import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Star,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  LogOut,
  CreditCard,
  Users,
  CalendarClock,
  Undo2,
  Send,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import SubscriptionExtendModal from "@/components/SubscriptionExtendModal";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const pendingPayments = useQuery(api.payments.listPending);
  const allPayments = useQuery(api.payments.listAll);
  const approvePayment = useMutation(api.payments.approve);
  const rejectPayment = useMutation(api.payments.reject);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [view, setView] = useState<"pending" | "history" | "clients">("pending");

  // Subscription management
  const allSubscriptions = useQuery(api.subscriptions.listAll);
  const extendSubscription = useMutation(api.subscriptions.extendSubscription);
  const revertSubscription = useMutation(api.subscriptions.revertSubscription);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState("");
  const [selectedCurrentExpiry, setSelectedCurrentExpiry] = useState<number | null>(null);
  const [extendProcessing, setExtendProcessing] = useState(false);
  const [undoData, setUndoData] = useState<{
    subId: string;
    previousExpiresAt: number;
    previousProExpiresAt: number;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const openExtendModal = useCallback((sub: { _id: string; userEmail: string; expiresAt?: number; proExpiresAt?: number }) => {
    setSelectedSubId(sub._id);
    setSelectedClientEmail(sub.userEmail);
    setSelectedCurrentExpiry(sub.expiresAt ?? sub.proExpiresAt ?? null);
    setExtendModalOpen(true);
  }, []);

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await approvePayment({ paymentId });
      toast.success("Client upgraded to Pro successfully!", {
        description: "The client's subscription has been activated.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve payment";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await rejectPayment({ paymentId });
      toast.success("Payment rejected", {
        description: "The client remains on the Free plan.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject payment";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleExtend = async (days: number) => {
    if (!selectedSubId) return;
    setExtendProcessing(true);
    try {
      // Capture current expiry before mutation (for undo)
      const currentSub = allSubscriptions?.find((s) => s._id === selectedSubId);
      const prevExpires = currentSub?.expiresAt ?? 0;
      const prevProExpires = currentSub?.proExpiresAt ?? 0;

      await extendSubscription({
        subscriptionId: selectedSubId as any,
        days,
      });
      setExtendModalOpen(false);

      // Store undo data with 10s timer
      const timer = setTimeout(() => setUndoData(null), 10_000);
      setUndoData({
        subId: selectedSubId,
        previousExpiresAt: prevExpires,
        previousProExpiresAt: prevProExpires,
        timer,
      });

      const newExpiry = prevExpires > 0 ? new Date(prevExpires + days * 86400000).toLocaleDateString() : "set";
      toast.success(`Subscription extended by ${days} days`, {
        description: `New expiry: ${newExpiry}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extend";
      toast.error(msg);
    } finally {
      setExtendProcessing(false);
    }
  };

  const handleUndo = async () => {
    if (!undoData) return;
    clearTimeout(undoData.timer);
    try {
      await revertSubscription({
        subscriptionId: undoData.subId as any,
        previousExpiresAt: undoData.previousExpiresAt,
        previousProExpiresAt: undoData.previousProExpiresAt,
      });
      setUndoData(null);
      toast.success("Extension reverted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revert";
      toast.error(msg);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      const res = await fetch(
        "YOUR_GOOGLE_WEBHOOK_URL_HERE",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: "StarCatch BD Test",
            clientEmail: "starcatchbd@gmail.com",
            customerName: "Test Customer",
            customerPhone: "01700000000",
            customerEmail: "test@example.com",
            feedbackMessage:
              "This is a test feedback message to check if Google Apps Script integration is working properly.",
          }),
        },
      );
      // mode: 'no-cors' always returns opaque response (status 0), treat as success
      toast.success("Test email request sent! Check your starcatchbd@gmail.com inbox.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Webhook test failed: ${msg}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  const displayPayments = view === "pending" ? (pendingPayments ?? []) : (allPayments ?? []);

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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-400">Super Admin</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#16A34A]">Admin Dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Payment Management
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Review and approve manual payment submissions from clients upgrading to Pro.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <GlassPanel className="p-5">
            <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-extrabold text-amber-400 tabular-nums">
              {pendingPayments?.length ?? 0}
            </p>
          </GlassPanel>
          <GlassPanel className="p-5">
            <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">Approved</p>
            <p className="text-3xl font-extrabold text-[#16A34A] tabular-nums">
              {allPayments?.filter((p) => p.status === "approved").length ?? 0}
            </p>
          </GlassPanel>
          <GlassPanel className="p-5">
            <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-3xl font-extrabold text-red-400 tabular-nums">
              {allPayments?.filter((p) => p.status === "rejected").length ?? 0}
            </p>
          </GlassPanel>
        </div>

        {/* Test Webhook Button */}
        <GlassPanel className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Google Apps Script Webhook</p>
                <p className="text-xs text-[#A1A1AA]">
                  Send a test POST to verify integration with your Apps Script endpoint.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              disabled={testingWebhook}
              onClick={handleTestWebhook}
              className="h-9 px-4 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-semibold cursor-pointer border border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingWebhook ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-1.5" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Test Webhook Email
                </>
              )}
            </Button>
          </div>
        </GlassPanel>

        {/* Undo Toast Banner */}
        <AnimatePresence>
          {undoData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="text-sm text-white font-medium">
                  Subscription extended — 10s undo window
                </span>
              </div>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#16A34A]/80 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setView("pending")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              view === "pending"
                ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1.5" />
            Pending ({pendingPayments?.length ?? 0})
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              view === "history"
                ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
            }`}
          >
            All History ({allPayments?.length ?? 0})
          </button>
          <button
            onClick={() => setView("clients")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              view === "clients"
                ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Active Clients ({allSubscriptions?.filter((s) => s.status === "active").length ?? 0})
          </button>
        </div>

        {/* Payments Table */}
        <GlassPanel className="overflow-hidden">
          {!displayPayments || displayPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-[#A1A1AA]/30" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                {view === "pending" ? "No pending payments" : "No payment history"}
              </h2>
              <p className="text-sm text-[#A1A1AA]">
                {view === "pending"
                  ? "When clients submit payment verification, it will appear here."
                  : "Approved and rejected payments will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-white/5">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Client Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">
                      Sender Phone
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      TrxID
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">
                      Submitted
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Plan Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {displayPayments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">
                            {payment.clientEmail}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] bg-white/5 px-2 py-1 rounded-md">
                            <Smartphone className="w-3 h-3" />
                            {payment.gateway === "bkash" ? "bKash" : "Nagad"}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-[#A1A1AA] font-mono">
                            {payment.senderPhone}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white font-mono font-semibold bg-white/5 px-2 py-1 rounded-md">
                            {payment.trxId}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-xs text-[#A1A1AA]">
                            {formatTime(payment.submittedAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {"currentPlan" in payment ? (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              payment.currentPlan === "pro"
                                ? "bg-[#16A34A]/15 text-[#16A34A]"
                                : "bg-white/5 text-[#A1A1AA]"
                            }`}>
                              {payment.currentPlan === "pro" ? "Pro" : "Free"}
                            </span>
                          ) : (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              payment.status === "approved"
                                ? "bg-[#16A34A]/15 text-[#16A34A]"
                                : payment.status === "rejected"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}>
                              {payment.status === "approved" ? "Approved" : payment.status === "rejected" ? "Rejected" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {payment.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(payment.id)}
                                disabled={processingId === payment.id}
                                className="h-8 px-3 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer"
                              >
                                {processingId === payment.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(payment.id)}
                                disabled={processingId === payment.id}
                                className="h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#A1A1AA]/50">
                              {payment.status === "approved" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>

        {/* ─── Active Clients Tab ─── */}
        {view === "clients" && (
          <GlassPanel className="overflow-hidden">
            {!allSubscriptions || allSubscriptions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-[#A1A1AA]/30" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  No subscriptions found
                </h2>
                <p className="text-sm text-[#A1A1AA]">
                  When clients purchase a plan or start a trial, their subscriptions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-white/5">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                        Client Email
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">
                        Expires
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {allSubscriptions
                        .filter((s) => s.status === "active" || s.status === "pending")
                        .map((sub) => {
                          const daysRemaining = sub.expiresAt
                            ? Math.max(0, Math.ceil((sub.expiresAt - Date.now()) / 86400000))
                            : null;
                          const isExpired = sub.expiresAt ? sub.expiresAt < Date.now() : false;
                          const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;

                          return (
                            <motion.tr
                              key={sub._id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-white">
                                  {sub.userEmail}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  sub.plan === "pro"
                                    ? "bg-[#16A34A]/15 text-[#16A34A]"
                                    : sub.plan === "trial"
                                    ? "bg-blue-500/15 text-blue-400"
                                    : sub.plan === "starter"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-white/5 text-[#A1A1AA]"
                                }`}>
                                  {sub.plan === "pro" ? "Pro" : sub.plan === "trial" ? "Trial" : sub.plan === "starter" ? "Starter" : "Free"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {isExpired ? (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">
                                    Expired
                                  </span>
                                ) : isExpiringSoon ? (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400">
                                    Expiring ({daysRemaining}d)
                                  </span>
                                ) : (
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    sub.status === "active"
                                      ? "bg-[#16A34A]/15 text-[#16A34A]"
                                      : "bg-amber-500/15 text-amber-400"
                                  }`}>
                                    {sub.status === "active" ? "Active" : "Pending"}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <span className="text-xs text-[#A1A1AA]">
                                  {sub.expiresAt ? formatTime(sub.expiresAt) : "No expiry"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <Button
                                  size="sm"
                                  onClick={() => openExtendModal(sub as any)}
                                  className="h-8 px-3 bg-[#16A34A]/15 hover:bg-[#16A34A]/25 text-[#16A34A] text-xs font-semibold cursor-pointer border border-[#16A34A]/30"
                                >
                                  <CalendarClock className="w-3.5 h-3.5 mr-1" />
                                  Edit Validity
                                </Button>
                              </td>
                            </motion.tr>
                          );
                        })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>
        )}
      </div>

      {/* Subscription Extend Modal */}
      <SubscriptionExtendModal
        open={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        onConfirm={handleExtend}
        clientEmail={selectedClientEmail}
        currentExpiresAt={selectedCurrentExpiry}
        processing={extendProcessing}
      />
    </div>
  );
}
