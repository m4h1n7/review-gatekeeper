import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
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
} from "lucide-react";
import { useNavigate } from "react-router";

type FilterRange = "today" | "week" | "month" | "all";

const FILTER_OPTIONS: { value: FilterRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
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

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterRange>("all");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const overview = useQuery(api.analytics.dashboardOverview, { filter });
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

  const displayStats = selectedBusinessId && stats ? stats : overview ? {
    totalVisits: overview.totalVisits,
    redirectCount: overview.totalRedirects,
    feedbackCount: overview.totalFeedbacks,
    redirectPercentage: overview.redirectPercentage,
    feedbackPercentage: overview.feedbackPercentage,
  } : null;

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
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              STAR CATCH MEDIA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Manage Profiles
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
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#16A34A]">
            Analytics Dashboard
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-[#A1A1AA] mr-1" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
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
              onClick={() => navigate("/admin")}
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

            {/* Recent Feedback Table */}
            {feedbacks && feedbacks.length > 0 && (
              <GlassPanel className="overflow-hidden mb-8">
                <div className="p-6 pb-4">
                  <h3 className="text-sm font-semibold text-white">
                    Recent Private Feedback
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Latest submissions from dissatisfied customers
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-white/5">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden sm:table-cell">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                          Feedback
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {feedbacks.map((fb) => (
                        <tr
                          key={fb.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-white">
                              {fb.customerName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-amber-400 text-sm">
                              {"★".repeat(fb.rating)}
                              {"☆".repeat(5 - fb.rating)}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-sm text-[#A1A1AA]">
                              {fb.phone}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-[#A1A1AA]">
                              {fb.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-[200px]">
                            <p className="text-sm text-[#A1A1AA] truncate">
                              {fb.message}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs text-[#A1A1AA]/60 whitespace-nowrap">
                              {formatTime(fb.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassPanel>
            )}

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
