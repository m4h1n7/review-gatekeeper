// @ts-nocheck
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  UserPlus,
  Megaphone,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Lock,
  FileDown,
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

type AdminTab = "overview" | "payments" | "clients" | "archived" | "announcements" | "audit" | "security";

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
  const [clientPlanFilter, setClientPlanFilter] = useState<"all" | "active" | "pending" | "expired" | "inactive" | "trial_active" | "trial_expired" | "paid">("all");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);

  // Create client modal
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", name: "", businessName: "", plan: "pro" as "starter" | "pro" });

  // Announcement form
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "" });

  // Client action dropdown
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Archive (danger zone) modal
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<{ userId: string; name: string } | null>(null);
  const [archiveConfirmText, setArchiveConfirmText] = useState("");

  // Session timeout (30 min inactivity)
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    const resetTimer = () => { lastActivityRef.current = Date.now(); };
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 30 * 60 * 1000) {
        toast.warning("Session expired due to inactivity");
        signOut();
        navigate("/");
      }
    }, 60 * 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [signOut, navigate]);

  // Security audit logs
  const auditLogs = useQuery(api.admin.getAuditLogs, { limit: 50 });
  // Maintenance mode
  const maintenance = useQuery(api.admin.getMaintenanceMode);
  const toggleMaintenance = useMutation(api.admin.toggleMaintenanceMode);
  const generateBackup = useMutation(api.admin.generateBackup);
  const verifyPin = useMutation(api.admin.verifyMasterPin);

  // Maintenance toggle state
  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMessage, setMaintMessage] = useState("System is currently under maintenance. Please try again later.");
  useEffect(() => {
    if (maintenance) {
      setMaintEnabled(maintenance.enabled);
      setMaintMessage(maintenance.message);
    }
  }, [maintenance?.enabled]);

  // Master PIN confirmation modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const requirePin = (action: () => void) => {
    setPinAction(() => action);
    setPinInput("");
    setPinError(false);
    setPinModalOpen(true);
  };

  const handlePinVerify = async () => {
    const result = await verifyPin({ pin: pinInput });
    if (result.valid) {
      setPinModalOpen(false);
      pinAction?.();
      setPinAction(null);
    } else {
      setPinError(true);
    }
  };

  const handleBackup = async () => {
    requirePin(async () => {
      try {
        const data = await generateBackup();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `starcatch-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click(); URL.revokeObjectURL(url);
        toast.success("Backup downloaded!", { description: `${data.recordCounts.businesses} businesses, ${data.recordCounts.feedbacks} feedbacks, ${data.recordCounts.interactions} interactions` });
      } catch (err) {
        toast.error("Backup failed");
      }
    });
  };

  const handleMaintenanceToggle = async () => {
    requirePin(async () => {
      try {
        await toggleMaintenance({ enabled: !maintEnabled, message: maintMessage });
        setMaintEnabled(!maintEnabled);
        toast.success(maintEnabled ? "Maintenance mode disabled" : "Maintenance mode enabled");
      } catch (err) {
        toast.error("Failed to update maintenance mode");
      }
    });
  };

  // Data
  const kpis = useQuery(api.admin.adminKPIs);
  const revenueData = useQuery(api.admin.monthlyRevenue);
  const clients = useQuery(api.admin.allClients);
  const pendingPayments = useQuery(api.payments.listPending);
  const allPayments = useQuery(api.payments.listAll);
  const announcements = useQuery(api.admin.getAnnouncements);

  // Mutations
  const approvePayment = useMutation(api.payments.approve);
  const rejectPayment = useMutation(api.payments.reject);
  const extendSubscription = useMutation(api.admin.extendSubscription);
  const createClient = useMutation(api.admin.createClient);
  const suspendClient = useMutation(api.admin.suspendClient);
  const activateClient = useMutation(api.admin.activateClient);
  const archiveClient = useMutation(api.admin.archiveClient);
  const restoreClient = useMutation(api.admin.restoreClient);
  const createAnnouncement = useMutation(api.admin.createAnnouncement);
  const toggleAnnouncement = useMutation(api.admin.toggleAnnouncement);
  const deleteAnnouncement = useMutation(api.admin.deleteAnnouncement);

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
    requirePin(async () => {
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
    });
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

  /* ─── Create Client ────────────────────────────────────── */
  const handleCreateClient = async () => {
    if (!createForm.email || !createForm.name || !createForm.businessName) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createClient({
        email: createForm.email,
        name: createForm.name,
        businessName: createForm.businessName,
        plan: createForm.plan,
      });
      toast.success("Client account created!", { description: `${createForm.email} has been added as a ${createForm.plan === "pro" ? "Business Pro" : "Starter"} subscriber.` });
      setShowCreateClient(false);
      setCreateForm({ email: "", name: "", businessName: "", plan: "pro" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create client");
    }
  };

  /* ─── Suspend / Activate / Delete Client ──────────────── */
  const handleSuspend = async (userId: string, name: string) => {
    requirePin(async () => {
    try {
      await suspendClient({ userId });
      toast.success(`${name} has been suspended`);
      setOpenActionMenu(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    });
  };
  const handleActivate = async (userId: string, name: string) => {
    try {
      await activateClient({ userId });
      toast.success(`${name} has been reactivated`);
      setOpenActionMenu(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const openArchiveModal = (userId: string, name: string) => {
    setArchiveTarget({ userId, name });
    setArchiveConfirmText("");
    setArchiveModalOpen(true);
    setOpenActionMenu(null);
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    const expected = `DELETE-${archiveTarget.name.toUpperCase()}`;
    if (archiveConfirmText !== expected) {
      toast.error(`Type "${expected}" exactly to confirm`);
      return;
    }
    requirePin(async () => {
    try {
      await archiveClient({ userId: archiveTarget.userId });
      toast.success(`${archiveTarget.name} has been archived for 30 days`, {
        description: "The account is suspended and hidden. It can be restored within 30 days.",
      });
      setArchiveModalOpen(false);
      setArchiveTarget(null);
      setArchiveConfirmText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to archive");
    }
    });
  };

  const handleRestore = async (userId: string, name: string) => {
    try {
      await restoreClient({ userId });
      toast.success(`${name} has been restored and is now active`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to restore");
    }
  };

  /* ─── Announcements ────────────────────────────────────── */
  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error("Please fill in both title and message");
      return;
    }
    try {
      await createAnnouncement({ title: announcementForm.title, message: announcementForm.message });
      toast.success("Announcement published!");
      setAnnouncementForm({ title: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      await toggleAnnouncement({ announcementId: id, active });
      toast.success(active ? "Announcement activated" : "Announcement deactivated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement({ announcementId: id });
      toast.success("Announcement deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  /* ─── Filtered clients ───────────────────────────────────── */
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((c: any) => {
      // Exclude archived clients from All Clients tab
      if (c.accountStatus === "archived") return false;
      const q = clientSearch.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        || (c.businessName && c.businessName.toLowerCase().includes(q));
      const sub = c.subscription;
      const isPro = (sub?.plan === "pro" || sub?.plan === "trial") && sub?.status === "active";
      const isExpired = sub?.status === "expired";
      const isPending = sub?.status === "pending";
      const isStarter = sub?.plan === "starter" && sub?.status === "active";
      const isActiveClient = c.lastScanAt && c.lastScanAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
      const isInactive = (isPro || isStarter) && !isActiveClient && c.totalInteractions === 0;
      const isTrialActive = sub?.plan === "trial" && sub?.status === "active";
      const isTrialExpired = sub?.plan === "trial" && isExpired;
      const matchesPlan = clientPlanFilter === "all"
        || (clientPlanFilter === "active" && isPro)
        || (clientPlanFilter === "trial_active" && isTrialActive)
        || (clientPlanFilter === "trial_expired" && isTrialExpired)
        || (clientPlanFilter === "paid" && (sub?.plan === "pro" || sub?.plan === "starter") && sub?.status === "active")
        || (clientPlanFilter === "pending" && isPending)
        || (clientPlanFilter === "expired" && isExpired)
        || (clientPlanFilter === "inactive" && isInactive);
      return matchesSearch && matchesPlan;
    });
  }, [clients, clientSearch, clientPlanFilter]);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <BarChart className="w-4 h-4" /> },
    { id: "payments", label: "Pending Approvals", icon: <CreditCard className="w-4 h-4" />, count: pendingPayments?.length },
    { id: "clients", label: "All Clients", icon: <Users className="w-4 h-4" />, count: clients?.length },
    { id: "archived", label: "Archived", icon: <Clock className="w-4 h-4" />, count: clients?.filter((c: any) => c.accountStatus === "archived").length },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "audit", label: "Audit Log", icon: <Shield className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
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
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto flex-nowrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#16A34A]">Super Admin Portal</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs whitespace-nowrap">Dashboard</Button>
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
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 overflow-x-auto flex-nowrap">
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
                <Button onClick={() => setShowCreateClient(true)}
                  className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Create New Client
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]/40" />
                  <input type="text" placeholder="Search by name, email, or business..."
                    value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
                  <Filter className="w-4 h-4 text-[#A1A1AA]/40 shrink-0" />
                  <select value={clientPlanFilter} onChange={(e) => setClientPlanFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#16A34A]/50 cursor-pointer whitespace-nowrap">
                    <option value="all">All Plans</option>
                    <option value="active">All Active</option>
                    <option value="paid">Paid Clients Only</option>
                    <option value="trial_active">🎉 Active Trials</option>
                    <option value="trial_expired">⏰ Expired Trials</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">⚠️ Inactive (7d+)</option>
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
                      const isTrial = sub?.plan === "trial" && sub?.status === "active";
                      const isPro = (sub?.plan === "pro" || isTrial) && sub?.status === "active";
                      const isPaidPro = sub?.plan === "pro" && sub?.status === "active";
                      const isStarter = sub?.plan === "starter" && sub?.status === "active";
                      const isExpired = sub?.status === "expired";
                      const isPending = sub?.status === "pending";
                      const daysLeft = sub?.daysRemaining;
                      const trialDaysElapsed = isTrial && sub?.createdAt ? Math.floor((Date.now() - sub.createdAt) / (1000 * 60 * 60 * 24)) : null;
                      const trialExpiredDaysAgo = (isExpired && sub?.plan === "trial" && sub?.expiresAt) ? Math.ceil((Date.now() - sub.expiresAt) / (1000 * 60 * 60 * 24)) : null;

                      const isActiveClient = client.lastScanAt && client.lastScanAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
                      const isInactive = (isPro || isStarter) && !isActiveClient && client.totalInteractions === 0;

                      return (
                        <tr key={client.userId} className={`hover:bg-white/[0.03] transition-colors ${isInactive ? "bg-amber-500/[0.04] border-l-2 border-l-amber-500/60" : ""}`}>
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
                              isTrial ? "bg-purple-500/15 text-purple-400"
                              : isPaidPro ? "bg-[#16A34A]/15 text-[#16A34A]"
                              : isStarter ? "bg-blue-500/15 text-blue-400"
                              : isExpired && sub?.plan === "trial" ? "bg-red-500/15 text-red-400"
                              : isExpired ? "bg-red-500/15 text-red-400"
                              : isPending ? "bg-amber-500/15 text-amber-400"
                              : "bg-white/5 text-[#A1A1AA]"
                            }`}>
                              {isTrial ? "🎉 Free Trial"
                              : isPaidPro ? "★ Pro"
                              : isStarter ? "Starter"
                              : isExpired && sub?.plan === "trial" ? "Trial Expired"
                              : isExpired ? "Expired"
                              : isPending ? "Pending"
                              : "Free"}
                            </span>
                            {isTrial && trialDaysElapsed !== null && (
                              <span className="block text-[10px] text-purple-300/70 mt-1">
                                Day {trialDaysElapsed + 1} of 10
                              </span>
                            )}
                            {(isExpired && sub?.plan === "trial" && trialExpiredDaysAgo !== null) && (
                              <span className="block text-[10px] text-red-400/70 mt-1">
                                Expired {trialExpiredDaysAgo}d ago
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            {(isPro || isStarter) ? (
                              <div className="flex items-center gap-1.5">
                                <CalendarPlus className={`w-3.5 h-3.5 ${
                                  daysLeft !== null && daysLeft !== undefined && ((isTrial && daysLeft <= 2) || (!isTrial && daysLeft <= 7)) ? "text-red-400"
                                  : isTrial && daysLeft !== null && daysLeft !== undefined && daysLeft <= 5 ? "text-amber-400"
                                  : "text-[#A1A1AA]/60"
                                }`} />
                                <span className={`text-xs ${
                                  daysLeft !== null && daysLeft !== undefined && ((isTrial && daysLeft <= 2) || (!isTrial && daysLeft <= 7)) ? "text-red-400 font-semibold"
                                  : isTrial && daysLeft !== null && daysLeft !== undefined && daysLeft <= 5 ? "text-amber-400 font-semibold"
                                  : "text-[#A1A1AA]"
                                }`}>
                                  {daysLeft !== null && daysLeft !== undefined
                                    ? daysLeft === 0 ? "Expires today"
                                    : isTrial ? `${daysLeft}d left`
                                    : `${daysLeft}d left`
                                    : "—"}
                                </span>
                              </div>
                            ) : isExpired ? (
                              <span className="text-xs text-red-400">Expired</span>
                            ) : <span className="text-xs text-[#A1A1AA]/40">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white tabular-nums">{client.totalInteractions}</span>
                              {isInactive && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                                  <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                  No Activity
                                </span>
                              )}
                            </div>
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
                              {/* Account status actions */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenActionMenu(openActionMenu === client.userId ? null : client.userId)}
                                  className="h-8 px-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white text-xs font-semibold cursor-pointer transition-all">
                                  {client.accountStatus === "suspended" ? <Pause className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                                {openActionMenu === client.userId && (
                                  <div className="absolute right-0 top-full mt-1 z-30 w-52 rounded-xl bg-[#18181B] border border-white/10 shadow-2xl p-1">
                                    {/* Standard actions */}
                                    {client.accountStatus !== "suspended" ? (
                                      <button onClick={() => handleSuspend(client.userId, client.name)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors">
                                        <Pause className="w-3.5 h-3.5" /> Suspend Account
                                      </button>
                                    ) : (
                                      <button onClick={() => handleActivate(client.userId, client.name)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#16A34A] hover:bg-[#16A34A]/10 rounded-lg cursor-pointer transition-colors">
                                        <Play className="w-3.5 h-3.5" /> Activate Account
                                      </button>
                                    )}
                                    {/* Danger zone — separated with border */}
                                    <div className="border-t border-red-500/20 my-1" />
                                    <button onClick={() => openArchiveModal(client.userId, client.businessName || client.name)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 bg-red-500/5 hover:bg-red-500/15 rounded-lg cursor-pointer transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" /> Archive Account
                                    </button>
                                  </div>
                                )}
                              </div>
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

        {/* ═══ ARCHIVED TAB ═══ */}
        {activeTab === "archived" && (
          <GlassPanel className="overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Archived Accounts</h3>
                  <p className="text-xs text-[#A1A1AA]">Soft-deleted accounts — data preserved for 30 days</p>
                </div>
              </div>
            </div>
            {(() => {
              const archived = clients?.filter((c: any) => c.accountStatus === "archived") ?? [];
              if (archived.length === 0) {
                return (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-[#A1A1AA]/20" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">No archived accounts</h2>
                    <p className="text-sm text-[#A1A1AA]">Archived accounts will appear here for 30 days.</p>
                  </div>
                );
              }
              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-white/5">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Client</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">Business</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Archived</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">Days Left</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {archived.map((client: any) => {
                        const archivedDaysAgo = client.archivedAt
                          ? Math.floor((Date.now() - client.archivedAt) / (1000 * 60 * 60 * 24))
                          : 0;
                        const daysLeft = Math.max(0, 30 - archivedDaysAgo);
                        return (
                          <tr key={client.userId} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-5 py-4">
                              <div>
                                <span className="text-sm font-medium text-white">{client.name}</span>
                                <p className="text-[10px] text-[#A1A1AA]/50 mt-0.5">{client.email}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <span className="text-sm text-[#A1A1AA]">{client.businessName ?? "—"}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs text-[#A1A1AA]">
                                {client.archivedAt ? formatTime(client.archivedAt) : "—"}
                              </span>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className={`text-xs font-semibold ${
                                daysLeft <= 7 ? "text-red-400" : "text-[#A1A1AA]"
                              }`}>
                                {daysLeft} days remaining
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Button size="sm"
                                onClick={() => handleRestore(client.userId, client.name)}
                                className="h-8 px-3 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold cursor-pointer">
                                <Play className="w-3.5 h-3.5 mr-1" /> Restore Account
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </GlassPanel>
        )}

        {/* ═══ ANNOUNCEMENTS TAB ═══ */}
        {activeTab === "announcements" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Create Announcement */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Post New Announcement</h3>
                  <p className="text-xs text-[#A1A1AA]">Broadcast a notice to all client dashboards</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Announcement title (e.g. Holiday Discount)"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50"
                />
                <textarea
                  placeholder="Announcement message (visible to all clients)"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50 resize-none h-24"
                />
                <Button onClick={handleCreateAnnouncement}
                  className="w-full h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-sm font-semibold cursor-pointer">
                  <Megaphone className="w-4 h-4 mr-2" /> Publish Announcement
                </Button>
              </div>
            </GlassPanel>

            {/* Announcements History */}
            <GlassPanel className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">All Announcements</h3>
              {!announcements || announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="w-8 h-8 text-[#A1A1AA]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#A1A1AA]">No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a: any) => (
                    <div key={a.id} className={`p-4 rounded-xl border transition-colors ${
                      a.active ? "border-[#16A34A]/30 bg-[#16A34A]/5" : "border-white/5 bg-white/[0.02]"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                            {a.active && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/15 text-[#16A34A] text-[10px] font-bold">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A1A1AA] line-clamp-2">{a.message}</p>
                          <p className="text-[10px] text-[#A1A1AA]/40 mt-2">{formatTime(a.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleToggleAnnouncement(a.id, !a.active)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${a.active ? "bg-[#16A34A]" : "bg-white/20"}`}>
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${a.active ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                          </button>
                          <span className={`text-[10px] font-semibold ${a.active ? "text-[#16A34A]" : "text-[#A1A1AA]"}`}>
                            {a.active ? "On" : "Off"}
                          </span>
                          <button onClick={() => handleDeleteAnnouncement(a.id)}
                            className="text-[#A1A1AA]/30 hover:text-red-400 transition-colors cursor-pointer ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>
        )}

        {/* ═══ AUDIT LOG TAB ═══ */}
        {activeTab === "audit" && (
          <GlassPanel className="overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Security Audit Log</h3>
                  <p className="text-xs text-[#A1A1AA]">All critical admin actions recorded here</p>
                </div>
              </div>
            </div>
            {!auditLogs || auditLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">No audit logs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.action.includes("APPROVE") ? "bg-[#16A34A]/15 text-[#16A34A]"
                            : log.action.includes("REJECT") ? "bg-red-500/15 text-red-400"
                            : log.action.includes("SUSPEND") ? "bg-amber-500/15 text-amber-400"
                            : log.action.includes("ARCHIVE") ? "bg-red-500/15 text-red-400"
                            : log.action.includes("BACKUP") ? "bg-blue-500/15 text-blue-400"
                            : log.action.includes("MAINTENANCE") ? "bg-purple-500/15 text-purple-400"
                            : "bg-white/10 text-[#A1A1AA]"
                          }`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-[#A1A1AA]">by {log.adminEmail}</span>
                        </div>
                        {log.targetEmail && <p className="text-xs text-[#A1A1AA]/60">Target: {log.targetEmail}</p>}
                        {log.details && <p className="text-xs text-[#A1A1AA]/50 mt-0.5">{log.details}</p>}
                      </div>
                      <span className="text-[10px] text-[#A1A1AA]/40 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        )}

        {/* ═══ SECURITY & SYSTEM TAB ═══ */}
        {activeTab === "security" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">System Maintenance Mode</h3>
                  <p className="text-xs text-[#A1A1AA]">Show a maintenance banner to public visitors</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">Maintenance Mode</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{maintEnabled ? "Active" : "Disabled"}</p>
                  </div>
                  <button onClick={handleMaintenanceToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${maintEnabled ? "bg-purple-500" : "bg-white/20"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${maintEnabled ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
                  </button>
                </div>
                <textarea value={maintMessage} onChange={(e) => setMaintMessage(e.target.value)}
                  placeholder="Maintenance message..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none resize-none h-20" />
              </div>
            </GlassPanel>
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Database Backup</h3>
                  <p className="text-xs text-[#A1A1AA]">Export anonymized records as JSON</p>
                </div>
              </div>
              <Button onClick={handleBackup} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer">
                <FileDown className="w-4 h-4 mr-2" /> Download Full System Backup
              </Button>
            </GlassPanel>
          </div>
        )}

      </div>

      {/* ═══ ARCHIVE CONFIRMATION MODAL ═══ */}
      {archiveModalOpen && archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181B] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400">⚠️ DANGER ZONE</h3>
                <p className="text-xs text-[#A1A1AA]">Permanent Account Deletion</p>
              </div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-white font-semibold mb-1">Archive &quot;{archiveTarget.name}&quot;?</p>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                This will suspend the account and hide it from all client views. The data will be preserved for <strong className="text-white">30 days</strong>, after which it will be permanently deleted. You can restore it at any time from the Archived tab.
              </p>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-red-400 mb-2 block">
                Type <code className="bg-red-500/10 px-1.5 py-0.5 rounded text-red-300 font-mono">DELETE-{(archiveTarget.businessName || archiveTarget.name).toUpperCase()}</code> to confirm:
              </label>
              <input type="text" value={archiveConfirmText}
                onChange={(e) => setArchiveConfirmText(e.target.value)}
                placeholder={`DELETE-${(archiveTarget.businessName || archiveTarget.name).toUpperCase()}`}
                className="w-full bg-white/5 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/30 focus:outline-none focus:border-red-500 font-mono" autoFocus />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setArchiveModalOpen(false); setArchiveTarget(null); setArchiveConfirmText(""); }}
                className="flex-1 border-white/10 text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Cancel</Button>
              <Button onClick={handleArchive}
                disabled={archiveConfirmText !== `DELETE-${(archiveTarget.businessName || archiveTarget.name).toUpperCase()}`}
                className={`flex-1 font-semibold cursor-pointer transition-all ${archiveConfirmText === `DELETE-${(archiveTarget.businessName || archiveTarget.name).toUpperCase()}` ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500/20 text-red-400/40 cursor-not-allowed"}`}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Archive Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ MASTER PIN CONFIRMATION MODAL ═══ */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181B] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Master PIN Required</h3>
                <p className="text-xs text-[#A1A1AA]">Enter PIN to confirm this critical action</p>
              </div>
            </div>
            <input type="password" value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handlePinVerify()}
              placeholder="Enter master PIN"
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none mb-3 font-mono ${pinError ? "border-red-500/50" : "border-white/10"}`} autoFocus />
            {pinError && <p className="text-xs text-red-400 mb-3">Incorrect PIN.</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setPinModalOpen(false); setPinAction(null); }}
                className="flex-1 border-white/10 text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Cancel</Button>
              <Button onClick={handlePinVerify}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer">Verify</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ CREATE CLIENT MODAL ═══ */}
      {showCreateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181B] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#16A34A]" />
                <h3 className="text-sm font-semibold text-white">Create New Client Account</h3>
              </div>
              <button onClick={() => setShowCreateClient(false)} className="text-[#A1A1AA] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Manually create a client account. No email verification required.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">Client Email</label>
                <input type="email" placeholder="client@email.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">Client Name</label>
                <input type="text" placeholder="John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">Business Name</label>
                <input type="text" placeholder="Business Name"
                  value={createForm.businessName}
                  onChange={(e) => setCreateForm((p) => ({ ...p, businessName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#16A34A]/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">Subscription Plan</label>
                <select value={createForm.plan}
                  onChange={(e) => setCreateForm((p) => ({ ...p, plan: e.target.value as "starter" | "pro" }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#16A34A]/50 cursor-pointer">
                  <option value="pro">★ Business Pro (৳2,499/mo)</option>
                  <option value="starter">Starter (৳1,499/mo)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" onClick={() => setShowCreateClient(false)}
                className="flex-1 border-white/10 text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Cancel</Button>
              <Button onClick={handleCreateClient}
                className="flex-1 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
                <UserPlus className="w-4 h-4 mr-1.5" /> Create Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}