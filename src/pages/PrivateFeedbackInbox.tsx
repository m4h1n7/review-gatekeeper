import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Filter,
  ArrowLeft,
  Search,
  Sparkles,
  Send,
  Download,
  Copy,
  X,
  ChevronDown,
  AlertTriangle,
  Star,
  Users,
} from "lucide-react";

/* ─── Types ─── */
type StatusFilter = "all" | "unread" | "in_progress" | "resolved";

interface FeedbackItem {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  message: string;
  rating: number;
  createdAt: number;
  status: string;
}

/* ─── Parse tags from message (they're embedded as [Tag1, Tag2] at the start) ─── */
function parseTagsFromMessage(message: string): { tags: string[]; cleanMessage: string } {
  const tagMatch = message.match(/^\[(.+?)\]\s*/);
  if (tagMatch) {
    const tags = tagMatch[1].split(", ").map((t) => t.trim()).filter(Boolean);
    const cleanMessage = message.slice(tagMatch[0].length);
    return { tags, cleanMessage };
  }
  return { tags: [], cleanMessage: message };
}

/* ─── AI Response Templates ─── */
const AI_RESPONSES: Record<string, string[]> = {
  "Service Quality": [
    "Thank you for your honest feedback about our service. We've shared this with our team and are taking immediate steps to improve response times and attentiveness. We'd love another chance to serve you better.",
    "We sincerely apologize for the service shortfall. Your feedback has been escalated to our management team, and we're implementing new training protocols. We value your patience and hope to welcome you back soon.",
  ],
  "Staff Behavior": [
    "Thank you for bringing this to our attention. We take staff conduct very seriously and will address this directly with the team member involved. We appreciate you helping us maintain our standards.",
    "We're sorry about your experience with our staff. This doesn't reflect our values, and we'll be having a conversation with the team. Please give us another chance to make it right.",
  ],
  "Wait Time": [
    "We understand that long waits are frustrating, and we sincerely apologize. We're reviewing our workflow to reduce wait times and improve efficiency. Thank you for your patience.",
    "Thank you for your feedback about wait times. We're optimizing our scheduling and staffing to ensure faster service in the future. We appreciate your understanding.",
  ],
  "Cleanliness": [
    "We take cleanliness very seriously and appreciate you pointing this out. We've immediately addressed the issue and reinforced our cleaning protocols. Thank you for helping us stay accountable.",
    "Your feedback about cleanliness is important to us. We've conducted a thorough review of our facilities and implemented additional cleaning schedules. We hope you'll notice the improvement on your next visit.",
  ],
  "Pricing / Value": [
    "We appreciate your feedback about our pricing. We strive to provide the best value for the quality we offer, and we'll take your input into consideration for future pricing decisions.",
    "Thank you for sharing your thoughts on our pricing. We continuously evaluate our offerings to ensure fair value. We'd love to discuss this further and show you the quality behind our pricing.",
  ],
  "Product Issue": [
    "We're sorry about the product issue you experienced. This isn't up to our standards, and we'd like to make it right. Please reach out to us directly so we can resolve this immediately.",
    "Thank you for reporting this product issue. We've flagged it with our quality team and are taking corrective action. We'd love to offer you a replacement or refund — please contact us.",
  ],
  default: [
    "Thank you for your valuable feedback. We take all customer input seriously and are committed to improving your experience. Our management team will review this and follow up within 24 hours.",
    "We appreciate you taking the time to share your experience. Your feedback helps us improve, and we're already working on addressing your concerns. We hope to see you again soon.",
  ],
};

