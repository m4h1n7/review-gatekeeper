// @ts-nocheck
import { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router";

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

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Data queries
  const kpis = useQuery(api.admin.adminKPIs);
  const revenueData = useQuery(api.admin.monthlyRevenue);
  const clients = useQuery(api.admin.allClients);
  const pendingPayments = useQuery(api.payments.listPending);
  const allPayments = useQuery(api.payments.listAll);

  // Mutations
  const approvePayment = useMutation(api.payments.approve);
  const rejectPayment = useMutation(api.payments.reject);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await approvePayment({ paymentId });
      toast.success("Client upgraded to Pro successfully!", {
        description: "The client's subscription has been activated for 30 days.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await rejectPayment({ paymentId });
      toast.success("Payment rejected");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <BarChart className="w-4 h-4" /> },
    { id: "payments", label: "Pending Approvals", icon: <CreditCard className="w-4 h-4" />, count: kpis?.pendingApprovals },
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
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
              Dashboard
            </Button>
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
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 w-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
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
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <KpiCard
                icon={<DollarSign className="w-5 h-5 text-[#16A34A]" />}
                label="MRR"
                value={kpis ? formatCurrency(kpis.mrr) : "—"}
                sub="Monthly recurring revenue"
                color="bg-[#16A34A]/10"
                trend={`${kpis?.activeProSubs ?? 0} active Pro subs`}
              />
              <KpiCard
                icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                label="Total Revenue"
                value={kpis ? formatCurrency(kpis.totalGrossRevenue) : "—"}
                sub="All approved payments"
                color="bg-emerald-500/10"
              />
              <KpiCard
                icon={<Building2 className="w-5 h-5 text-blue-400" />}
                label="Businesses"
                value={kpis?.totalBusinesses ?? "—"}
                sub="Registered profiles"
                color="bg-blue-500/10"
              />
              <KpiCard
                icon={<Crown className="w-5 h-5 text-amber-400" />}
                label="Active Pro"
                value={kpis?.activeProSubs ?? "—"}
                sub="Active subscribers"
                color="bg-amber-500/10"
              />
              <KpiCard
                icon={<Clock className="w-5 h-5 text-orange-400" />}
                label="Pending"
                value={kpis?.pendingApprovals ?? "—"}
                sub="Awaiting approval"
                color="bg-orange-500/10"
              />
              <KpiCard
                icon={<Activity className="w-5 h-5 text-[#16A34A]" />}
                label="Reviews Routed"
                value={kpis?.totalReviewsRouted ?? "—"}
                sub="All time"
                color="bg-[#16A34A]/10"
              />
            </div>

            {/* Revenue Chart */}
            <GlassPanel className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Revenue Growth</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">Monthly approved payment revenue (৳ BDT)</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
                  <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-xs font-semibold text-[#16A34A]">
                    {kpis ? formatCurrency(kpis.totalGrossRevenue) : "৳0"} total
                  </span>
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
                      <p className="text-xs text-[#A1A1AA]/60 mt-1">Revenue will appear here once payments are approved</p>
                    </div>
                  </div>
                )}
              </div>
            </GlassPanel>

            {/* Quick Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Subscription Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                      <span className="text-xs text-[#A1A1AA]">Active Pro</span>
                    </div>
                    <span className="text-sm font-bold text-white">{kpis?.activeProSubs ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs text-[#A1A1AA]">Pending Payment</span>
                    </div>
                    <span className="text-sm font-bold text-white">{kpis?.pendingSubs ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-xs text-[#A1A1AA]">Total Businesses</span>
                    </div>
                    <span className="text-sm font-bold text-white">{kpis?.totalBusinesses ?? 0}</span>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Payment Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs text-[#A1A1AA]">Pending Approval</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">{kpis?.pendingApprovals ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                      <span className="text-xs text-[#A1A1AA]">Total Approved</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {allPayments?.filter((p: any) => p.status === "approved").length ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-xs text-[#A1A1AA]">Rejected</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {allPayments?.filter((p: any) => p.status === "rejected").length ?? 0}
                    </span>
                  </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-white/5">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Client</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Gateway</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">Sender Phone</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">TrxID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Plan</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {pendingPayments.map((payment: any) => (
                        <motion.tr key={payment.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-white">{payment.clientEmail}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] bg-white/5 px-2 py-1 rounded-md">
                              <Smartphone className="w-3 h-3" />
                              {payment.gateway === "bkash" ? "bKash" : "Nagad"}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-sm text-[#A1A1AA] font-mono">{payment.senderPhone}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-white font-mono font-semibold bg-white/5 px-2 py-1 rounded-md">{payment.trxId}</span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-xs text-[#A1A1AA]">{formatTime(payment.submittedAt)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              payment.currentPlan === "pro" ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-white/5 text-[#A1A1AA]"
                            }`}>
                              {payment.currentPlan === "pro" ? "Pro" : "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" onClick={() => handleApprove(payment.id)} disabled={processingId === payment.id}
                                className="h-8 px-3 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer">
                                {processingId === payment.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (<><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve</>)}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(payment.id)} disabled={processingId === payment.id}
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
            )}

            {/* Payment history below */}
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
                            }`}>
                              {p.status === "approved" ? "Approved" : "Rejected"}
                            </span>
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
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">All Registered Clients</h3>
                  <p className="text-xs text-[#A1A1AA]">{clients?.length ?? 0} total client(s)</p>
                </div>
              </div>
            </div>

            {!clients || clients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">No clients registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-white/5">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Client</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">Business</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Plan</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">Expires</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Reviews</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Onboarding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map((client: any) => {
                      const sub = client.subscription;
                      const isPro = sub?.plan === "pro" && sub?.status === "active";
                      const isExpired = sub?.status === "expired";
                      const isPending = sub?.status === "pending";

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
                              {client.businessCategory && (
                                <p className="text-[10px] text-[#A1A1AA]/50 mt-0.5">{client.businessCategory}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isPro
                                ? "bg-[#16A34A]/15 text-[#16A34A]"
                                : isExpired
                                ? "bg-red-500/15 text-red-400"
                                : isPending
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-white/5 text-[#A1A1AA]"
                            }`}>
                              {isPro ? "Pro" : isExpired ? "Expired" : isPending ? "Pending" : "Free"}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-xs text-[#A1A1AA]">
                              {sub?.expiresAt
                                ? isExpired
                                  ? `Expired ${new Date(sub.expiresAt).toLocaleDateString()}`
                                  : `Until ${new Date(sub.expiresAt).toLocaleDateString()}`
                                : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-white tabular-nums">{client.totalInteractions}</span>
                          </td>
                          <td className="px-5 py-4">
                            {client.onboardingCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#A1A1AA]/30" />
                            )}
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
