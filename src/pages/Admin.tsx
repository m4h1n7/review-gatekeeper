// @ts-nocheck
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  Star,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  CreditCard,
  DollarSign,
  Building2,
  Users,
  TrendingUp,
  Activity,
  Crown,
  Search,
  Filter,
  ExternalLink,
  CalendarPlus,
  Copy,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, trend }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; trend?: string;
}) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{value}</p>
          {sub && <p className="text-xs text-[#A1A1AA]/60 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-[#16A34A]" />
          <span className="text-[10px] font-semibold text-[#16A34A]">{trend}</span>
        </div>
      )}
    </GlassPanel>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString()}`;
}

function RevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#A1A1AA] mb-1">{label}</p>
        <p className="text-sm font-bold text-[#16A34A]">{formatCurrency(payload[0].value)}</p>
        {payload[0].payload?.count !== undefined && (
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">{payload[0].payload.count} payment(s)</p>
        )}
      </div>
    );
  }
  return null;
}

type AdminTab = "overview" | "payments" | "clients";

/* ─── Rejection Reason Modal ──────────────────────────────── */
function RejectModal({
  open, onClose, onSubmit, processing,
}: {
  open: boolean; onClose: () => void; onSubmit: (reason: string) => void; processing: boolean;
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#18181B] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Reject Payment</h3>
          </div>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-3">
          Provide a reason for rejection. The client will receive an email notification.
        </p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Transaction ID not found, amount mismatch..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-red-500/50 resize-none h-24" />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}
            className="flex-1 border-white/10 text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Cancel</Button>
          <Button size="sm" onClick={() => { onSubmit(reason); setReason(""); }}
            disabled={processing}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer">
            {processing ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reject & Notify"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Client search & filter
  const [clientSearch, setClientSearch] = useState("");
  const [clientPlanFilter, setClientPlanFilter] = useState<"all" | "active" | "pending" | "expired">("all");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);

  // Data
  const kpis = useQuery(api.admin.adminKPIs);
  const revenueData = useQuery(api.admin.monthlyRevenue);
  const clients = useQuery(api.admin.allClients);
  const pendingPayments = useQuery(api.payments.listPending);
  const allPayments = useQuery(api.payments.listAll);

  // Mutations
  const approvePayment = useMutation(api.payments.approve);
  const rejectPayment = useMutation(api.payments.reject);
  const extendSubscription = useMutation(api.admin.extendSubscription);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  /* ─── Send email via Convex HTTP route ────────────────────── */
  const sendEmail = async (endpoint: string, payload: Record<string, string>) => {
    try {
      const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
      if (convexUrl) {
        await fetch(`${convexUrl}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.error("Email notification failed:", err);
    }
  };

  /* ─── Approve ────────────────────────────────────────────── */
  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const result = await approvePayment({ paymentId });
      toast.success("Client upgraded successfully!", {
        description: `Subscription activated for ${result.plan === "starter" ? "Starter" : "Business Pro"} plan.`,
      });
      if (result.clientEmail) {
        await sendEmail("/api/send-approval-email", {
          to: result.clientEmail,
          plan: result.plan,
          clientName: result.clientName || "",
        });
        toast.success("Approval email sent!", { description: `Confirmation sent to ${result.clientEmail}` });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally { setProcessingId(null); }
  };

  /* ─── Reject ─────────────────────────────────────────────── */
  const openRejectModal = (paymentId: string) => { setRejectPaymentId(paymentId); setRejectModalOpen(true); };

  const handleReject = async (reason: string) => {
    if (!rejectPaymentId) return;
    setProcessingId(rejectPaymentId);
    setRejectModalOpen(false);
    try {
      const result = await rejectPayment({ paymentId: rejectPaymentId, reason: reason || undefined });
      toast.success("Payment rejected");
      if (result.clientEmail) {
        await sendEmail("/api/send-rejection-email", {
          to: result.clientEmail,
          plan: result.plan,
          reason: reason || "Payment could not be verified.",
        });
        toast.success("Rejection email sent!", { description: `Notification sent to ${result.clientEmail}` });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally { setProcessingId(null); setRejectPaymentId(null); }
  };

  /* ─── Extend Subscription ────────────────────────────────── */
  const handleExtend = async (userId: string, clientName: string) => {
    const key = `extend-${userId}`;
    setProcessingId(key);
    try {
      await extendSubscription({ userId, days: 30 });
      toast.success(`Subscription extended by 30 days for ${clientName}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to extend");
    } finally { setProcessingId(null); }
  };

  /* ─── Copy helper ────────────────────────────────────────── */
  const copyTrxId = (trxId: string) => { navigator.clipboard.writeText(trxId); toast.success("Transaction ID copied!"); };

  /* ─── Filtered clients ───────────────────────────────────── */
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((c: any) => {
      const q = clientSearch.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        || (c.businessName && c.businessName.toLowerCase().includes(q));
      const sub = c.subscription;
      const isPro = sub?.plan === "pro" && sub?.status === "active";
      const isExpired = sub?.status === "expired";
      const isPending = sub?.status === "pending";
      const matchesPlan = clientPlanFilter === "all"
        || (clientPlanFilter === "active" && isPro)
        || (clientPlanFilter === "pending" && isPending)
        || (clientPlanFilter === "expired" && isExpired);
      return matchesSearch && matchesPlan;
    });
  }, [clients, clientSearch, clientPlanFilter]);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <BarChart className="w-4 h-4" /> },
    { id: "payments", label: "Pending Approvals", icon: <CreditCard className="w-4 h-4" />, count: pendingPayments?.length },
    { id: "clients", label: "All Clients", icon: <Users className="w-4 h-4" />, count: clients?.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <RejectModal open={rejectModalOpen}
        onClose={() => { setRejectModalOpen(false); setRejectPaymentId(null); }}
        onSubmit={handleReject} processing={processingId !== null} />

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-wide">STAR CATCH</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
              <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#16A34A]">Super Admin Portal</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">Dashboard</Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Super Admin Command Center</h1>
              <p className="text-sm text-[#A1A1AA]">Manage subscriptions, revenue, and client accounts.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}>
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/10">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <KpiCard icon={<DollarSign className="w-5 h-5 text-[#16A34A]" />} label="MRR"
                value={kpis ? formatCurrency(kpis.mrr) : "—"} sub="Monthly recurring revenue" color="bg-[#16A34A]/10"
                trend={`${kpis?.activeProSubs ?? 0} active subs`} />
              <KpiCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} label="Total Revenue"
                value={kpis ? formatCurrency(kpis.totalGrossRevenue) : "—"} sub="All approved payments" color="bg-emerald-500/10" />
              <KpiCard icon={<Building2 className="w-5 h-5 text-blue-400" />} label="Businesses"
                value={kpis?.totalBusinesses ?? "—"} sub="Registered profiles" color="bg-blue-500/10" />
              <KpiCard icon={<Crown className="w-5 h-5 text-amber-400" />} label="Active Pro"
                value={kpis?.activeProSubs ?? "—"} sub="Active subscribers" color="bg-amber-500/10" />
              <KpiCard icon={<Clock className="w-5 h-5 text-orange-400" />} label="Pending"
                value={kpis?.pendingApprovals ?? "—"} sub="Awaiting approval" color="bg-orange-500/10" />
              <KpiCard icon={<Activity className="w-5 h-5 text-[#16A34A]" />} label="Reviews Routed"
                value={kpis?.totalReviewsRouted ?? "—"} sub="All time" color="bg-[#16A34A]/10" />
            </div>

            <GlassPanel className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Revenue Growth</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">Monthly approved payment revenue (৳ BDT)</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
                  <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-xs font-semibold text-[#16A34A]">{kpis ? formatCurrency(kpis.totalGrossRevenue) : "৳0"} total</span>
                </div>
              </div>
              <div className="h-[280px]">
                {revenueData && revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16A34A" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#16A34A" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" stroke="#A1A1AA" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                      <p className="text-sm text-[#A1A1AA]">No revenue data yet</p>
                    </div>
                  </div>
                )}
              </div>
            </GlassPanel>

            <div className="grid sm:grid-cols-2 gap-4">
              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Subscription Breakdown</h3>
                <div className="space-y-3">
                  {[{ color: "bg-[#16A34A]", label: "Active Pro", val: kpis?.activeProSubs ?? 0 },
                    { color: "bg-amber-500", label: "Pending Payment", val: kpis?.pendingSubs ?? 0 },
                    { color: "bg-blue-500", label: "Total Businesses", val: kpis?.totalBusinesses ?? 0 }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-xs text-[#A1A1AA]">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{item.val}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Payment Status</h3>
                <div className="space-y-3">
                  {[{ color: "bg-amber-500", label: "Pending Approval", val: kpis?.pendingApprovals ?? 0, textColor: "text-amber-400" },
                    { color: "bg-[#16A34A]", label: "Total Approved", val: allPayments?.filter((p: any) => p.status === "approved").length ?? 0, textColor: "text-white" },
                    { color: "bg-red-500", label: "Rejected", val: allPayments?.filter((p: any) => p.status === "rejected").length ?? 0, textColor: "text-white" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-xs text-[#A1A1AA]">{item.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${item.textColor}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </>
        )}

        {/* ═══ PENDING APPROVALS TAB ═══ */}
        {activeTab === "payments" && (
          <GlassPanel className="overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Pending Payment Approvals</h3>
                  <p className="text-xs text-[#A1A1AA]">Review and approve manual bKash/Nagad payment submissions</p>
                </div>
              </div>
            </div>

            {!pendingPayments || pendingPayments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A]/40" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">All caught up!</h2>
                <p className="text-sm text-[#A1A1AA]">No pending payment approvals at this time.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-white/5">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Client</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Plan Requested</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Gateway</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Sender Phone</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">TrxID</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Submitted</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Current</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence>
                        {pendingPayments.map((payment: any) => (
                          <motion.tr key={payment.id}
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-5 py-4">
                              <div>
                                <span className="text-sm font-medium text-white">{payment.clientName || "—"}</span>
                                <p className="text-[10px] text-[#A1A1AA]/50 mt-0.5">{payment.clientEmail}</p>
                                {payment.businessName && <p className="text-[10px] text-[#A1A1AA]/40 mt-0.5">{payment.businessName}</p>}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                payment.selectedPlan === "pro" ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-amber-500/15 text-amber-400"
                              }`}>
                                {payment.selectedPlan === "pro" ? "★ Business Pro" : "Starter"}
                              </span>
                              {payment.setupFee && <p className="text-[10px] text-[#A1A1AA]/40 mt-1">Setup: {formatCurrency(payment.setupFee)}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] bg-white/5 px-2 py-1 rounded-md">
                                <Smartphone className="w-3 h-3" />
                                {payment.gateway === "bkash" ? "bKash" : "Nagad"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-[#A1A1AA] font-mono">{payment.senderPhone}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-white font-mono font-semibold bg-white/5 px-2 py-1 rounded-md">{payment.trxId}</span>
                                <button onClick={() => copyTrxId(payment.trxId)} className="text-[#A1A1AA]/40 hover:text-white transition-colors cursor-pointer" title="Copy">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs text-[#A1A1AA]">{formatTime(payment.submittedAt)}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                payment.currentPlan === "pro" ? "bg-[#16A34A]/15 text-[#16A34A]"
                                : payment.currentPlan === "starter" ? "bg-blue-500/15 text-blue-400"
                                : "bg-white/5 text-[#A1A1AA]"
                              }`}>
                                {payment.currentPlan === "pro" ? "Pro" : payment.currentPlan === "starter" ? "Starter" : "None"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" onClick={() => handleApprove(payment.id)} disabled={processingId === payment.id}
                                  className="h-8 px-3 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer">
                                  {processingId === payment.id
                                    ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve</>}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openRejectModal(payment.id)} disabled={processingId === payment.id}
                                  className="h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer">
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-white/5">
                  {pendingPayments.map((payment: any) => (
                    <div key={payment.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{payment.clientName || "—"}</p>
                          <p className="text-[10px] text-[#A1A1AA]/50">{payment.clientEmail}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          payment.selectedPlan === "pro" ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {payment.selectedPlan === "pro" ? "★ Pro" : "Starter"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-[#A1A1AA]/60">Gateway</span><p className="text-white">{payment.gateway === "bkash" ? "bKash" : "Nagad"}</p></div>
                        <div>
                          <span className="text-[#A1A1AA]/60">TrxID</span>
                          <div className="flex items-center gap-1">
                            <p className="text-white font-mono">{payment.trxId}</p>
                            <button onClick={() => copyTrxId(payment.trxId)} className="text-[#A1A1AA]/40 hover:text-white cursor-pointer"><Copy className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div><span className="text-[#A1A1AA]/60">Sender</span><p className="text-white font-mono">{payment.senderPhone}</p></div>
                        <div><span className="text-[#A1A1AA]/60">Submitted</span><p className="text-white">{formatTime(payment.submittedAt)}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(payment.id)} disabled={processingId === payment.id}
                          className="flex-1 h-9 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRejectModal(payment.id)} disabled={processingId === payment.id}
                          className="flex-1 h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Payment History */}
            {allPayments && allPayments.filter((p: any) => p.status !== "pending").length > 0 && (
              <div className="border-t border-white/5">
                <div className="px-5 py-3">
                  <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Payment History</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-white/5">
                        <th className="px-5 py-2 text-left text-[10px] font-semibold text-[#A1A1AA]/60 uppercase tracking-wider">Email</th>
                        <th className="px-5 py-2 text-left text-[10px] font-semibold text-[#A1A1AA]/60 uppercase tracking-wider">Gateway</th>
                        <th className="px-5 py-2 text-left text-[10px] font-semibold text-[#A1A1AA]/60 uppercase tracking-wider">TrxID</th>
                        <th className="px-5 py-2 text-left text-[10px] font-semibold text-[#A1A1AA]/60 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-2 text-left text-[10px] font-semibold text-[#A1A1AA]/60 uppercase tracking-wider hidden md:table-cell">Reviewed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allPayments.filter((p: any) => p.status !== "pending").slice(0, 10).map((p: any) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-2.5 text-xs text-[#A1A1AA]">{p.clientEmail}</td>
                          <td className="px-5 py-2.5 text-xs text-[#A1A1AA]">{p.gateway === "bkash" ? "bKash" : "Nagad"}</td>
                          <td className="px-5 py-2.5 text-xs text-white font-mono">{p.trxId}</td>
                          <td className="px-5 py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              p.status === "approved" ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-red-500/15 text-red-400"
                            }`}>{p.status === "approved" ? "Approved" : "Rejected"}</span>
                          </td>
                          <td className="px-5 py-2.5 text-[10px] text-[#A1A1AA]/60 hidden md:table-cell">
                            {p.reviewedAt ? formatTime(p.reviewedAt) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </GlassPanel>
        )}

        {/* ═══ ALL CLIENTS TAB ═══ */}
        {activeTab === "clients" && (
          <GlassPanel className="overflow-hidden">
            {/* Header with Search & Filter */}
            <div className="p-5 border-b border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">All Registered Clients</h3>
                    <p className="text-xs text-[#A1A1AA]">{filteredClients.length} of {clients?.length ?? 0} client(s)</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]/40" />
                  <input type="text" placeholder="Search by name, email, or business..."
                    value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#A1A1AA]/40" />
                  <select value={clientPlanFilter} onChange={(e) => setClientPlanFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#16A34A]/50 cursor-pointer">
                    <option value="all">All Plans</option>
                    <option value="active">Active Pro</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {!clients || clients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">No clients registered yet</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">No clients match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-white/5">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Client</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">Business</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Plan</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">Days Left</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Reviews</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">Onboarded</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredClients.map((client: any) => {
                      const sub = client.subscription;
                      const isPro = sub?.plan === "pro" && sub?.status === "active";
                      const isStarter = sub?.plan === "starter" && sub?.status === "active";
                      const isExpired = sub?.status === "expired";
                      const isPending = sub?.status === "pending";
                      const daysLeft = sub?.daysRemaining;

                      return (
                        <tr key={client.userId} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <span className="text-sm font-medium text-white">{client.name}</span>
                              <p className="text-[10px] text-[#A1A1AA]/50 mt-0.5">{client.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div>
                              <span className="text-sm text-[#A1A1AA]">{client.businessName ?? "—"}</span>
                              {client.businessCategory && <p className="text-[10px] text-[#A1A1AA]/50 mt-0.5">{client.businessCategory}</p>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isPro ? "bg-[#16A34A]/15 text-[#16A34A]"
                              : isStarter ? "bg-blue-500/15 text-blue-400"
                              : isExpired ? "bg-red-500/15 text-red-400"
                              : isPending ? "bg-amber-500/15 text-amber-400"
                              : "bg-white/5 text-[#A1A1AA]"
                            }`}>
                              {isPro ? "★ Pro" : isStarter ? "Starter" : isExpired ? "Expired" : isPending ? "Pending" : "Free"}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            {(isPro || isStarter) ? (
                              <div className="flex items-center gap-1.5">
                                <CalendarPlus className={`w-3.5 h-3.5 ${
                                  daysLeft !== null && daysLeft !== undefined && daysLeft <= 7 ? "text-red-400" : "text-[#A1A1AA]/60"
                                }`} />
                                <span className={`text-xs ${
                                  daysLeft !== null && daysLeft !== undefined && daysLeft <= 7 ? "text-red-400 font-semibold" : "text-[#A1A1AA]"
                                }`}>
                                  {daysLeft !== null && daysLeft !== undefined
                                    ? daysLeft === 0 ? "Expires today" : `${daysLeft}d left`
                                    : "—"}
                                </span>
                              </div>
                            ) : isExpired ? (
                              <span className="text-xs text-red-400">Expired</span>
                            ) : <span className="text-xs text-[#A1A1AA]/40">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-white tabular-nums">{client.totalInteractions}</span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            {client.onboardingCompleted
                              ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                              : <XCircle className="w-4 h-4 text-[#A1A1AA]/30" />}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {client.businessSlug && (
                                <Button size="sm" variant="outline"
                                  onClick={() => navigate(`/review/${client.businessSlug}`)}
                                  className="h-8 px-2.5 border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/5 text-xs cursor-pointer"
                                  title="View Client Review Page">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {(isPro || isStarter || isExpired) && (
                                <Button size="sm" variant="outline"
                                  onClick={() => handleExtend(client.userId, client.name)}
                                  disabled={processingId === `extend-${client.userId}`}
                                  className="h-8 px-2.5 border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A]/10 text-xs cursor-pointer"
                                  title="Extend +30 days">
                                  {processingId === `extend-${client.userId}`
                                    ? <div className="w-3.5 h-3.5 border-2 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
                                    : <><CalendarPlus className="w-3.5 h-3.5 mr-1" /><span className="hidden sm:inline">+30d</span></>}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