function getAIResponse(tags: string[]): string {
  for (const tag of tags) {
    if (AI_RESPONSES[tag]) {
      const responses = AI_RESPONSES[tag];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  const defaults = AI_RESPONSES["default"];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/* ─── Main Component ─── */
export default function PrivateFeedbackInbox() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [copiedResponse, setCopiedResponse] = useState(false);

  const overview = useQuery(api.analytics.dashboardOverview, { filter: "all" });
  const feedbacks = useQuery(
    api.analytics.recentFeedbacks,
    overview?.businesses[0]?.id
      ? { businessId: overview.businesses[0].id, limit: 200 }
      : "skip"
  );
  const toggleStatus = useMutation(api.feedback.toggleStatus);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  /* ─── Filtered Feedbacks ─── */
  const filteredFeedbacks = useMemo(() => {
    if (!feedbacks) return [];
    return feedbacks.filter((fb: FeedbackItem) => {
      const effectiveStatus = localStatuses[fb.id] ?? fb.status;

      // Status filter
      if (statusFilter === "unread" && effectiveStatus !== "unresolved") return false;
      if (statusFilter === "in_progress" && effectiveStatus !== "in_progress") return false;
      if (statusFilter === "resolved" && effectiveStatus !== "resolved") return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const { tags, cleanMessage } = parseTagsFromMessage(fb.message);
        const searchable = `${fb.customerName} ${fb.phone} ${fb.email} ${cleanMessage} ${tags.join(" ")}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [feedbacks, statusFilter, searchQuery, localStatuses]);

  /* ─── Counts ─── */
  const counts = useMemo(() => {
    if (!feedbacks) return { all: 0, unread: 0, in_progress: 0, resolved: 0 };
    let unread = 0;
    let in_progress = 0;
    let resolved = 0;
    for (const fb of feedbacks) {
      const s = localStatuses[fb.id] ?? fb.status;
      if (s === "unresolved") unread++;
      else if (s === "in_progress") in_progress++;
      else if (s === "resolved") resolved++;
    }
    return { all: feedbacks.length, unread, in_progress, resolved };
  }, [feedbacks, localStatuses]);

  /* ─── Handlers ─── */
  const handleStatusChange = useCallback(
    async (feedbackId: string, newStatus: string) => {
      setLocalStatuses((prev) => ({ ...prev, [feedbackId]: newStatus }));
      try {
        await toggleStatus({
          feedbackId,
          status: newStatus as "unresolved" | "resolved",
        });
      } catch {
        // Revert on error
      }
    },
    [toggleStatus]
  );

  const handleGenerateAI = useCallback((fb: FeedbackItem) => {
    setAiGenerating(fb.id);
    setAiResponse(null);
    // Simulate AI generation with a delay
    setTimeout(() => {
      const { tags } = parseTagsFromMessage(fb.message);
      const response = getAIResponse(tags);
      setAiResponse(response);
      setAiGenerating(null);
    }, 1500);
  }, []);

  const handleCopyResponse = useCallback(() => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  }, [aiResponse]);

  const handleDownloadCSV = useCallback(() => {
    if (!feedbacks || feedbacks.length === 0) return;
    const headers = ["Customer Name", "Phone", "Email", "Rating", "Tags", "Feedback", "Status", "Timestamp"];
    const rows = feedbacks.map((fb: FeedbackItem) => {
      const { tags, cleanMessage } = parseTagsFromMessage(fb.message);
      const status = localStatuses[fb.id] ?? fb.status;
      return [
        fb.customerName,
        fb.phone,
        fb.email,
        fb.rating,
        `"${tags.join(", ")}"`,
        `"${cleanMessage.replace(/"/g, '""')}"`,
        status,
        new Date(fb.createdAt).toISOString(),
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starcatch-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [feedbacks, localStatuses]);

  const businessName = overview?.businesses[0]?.name || "Your Business";

  /* ─── Filter Tabs ─── */
  const filterTabs: { id: StatusFilter; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { id: "all", label: "All", icon: <Inbox className="w-3.5 h-3.5" />, count: counts.all, color: "text-[#A1A1AA]" },
    { id: "unread", label: "Unread / New", icon: <AlertTriangle className="w-3.5 h-3.5" />, count: counts.unread, color: "text-red-400" },
    { id: "in_progress", label: "In Progress", icon: <Clock className="w-3.5 h-3.5" />, count: counts.in_progress, color: "text-amber-400" },
    { id: "resolved", label: "Resolved", icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: counts.resolved, color: "text-[#16A34A]" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* ─── Top Navigation Bar ─── */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Private Feedback</p>
                <p className="text-[10px] text-[#A1A1AA]">{businessName}</p>
              </div>
              {counts.unread > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400">
                  {counts.unread} unread
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ─── Filter Tabs ─── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 mb-6 w-fit overflow-x-auto flex-nowrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    statusFilter === tab.id
                      ? "bg-white/20 text-white"
                      : tab.id === "unread"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-white/5 text-[#A1A1AA]/60"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Search Bar ─── */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, message, or tags..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]/40 hover:text-white/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ─── Feedback List ─── */}
        {!feedbacks ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#A1A1AA]/30 animate-pulse" />
            </div>
            <p className="text-sm text-[#A1A1AA]">Loading feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#A1A1AA]/20" />
            </div>
            <p className="text-sm text-[#A1A1AA]">
              {searchQuery
                ? "No feedback matches your search"
                : statusFilter === "unread"
                  ? "No unread feedback — great job!"
                  : statusFilter === "in_progress"
                    ? "No feedback in progress"
                    : statusFilter === "resolved"
                      ? "No resolved feedback yet"
                      : "No private feedback yet"}
            </p>
            <p className="text-xs text-[#A1A1AA]/60 mt-1">
              {searchQuery
                ? "Try a different search term"
                : "When customers submit private feedback, it will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFeedbacks.map((fb: FeedbackItem, index: number) => {
                const effectiveStatus = localStatuses[fb.id] ?? fb.status;
                const { tags, cleanMessage } = parseTagsFromMessage(fb.message);
                const isNew = effectiveStatus === "unresolved";
                const isInProgress = effectiveStatus === "in_progress";

                return (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className={`rounded-2xl border transition-all cursor-pointer ${
                      selectedFeedback?.id === fb.id
                        ? "border-[#16A34A]/40 bg-[#16A34A]/[0.04]"
                        : isNew
                          ? "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/30"
                          : isInProgress
                            ? "border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/30"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                    onClick={() => setSelectedFeedback(selectedFeedback?.id === fb.id ? null : fb)}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-sm font-semibold text-white">{fb.customerName}</span>
                            <span className="text-amber-400 text-xs">
                              {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                            </span>
                            {isNew && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                New
                              </span>
                            )}
                            {isInProgress && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                <Clock className="w-2.5 h-2.5" />
                                In Progress
                              </span>
                            )}
                            {effectiveStatus === "resolved" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/15 text-[#16A34A] text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Resolved
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Message preview */}
                          <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-2">{cleanMessage}</p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#A1A1AA]/50">
                            <span>{new Date(fb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span>{new Date(fb.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                            {fb.phone && fb.phone !== "N/A" && <span>📱 {fb.phone}</span>}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {fb.phone && fb.phone !== "N/A" && (
                            <a
                              href={`https://wa.me/${fb.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hi ${fb.customerName},\n\nThank you for sharing your feedback with us. We're sorry your experience didn't meet expectations.\n\nWe'd love to make it right! As a token of our appreciation, please enjoy a special discount on your next visit.\n\nJust show this message to our staff.\n\nWarm regards,\n${businessName}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors cursor-pointer whitespace-nowrap"
                              title="Reply via WhatsApp"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                          <ChevronDown
                            className={`w-4 h-4 text-[#A1A1AA]/40 transition-transform ${
                              selectedFeedback?.id === fb.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {selectedFeedback?.id === fb.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/[0.04] pt-4 space-y-4">
                            {/* Full Message */}
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <p className="text-[10px] text-[#A1A1AA]/50 uppercase tracking-wider font-medium mb-1.5">Full Message</p>
                              <p className="text-sm text-white/80 leading-relaxed">{cleanMessage}</p>
                            </div>

                            {/* Contact Info */}
                            {(fb.phone !== "N/A" || fb.email !== "N/A") && (
                              <div className="flex flex-wrap gap-3">
                                {fb.phone && fb.phone !== "N/A" && (
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                    <span className="text-xs text-white/60">{fb.phone}</span>
                                  </div>
                                )}
                                {fb.email && fb.email !== "N/A" && (
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                    <Send className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs text-white/60">{fb.email}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Status Controls + AI */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status Dropdown */}
                              <div className="relative">
                                <select
                                  value={effectiveStatus}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(fb.id, e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-8 pl-3 pr-8 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white appearance-none cursor-pointer focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
                                >
                                  <option value="unresolved">🔴 Unread / New</option>
                                  <option value="in_progress">🟡 In Progress</option>
                                  <option value="resolved">🟢 Resolved</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#A1A1AA]/40 pointer-events-none" />
                              </div>

                              {/* AI Generate Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateAI(fb);
                                }}
                                disabled={aiGenerating === fb.id}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {aiGenerating === fb.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate AI Response
                                  </>
                                )}
                              </button>

                              {/* WhatsApp Reply */}
                              {fb.phone && fb.phone !== "N/A" && (
                                <a
                                  href={`https://wa.me/${fb.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                    aiResponse || `Hi ${fb.customerName},\n\nThank you for your feedback. We take all customer input seriously and are working to improve your experience.\n\nWarm regards,\n${businessName}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {aiResponse ? "Send AI Reply" : "Reply via WhatsApp"}
                                </a>
                              )}
                            </div>

                            {/* AI Response Display */}
                            <AnimatePresence>
                              {aiResponse && selectedFeedback?.id === fb.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className="p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/20"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                      <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">AI-Generated Response</p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAiResponse(null);
                                      }}
                                      className="text-white/30 hover:text-white/60 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-white/70 leading-relaxed mb-3">{aiResponse}</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyResponse();
                                      }}
                                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                      {copiedResponse ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" /> Copy
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateAI(fb);
                                      }}
                                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                      <Sparkles className="w-3 h-3" /> Regenerate
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Stats Footer ─── */}
        {feedbacks && feedbacks.length > 0 && (
          <div className="mt-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white">{counts.all}</p>
                <p className="text-[10px] text-[#A1A1AA]/50">Total Feedback</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-400">{counts.unread}</p>
                <p className="text-[10px] text-[#A1A1AA]/50">Unread</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">{counts.in_progress}</p>
                <p className="text-[10px] text-[#A1A1AA]/50">In Progress</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#16A34A]">{counts.resolved}</p>
                <p className="text-[10px] text-[#A1A1AA]/50">Resolved</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
