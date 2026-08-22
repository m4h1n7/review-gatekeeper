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
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Admin() {
  const createBusiness = useMutation(api.businesses.create);
  const businesses = useQuery(api.businesses.list);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      console.error("Failed to create business:", err);
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
    "h-12 bg-white/50 border-white/60 backdrop-blur-sm focus:bg-white/70 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 transition-all placeholder:text-slate-400";

  return (
    <div className="min-h-screen">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/25 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/60 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Review Gatekeeper
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Configure Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Review Gatekeeper
            </span>
          </h1>
          <p className="mt-3 text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
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
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    New Profile
                  </h2>
                  <p className="text-sm text-slate-400">
                    Add your business details to generate a unique review link
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Store className="w-4 h-4 text-blue-500" />
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
                  <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Image className="w-4 h-4 text-blue-500" />
                    Business Logo URL{" "}
                    <span className="text-slate-400 font-normal">
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
                  <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Globe className="w-4 h-4 text-blue-500" />
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
                  <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
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
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
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
                    className="mt-5 p-4 rounded-xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-800">
                          Business profile created!
                        </p>
                        <p className="text-sm text-emerald-600 mt-1 break-all">
                          Share this link:
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="flex-1 text-xs bg-emerald-100/80 px-3 py-1.5 rounded-lg text-emerald-700 truncate">
                            {getShareableUrl(createdSlug)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(createdSlug)}
                            className="shrink-0 border-emerald-300 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
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
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10">
                  <Link2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Profiles
                  </h2>
                  <p className="text-sm text-slate-400">
                    Your active review gatekeeper links
                  </p>
                </div>
              </div>

              {!businesses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-slate-100/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100/60 flex items-center justify-center mb-4">
                    <Store className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">
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
                      className="p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%23f1f5f9' width='40' height='40' rx='8'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%2394a3b8' font-size='14'%3E%F0%9F%8F%BA%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">
                            {biz.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {getShareableUrl(biz.slug)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(biz.slug)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Copy link"
                        >
                          {copiedId === biz.slug ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Preview
                        </a>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400 truncate">
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
    </div>
  );
}
