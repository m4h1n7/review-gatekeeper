import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  KeyRound,
  AlertTriangle,
  Gift,
  ToggleLeft,
  Users,
  UserPlus,
  ToggleRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("1 uppercase letter");
  if (!/[0-9]/.test(pw)) errors.push("1 number");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("1 special character");
  return errors;
}

export default function AccountSettings() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const subscription = useQuery(api.subscriptions.getCurrent);
  const businesses = useQuery(api.businesses.listByUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const updatePromo = useMutation(api.businesses.updatePromo);
  const hasPassword = useQuery(api.users.hasPasswordAccount);

  // Profile form state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Promo/reward settings state
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoText, setPromoText] = useState("");
  const [promoSaved, setPromoSaved] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  // Thank-you message settings state
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [thankYouSaved, setThankYouSaved] = useState(false);
  const [thankYouLoading, setThankYouLoading] = useState(false);
  const updateThankYou = useMutation(api.businesses.updateThankYou);
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  // Sync promo & thankYou state from business data
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const biz = businesses[0] as any;
      setPromoEnabled(biz.promoEnabled ?? false);
      setPromoText(biz.promoText ?? "");
      setThankYouMessage(biz.thankYouMessage ?? "");
    }
  }, [businesses]);

  const handleSaveThankYou = async () => {
    if (!businesses || businesses.length === 0) return;
    setThankYouLoading(true);
    try {
      await updateThankYou({
        businessId: (businesses[0] as any).id,
        thankYouMessage: thankYouMessage.trim(),
      });
      setThankYouSaved(true);
      setTimeout(() => setThankYouSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save thank-you message:", err);
    }
    setThankYouLoading(false);
  };

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Staff access
  const [staffEmail, setStaffEmail] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const staffList = useQuery(
    api.admin.listStaff,
    user?.email ? { ownerEmail: user.email } : "skip"
  );
  const inviteStaffMutation = useMutation(api.admin.inviteStaff);

  const handleSavePromo = async () => {
    if (!businesses || businesses.length === 0) return;
    setPromoLoading(true);
    try {
      await updatePromo({
        businessId: (businesses[0] as any).id,
        promoEnabled,
        promoText: promoText.trim(),
      });
      setPromoSaved(true);
      setTimeout(() => setPromoSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save promo settings:", err);
    }
    setPromoLoading(false);
  };

  // Sync form state with user data
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user?.name, user?.email]);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile.");
    }
    setProfileLoading(false);
  };

  const handleSetOrChangePassword = async () => {
    setPwLoading(true);
    setPwError(null);
    setPwSaved(false);

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      setPwLoading(false);
      return;
    }

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setPwError(`Password needs: ${errors.join(", ")}.`);
      setPwLoading(false);
      return;
    }

    try {
      if (hasPassword) {
        // User already has a password — use reset flow to change it
        // First trigger the reset to send an OTP
        await signIn("password", {
          flow: "reset",
          email: user?.email ?? "",
        });
        // For simplicity, we show a message that a reset code was sent
        setPwError(null);
        setPwSaved(false);
        setPwError(
          "A password reset code has been sent to your email. Please use the Sign In page → Forgot Password to complete the change.",
        );
      } else {
        // User signed up via Google/OAuth and has no password yet — create one
        await signIn("password", {
          flow: "signUp",
          email: user?.email ?? "",
          password: newPassword,
          name: user?.name ?? "",
        });
        setPwSaved(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwSaved(false), 3000);
      }
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password.");
    }
    setPwLoading(false);
  };

  const handleInviteStaff = async () => {
    if (!staffEmail.trim() || !user?.email) return;
    setStaffLoading(true);
    try {
      await inviteStaffMutation({
        ownerEmail: user.email,
        staffEmail: staffEmail.trim(),
      });
      setStaffEmail("");
    } catch (err) {
      // Error handled by Convex
    }
    setStaffLoading(false);
  };

  const planLabel = subscription?.plan === "pro" && subscription?.status === "active" ? "Business Pro" : subscription?.plan === "starter" && subscription?.status === "active" ? "Starter" : subscription?.status === "pending" ? "Pending Payment" : "Business Pro";
  const planColor = subscription?.plan === "pro" && subscription?.status === "active" ? "text-[#16A34A]" : subscription?.status === "pending" ? "text-amber-400" : "text-[#16A34A]";

  const passwordButtonText = hasPassword === undefined
    ? "Loading..."
    : hasPassword
      ? pwLoading ? "Sending Reset Code..." : "Send Reset Code"
      : pwLoading ? "Setting Password..." : "Set Password";

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-wide leading-tight">
                STAR CATCH
              </span>
              <span className="text-[10px] text-[#A1A1AA] tracking-wider leading-tight">
                Reviews and Feedback Agency Bd
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#16A34A]">Account Settings</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Manage Your Account
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Update your profile, manage your password, and view your subscription.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* ─── Profile Section ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Profile</h2>
                  <p className="text-xs text-[#A1A1AA]">Your account information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      type="email"
                      className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                  </div>
                </div>

                {profileError && <p className="text-sm text-red-400">{profileError}</p>}

                {profileSaved && (
                  <div className="flex items-center gap-2 text-sm text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4" />
                    Profile updated successfully.
                  </div>
                )}

                <Button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="w-full h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </GlassPanel>
          </motion.div>

          {/* ─── Password Section ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  {hasPassword ? (
                    <Lock className="w-5 h-5 text-amber-400" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {hasPassword ? "Change Password" : "Set Password"}
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    {hasPassword
                      ? "Update your existing password"
                      : "Add a password so you can also log in with email"}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              {hasPassword !== undefined && (
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs ${
                  hasPassword
                    ? "bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                }`}>
                  {hasPassword ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Password configured — you can sign in with email and password</>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5" /> No password set — you signed up via Google. Set a password for email login.</>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    {hasPassword ? "New Password" : "Choose a Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={hasPassword ? "Enter new password" : "Create a strong password"}
                      type={showNewPw ? "text" : "password"}
                      className="pl-9 pr-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-[#A1A1AA]/60">
                    8+ characters, 1 uppercase, 1 number, 1 special character
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#A1A1AA]" />
                    <Input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      type={showNewPw ? "text" : "password"}
                      className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                  </div>
                </div>

                {pwError && <p className="text-sm text-amber-400">{pwError}</p>}

                {pwSaved && (
                  <div className="flex items-center gap-2 text-sm text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4" />
                    {hasPassword
                      ? "A reset code has been sent to your email."
                      : "Password set successfully! You can now sign in with email and password."}
                  </div>
                )}

                <Button
                  onClick={handleSetOrChangePassword}
                  disabled={pwLoading || !newPassword || !confirmPassword}
                  className="w-full h-10 bg-amber-500/80 hover:bg-amber-500 text-white font-semibold cursor-pointer"
                >
                  {passwordButtonText}
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        {/* ─── Subscription Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6"
        >
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Subscription</h2>
                <p className="text-xs text-[#A1A1AA]">Your current plan and billing</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  subscription?.plan === "pro" && subscription?.status === "active"
                    ? "bg-[#16A34A]/15"
                    : subscription?.status === "pending"
                      ? "bg-amber-500/10"
                      : "bg-white/5"
                }`}>
                  <Shield className={`w-6 h-6 ${planColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{planLabel} Plan</p>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    {subscription?.plan === "pro" && subscription?.status === "active"
                      ? `Active · Expires ${subscription.proExpiresAt ? new Date(subscription.proExpiresAt).toLocaleDateString() : subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "—"}`
                      : subscription?.status === "pending"
                        ? "Complete payment to unlock full access"
                        : "Subscribe to unlock all features"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                size="sm"
                className="border-[#16A34A]/30 bg-[#16A34A]/10 hover:bg-[#16A34A]/20 text-[#16A34A] cursor-pointer font-semibold"
              >
                {subscription?.plan === "pro" && subscription?.status === "active" ? "Manage Plan" : "Choose Plan"}
              </Button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* ─── Reward Settings ─── */}
        {businesses && businesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6"
          >
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Customer Reward Offer</h2>
                  <p className="text-xs text-[#A1A1AA]">Show a promotional incentive on your review page</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">Show reward offer to customers</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      When enabled, customers see a promotional banner on your review page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoEnabled(!promoEnabled)}
                    className="cursor-pointer transition-colors"
                  >
                    {promoEnabled ? (
                      <ToggleRight className="w-10 h-10 text-[#16A34A]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-[#A1A1AA]/40" />
                    )}
                  </button>
                </div>

                {/* Reward Description */}
                {promoEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="block text-xs font-medium text-[#A1A1AA]">
                      Reward Description
                    </label>
                    <Input
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      placeholder="e.g., Show this screen to the cashier for 10% off!"
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                    <p className="text-[10px] text-[#A1A1AA]/50">
                      This text appears in an amber banner below the rating stars and on the thank-you screen.
                    </p>

                    {/* Preview */}
                    <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Preview</span>
                      </div>
                      <p className="text-xs text-amber-300/90">
                        {promoText || "Your reward text will appear here..."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {promoSaved && (
                  <div className="flex items-center gap-2 text-sm text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4" />
                    Reward settings saved!
                  </div>
                )}

                <Button
                  onClick={handleSavePromo}
                  disabled={promoLoading || !promoEnabled}
                  className="w-full h-10 bg-amber-500/80 hover:bg-amber-500 text-white font-semibold cursor-pointer"
                >
                  {promoLoading ? "Saving..." : "Save Reward Settings"}
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* ─── Thank-You Message Settings (Pro Feature) ─── */}
        {businesses && businesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6"
          >
            <GlassPanel className={`p-6 relative overflow-hidden ${!isPro ? 'opacity-70' : ''}`}>
              {!isPro && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[1px]">
                  <div className="text-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                      <Sparkles className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                    </div>
                    <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to set a custom thank-you message before Google redirect</p>
                    <Button onClick={() => navigate("/pricing")} size="sm"
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Custom Thank-You Message</h2>
                  <p className="text-xs text-[#A1A1AA]">Show a custom message before redirecting to Google (4-5 stars)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Thank-You Message
                  </label>
                  <Input
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    placeholder="e.g., Thank you! Show this screen for 10% off your next visit"
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                  />
                  <p className="text-[10px] text-[#A1A1AA]/50 mt-1.5">
                    When a customer taps 4-5 stars, this message appears briefly before redirecting them to your Google Review page.
                  </p>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-[#16A34A]/[0.04] border border-[#16A34A]/15">
                  <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-2">Preview — Customer View</p>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-300/90 leading-relaxed">
                      {thankYouMessage || "Your thank-you message will appear here..."}
                    </p>
                  </div>
                </div>

                {thankYouSaved && (
                  <div className="flex items-center gap-2 text-sm text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4" />
                    Thank-you message saved!
                  </div>
                )}

                <Button
                  onClick={handleSaveThankYou}
                  disabled={thankYouLoading || !isPro}
                  className="w-full h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                >
                  {thankYouLoading ? "Saving..." : "Save Thank-You Message"}
                </Button>
              </div>
            </GlassPanel>

            {/* ═══ STAFF ACCESS (Pro Feature) ═══ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassPanel className={`p-6 relative overflow-hidden ${!isPro ? 'opacity-70' : ''}`}>
                {!isPro && (
                  <div className="absolute inset-0 z-10 bg-[#0D0D0D]/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-amber-400">PRO FEATURE</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-1">Upgrade to Business Pro to invite staff</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Staff Access</h3>
                    <p className="text-xs text-[#A1A1AA]">Invite team members with view-only dashboard access (Pro)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {staffList && staffList.length > 0 && (
                    <div className="space-y-2">
                      {staffList.map((s: any) => (
                        <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center">
                              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white">{s.staffEmail}</p>
                              <p className="text-[10px] text-[#A1A1AA]">Invited {new Date(s.invitedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400">View Only</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="Enter staff email address"
                      className="h-10 bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                    <Button
                      onClick={handleInviteStaff}
                      disabled={!staffEmail || staffLoading}
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer shrink-0"
                    >
                      {staffLoading ? "..." : <><UserPlus className="w-3.5 h-3.5 mr-1" /> Invite</>}
                    </Button>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA]/50">
                    Staff users can view analytics and feedback but cannot edit business settings or payment information.
                  </p>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
