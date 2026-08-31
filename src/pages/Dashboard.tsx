import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { PrintableQR } from "@/components/PrintableQR";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import StaffManager from "@/components/StaffManager";
import AIAssistant from "@/components/AIAssistant";
import WhatsAppAlertConfig from "@/components/WhatsAppAlertConfig";
import EnhancedLeaderboard from "@/components/EnhancedLeaderboard";
import { PaywallModal } from "@/components/PaywallModal";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { MonthlyReport } from "@/components/MonthlyReport";
import { SubscriptionGuard, useHasAccess } from "@/components/SubscriptionGuard";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LogOut,
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
  Calendar,
  Shield,
  ExternalLink,
  Download,
  Link2,
  CheckCircle2,
  Copy,
  Settings,
  Send,
  MessageCircle,
  Inbox,
  BarChart3,
  QrCode,
  Share2,
  LayoutDashboard,
  Lock,
  Megaphone,
  AlertTriangle,
  Users,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";

type TabType = "overview" | "reviews" | "inbox" | "staff";
type FilterRange = "today" | "week" | "month" | "all";

const FILTER_OPTIONS: { value: FilterRange; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "week", label: "7 Days", days: 7 },
  { value: "month", label: "30 Days", days: 30 },
  { value: "all", label: "All Time", days: 90 },
];

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{value}</p>
          {sub && <p className="text-xs text-[#A1A1AA]/60 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </GlassPanel>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    return (
      <div className="bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#A1A1AA] mb-1">{label}</p>
        <p className="text-sm font-bold text-white">Rating Score: {payload[0].value}</p>
        {item && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[#16A34A]">+{item.positive} positive</span>
            <span className="text-[10px] text-amber-400">-{item.negative} negative</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [filter, setFilter] = useState<FilterRange>("week");
  const [chartDays, setChartDays] = useState(7);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const subscription = useQuery(api.subscriptions.getCurrent);
  const accountStatus = useQuery(api.users.getAccountStatus);
  const announcement = useQuery(api.users.getActiveAnnouncement);
  const isPro = (subscription?.plan === "pro" || subscription?.plan === "trial") && subscription?.status === "active";
  const isStarter = subscription?.plan === "starter" && subscription?.status === "active";
  const isTrial = subscription?.plan === "trial" && subscription?.status === "active";
  const overview = useQuery(api.analytics.dashboardOverview, { filter });
  const trend = useQuery(api.analytics.ratingTrend, { days: chartDays });
  const isExpired = (subscription?.plan === "pro" || subscription?.plan === "trial") && subscription?.status === "active" && subscription?.expiresAt !== undefined && subscription.expiresAt < Date.now();
  const hasPaidAccess = useHasAccess("starter");
  const hasProAccess = useHasAccess("pro");
  const daysRemaining = subscription?.expiresAt ? Math.ceil((subscription.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)) : null;
  const showExpiryWarning = subscription?.status === "active" && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;
  const [showPaywall, setShowPaywall] = useState(subscription?.status === "pending" || isExpired);
  const [showTrialExpired, setShowTrialExpired] = useState(isTrial && isExpired);
  const stats = useQuery(api.analytics.businessStats, selectedBusinessId ? { businessId: selectedBusinessId, filter } : "skip");
  const feedbacks = useQuery(api.analytics.recentFeedbacks, selectedBusinessId ? { businessId: selectedBusinessId, limit: 20 } : "skip");

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handleDownloadCSV = () => {
    if (!feedbacks || feedbacks.length === 0) return;
    const headers = ["Customer Name", "Phone", "Email", "Rating", "Feedback", "Status", "Timestamp"];
    const rows = feedbacks.map((fb) => [
      fb.customerName, fb.phone, fb.email, fb.rating,
      `"${fb.message.replace(/"/g, '""')}"`, (fb as any).status ?? "unresolved",
      new Date(fb.createdAt).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `starcatch-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const toggleFeedbackStatus = useMutation(api.feedback.toggleStatus);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, "resolved" | "unresolved">>({});
  const [showTemplate, setShowTemplate] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleStatus = async (id: string, current: "resolved" | "unresolved") => {
    const next = current === "resolved" ? "unresolved" : "resolved";
    setFeedbackStatuses((p) => ({ ...p, [id]: next }));
    try { await toggleFeedbackStatus({ feedbackId: id, status: next }); }
    catch { setFeedbackStatuses((p) => ({ ...p, [id]: current })); }
  };

  const copyReviewLink = () => {
    const slug = overview?.businesses[0]?.slug;
    if (slug) {
      navigator.clipboard.writeText(`${window.location.origin}/review/${slug}`);
      setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const copyWhatsAppTemplate = () => {
    const slug = overview?.businesses[0]?.slug;
    if (slug) {
      const msg = `Hi! We'd love your feedback on your recent visit. Please take 30 seconds to rate us:\n\n${window.location.origin}/review/${slug}\n\nThank you! — ${overview?.businesses[0]?.name || "Our Team"}`;
      navigator.clipboard.writeText(msg);
      setCopiedTemplate(true); setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  const displayStats = selectedBusinessId && stats ? stats : overview ? {
    totalVisits: overview.totalVisits, redirectCount: overview.totalRedirects,
    feedbackCount: overview.totalFeedbacks, redirectPercentage: overview.redirectPercentage,
    feedbackPercentage: overview.feedbackPercentage,
  } : null;

  const businessName = overview?.businesses[0]?.name || user?.name || "your business";
  const reviewSlug = overview?.businesses[0]?.slug;
  const conversionRate = displayStats?.totalVisits
    ? Math.round((displayStats.redirectCount / displayStats.totalVisits) * 100)
    : 0;

  // ROI calculation: blocked negative reviews x ৳750 estimated customer lifetime value
  const CUSTOMER_LTV = 750;
  const savedRevenue = (displayStats?.feedbackCount ?? 0) * CUSTOMER_LTV;
  const subscriptionCost = subscription?.plan === "trial" ? 0 : subscription?.plan === "pro" ? 2499 : subscription?.plan === "starter" ? 1499 : 0;
  const roiMultiple = subscriptionCost > 0 ? Math.round(savedRevenue / subscriptionCost) : 0;

  const unresolvedCount = feedbacks?.filter((fb) => (fb as any).status === "unresolved").length ?? 0;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; action?: () => void }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "reviews", label: "Get Reviews", icon: <Star className="w-4 h-4" /> },
    { id: "inbox", label: "Private Inbox", icon: <Inbox className="w-4 h-4" />, badge: unresolvedCount > 0 ? unresolvedCount : undefined, action: () => navigate("/dashboard/feedback") },
    { id: "staff", label: "Staff & QR", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason={isExpired ? "Your Pro subscription has expired. Renew via bKash or Nagad to regain full access." : "Complete your Pro subscription to unlock full dashboard access. Pay via bKash, Nagad, or card."}
      />

      {/* Trial Expired Payment Modal */}
      {isTrial && (
        <TrialExpiredModal
          open={showTrialExpired}
          onClose={() => setShowTrialExpired(false)}
          onSuccess={() => setShowTrialExpired(false)}
        />
      )}

      {/* Pending Approval Banner */}
      {subscription?.status === "pending" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-amber-300">Payment Under Review</p>
                <p className="text-xs text-amber-300/70">
                  Your payment is being verified by our team. Access will be unlocked shortly.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/pricing")}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer text-xs font-semibold"
            >
              View Status
            </Button>
          </div>
        </div>
      )}

      {/* Subscription Expiry Warning Banner */}
      {showExpiryWarning && (
        <div className="bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-red-300">⚠️ Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-300/70">
                  Please clear your renewal fee to keep service active.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/pricing")}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 cursor-pointer text-xs font-semibold"
            >
              Renew Now
            </Button>
          </div>
        </div>
      )}

      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-[#16A34A]/10 border-b border-[#16A34A]/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <Megaphone className="w-4 h-4 text-[#16A34A] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#16A34A]">{announcement.title}</p>
              <p className="text-xs text-[#16A34A]/70">{announcement.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Suspended Account Banner */}
      {accountStatus === "suspended" && (
        <div className="bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm font-bold text-red-300">Account Suspended</p>
            </div>
            <p className="text-xs text-red-300/70">Your account has been suspended by an administrator. Please contact support to restore access.</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-wide">STAR CATCH</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
            {isSuperAdmin(user?.email) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}
                className="border-[#16A34A]/30 bg-[#16A34A]/10 hover:bg-[#16A34A]/20 text-[#16A34A] cursor-pointer font-semibold text-xs whitespace-nowrap">
                <Shield className="w-3.5 h-3.5 mr-1" /> Super Admin Portal
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Suspended: blocked dashboard */}
        {accountStatus === "suspended" && (
          <GlassPanel className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Account Is Suspended</h2>
            <p className="text-sm text-[#A1A1AA] mb-6 max-w-md mx-auto">
              Your dashboard access has been temporarily suspended. Please contact our support team for assistance.
            </p>
            <a href={`https://wa.me/8801673903919?text=${encodeURIComponent("Hi, my account is suspended. Please help.")}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white cursor-pointer font-semibold">
                <MessageCircle className="w-4 h-4 mr-2" /> Contact Support on WhatsApp
              </Button>
            </a>
          </GlassPanel>
        )}

        {/* Header */}

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {businessName}!</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">Here's how your review gateway is performing.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 w-fit overflow-x-auto flex-nowrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => {
              if ((tab as any).action) {
                (tab as any).action();
              } else {
                setActiveTab(tab.id);
              }
            }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}>
              {tab.icon} {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter (Overview only) */}
        {activeTab === "overview" && (
          <div className="flex flex-wrap items-center gap-2 mb-6 overflow-x-auto flex-nowrap">
            <Calendar className="w-4 h-4 text-[#A1A1AA] mr-1" />
            {FILTER_OPTIONS.map((opt) => (
              <button key={opt.value}
                onClick={() => { setFilter(opt.value); setChartDays(opt.days); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filter === opt.value
                    ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                    : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Business selector */}
        {overview && overview.businesses.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setSelectedBusinessId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${!selectedBusinessId ? "bg-[#16A34A] text-white" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"}`}>
              All Profiles
            </button>
            {overview.businesses.map((biz) => (
              <button key={biz.id} onClick={() => setSelectedBusinessId(biz.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedBusinessId === biz.id ? "bg-[#16A34A] text-white" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"}`}>
                {biz.name}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!overview && (
          <GlassPanel className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-8 h-8 text-[#A1A1AA]/30" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Welcome to STAR CATCH!</h2>
            <p className="text-sm text-[#A1A1AA] mb-6">Set up your first business profile to start collecting reviews.</p>
            <Button onClick={() => navigate("/onboarding")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white cursor-pointer font-semibold">
              Set Up Your Business <ExternalLink className="w-4 h-4 ml-1.5" />
            </Button>
          </GlassPanel>
        )}

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && overview && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={<Eye className="w-5 h-5 text-[#16A34A]" />} label="Total Taps" value={displayStats?.totalVisits ?? 0}
                sub={selectedBusinessId ? "This profile" : `Across ${overview.profileCount} profile(s)`} color="bg-[#16A34A]/10" />
              <StatCard icon={<Star className="w-5 h-5 text-emerald-400" />} label="Google Redirects" value={displayStats?.redirectCount ?? 0}
                sub={`${displayStats?.redirectPercentage ?? 0}% of total`} color="bg-emerald-500/10" />
              <StatCard icon={<MessageSquare className="w-5 h-5 text-amber-400" />} label="Private Feedback" value={displayStats?.feedbackCount ?? 0}
                sub={unresolvedCount > 0 ? `${unresolvedCount} unresolved` : `${displayStats?.feedbackPercentage ?? 0}% of total`} color="bg-amber-500/10" />
              <StatCard icon={<TrendingUp className="w-5 h-5 text-[#16A34A]" />} label="Conversion Rate"
                value={`${conversionRate}%`} sub="Positive review rate" color="bg-[#16A34A]/10" />
            </div>

            {/* ROI & Revenue Saver Widget */}
            <GlassPanel className="p-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Estimated Saved Revenue</p>
                    <p className="text-2xl font-extrabold text-white">৳{savedRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-[#A1A1AA]/60 mt-0.5">
                      Based on {displayStats?.feedbackCount ?? 0} blocked negative reviews × ৳{CUSTOMER_LTV} customer lifetime value
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20">
                  <Star className="w-4 h-4 text-[#16A34A] fill-[#16A34A]" />
                  <span className="text-xs font-bold text-[#16A34A]">
                    STAR CATCH ROI: {roiMultiple > 0 ? `${roiMultiple}x` : '—'} Subscription Value
                  </span>
                </div>
              </div>
            </GlassPanel>

            {/* Funnel Conversion Metrics */}
            <GlassPanel className="p-5 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">Tap → Conversion Funnel</h3>
              <div className="flex flex-col sm:flex-row items-stretch gap-0">
                {/* Step 1: Total Scans */}
                <div className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center relative">
                  <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">Total Scans</p>
                  <p className="text-2xl font-extrabold text-white">{displayStats?.totalVisits ?? 0}</p>
                  <p className="text-[10px] text-[#A1A1AA]/60 mt-1">NFC / QR / Link taps</p>
                  {/* Arrow */}
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#18181B] border border-white/10 items-center justify-center">
                    <span className="text-[#A1A1AA] text-xs">→</span>
                  </div>
                </div>
                {/* Step 2: Google Redirects */}
                <div className="flex-1 p-4 rounded-xl bg-[#16A34A]/[0.04] border border-[#16A34A]/15 text-center relative">
                  <p className="text-[10px] text-[#16A34A]/80 uppercase tracking-wider mb-1">Google Reviews</p>
                  <p className="text-2xl font-extrabold text-[#16A34A]">{displayStats?.redirectCount ?? 0}</p>
                  <p className="text-[10px] text-[#16A34A]/60 mt-1">{displayStats?.redirectPercentage ?? 0}% of scans</p>
                  <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#18181B] border border-white/10 items-center justify-center">
                    <span className="text-[#A1A1AA] text-xs">→</span>
                  </div>
                </div>
                {/* Step 3: Private Feedback */}
                <div className="flex-1 p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-center">
                  <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mb-1">Private Feedback</p>
                  <p className="text-2xl font-extrabold text-amber-400">{displayStats?.feedbackCount ?? 0}</p>
                  <p className="text-[10px] text-amber-400/60 mt-1">{displayStats?.feedbackPercentage ?? 0}% of scans</p>
                </div>
              </div>
              {/* Conversion rate callout */}
              <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-[#16A34A]/[0.06] border border-[#16A34A]/15">
                <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                <p className="text-xs text-[#A1A1AA]">
                  Positive conversion rate: <span className="text-[#16A34A] font-bold">{conversionRate}%</span> of all scans redirected to Google Reviews
                </p>
              </div>
            </GlassPanel>

            {/* Chart */}
            <GlassPanel className="p-6 mb-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Rating Performance Trend</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" /> Score (net daily)</span>
                </div>
              </div>
              {isPro ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend || []}>
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v: number) => v.toFixed(0)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2} fill="url(#g)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <>
                  {/* Starter: simplified total count graph */}
                  <div className="h-[220px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                      <p className="text-sm text-[#A1A1AA] mb-1">Total Reviews: {displayStats?.totalVisits ?? 0}</p>
                      <p className="text-xs text-[#A1A1AA]/60">Simple count view</p>
                    </div>
                  </div>
                  {/* Upgrade overlay */}
                  <div className="absolute inset-0 bg-[#0D0D0D]/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-3">
                        <Star className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">Dynamic Trend Analysis</p>
                      <p className="text-xs text-[#A1A1AA] mb-4">Upgrade to Business Pro to unlock the interactive daily rating chart</p>
                      <Button onClick={() => navigate("/pricing")} size="sm"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                        Upgrade to Business Pro
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </GlassPanel>

            {/* Breakdown bar */}
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Rating Breakdown</h3>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-[#16A34A] transition-all duration-500" style={{ width: `${displayStats?.redirectPercentage ?? 0}%` }} />
                <div className="bg-amber-500 transition-all duration-500" style={{ width: `${displayStats?.feedbackPercentage ?? 0}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                  <span className="text-xs text-[#A1A1AA]">Google Redirects ({displayStats?.redirectPercentage ?? 0}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-[#A1A1AA]">Private Feedback ({displayStats?.feedbackPercentage ?? 0}%)</span>
                </div>
              </div>
            </GlassPanel>

            {/* Monthly Report Export */}
            <GlassPanel className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Monthly Performance Report</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">Export a detailed PDF summary with feedback breakdown</p>
                </div>
                <MonthlyReport
                  data={{
                    businessName,
                    totalScans: displayStats?.totalVisits ?? 0,
                    totalRedirects: displayStats?.redirectCount ?? 0,
                    totalFeedbacks: displayStats?.feedbackCount ?? 0,
                    conversionRate,
                    feedbacks: feedbacks?.map((fb) => ({
                      customerName: fb.customerName,
                      rating: fb.rating,
                      message: fb.message,
                      createdAt: fb.createdAt,
                      status: (fb as any).status ?? "unresolved",
                    })) ?? [],
                    starDistribution: (() => {
                      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                      feedbacks?.forEach((fb) => {
                        dist[fb.rating] = (dist[fb.rating] || 0) + 1;
                      });
                      // Also count redirects as 5-star
                      dist[5] += displayStats?.redirectCount ?? 0;
                      return dist;
                    })(),
                  }}
                  isPro={!!isPro}
                  filterLabel={FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "All Time"}
                />
              </div>
            </GlassPanel>

            {/* AI Auto-Reply Assistant (Pro Feature) */}
            <GlassPanel className={`p-5 relative overflow-hidden ${!isPro ? 'opacity-70' : ''}`}>
              {!isPro && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[1px]">
                  <div className="text-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                      <Star className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                    </div>
                    <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to unlock AI Auto-Reply Assistant</p>
                    <Button onClick={() => navigate("/pricing")} size="sm"
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Auto-Reply Assistant</h3>
                  <p className="text-xs text-[#A1A1AA]">Generate smart responses to customer feedback</p>
                </div>
              </div>
              <AIAssistant businessName={businessName} />
            </GlassPanel>

            {/* WhatsApp Alert Configurator (Pro Feature) */}
            <GlassPanel className={`p-5 relative overflow-hidden ${!isPro ? 'opacity-70' : ''}`}>
              {!isPro && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[1px]">
                  <div className="text-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                      <Star className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                    </div>
                    <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to unlock WhatsApp Instant Alerts</p>
                    <Button onClick={() => navigate("/pricing")} size="sm"
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">WhatsApp Instant Alerts</h3>
                  <p className="text-xs text-[#A1A1AA]">Get real-time notifications for private feedback</p>
                </div>
              </div>
              <WhatsAppAlertConfig businessName={businessName} />
            </GlassPanel>
          </>
        )}

        {/* ─── GET REVIEWS TAB ─── */}
        {activeTab === "reviews" && overview && (
          <SubscriptionGuard
            requiredTier="starter"
            message="Subscribe to a plan to unlock your custom review link, QR code, and start capturing reviews from customers."
            enabled={!hasPaidAccess.hasAccess}
          >
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Copy Link Card */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-semibold text-white mb-1">Your Review Link</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">Share this link with customers to collect reviews</p>
              {reviewSlug ? (
                <>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 font-mono text-sm text-[#16A34A] mb-4 break-all">
                    /review/{reviewSlug}
                  </div>
                  <Button onClick={copyReviewLink} className="w-full h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-sm font-semibold cursor-pointer">
                    {copiedLink ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Review Link</>}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[#A1A1AA]">No review profile set up yet.</p>
              )}
            </GlassPanel>

            {/* QR Code */}
            {reviewSlug && (
              <PrintableQR slug={reviewSlug} businessName={overview.businesses[0]?.name || businessName} isPro={!!isPro} />
            )}

            {/* WhatsApp Template */}
            <GlassPanel className={`p-6 relative overflow-hidden ${isStarter ? 'opacity-70' : ''}`}>
              {isStarter && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[1px]">
                  <div className="text-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                      <Star className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                    </div>
                    <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to unlock WhatsApp message generator</p>
                    <Button onClick={() => navigate("/pricing")} size="sm"
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
              <h3 className="text-sm font-semibold text-white mb-1">WhatsApp / SMS Template</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">Copy a ready-made message to send to customers</p>
              {reviewSlug ? (
                <>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-[#A1A1AA] leading-relaxed mb-4">
                    Hi! We'd love your feedback on your recent visit. Please take 30 seconds to rate us:<br /><br />
                    <span className="text-[#16A34A]">{window.location.origin}/review/{reviewSlug}</span><br /><br />
                    Thank you! — {overview.businesses[0]?.name || "Our Team"}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyWhatsAppTemplate} variant="outline" className="flex-1 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold cursor-pointer">
                      {copiedTemplate ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Message</>}
                    </Button>
                    <Button onClick={() => {
                      const slug = reviewSlug;
                      const name = overview?.businesses[0]?.name || "Our Team";
                      if (slug) {
                        const msg = `Hi! We'd love your feedback on your recent visit. Please take 30 seconds to rate us:\n\n${window.location.origin}/review/${slug}\n\nThank you! — ${name}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                      }
                    }} className="flex-1 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold cursor-pointer">
                      <MessageCircle className="w-4 h-4 mr-2" /> Open in WhatsApp
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#A1A1AA]">Set up a review profile first.</p>
              )}
            </GlassPanel>

            {/* Share Tips */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-semibold text-white mb-1">Sharing Tips</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">Ways to share your review link with customers</p>
              <div className="space-y-3">
                {[
                  { icon: <MessageCircle className="w-4 h-4" />, title: "WhatsApp / SMS", desc: "Send directly after a purchase or visit" },
                  { icon: <QrCode className="w-4 h-4" />, title: "Print QR Code", desc: "Display at your counter or on receipts" },
                  { icon: <Share2 className="w-4 h-4" />, title: "Social Media", desc: "Post your link on Facebook, Instagram, etc." },
                  { icon: <Send className="w-4 h-4" />, title: "Email Campaign", desc: "Include in follow-up emails to customers" },
                ].map((tip) => (
                  <div key={tip.title} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] shrink-0">{tip.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{tip.title}</p>
                      <p className="text-xs text-[#A1A1AA]">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
          </SubscriptionGuard>
        )}

        {/* ─── PRIVATE INBOX TAB ─── */}
        {activeTab === "inbox" && overview && (
          <SubscriptionGuard
            requiredTier="starter"
            message="Subscribe to a plan to access your private feedback inbox and capture negative reviews before they go public."
            enabled={!hasPaidAccess.hasAccess}
          >
          <GlassPanel className="overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-white">Private Feedback Inbox</h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Customer feedback from 1-3 star ratings</p>
              </div>
              {feedbacks && feedbacks.length > 0 && (
                <div className="relative">
                  {!isPro ? (
                    <div className="relative group">
                      <Button variant="outline" size="sm" disabled
                        className="border-white/10 bg-white/5 text-[#A1A1AA]/40 cursor-not-allowed text-xs opacity-60">
                        <Lock className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                      </Button>
                      <div className="absolute right-0 top-full mt-2 z-20 hidden group-hover:block w-56 p-3 rounded-xl bg-[#18181B] border border-white/10 shadow-xl">
                        <p className="text-[10px] font-semibold text-[#16A34A] mb-1">PRO FEATURE</p>
                        <p className="text-xs text-[#A1A1AA] mb-2">Upgrade to Business Pro to export feedback data</p>
                        <Button onClick={() => navigate("/pricing")} size="sm"
                          className="w-full h-7 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleDownloadCSV}
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs">
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                    </Button>
                  )}
                </div>
              )}
            </div>

            {!feedbacks || feedbacks.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">No private feedback yet</p>
                <p className="text-xs text-[#A1A1AA]/60 mt-1">When customers rate 1-3 stars, their feedback will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {feedbacks.map((fb) => {
                  const status = feedbackStatuses[fb.id] ?? (fb as any).status ?? "unresolved";
                  return (
                    <div key={fb.id} className={`p-5 hover:bg-white/[0.02] transition-colors ${status === "unresolved" ? "border-l-2 border-l-red-500/60" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-white">{fb.customerName}</span>
                            <span className="text-amber-400 text-xs">{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
                            {status === "unresolved" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                New Complaint
                              </span>
                            )}
                            {fb.phone && <span className="text-xs text-[#A1A1AA]">{fb.phone}</span>}
                          </div>
                          <p className="text-sm text-[#A1A1AA] leading-relaxed">{fb.message}</p>
                          <p className="text-[10px] text-[#A1A1AA]/40 mt-2">{new Date(fb.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {/* WhatsApp Recovery Button */}
                          {fb.phone && (
                            <a
                              href={`https://wa.me/${fb.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hi ${fb.customerName},\n\nThank you for sharing your feedback with us. We're sorry your experience didn't meet expectations.\n\nWe'd love to make it right! As a token of our appreciation, please enjoy a special discount on your next visit.\n\nJust show this message to our staff.\n\nWarm regards,\n${overview?.businesses[0]?.name || "Our Team"}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors cursor-pointer whitespace-nowrap"
                              title="Recover this customer via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                          <button onClick={() => handleToggleStatus(fb.id, status)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${status === "resolved" ? "bg-[#16A34A]" : "bg-red-500/80"}`}>
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${status === "resolved" ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                          </button>
                          <span className={`text-[10px] font-semibold ${status === "resolved" ? "text-[#16A34A]" : "text-red-400"}`}>
                            {status === "resolved" ? "Resolved" : "Unresolved"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassPanel>
          </SubscriptionGuard>
        )}

        {/* ─── STAFF & QR TAB ─── */}
        {activeTab === "staff" && overview && (
          <div className="space-y-6">
            {/* QR Code Generator */}
            <GlassPanel className="p-5">
              <QRCodeGenerator
                reviewUrl={`${window.location.origin}/review/${reviewSlug || overview.businesses[0]?.slug || ""}`}
                businessName={overview.businesses[0]?.name || businessName}
                logoUrl={overview.businesses[0]?.logoUrl}
                brandColor={overview.businesses[0]?.brandColor}
              />
            </GlassPanel>

            {/* Staff Management + Leaderboard */}
            <GlassPanel className="p-5">
              <StaffManager
                businessId={selectedBusinessId || overview.businesses[0]?.id || ""}
                businessSlug={reviewSlug || overview.businesses[0]?.slug || ""}
                businessName={overview.businesses[0]?.name || businessName}
                brandColor={overview.businesses[0]?.brandColor}
              />
            </GlassPanel>

            {/* Enhanced Staff Performance Leaderboard */}
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Staff Performance Leaderboard</h3>
                  <p className="text-xs text-[#A1A1AA]">Track individual staff review generation performance</p>
                </div>
              </div>
              <EnhancedLeaderboard
                staff={overview.businesses[0]?.id ? [
                  { id: "1", name: "Staff Member 1", slug: "staff-1", totalScans: 47, publicReviews: 38, privateFeedbacks: 9, conversionRate: 81 },
                  { id: "2", name: "Staff Member 2", slug: "staff-2", totalScans: 32, publicReviews: 28, privateFeedbacks: 4, conversionRate: 88 },
                  { id: "3", name: "Staff Member 3", slug: "staff-3", totalScans: 21, publicReviews: 18, privateFeedbacks: 3, conversionRate: 86 },
                ] : []}
              />
            </GlassPanel>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-6 border-t border-white/5 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#16A34A] flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="text-xs text-[#A1A1AA]">STAR CATCH Reviews and Feedback Agency Bd</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#A1A1AA]/60 overflow-x-auto flex-nowrap">
              <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">Terms of Service</button>
              <span className="text-[#A1A1AA]/20">·</span>
              <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">Privacy Policy</button>
              <span className="text-[#A1A1AA]/20">·</span>
              <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">Refund Policy</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] text-[#A1A1AA]/40 overflow-x-auto flex-nowrap">
              <a href="mailto:starcatchbd@gmail.com" className="hover:text-white transition-colors whitespace-nowrap">starcatchbd@gmail.com</a>
              <span className="text-[#A1A1AA]/10">·</span>
              <span className="whitespace-nowrap">Mahin Hossain (Founder)</span>
              <a href="tel:+8801791130633" className="hover:text-white transition-colors whitespace-nowrap">+880 1791-130633</a>
              <a href="mailto:mahinhosen870@gmail.com" className="hover:text-white transition-colors whitespace-nowrap">mahinhosen870@gmail.com</a>
              <span className="text-[#A1A1AA]/10">|</span>
              <span className="whitespace-nowrap">Ahnaf Tajwar Alif (Co-Founder)</span>
              <a href="tel:+8801673903919" className="hover:text-white transition-colors whitespace-nowrap">+880 1673-903919</a>
              <a href="mailto:atazwar103@gmail.com" className="hover:text-white transition-colors whitespace-nowrap">atazwar103@gmail.com</a>
            </div>
            <a
              href={`https://wa.me/8801673903919?text=${encodeURIComponent("Hi STAR CATCH team, I need help with my review dashboard")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-medium hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
