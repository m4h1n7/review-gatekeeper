import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { PrintableQR } from "@/components/PrintableQR";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import NFCCardPreview from "@/components/NFCCardPreview";
import StaffManager from "@/components/StaffManager";
import EnhancedLeaderboard from "@/components/EnhancedLeaderboard";
import { PaywallModal } from "@/components/PaywallModal";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { SubscriptionGuard, useHasAccess } from "@/components/SubscriptionGuard";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
import { motion } from "framer-motion";
import {
  LogOut,
  Star,
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
  User,
  Zap,
  ArrowRight,
  Crown,
  Nfc,
} from "lucide-react";
import { useNavigate } from "react-router";
import { NotificationBell, GlassPanel, type NotificationItem } from "@/components/DashboardWidgets";
import OverviewTab from "@/components/OverviewTab";

type TabType = "overview" | "reviews" | "inbox" | "staff";
type FilterRange = "today" | "week" | "month" | "all";

const FILTER_OPTIONS: { value: FilterRange; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "week", label: "7 Days", days: 7 },
  { value: "month", label: "30 Days", days: 30 },
  { value: "all", label: "All Time", days: 90 },
];

/* ─── Real-time Notification Bell ─── */

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [filter, setFilter] = useState<FilterRange>("week");
  const [chartDays, setChartDays] = useState(7);
  // Staff leaderboard timeframe (mirrors `filter` so the same controls drive both)
  const [leaderboardDays, setLeaderboardDays] = useState<number>(7);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const subscription = useQuery(api.subscriptions.getCurrent);
  const accountStatus = useQuery(api.users.getAccountStatus);
  const announcement = useQuery(api.users.getActiveAnnouncement);
  const isPro = (subscription?.plan === "pro" || subscription?.plan === "trial") && subscription?.status === "active";
  const isStarter = subscription?.plan === "starter" && subscription?.status === "active";
  const isTrial = subscription?.plan === "trial" && subscription?.status === "active";
  const overview = useQuery(api.analytics.dashboardOverview, { filter });
  const trend = useQuery(api.analytics.ratingTrend, { days: chartDays });
  // Expired = timestamp passed while still "active" (real-time window before
  // the cron runs) OR the cron already flipped status to "expired".
  const isExpired =
    subscription?.status === "expired" ||
    ((subscription?.plan === "pro" || subscription?.plan === "starter" || subscription?.plan === "trial") &&
      subscription?.status === "active" &&
      subscription?.expiresAt !== undefined &&
      subscription.expiresAt < Date.now());
  const hasPaidAccess = useHasAccess("starter");
  const hasProAccess = useHasAccess("pro");
  const daysRemaining = subscription?.expiresAt ? Math.ceil((subscription.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)) : null;
  const showExpiryWarning = subscription?.status === "active" && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;

  // ── Locked state: no active plan or expired trial ──
  const isLocked = !hasPaidAccess.hasAccess && !hasPaidAccess.isLoading;

  // ── Business Pro feature gate ──
  // Starter Plan unlocks: Overview, Review Link, Printable QR generator,
  // Private Inbox, and a read-only preview of the Staff & QR hub.
  // Pro-only (fully interactive): Staff & QR actions, NFC Review Card assets.
  // Super admins bypass the gate.
  const isSuperAdminUser = isSuperAdmin(user?.email);
  const isStarterOnly =
    !isLocked &&
    !isSuperAdminUser &&
    subscription?.plan === "starter" &&
    subscription?.status === "active" &&
    subscription?.expiresAt !== undefined &&
    subscription.expiresAt > Date.now();
  const hasProFeatures = !isStarterOnly;

  const [showPaywall, setShowPaywall] = useState(false);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  // When set, the paywall opens pre-focused on Business Pro with a
  // feature-specific reason (e.g. clicking the locked Staff & QR tab).
  const [proPaywallReason, setProPaywallReason] = useState<string | null>(null);

  const openProPaywall = (reason: string) => {
    setProPaywallReason(reason);
    setShowPaywall(true);
  };

  // Show paywall modal on first load for users without a plan
  useEffect(() => {
    if (hasPaidAccess.isLoading) return; // wait for subscription to load
    if (isLocked) {
      setProPaywallReason(null);
      setShowPaywall(true);
    } else if (isTrial && isExpired) {
      setShowTrialExpired(true);
    }
  }, [hasPaidAccess.isLoading, isLocked, isTrial, isExpired]);


  const stats = useQuery(api.analytics.businessStats, selectedBusinessId ? { businessId: selectedBusinessId, filter } : "skip");
  const feedbacks = useQuery(api.analytics.recentFeedbacks, selectedBusinessId ? { businessId: selectedBusinessId, limit: 20 } : "skip");
  // Real-time notification feed — live Convex subscription, no polling
  const notifications = useQuery(api.notifications.listMine);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const unreadNotifications = (notifications ?? []).filter((n) => !n.read).length;
  const staffLeaderboard = useQuery(
    api.staff.getLeaderboard,
    overview?.businesses?.[0]?.id && leaderboardDays != null
      ? { businessId: overview.businesses[0].id, days: leaderboardDays }
      : "skip",
  );

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handleDownloadCSV = () => {
    if (!feedbacks || feedbacks.length === 0) return;
    const headers = ["Customer Name", "Phone", "Email", "Rating", "Feedback", "Status", "Timestamp"];
    const rows = feedbacks.map((fb) => [
      fb.customerName, fb.phone, fb.email, fb.rating,
      `"${(fb.message ?? "").replace(/"/g, '""')}"`, (fb as any).status ?? "unresolved",
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
    totalReviews: (overview as any).totalReviews,
    conversionRate: (overview as any).conversionRate,
  } : null;

  const businessName = overview?.businesses[0]?.name || user?.name || "your business";
  const reviewSlug = overview?.businesses[0]?.slug;
  // Conversion rate = (Google Redirects / Total Scans) × 100 — computed
  // server-side in Convex (analytics.businessStats / dashboardOverview) so it
  // stays exact and reactive; the local fallback mirrors the same formula.
  const conversionRate = displayStats?.conversionRate
    ?? (displayStats?.totalVisits
      ? Math.round((displayStats.redirectCount / displayStats.totalVisits) * 100)
      : 0);

  // ROI calculation: blocked negative reviews x ৳750 estimated customer lifetime value
  const CUSTOMER_LTV = 750;
  const savedRevenue = (displayStats?.feedbackCount ?? 0) * CUSTOMER_LTV;
  const subscriptionCost = subscription?.plan === "trial" ? 0 : subscription?.plan === "pro" ? 2499 : subscription?.plan === "starter" ? 1499 : 0;
  const roiMultiple = subscriptionCost > 0 ? Math.round(savedRevenue / subscriptionCost) : 0;

  const unresolvedCount = feedbacks?.filter((fb) => (fb as any).status === "unresolved").length ?? 0;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; locked?: boolean; proBadge?: boolean; action?: () => void }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "reviews", label: "Get Reviews", icon: <Star className="w-4 h-4" />, locked: isLocked },
    { id: "inbox", label: "Private Inbox", icon: <Inbox className="w-4 h-4" />, badge: !isLocked && unresolvedCount > 0 ? unresolvedCount : undefined, locked: isLocked, action: isLocked ? undefined : () => navigate("/dashboard/feedback") },
    // Staff & QR is a Business Pro feature — Starter users see the paywall
    // Staff & QR is explorable on Starter as a blurred read-only preview —
    // the upgrade prompt lives inside the page, not on the tab click.
    { id: "staff", label: "Staff & QR", icon: <Users className="w-4 h-4" />, locked: isLocked, proBadge: isStarterOnly },
  ];

  return (
    <div className="min-h-screen">
      <PaywallModal
        open={showPaywall}
        onClose={() => { setShowPaywall(false); setProPaywallReason(null); }}
        plan={proPaywallReason ? "pro" : undefined}
        reason={proPaywallReason ?? (isExpired
          ? "Your subscription has expired. Renew via bKash or Nagad to regain full access."
          : "Complete your subscription to unlock full dashboard access. Pay via bKash, Nagad, or card.")}
      />

      {/* Trial Expired Payment Modal */}
      {isTrial && (
        <TrialExpiredModal
          open={showTrialExpired}
          onClose={() => setShowTrialExpired(false)}
          onSuccess={() => setShowTrialExpired(false)}
        />
      )}

      {/* ─── EXPIRED SUBSCRIPTION BANNER (Upgrade / Renew Plan) ───
          Shown when the account's plan has lapsed: status is "expired" (set by
          the daily cron) OR the expiry timestamp has passed while still
          "active" (covers the real-time window before the next cron run).     */}
      {isExpired && (
        <div className="bg-gradient-to-r from-red-500/15 via-red-500/10 to-red-500/5 border-b border-red-500/25">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Your subscription has expired. Renew your plan to reactivate your NFC review portal.
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  Customer NFC taps now see a “Service Inactive” screen — no taps reach Google until you renew. All settings are locked while expired.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPaywall(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 cursor-pointer shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all whitespace-nowrap"
            >
              <Zap className="w-4 h-4 mr-2" /> Upgrade / Renew Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── LOCKED DASHBOARD PAYWALL BANNER (hidden when expired — the
          dedicated Upgrade / Renew banner above covers that state) ─── */}
      {isLocked && !isExpired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#16A34A]/15 via-[#16A34A]/10 to-[#16A34A]/5 border-b border-[#16A34A]/20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/25 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Unlock Full Access</p>
                <p className="text-xs text-[#A1A1AA]">Choose a plan to start collecting reviews and unlocking all features</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPaywall(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold px-6 cursor-pointer shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all whitespace-nowrap"
            >
              <Zap className="w-4 h-4 mr-2" /> Select Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
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
            {/* Real-time Notification Bell */}
            <NotificationBell
              notifications={notifications as NotificationItem[] | undefined}
              onMarkAllRead={() => {
                markAllRead().catch(() => {});
              }}
            />
            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#16A34A]/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-[#16A34A]" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white leading-none">{user?.name || "User"}</span>
                <span className="text-[10px] text-[#A1A1AA] leading-none mt-0.5 max-w-[120px] truncate">{user?.email}</span>
              </div>
            </div>
            {/* Subscription Badge */}
            {!isLocked && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
                <Crown className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
                  {subscription?.plan === "pro" ? "Pro" : subscription?.plan === "starter" ? "Starter" : "Trial"}
                </span>
              </div>
            )}
            {isLocked && (
              <Button
                size="sm"
                onClick={() => setShowPaywall(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer font-semibold text-xs whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
              </Button>
            )}
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
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs whitespace-nowrap">
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
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
          <p className="text-sm text-[#A1A1AA] mt-1">
            {isLocked
              ? "Set up your business profile and choose a plan to start collecting reviews."
              : "Here's how your review gateway is performing."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 w-fit overflow-x-auto flex-nowrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => {
              if (tab.locked) {
                setProPaywallReason(null);
                setShowPaywall(true);
                return;
              }
              if ((tab as any).action) {
                (tab as any).action();
              } else {
                setActiveTab(tab.id);
              }
            }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${
                activeTab === tab.id && !tab.locked
                  ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}>
              {tab.icon} {tab.label}
              {tab.locked && <Lock className="w-3 h-3 text-[#A1A1AA]/40 ml-0.5" />}
              {tab.proBadge && (
                <span className="ml-1 px-1.5 py-px text-[9px] font-bold rounded bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#16A34A]">PRO</span>
              )}
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
            <OverviewTab
              profileCount={overview.profileCount}
              displayStats={displayStats}
              unresolvedCount={unresolvedCount}
              selectedBusinessId={selectedBusinessId}
              conversionRate={conversionRate}
              savedRevenue={savedRevenue}
              roiMultiple={roiMultiple}
              isPro={!!isPro}
              isLocked={isLocked}
              trend={trend}
              feedbacks={feedbacks}
              businessName={businessName}
              filterLabel={FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "All Time"}
            />
          </>
        )}

        {/* ─── GET REVIEWS TAB ─── */}
        {activeTab === "reviews" && overview && (
          <SubscriptionGuard
            requiredTier="starter"
            message="Subscribe to a plan to unlock your custom review link, QR code, and start capturing reviews from customers."
            enabled={isLocked}
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

            {/* QR Code — full Printable QR generator included in Starter Plan */}
            {reviewSlug && (
              <PrintableQR slug={reviewSlug} businessName={overview.businesses[0]?.name || businessName} />
            )}

            {/* NFC Card Preview — PRO FEATURE (Business Pro only) */}
            {reviewSlug && (
              <GlassPanel className={`p-6 relative overflow-hidden ${hasProFeatures ? "" : "opacity-70"}`}>
                {!hasProFeatures && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-[1px]">
                    <div className="text-center px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                        <Star className="w-3 h-3 fill-[#16A34A]" /> PRO FEATURE
                      </div>
                      <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to unlock the NFC Review Card designer with printable PDF & vector assets</p>
                      <Button
                        onClick={() => openProPaywall("The NFC Review Card Preview — interactive CR80 card, Download Printable Card PDF, Front/Back SVG, and print tools — is a Business Pro feature. Upgrade to unlock it.")}
                        size="sm"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
                      >
                        Upgrade to Business Pro
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                    <Nfc className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">NFC Review Card Preview</h3>
                    <p className="text-[10px] text-[#A1A1AA]">Physical card design for printing & NFC programming</p>
                  </div>
                </div>
                <NFCCardPreview
                  slug={reviewSlug}
                  businessName={overview.businesses[0]?.name || businessName}
                  brandColor={overview.businesses[0]?.brandColor || "#16A34A"}
                  staffMembers={staffLeaderboard?.map((s) => ({
                    id: String(s.staffId),
                    name: s.name,
                    slug: s.slug,
                  })) || []}
                  isPro={!!isPro}
                />
              </GlassPanel>
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
            enabled={isLocked}
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
          <SubscriptionGuard
            requiredTier="starter"
            message="Subscribe to a plan to unlock staff management, QR code generation, and performance tracking."
            enabled={isLocked}
          >
          <div className="relative space-y-6">
            {/* Starter Plan: non-intrusive inline PRO banner — no auto-popup on
                tab click. The full hub below is a blurred read-only preview;
                any action attempt opens the upgrade modal. */}
            {!hasProFeatures && (
              <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/10 px-4 py-3">
                <div className="flex items-center gap-2.5 text-center sm:text-left">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#16A34A]/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-[#16A34A] fill-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">PRO FEATURE — Staff Management</p>
                    <p className="text-[11px] text-[#A1A1AA]">Explore the hub below — add staff, share QR links, and download cards by upgrading to Business Pro.</p>
                  </div>
                </div>
                <Button onClick={() => openProPaywall("Staff Management, staff-specific QR links, and the performance leaderboard are Business Pro features. Upgrade to unlock the Staff & QR system.")} size="sm" className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer shrink-0">Upgrade to Business Pro</Button>
              </div>
            )}
            {/* Invisible catcher over the blurred preview: any click on a
                disabled control opens the upgrade modal. */}
            {!hasProFeatures && (
              <div className="absolute inset-0 z-10 cursor-pointer" title="Upgrade to Business Pro to unlock Staff Management" onClick={() => openProPaywall("The Staff & QR hub is read-only on Starter. Upgrade to Business Pro to add staff, copy links, and download QR codes.")} />
            )}
            {/* Blurred, non-interactive preview of the full hub */}
            <div className={`space-y-6 ${hasProFeatures ? "" : "pointer-events-none blur-[3px] opacity-60"}`}>
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
                staff={staffLeaderboard?.map((s) => ({
                  id: String(s.staffId),
                  name: s.name,
                  slug: s.slug,
                  role: s.role,
                  totalScans: s.totalScans,
                  publicReviews: s.publicReviews,
                  privateFeedbacks: s.privateFeedbacks,
                  positiveReviews: s.positiveReviews,
                  negativeFeedbacks: s.negativeFeedbacks,
                  conversionRate: s.conversionRate,
                })) || []}
            periodFilter={{
              value: filter === "today" ? "all" : filter,
              days: leaderboardDays,
            }}
            onPeriodChange={(value, days) => {
              // Map back to FilterRange: 'week'↔week, 'month'↔month, 'all'↔today
              setFilter((value === "week" ? "week" : value === "month" ? "month" : "today") as FilterRange);
              setChartDays(days ?? 90);
              setLeaderboardDays(days ?? 90);
            }}
              />
            </GlassPanel>
            </div>
          </div>
          </SubscriptionGuard>
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
