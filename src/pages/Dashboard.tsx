import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { PrintableQR } from "@/components/PrintableQR";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  LogOut,
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Shield,
  ExternalLink,
  Download,
  Link2,
  TestTube,
  Share2,
  CheckCircle2,
  Copy,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router";

type FilterRange = "today" | "week" | "month" | "all";

const FILTER_OPTIONS: { value: FilterRange; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "week", label: "7 Days", days: 7 },
  { value: "month", label: "30 Days", days: 30 },
  { value: "all", label: "All Time", days: 90 },
];

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-white tabular-nums">
            {value}
          </p>
          {sub && <p className="text-xs text-[#A1A1AA]/60 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </GlassPanel>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#A1A1AA] mb-1">{label}</p>
        <p className="text-sm font-bold text-white">Score: {payload[0].value}</p>
        {payload[0].payload?.positive !== undefined && (
          <div className="flex gap-3 mt-1">
            <span className="text-[10px] text-[#16A34A]">+{payload[0].payload.positive} positive</span>
            <span className="text-[10px] text-amber-400">-{payload[0].payload.negative} feedback</span>
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
  const [filter, setFilter] = useState<FilterRange>("week");
  const [chartDays, setChartDays] = useState(7);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const overview = useQuery(api.analytics.dashboardOverview, { filter });
  const trend = useQuery(api.analytics.ratingTrend, { days: chartDays });
  const stats = useQuery(
    api.analytics.businessStats,
    selectedBusinessId
      ? { businessId: selectedBusinessId, filter }
      : "skip",
  );
  const feedbacks = useQuery(
    api.analytics.recentFeedbacks,
    selectedBusinessId
      ? { businessId: selectedBusinessId, limit: 15 }
      : "skip",
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDownloadCSV = () => {
    if (!feedbacks || feedbacks.length === 0) return;
    const headers = ["Customer Name", "Phone", "Email", "Rating", "Feedback", "Timestamp"];
    const rows = feedbacks.map((fb) => [
      fb.customerName,
      fb.phone,
      fb.email,
      fb.rating,
      `"${fb.message.replace(/"/g, '""')}"`,
      new Date(fb.createdAt).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `star-catch-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showChecklist = overview && overview.totalVisits < 3;

  const toggleFeedbackStatus = useMutation(api.feedback.toggleStatus);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, "resolved" | "unresolved">>({});
  const [showQuickReply, setShowQuickReply] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleToggleStatus = async (feedbackId: string, currentStatus: "resolved" | "unresolved") => {
    const newStatus = currentStatus === "resolved" ? "unresolved" : "resolved";
    setFeedbackStatuses((prev) => ({ ...prev, [feedbackId]: newStatus }));
    try {
      await toggleFeedbackStatus({ feedbackId, status: newStatus });
    } catch (e) {
      console.error("Failed to toggle status:", e);
      setFeedbackStatuses((prev) => ({ ...prev, [feedbackId]: currentStatus }));
    }
  };

  const copyReplyTemplate = (customerName: string) => {
    const template = `Dear ${customerName},\n\nThank you for sharing your feedback with us. We sincerely apologize for the inconvenience you experienced. Your input is invaluable, and we are actively working to improve.\n\nWe would love the opportunity to make things right. Please feel free to reach out to us directly so we can assist you further.\n\nWarm regards,\nSTAR CATCH Reviews and Feedback Agency Bd`;
    navigator.clipboard.writeText(template);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const displayStats = selectedBusinessId && stats ? stats : overview ? {
    totalVisits: overview.totalVisits,
    redirectCount: overview.totalRedirects,
    feedbackCount: overview.totalFeedbacks,
    redirectPercentage: overview.redirectPercentage,
    feedbackPercentage: overview.feedbackPercentage,
  } : null;

  const businessName = overview?.businesses[0]?.name || user?.name || "your business";

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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-5 h-5 text-white fill-white" />
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
            {isSuperAdmin(user?.email) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="border-[#16A34A]/30 bg-[#16A34A]/10 hover:bg-[#16A34A]/20 text-[#16A34A] cursor-pointer font-semibold"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/manage")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
            >
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Personalized Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              {overview?.businesses[0] ? (
                <span className="text-lg font-bold text-[#16A34A]">{businessName.charAt(0).toUpperCase()}</span>
              ) : (
                <Star className="w-6 h-6 text-[#16A34A] fill-[#16A34A]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#16A34A]">
                Analytics Dashboard
              </p>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {businessName}!
              </h1>
            </div>
          </div>
        </div>

        {/* Getting Started Checklist */}
        {showChecklist && (
          <GlassPanel className="p-6 mb-8">
            <h3 className="text-sm font-semibold text-white mb-4">
              Getting Started
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: <Link2 className="w-4 h-4" />,
                  label: "Connect Your Google Review Link",
                  desc: "Add your business and set up your Google Review URL",
                  done: overview.profileCount > 0,
                  action: () => navigate("/manage"),
                },
                {
                  icon: <TestTube className="w-4 h-4" />,
                  label: "Test Your Review Page",
                  desc: "Open your review link and verify the star rating flow works",
                  done: overview.totalVisits > 0,
                  action: () => overview.businesses[0] && window.open(`/review/${overview.businesses[0].slug}`, "_blank"),
                },
                {
                  icon: <Share2 className="w-4 h-4" />,
                  label: "Share with Customers",
                  desc: "Send your review link via SMS, email, or QR code",
                  done: overview.totalVisits >= 3,
                  action: () => navigate("/manage"),
                },
              ].map((step, i) => (
                <div
                  key={i}
                  onClick={step.done ? undefined : step.action}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    step.done
                      ? "bg-[#16A34A]/5 border border-[#16A34A]/15"
                      : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] cursor-pointer"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    step.done ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-white/5 text-[#A1A1AA]"
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${step.done ? "text-[#16A34A]" : "text-white"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{step.desc}</p>
                  </div>
                  {step.done ? (
                    <span className="text-[10px] font-semibold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#A1A1AA] bg-white/5 px-2 py-0.5 rounded-full">
                      Step {i + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {/* Filter + Business Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-[#A1A1AA] mr-1" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setFilter(opt.value); setChartDays(opt.days); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                filter === opt.value
                  ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                  : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Business profile selector */}
        {overview && overview.businesses.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedBusinessId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                !selectedBusinessId
                  ? "bg-[#16A34A] text-white"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"
              }`}
            >
              All Profiles
            </button>
            {overview.businesses.map((biz) => (
              <button
                key={biz.id}
                onClick={() => setSelectedBusinessId(biz.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedBusinessId === biz.id
                    ? "bg-[#16A34A] text-white"
                    : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"
                }`}
              >
                {biz.name}
              </button>
            ))}
          </div>
        )}

        {!overview ? (
          <GlassPanel className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-8 h-8 text-[#A1A1AA]/30" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              No data yet
            </h2>
            <p className="text-sm text-[#A1A1AA] mb-6">
              Create a review profile to start tracking ratings and feedback.
            </p>
            <Button
              onClick={() => navigate("/manage")}
              className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white cursor-pointer font-semibold"
            >
              Create Your First Profile
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
          </GlassPanel>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Eye className="w-5 h-5 text-[#16A34A]" />}
                label="Total Visits"
                value={displayStats?.totalVisits ?? 0}
                sub={selectedBusinessId ? "This profile" : `Across ${overview.profileCount} profile(s)`}
                color="bg-[#16A34A]/10"
              />
              <StatCard
                icon={<Star className="w-5 h-5 text-emerald-400" />}
                label="Google Redirects"
                value={displayStats?.redirectCount ?? 0}
                sub={displayStats && "redirectPercentage" in displayStats
                  ? `${displayStats.redirectPercentage}% of total`
                  : `${overview.redirectPercentage}% of total`
                }
                color="bg-emerald-500/10"
              />
              <StatCard
                icon={<MessageSquare className="w-5 h-5 text-amber-400" />}
                label="Private Feedback"
                value={displayStats?.feedbackCount ?? 0}
                sub={displayStats && "feedbackPercentage" in displayStats
                  ? `${displayStats.feedbackPercentage}% of total`
                  : `${overview.feedbackPercentage}% of total`
                }
                color="bg-amber-500/10"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-[#16A34A]" />}
                label="Protection Rate"
                value={`${displayStats && "redirectPercentage" in displayStats
                  ? displayStats.redirectPercentage
                  : overview.redirectPercentage
                }%`}
                sub="Reviews redirected to Google"
                color="bg-[#16A34A]/10"
              />
            </div>

            {/* Rating Trend Chart */}
            <GlassPanel className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Rating Performance Trend
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Score trends up with positive redirects, down with private feedback
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="text-[#A1A1AA]">Score</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend || []}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      stroke="#A1A1AA"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#A1A1AA"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#16A34A"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            {/* Ratio bar */}
            <GlassPanel className="p-6 mb-8">
              <h3 className="text-sm font-semibold text-white mb-3">
                Rating Breakdown
              </h3>
              <div className="h-4 rounded-full bg-white/5 overflow-hidden flex">
                <div
                  className="bg-[#16A34A] transition-all duration-500"
                  style={{
                    width: `${displayStats?.redirectPercentage ?? 0}%`,
                  }}
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${displayStats?.feedbackPercentage ?? 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                  <span className="text-xs text-[#A1A1AA]">
                    Google Redirects ({displayStats?.redirectPercentage ?? 0}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-[#A1A1AA]">
                    Private Feedback ({displayStats?.feedbackPercentage ?? 0}%)
                  </span>
                </div>
              </div>
            </GlassPanel>

            {/* QR Code + Feedback Table Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* QR Code Card */}
              {overview.businesses.length > 0 && (
                <PrintableQR
                  slug={selectedBusinessId
                    ? overview.businesses.find((b) => b.id === selectedBusinessId)?.slug ?? overview.businesses[0].slug
                    : overview.businesses[0].slug
                  }
                  businessName={selectedBusinessId
                    ? overview.businesses.find((b) => b.id === selectedBusinessId)?.name ?? overview.businesses[0].name
                    : overview.businesses[0].name
                  }
                />
              )}

              {/* Recent Feedback Table */}
              {feedbacks && feedbacks.length > 0 && (
                <GlassPanel className="lg:col-span-2 overflow-hidden">
                  <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Recent Private Feedback
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        Latest submissions from dissatisfied customers
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCSV}
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Download CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-t border-white/5">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">
                            Feedback
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {feedbacks.map((fb) => {
                          const status = feedbackStatuses[fb.id] ?? (fb as any).status ?? "unresolved";
                          return (
                            <tr
                              key={fb.id}
                              className="hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-white">
                                  {fb.customerName}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-amber-400 text-sm">
                                  {"★".repeat(fb.rating)}
                                  {"☆".repeat(5 - fb.rating)}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-[200px] hidden md:table-cell">
                                <p className="text-sm text-[#A1A1AA] truncate">
                                  {fb.message}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleToggleStatus(fb.id, status)}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${status === "resolved" ? "bg-[#16A34A]" : "bg-red-500/80"}`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                      status === "resolved" ? "translate-x-[18px]" : "translate-x-[3px]"
                                    }`}
                                  />
                                </button>
                                <span className={`ml-2 text-[10px] font-semibold ${status === "resolved" ? "text-[#16A34A]" : "text-red-400"}`}>
                                  {status === "resolved" ? "Resolved" : "Unresolved"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="relative inline-block">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowQuickReply(showQuickReply === fb.id ? null : fb.id)}
                                    className="h-7 px-2 text-[10px] text-[#A1A1AA] hover:text-white hover:bg-white/5 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Quick Reply
                                  </Button>
                                  {showQuickReply === fb.id && (
                                    <div className="absolute right-0 top-9 z-30 w-72 rounded-xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-2xl p-4">
                                      <p className="text-xs font-semibold text-white mb-2">Quick Reply Template</p>
                                      <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
                                        Dear {fb.customerName},<br /><br />
                                        Thank you for sharing your feedback. We sincerely apologize for the inconvenience. We are actively working to improve based on your input.
                                      </p>
                                      <Button
                                        size="sm"
                                        onClick={() => copyReplyTemplate(fb.customerName)}
                                        className="w-full h-8 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs cursor-pointer"
                                      >
                                        {copiedTemplate ? (
                                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Copied to Clipboard</>
                                        ) : (
                                          <><Copy className="w-3 h-3 mr-1" /> Copy Template</>
                                        )}
                                      </Button>
                                      <p className="text-[10px] text-[#A1A1AA]/50 mt-2 text-center">Paste into WhatsApp or SMS to send</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassPanel>
              )}
            </div>

            {feedbacks && feedbacks.length === 0 && selectedBusinessId && (
              <GlassPanel className="p-8 text-center mb-8">
                <MessageSquare className="w-8 h-8 text-[#A1A1AA]/30 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">
                  No private feedback yet for this profile.
                </p>
              </GlassPanel>
            )}
          </>
        )}
      </div>
    </div>
  );
}
