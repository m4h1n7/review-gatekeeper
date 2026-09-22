import { Button } from "@/components/ui/button";
import { GlassPanel, StatCard, CustomTooltip } from "@/components/DashboardWidgets";
import { MonthlyReport } from "@/components/MonthlyReport";
import AIAssistant from "@/components/AIAssistant";
import WhatsAppAlertConfig from "@/components/WhatsAppAlertConfig";
import { useNavigate } from "react-router";
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
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ClipboardCheck,
  Sparkles,
  MessageCircle,
} from "lucide-react";

/* ─── Overview Tab — extracted from Dashboard.tsx (identical markup) ─── */

type StatsShape = {
  totalVisits?: number;
  redirectCount?: number;
  feedbackCount?: number;
  redirectPercentage?: number;
  feedbackPercentage?: number;
  totalReviews?: number;
} | null;

export default function OverviewTab({
  profileCount,
  displayStats,
  unresolvedCount,
  selectedBusinessId,
  conversionRate,
  savedRevenue,
  roiMultiple,
  isPro,
  isLocked,
  trend,
  feedbacks,
  businessName,
  filterLabel,
}: {
  profileCount: number;
  displayStats: StatsShape;
  unresolvedCount: number;
  selectedBusinessId: string | null;
  conversionRate: number;
  savedRevenue: number;
  roiMultiple: number;
  isPro: boolean;
  isLocked: boolean;
  trend: any[] | undefined;
  feedbacks: any[] | undefined;
  businessName: string;
  filterLabel: string;
}) {
  const navigate = useNavigate();
  const CUSTOMER_LTV = 750;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<Eye className="w-5 h-5 text-[#16A34A]" />} label="Total Scans" value={displayStats?.totalVisits ?? 0}
          sub={selectedBusinessId ? "This profile" : `Across ${profileCount} profile(s)`} color="bg-[#16A34A]/10" />
        <StatCard icon={<Star className="w-5 h-5 text-emerald-400" />} label="Google Redirects" value={displayStats?.redirectCount ?? 0}
          sub={`${displayStats?.redirectPercentage ?? 0}% of scans`} color="bg-emerald-500/10" />
        <StatCard icon={<MessageSquare className="w-5 h-5 text-amber-400" />} label="Private Feedback" value={displayStats?.feedbackCount ?? 0}
          sub={unresolvedCount > 0 ? `${unresolvedCount} unresolved` : `${displayStats?.feedbackPercentage ?? 0}% of scans`} color="bg-amber-500/10" />
        <StatCard icon={<ClipboardCheck className="w-5 h-5 text-sky-400" />} label="Total Reviews" value={displayStats?.totalReviews ?? (displayStats ? (displayStats.redirectCount ?? 0) + (displayStats.feedbackCount ?? 0) : 0)}
          sub="Redirects + feedback" color="bg-sky-500/10" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-[#16A34A]" />} label="Conversion Rate"
          value={`${conversionRate}%`} sub="Scans → Google reviews" color="bg-[#16A34A]/10" />
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
          <div className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center relative">
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">Total Scans</p>
            <p className="text-2xl font-extrabold text-white">{displayStats?.totalVisits ?? 0}</p>
            <p className="text-[10px] text-[#A1A1AA]/60 mt-1">NFC / QR / Link taps</p>
            <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#18181B] border border-white/10 items-center justify-center">
              <span className="text-[#A1A1AA] text-xs">→</span>
            </div>
          </div>
          <div className="flex-1 p-4 rounded-xl bg-[#16A34A]/[0.04] border border-[#16A34A]/15 text-center relative">
            <p className="text-[10px] text-[#16A34A]/80 uppercase tracking-wider mb-1">Google Reviews</p>
            <p className="text-2xl font-extrabold text-[#16A34A]">{displayStats?.redirectCount ?? 0}</p>
            <p className="text-[10px] text-[#16A34A]/60 mt-1">{displayStats?.redirectPercentage ?? 0}% of scans</p>
            <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#18181B] border border-white/10 items-center justify-center">
              <span className="text-[#A1A1AA] text-xs">→</span>
            </div>
          </div>
          <div className="flex-1 p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-center">
            <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mb-1">Private Feedback</p>
            <p className="text-2xl font-extrabold text-amber-400">{displayStats?.feedbackCount ?? 0}</p>
            <p className="text-[10px] text-amber-400/60 mt-1">{displayStats?.feedbackPercentage ?? 0}% of scans</p>
          </div>
        </div>
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
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA] mb-1">Total Reviews: {displayStats?.totalReviews ?? (displayStats ? (displayStats.redirectCount ?? 0) + (displayStats.feedbackCount ?? 0) : 0)}</p>
                <p className="text-xs text-[#A1A1AA]/60">Simple count view</p>
              </div>
            </div>
            {!isLocked && (
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
            )}
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
                message: fb.message ?? "",
                createdAt: fb.createdAt,
                status: (fb as any).status ?? "unresolved",
              })) ?? [],
              starDistribution: (() => {
                const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                feedbacks?.forEach((fb) => {
                  dist[fb.rating] = (dist[fb.rating] || 0) + 1;
                });
                dist[5] += displayStats?.redirectCount ?? 0;
                return dist;
              })(),
            }}
            isPro={!!isPro}
            filterLabel={filterLabel}
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
        <WhatsAppAlertConfig
          businessName={businessName}
          latestFeedback={
            feedbacks && feedbacks.length > 0
              ? {
                  customerName: feedbacks[0].customerName,
                  rating: feedbacks[0].rating,
                  message: feedbacks[0].message ?? "No details provided.",
                  createdAt: feedbacks[0].createdAt,
                }
              : null
          }
        />
      </GlassPanel>
    </>
  );
}
