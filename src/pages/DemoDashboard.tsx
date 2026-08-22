import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Shield,
  Download,
  Link2,
  TestTube,
  Share2,
  CheckCircle2,
  Copy,
  Printer,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type FilterRange = "today" | "week" | "month" | "all";

const FILTER_OPTIONS: { value: FilterRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const DEMO_BUSINESSES = [
  { id: "demo-1", name: "GreenLeaf Coffee House", slug: "greenleaf-coffee" },
  { id: "demo-2", name: "Urban Cuts Salon", slug: "urban-cuts-salon" },
];

const DEMO_FEEDBACKS = [
  { id: "fb-1", customerName: "Sarah Ahmed", phone: "+880 1712-345678", email: "sarah.a@gmail.com", message: "The coffee was excellent but the waiting time was too long during peak hours. Would appreciate faster service.", rating: 2, createdAt: Date.now() - 3600000, status: "resolved" as const },
  { id: "fb-2", customerName: "Rahul Khan", phone: "+880 1834-567890", email: "rahul.k@yahoo.com", message: "Great ambiance and friendly staff. The pastry selection could be better though.", rating: 3, createdAt: Date.now() - 7200000, status: "unresolved" as const },
  { id: "fb-3", customerName: "Nadia Rahman", phone: "+880 1912-112233", email: "nadia.r@outlook.com", message: "Parking is very difficult. Need dedicated parking for customers.", rating: 2, createdAt: Date.now() - 14400000, status: "unresolved" as const },
  { id: "fb-4", customerName: "Tanvir Hasan", phone: "+880 1678-998877", email: "tanvir.h@gmail.com", message: "Music was too loud for a coffee shop. Please consider lowering the volume.", rating: 3, createdAt: Date.now() - 28800000, status: "resolved" as const },
  { id: "fb-5", customerName: "Fatima Begum", phone: "+880 1534-223344", email: "fatima.b@hotmail.com", message: "The Wi-Fi kept disconnecting. unreliable internet for remote work.", rating: 1, createdAt: Date.now() - 43200000, status: "unresolved" as const },
];

const DEMO_STATS = {
  totalVisits: 342,
  redirectCount: 247,
  feedbackCount: 95,
  redirectPercentage: 72,
  feedbackPercentage: 28,
};

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
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

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DemoDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterRange>("all");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, "resolved" | "unresolved">>(
    Object.fromEntries(DEMO_FEEDBACKS.map((f) => [f.id, f.status]))
  );
  const [showQuickReply, setShowQuickReply] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const selectedBiz = selectedBusinessId ? DEMO_BUSINESSES.find((b) => b.id === selectedBusinessId) : null;
  const displayFeedbacks = selectedBiz
    ? DEMO_FEEDBACKS.filter((_, i) => i < 3)
    : DEMO_FEEDBACKS;

  const toggleStatus = (id: string) => {
    setFeedbackStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "resolved" ? "unresolved" : "resolved",
    }));
  };

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/review/${slug}`);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyReplyTemplate = (customerName: string) => {
    const template = `Dear ${customerName},\n\nThank you for sharing your feedback with us. We sincerely apologize for the inconvenience you experienced. Your input is invaluable, and we are actively working to improve.\n\nWe would love the opportunity to make things right. Please feel free to reach out to us directly so we can assist you further.\n\nWarm regards,\nSTAR CATCH`;
    navigator.clipboard.writeText(template);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Demo banner */}
      <div className="relative z-20 bg-[#16A34A]/10 border-b border-[#16A34A]/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm text-[#16A34A] font-medium">
              Demo Mode — This is a preview of the analytics dashboard
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/auth?returnTo=/dashboard")}
            className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white cursor-pointer text-xs font-semibold"
          >
            Sign Up Free
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-wide leading-tight">STAR CATCH</span>
              <span className="text-[10px] text-[#A1A1AA] tracking-wider leading-tight">Reviews and Feedback Agency Bd</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#16A34A]">Analytics Dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome back, Demo User</h1>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-[#A1A1AA] mr-1" />
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${filter === opt.value ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25" : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Business profile selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedBusinessId(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${!selectedBusinessId ? "bg-[#16A34A] text-white" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"}`}>
            All Profiles
          </button>
          {DEMO_BUSINESSES.map((biz) => (
            <button key={biz.id} onClick={() => setSelectedBusinessId(biz.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedBusinessId === biz.id ? "bg-[#16A34A] text-white" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-white/10"}`}>
              {biz.name}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Eye className="w-5 h-5 text-[#16A34A]" />} label="Total Visits" value={DEMO_STATS.totalVisits} sub={`Across ${DEMO_BUSINESSES.length} profile(s)`} color="bg-[#16A34A]/10" />
          <StatCard icon={<Star className="w-5 h-5 text-emerald-400" />} label="Google Redirects" value={DEMO_STATS.redirectCount} sub={`${DEMO_STATS.redirectPercentage}% of total`} color="bg-emerald-500/10" />
          <StatCard icon={<MessageSquare className="w-5 h-5 text-amber-400" />} label="Private Feedback" value={DEMO_STATS.feedbackCount} sub={`${DEMO_STATS.feedbackPercentage}% of total`} color="bg-amber-500/10" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-[#16A34A]" />} label="Protection Rate" value={`${DEMO_STATS.redirectPercentage}%`} sub="Reviews redirected to Google" color="bg-[#16A34A]/10" />
        </div>

        {/* Rating Breakdown */}
        <GlassPanel className="p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Rating Breakdown</h3>
          <div className="h-4 rounded-full bg-white/5 overflow-hidden flex">
            <div className="bg-[#16A34A] transition-all duration-500" style={{ width: `${DEMO_STATS.redirectPercentage}%` }} />
            <div className="bg-amber-500 transition-all duration-500" style={{ width: `${DEMO_STATS.feedbackPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
              <span className="text-xs text-[#A1A1AA]">Google Redirects ({DEMO_STATS.redirectPercentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-[#A1A1AA]">Private Feedback ({DEMO_STATS.feedbackPercentage}%)</span>
            </div>
          </div>
        </GlassPanel>

        {/* QR Code + Recent Feedback side by side */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* QR Code Card */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                <Printer className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Review QR Code</h3>
                <p className="text-xs text-[#A1A1AA]">Scan to leave feedback</p>
              </div>
            </div>
            <div className="mx-auto w-fit rounded-2xl border-2 border-white/10 bg-white p-5 mb-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#16A34A] fill-[#16A34A]" />
                  <span className="text-[9px] font-bold text-[#18181B] tracking-wide">STAR CATCH</span>
                </div>
                <div className="relative">
                  <QRCodeSVG value={`${window.location.origin}/review/demo-slug`} size={140} level="H" bgColor="#FFFFFF" fgColor="#18181B" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-md bg-[#16A34A] flex items-center justify-center shadow-md">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold text-[#18181B]">Scan to Leave Feedback</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-white/10 bg-white/5 text-[#A1A1AA] cursor-pointer">
                <Download className="w-3.5 h-3.5 mr-1" /> SVG
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-white/10 bg-white/5 text-[#A1A1AA] cursor-pointer">
                <Download className="w-3.5 h-3.5 mr-1" /> PNG
              </Button>
            </div>
          </GlassPanel>

          {/* Recent Feedback Table */}
          <GlassPanel className="lg:col-span-2 overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-sm font-semibold text-white">Recent Private Feedback</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Latest submissions from customers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden sm:table-cell">Feedback</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayFeedbacks.map((fb) => {
                    const status = feedbackStatuses[fb.id] ?? fb.status;
                    return (
                      <tr key={fb.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-white">{fb.customerName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-amber-400 text-sm">{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px] hidden sm:table-cell">
                          <p className="text-sm text-[#A1A1AA] truncate">{fb.message}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleStatus(fb.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${status === "resolved" ? "bg-[#16A34A]" : "bg-red-500/80"}`}>
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${status === "resolved" ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                          </button>
                          <span className={`ml-2 text-[10px] font-semibold ${status === "resolved" ? "text-[#16A34A]" : "text-red-400"}`}>
                            {status === "resolved" ? "Resolved" : "Unresolved"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <Button variant="ghost" size="sm" onClick={() => setShowQuickReply(showQuickReply === fb.id ? null : fb.id)} className="h-7 px-2 text-[10px] text-[#A1A1AA] hover:text-white hover:bg-white/5 cursor-pointer">
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
                                <Button size="sm" onClick={() => copyReplyTemplate(fb.customerName)} className="w-full h-8 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs cursor-pointer">
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
        </div>

        {/* CTA */}
        <GlassPanel className="p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Ready to protect your Google rating?</h3>
          <p className="text-sm text-[#A1A1AA] mb-6">Get started now and set up your first review gatekeeper in under a minute.</p>
          <Button onClick={() => navigate("/auth?returnTo=/dashboard")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" />
            Get Started Now
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </GlassPanel>
      </div>
    </div>
  );
}

function ArrowRight(props: { className?: string }) {
  return (
    <svg className={props.className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
