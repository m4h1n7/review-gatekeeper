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
import {
  Loader2,
  Mail,
  Lock,
  User,
  Star,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);

  const [view, setView] = useState<AuthView>("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

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
      await signIn("password", {
        flow: "signIn",
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
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
      navigate(redirect);
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
      navigate(redirect);
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
      navigate(redirect);
    } catch (err) {
      setError("Invalid verification code.");
      setIsLoading(false);
      setOtp("");
    }
  };

  // ─── Guest / Google ───
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      setError("Google sign-in is not yet configured. Signed in as guest instead.");
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
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#18181B] px-2 text-[#A1A1AA]">Or sign in with email</span>
                    </div>
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
              STAR CATCH Reviews and Feedback Agency Bd
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
