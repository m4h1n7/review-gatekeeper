import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Trophy,
  Medal,
  Crown,
  UserPlus,
  Trash2,
  QrCode,
  TrendingUp,
  Star,
  MessageCircle,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserX,
  UserCheck,
  Download,
  Wifi,
  Mail,
  Phone,
} from "lucide-react";

interface StaffManagerProps {
  businessId: string;
  businessSlug: string;
  businessName: string;
  brandColor?: string;
}

export default function StaffManager({
  businessId,
  businessSlug,
  businessName,
  brandColor = "#16A34A",
}: StaffManagerProps) {
  const staffMembers = useQuery(api.staff.listByBusiness, { businessId });
  const leaderboard = useQuery(api.staff.getLeaderboard, { businessId });
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const removeStaff = useMutation(api.staff.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);
  const [copiedNfcId, setCopiedNfcId] = useState<string | null>(null);

  /* ─── Handlers ─── */
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createStaff({
        businessId,
        name: newName.trim(),
        role: newRole.trim() || undefined,
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
      });
      setSuccessMsg(`Created ${newName.trim()}! QR slug: ${result.slug}`);
      setNewName("");
      setNewRole("");
      setNewEmail("");
      setNewPhone("");
      setShowAddForm(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (staffId: string, currentActive: boolean) => {
    try {
      await updateStaff({ staffId, active: !currentActive });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (staffId: string, name: string) => {
    if (!confirm(`Delete staff member "${name}"? This cannot be undone.`)) return;
    try {
      await removeStaff({ staffId });
    } catch (err) {
      console.error(err);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-[#A1A1AA] w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-sm text-[#16A34A]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Staff List + QR Generator ─── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Staff Members</h3>
              <p className="text-xs text-[#A1A1AA]">
                Create unique QR links per employee
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showAddForm ? "Cancel" : "Add Staff"}
          </button>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">
                      Staff Name *
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Rahim Uddin"
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">
                      Role (optional)
                    </label>
                    <input
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Cashier, Server"
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">
                      Email (optional)
                    </label>
                    <input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="staff@email.com"
                      type="email"
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] mb-1 block">
                      Phone (optional)
                    </label>
                    <input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="01700-000000"
                      type="tel"
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || isCreating}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Create Staff Member
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff List */}
        {staffMembers && staffMembers.length > 0 ? (
          <div className="space-y-2">
            {staffMembers.map((staff) => {
              const isExpanded = expandedStaff === staff.id;
              const staffUrl = `${window.location.origin}/review/${businessSlug}?sid=${staff.slug}`;
              return (
                <motion.div
                  key={staff.id}
                  layout
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedStaff(isExpanded ? null : staff.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-400">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{staff.name}</p>
                        <p className="text-[10px] text-[#A1A1AA]">
                          {staff.role || "Staff"} · /{businessSlug}?sid={staff.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.active
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {staff.active ? "Active" : "Inactive"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#A1A1AA]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 pt-0 border-t border-white/[0.04] space-y-3">
                          {/* QR URL */}
                          <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-[10px] text-[#A1A1AA] mb-1 font-medium">
                              <QrCode className="inline w-3 h-3 mr-1" />
                              Staff Review Link
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-blue-400 break-all flex-1 font-mono">
                                {staffUrl}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(staffUrl);
                                }}
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer shrink-0"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(staff.id, staff.active);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                staff.active
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                  : "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              }`}
                            >
                              {staff.active ? (
                                <>
                                  <UserX className="w-3 h-3" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" /> Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(staff.id, staff.name);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#A1A1AA]/50">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No staff members yet. Add your first team member above.</p>
          </div>
        )}
      </div>

      {/* ─── Staff Leaderboard ─── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Staff Leaderboard</h3>
            <p className="text-xs text-[#A1A1AA]">Review generation performance rankings</p>
          </div>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <motion.div
                key={entry.staffId}
                layout
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  entry.rank === 1
                    ? "bg-amber-500/[0.06] border border-amber-500/15"
                    : "bg-white/[0.02] border border-white/[0.04]"
                }`}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {entry.name}
                    </p>
                    {!entry.active && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400">
                        OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#A1A1AA]">{entry.role || "Staff"}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                      <span className="text-sm font-bold text-white">
                        {entry.totalScans}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#A1A1AA]">Scans</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-sm font-bold text-white">
                        {entry.publicReviews}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#A1A1AA]">Reviews</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-sm font-bold text-white">
                        {entry.privateFeedbacks}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#A1A1AA]">Feedback</p>
                  </div>
                  <div className="w-14">
                    <span
                      className={`text-sm font-bold ${
                        entry.conversionRate >= 70
                          ? "text-[#16A34A]"
                          : entry.conversionRate >= 40
                            ? "text-amber-400"
                            : "text-[#A1A1AA]"
                      }`}
                    >
                      {entry.conversionRate}%
                    </span>
                    <p className="text-[9px] text-[#A1A1AA]">Conv.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#A1A1AA]/50">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Add staff members to see their performance rankings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
