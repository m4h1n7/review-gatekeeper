import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Store,
  Globe,
  Image,
  Mail,
  Plus,
  Link2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Lock,
  Star,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { PaywallModal } from "@/components/PaywallModal";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createBusiness = useMutation(api.businesses.create);
  const businesses = useQuery(
    api.businesses.listByUser,
    isAuthenticated ? {} : "skip",
  );
  const profileCheck = useQuery(
    api.subscriptions.canCreateProfile,
    isAuthenticated ? {} : "skip",
  );
  const subscription = useQuery(
    api.subscriptions.getCurrent,
    isAuthenticated ? {} : "skip",
  );

  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    reviewUrl: "",
    alertEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/auth?returnTo=/admin");
      return;
    }
    if (profileCheck && !profileCheck.allowed) {
      setPaywallReason(profileCheck.reason);
      setShowPaywall(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createBusiness({
        name: form.name,
        logoUrl: form.logoUrl || "https://via.placeholder.com/120",
        reviewUrl: form.reviewUrl,
        alertEmail: form.alertEmail,
      });
      setCreatedSlug(result.slug);
      setShowSuccess(true);
      setForm({ name: "", logoUrl: "", reviewUrl: "", alertEmail: "" });
      setTimeout(() => {
        setShowSuccess(false);
        setCreatedSlug(null);
      }, 6000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Free plan limited")) {
        setPaywallReason(message);
        setShowPaywall(true);
      } else {
        console.error("Failed to create business:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareableUrl = (slug: string) => {
    return `${window.location.origin}/review/${slug}`;
  };

  const copyToClipboard = async (slug: string) => {
    await navigator.clipboard.writeText(getShareableUrl(slug));
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inputClass =
    "h-12 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20 transition-all";

  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  // Not signed in state
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
        </div>
        <GlassPanel className="p-10 text-center max-w-md">
          <Shield className="w-12 h-12 text-[#16A34A] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Sign in Required
          </h1>
          <p className="text-[#A1A1AA] text-sm mb-6">
            Create an account to set up your review gatekeeper.
          </p>
          <Button
            onClick={() => navigate("/auth?returnTo=/admin")}
            className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
          >
            Sign In
          </Button>
        </GlassPanel>
      </div>
    );
  }

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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Review Gatekeeper
            {isPro && (
              <span className="ml-1 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Configure Your{" "}
            <span className="text-[#16A34A]">
              Review Gatekeeper
            </span>
          </h1>
          <p className="mt-3 text-[#A1A1AA] text-base sm:text-lg max-w-xl mx-auto">
            Create a review gatekeeper profile for your business. Satisfied
            customers are sent to Google to leave a public review, while others
            submit private feedback directly to you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Setup Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <GlassPanel className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16A34A]/10">
                  <Plus className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    New Profile
                  </h2>
                  <p className="text-sm text-[#A1A1AA]">
                    Add your business details to generate a unique review link
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                    <Store className="w-4 h-4 text-[#16A34A]" />
                    Business Name
                  </Label>
                  <Input
                    placeholder="e.g. Joe's Coffee Shop"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                    <Image className="w-4 h-4 text-[#16A34A]" />
                    Business Logo URL{" "}
                    <span className="text-[#A1A1AA]/50 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={(e) =>
                      setForm({ ...form, logoUrl: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                    <Globe className="w-4 h-4 text-[#16A34A]" />
                    Direct Google Review URL
                  </Label>
                  <Input
                    placeholder="https://g.page/r/your-business/review"
                    value={form.reviewUrl}
                    onChange={(e) =>
                      setForm({ ...form, reviewUrl: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                    <Mail className="w-4 h-4 text-[#16A34A]" />
                    Alert Email
                  </Label>
                  <Input
                    placeholder="alerts@yourbusiness.com"
                    type="email"
                    value={form.alertEmail}
                    onChange={(e) =>
                      setForm({ ...form, alertEmail: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold text-base shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Generate Review Link
                    </div>
                  )}
                </Button>
              </form>

              {/* Success toast */}
              <AnimatePresence>
                {showSuccess && createdSlug && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mt-5 p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#16A34A]">
                          Business profile created!
                        </p>
                        <p className="text-sm text-[#A1A1AA] mt-1 break-all">
                          Share this link:
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="flex-1 text-xs bg-white/5 px-3 py-1.5 rounded-lg text-[#16A34A] truncate border border-white/5">
                            {getShareableUrl(createdSlug)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(createdSlug)}
                            className="shrink-0 border-[#16A34A]/30 hover:bg-[#16A34A]/10 text-[#16A34A] cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          </motion.div>

          {/* Business List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassPanel className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16A34A]/10">
                  <Link2 className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Profiles
                  </h2>
                  <p className="text-sm text-[#A1A1AA]">
                    Your active review gatekeeper links
                  </p>
                </div>
              </div>

              {/* Free/Pro badge */}
              {subscription && (
                <div className={`mb-4 p-3 rounded-xl text-center text-xs font-medium ${
                  isPro
                    ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                    : "bg-white/5 text-[#A1A1AA] border border-white/10"
                }`}>
                  {isPro ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Pro Plan — Unlimited
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Free Plan — 1 profile, 15 feedbacks
                    </span>
                  )}
                </div>
              )}

              {!businesses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Store className="w-8 h-8 text-[#A1A1AA]/30" />
                  </div>
                  <p className="text-[#A1A1AA] text-sm">
                    No profiles yet. Create one to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {businesses.map((biz, i) => (
                    <motion.div
                      key={biz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%2318181B' width='40' height='40' rx='8'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%23A1A1AA' font-size='14'%3E%F0%9F%8F%BA%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {biz.name}
                          </h3>
                          <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">
                            {getShareableUrl(biz.slug)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(biz.slug)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#A1A1AA] hover:text-white hover:bg-white/5"
                          title="Copy link"
                        >
                          {copiedId === biz.slug ? (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={`/review/${biz.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] hover:text-[#16A34A]/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Preview
                        </a>
                        <span className="text-white/10">·</span>
                        <span className="text-xs text-[#A1A1AA] truncate">
                          {biz.alertEmail}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason={paywallReason}
      />
    </div>
  );
}
