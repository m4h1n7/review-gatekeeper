import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
import { isAdminEmail } from "@/lib/routing";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Star,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

type AuthView =
  | "signIn"
  | "signUp"
  | "forgotPassword"
  | { email: string } // email OTP step
  | { resetEmail: string }; // password reset verify step

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("1 uppercase letter");
  if (!/[0-9]/.test(pw)) errors.push("1 number");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("1 special character");
  return errors;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  // Determine the base redirect destination:
  //  1. Explicit returnTo (from RequireAuth) takes priority
  //  2. Then redirectAfterAuth prop (defaults to /dashboard from main.tsx)
  //  3. Fallback to /dashboard
  const baseRedirect = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : (redirectAfterAuth || "/dashboard");

  // Compute redirect with role-based routing
  const getRedirect = (email?: string | null) => {
    if (isAdminEmail(email) && baseRedirect !== "/admin") {
      return "/admin";
    }
    return baseRedirect;
  };
  const redirect = getRedirect(user?.email);

  const [view, setView] = useState<AuthView>("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Ref to track latest isAuthenticated value for post-signIn polling
  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);
  const sendSignupOtpMutation = useMutation(api.users.sendSignupOtp);
  const verifySignupOtpMutation = useMutation(api.users.verifySignupOtp);
  const isEmailVerified = useQuery(api.users.isEmailVerified);
  const sendOtpEmailAction = useAction(api.otp.sendOtpEmail);
  const resendOtpEmailAction = useAction(api.otp.resendOtpEmail);

  // Send OTP after signup (server-side: generate + store + email, no OTP leak)
  const handleSendSignupOtp = useCallback(async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const result = await sendOtpEmailAction();
      // Dev mode bypass: SMTP not configured → account auto-verified, skip OTP screen
      if (result?.bypassed) {
        setOtpVerified(true);
        setTimeout(() => {
          navigate(isSuperAdmin(signupEmail) ? "/admin" : redirect);
        }, 400);
        return;
      }
      setOtpSent(true);
      setResendCooldown(60); // start 60s cooldown
    } catch (err) {
      // If email sending fails entirely, treat as bypass — don't block registration
      setOtpVerified(true);
      setTimeout(() => {
        navigate(isSuperAdmin(signupEmail) ? "/admin" : redirect);
      }, 400);
    } finally {
      setOtpLoading(false);
    }
  }, [sendOtpEmailAction, navigate, signupEmail, redirect]);

  // Resend OTP with cooldown
  const handleResendOtp = useCallback(async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const result = await resendOtpEmailAction();
      if (result?.bypassed) {
        setOtpVerified(true);
        setTimeout(() => {
          navigate(isSuperAdmin(signupEmail) ? "/admin" : redirect);
        }, 400);
        return;
      }
      setOtpSent(true);
      setResendCooldown(60); // restart 60s cooldown
    } catch (err) {
      // Email failed — bypass anyway, don't block the user
      setOtpVerified(true);
      setTimeout(() => {
        navigate(isSuperAdmin(signupEmail) ? "/admin" : redirect);
      }, 400);
    } finally {
      setOtpLoading(false);
    }
  }, [resendOtpEmailAction, navigate, signupEmail, redirect]);

  // Verify OTP after signup
  const handleVerifySignupOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    try {
      await verifySignupOtpMutation({ otp });
      setOtpVerified(true);
      // Navigate after a short delay for the success animation
      setTimeout(() => {
        navigate(isSuperAdmin(user?.email) ? "/admin" : redirect);
      }, 800);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid verification code.");
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  }, [verifySignupOtpMutation, otp, navigate, user?.email, redirect]);

  // Auto-send OTP after signup
  useEffect(() => {
    if (signupEmail && isAuthenticated && !otpSent && !otpVerified && isEmailVerified === false) {
      handleSendSignupOtp();
    }
  }, [signupEmail, isAuthenticated, otpSent, otpVerified, isEmailVerified, handleSendSignupOtp]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user !== undefined) {
      // Super admin: always redirect immediately (skip OTP)
      if (isAdminEmail(user?.email)) {
        navigate("/admin");
        return;
      }
      // OTP was bypassed/verified → redirect immediately
      if (otpVerified) {
        navigate(getRedirect(user?.email));
        return;
      }
      // If email is already verified in DB, redirect to destination
      if (isEmailVerified === true) {
        navigate(getRedirect(user?.email));
        return;
      }
      // Existing user (no signup flow, email verification status unknown) → redirect anyway
      if (signupEmail === null && (isEmailVerified === undefined || isEmailVerified === false)) {
        navigate(getRedirect(user?.email));
      }
    }
  }, [authLoading, isAuthenticated, user?.email, user, navigate, baseRedirect, isEmailVerified, signupEmail, otpVerified]);

  const currentView = typeof view === "string" ? view : "emailOtp";
  const otpEmail = typeof view === "object" && "email" in view ? view.email : null;
  const resetEmail = typeof view === "object" && "resetEmail" in view ? view.resetEmail : null;



  // ─── Sign In with Password ───
  const handlePasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        setError("Please enter both email and password.");
        setIsLoading(false);
        return;
      }

      await signIn("password", {
        flow: "signIn",
        email,
        password,
      });

      // Wait for the Convex auth session to propagate to the client.
      // signIn resolves with a token, but isAuthenticated may lag by a tick.
      // We poll via ref to avoid RequireAuth redirecting back to /auth.
      const waitForSession = () =>
        new Promise<boolean>((resolve) => {
          let attempts = 0;
          const check = () => {
            if (isAuthenticatedRef.current || attempts > 15) {
              resolve(isAuthenticatedRef.current);
              return;
            }
            attempts++;
            setTimeout(check, 50);
          };
          // Give the first render cycle a chance to update
          setTimeout(check, 100);
        });

      const sessionReady = await waitForSession();
      const dest = isSuperAdmin(email) ? "/admin" : redirect;

      if (sessionReady) {
        // Session is active — safe to navigate directly
        navigate(dest);
      } else {
        // Session not yet visible — force a full page reload to the destination.
        // The Convex token is stored in a cookie/indexedDB, so reload will pick it up.
        window.location.href = dest;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("InvalidSecret") || msg.includes("Invalid credentials") || msg.includes("credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (msg.includes("not found") || msg.includes("does not exist")) {
        setError("No account found with this email. Please sign up first.");
      } else if (msg.includes("Too many") || msg.includes("rate limit")) {
        setError("Too many failed attempts. Please wait a few minutes and try again.");
      } else {
        setError(msg || "Sign-in failed. Please check your credentials and try again.");
      }
      setIsLoading(false);
    }
  };

  // ─── Sign Up with Password ───
  const handlePasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      const name = formData.get("name") as string;

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const pwErrors = validatePassword(password);
      if (pwErrors.length > 0) {
        setError(`Password needs: ${pwErrors.join(", ")}.`);
        setIsLoading(false);
        return;
      }

      await signIn("password", {
        flow: "signUp",
        email,
        password,
        name,
      });
      // Super admins skip OTP verification
      if (isSuperAdmin(email)) {
        navigate("/admin");
      } else {
        // Set signup email to trigger OTP flow
        setSignupEmail(email);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  // ─── Forgot Password: send reset code ───
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      // Trigger the reset flow — this sends an email with the code
      await signIn("password", {
        flow: "reset",
        email,
      });
      setView({ resetEmail: email });
      setOtp("");
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset code. Check your email.");
      setIsLoading(false);
    }
  };

  // ─── Reset Password: verify code + set new password ───
  const handleResetVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const newPassword = formData.get("newPassword") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const pwErrors = validatePassword(newPassword);
      if (pwErrors.length > 0) {
        setError(`Password needs: ${pwErrors.join(", ")}.`);
        setIsLoading(false);
        return;
      }

      await signIn("password", {
        flow: "reset-verification",
        email: resetEmail,
        code: otp,
        newPassword,
      });
      navigate(isSuperAdmin(resetEmail) ? "/admin" : redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
      setIsLoading(false);
      setOtp("");
    }
  };

  // ─── Email OTP: send code ───
  const handleEmailOTPSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      setView({ email: formData.get("email") as string });
      setOtp("");
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
      setIsLoading(false);
    }
  };

  // ─── Email OTP: verify code ───
  const handleEmailOTPVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      // After OTP login, user state updates — useEffect will redirect correctly
      // Navigate immediately with known email
      const otpEmail = formData.get("email") as string;
      navigate(getRedirect(otpEmail));
    } catch (err) {
      setError("Invalid verification code.");
      setIsLoading(false);
      setOtp("");
    }
  };

  // ─── Guest Login ───
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      setError("Failed to sign in as guest.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#16A34A]/3 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-[420px] border-white/10 bg-[#18181B]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* ─── SIGN IN ─── */}
          {currentView === "signIn" && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/15 flex items-center justify-center mb-2 cursor-pointer" onClick={() => navigate("/")}>
                    <Star className="w-7 h-7 text-[#16A34A] fill-[#16A34A]" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Welcome Back</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Sign in to manage your review gatekeeper
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSignIn}>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="email"
                      placeholder="Email address"
                      type="email"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </CardContent>
                <CardFooter className="flex-col gap-3 pt-0">
                  <button
                    type="button"
                    onClick={() => { setView("forgotPassword"); setError(null); }}
                    className="text-sm text-[#16A34A] hover:text-[#16A34A]/80 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                  <p className="text-sm text-[#A1A1AA]">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("signUp"); setError(null); }}
                      className="text-[#16A34A] hover:text-[#16A34A]/80 font-medium cursor-pointer"
                    >
                      Create one
                    </button>
                  </p>
                </CardFooter>
              </form>
            </>
          )}

          {/* ─── SIGN UP ─── */}
          {currentView === "signUp" && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/15 flex items-center justify-center mb-2 cursor-pointer" onClick={() => navigate("/")}>
                    <Star className="w-7 h-7 text-[#16A34A] fill-[#16A34A]" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Create Account</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Set up your review gatekeeper in seconds
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSignUp}>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="name"
                      placeholder="Full name"
                      type="text"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="email"
                      placeholder="Email address"
                      type="email"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="confirmPassword"
                      placeholder="Confirm password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer"
                      required
                    />
                    <span className="text-xs text-[#A1A1AA] leading-relaxed">
                      I agree to the{' '}
                      <button type="button" onClick={() => window.open("/terms", "_blank")} className="text-[#16A34A] hover:underline">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" onClick={() => window.open("/privacy", "_blank")} className="text-[#16A34A] hover:underline">Privacy Policy</button>
                    </span>
                  </label>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-sm text-[#A1A1AA] w-full text-center">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("signIn"); setError(null); }}
                      className="text-[#16A34A] hover:text-[#16A34A]/80 font-medium cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </CardFooter>
              </form>
            </>
          )}

          {/* ─── SIGNUP OTP VERIFICATION ─── */}
          {signupEmail && isAuthenticated && !otpVerified && isEmailVerified === false && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/15 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-7 h-7 text-[#16A34A]" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Verify Your Email</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  We sent a 6-digit code to {signupEmail}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerifySignupOtp}>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={otpLoading}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="border-white/10 bg-white/5 text-white" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {otpError && <p className="text-sm text-red-400 text-center">{otpError}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
                    disabled={otpLoading || otp.length !== 6}
                  >
                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify & Continue
                  </Button>

                  {resendCooldown > 0 ? (
                    <p className="text-xs text-center text-[#A1A1AA]">
                      Resend code in <span className="font-semibold text-[#16A34A]">{resendCooldown}s</span>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="w-full text-[#16A34A] hover:text-[#16A34A]/80 cursor-pointer"
                    >
                      {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Resend Verification Code
                    </Button>
                  )}

                  <p className="text-xs text-center text-[#A1A1AA]/60">
                    Your account is active but needs email verification to access the dashboard.
                  </p>
                </CardContent>
              </form>
            </>
          )}

          {/* ─── OTP SUCCESS ─── */}
          {otpVerified && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/15 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-7 h-7 text-[#16A34A]" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Email Verified!</CardTitle>
                <CardDescription className="text-[#16A34A]">
                  Redirecting you now...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
              </CardContent>
            </>
          )}

          {/* ─── FORGOT PASSWORD (enter email) ─── */}
          {currentView === "forgotPassword" && (
            <>
              <CardHeader className="text-center pb-4">                  <button
                    type="button"
                    onClick={() => { setView("signIn"); setError(null); }}
                    className="absolute left-4 top-4 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-xl text-white">Reset Password</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Enter your email and we'll send a verification code
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleForgotPassword}>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="email"
                      placeholder="Email address"
                      type="email"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Reset Code
                  </Button>
                </CardContent>
              </form>
            </>
          )}

          {/* ─── RESET VERIFY (enter code + new password) ─── */}
          {resetEmail && (
            <>
              <CardHeader className="text-center pb-4">
                <button
                  type="button"
                  onClick={() => { setView("forgotPassword"); setError(null); setOtp(""); }}
                  className="absolute left-4 top-4 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-xl text-white">Check Your Email</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Enter the code sent to {resetEmail}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetVerify}>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="border-white/10 bg-white/5 text-white" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="newPassword"
                      placeholder="New password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Reset Password
                  </Button>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-sm text-[#A1A1AA] w-full text-center">
                    Didn't receive a code?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("forgotPassword"); setError(null); }}
                      className="text-[#16A34A] hover:text-[#16A34A]/80 font-medium cursor-pointer"
                    >
                      Try again
                    </button>
                  </p>
                </CardFooter>
              </form>
            </>
          )}

          {/* ─── EMAIL OTP: enter email ─── */}
          {currentView === "emailOtp" && !otpEmail && (
            <>
              <CardHeader className="text-center pb-4">
                <button
                  type="button"
                  onClick={() => { setView("signIn"); setError(null); }}
                  className="absolute left-4 top-4 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-xl text-white">Email Verification</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Enter your email to receive a verification code
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailOTPSend}>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      name="email"
                      placeholder="Email address"
                      type="email"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Code
                  </Button>
                </CardContent>
              </form>
            </>
          )}

          {/* ─── EMAIL OTP: verify code ─── */}
          {currentView === "emailOtp" && otpEmail && (
            <>
              <CardHeader className="text-center pb-4">
                <button
                  type="button"
                  onClick={() => { setView("signIn"); setError(null); setOtp(""); }}
                  className="absolute left-4 top-4 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-xl text-white">Check Your Email</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  We've sent a code to {otpEmail}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailOTPVerify}>
                <CardContent className="space-y-4">
                  <input type="hidden" name="email" value={otpEmail} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="border-white/10 bg-white/5 text-white" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify Code
                  </Button>

                  <p className="text-sm text-[#A1A1AA] text-center">
                    Didn't receive a code?{" "}
                    <button
                      type="button"
                      onClick={() => { setView("signIn"); setError(null); setOtp(""); }}
                      className="text-[#16A34A] hover:text-[#16A34A]/80 font-medium cursor-pointer"
                    >
                      Try again
                    </button>
                  </p>
                </CardContent>
              </form>
            </>
          )}



          {/* Footer */}
          <div className="py-4 px-6 text-xs text-center text-[#A1A1AA]/60 bg-white/[0.02] border-t border-white/5 rounded-b-lg">
            Powered by{" "}
            <span className="font-semibold text-[#16A34A]">
              STAR CATCH
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
