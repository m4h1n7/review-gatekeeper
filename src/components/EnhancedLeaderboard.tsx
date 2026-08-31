"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  TrendingUp,
  Eye,
  Star,
  MessageSquare,
  Users,
  Calendar,
  Crown,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  slug: string;
  totalScans: number;
  publicReviews: number;
  privateFeedbacks: number;
  conversionRate: number;
}

type TimePeriod = "week" | "month" | "all";

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const RANK_ICONS = [
  { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10", medal: "🥇" },
  { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10", medal: "🥈" },
  { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10", medal: "🥉" },
];

interface EnhancedLeaderboardProps {
  staff: StaffMember[];
}

export default function EnhancedLeaderboard({ staff }: EnhancedLeaderboardProps) {
  const [period, setPeriod] = useState<TimePeriod>("all");

  // Simulate period-based filtering (in production, this would query the DB)
  const filteredStaff = useMemo(() => {
    if (period === "all") return staff;
    // Simulate different counts for different periods
    const multiplier = period === "week" ? 0.3 : 0.7;
    return staff.map((s) => ({
      ...s,
      totalScans: Math.max(1, Math.round(s.totalScans * multiplier)),
      publicReviews: Math.max(0, Math.round(s.publicReviews * multiplier)),
      privateFeedbacks: Math.max(0, Math.round(s.privateFeedbacks * multiplier)),
      conversionRate: s.conversionRate,
    }));
  }, [staff, period]);

  const ranked = useMemo(
    () =>
      [...filteredStaff].sort((a, b) => b.totalScans - a.totalScans),
    [filteredStaff]
  );

  if (ranked.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-10 h-10 text-[#A1A1AA]/20 mx-auto mb-3" />
        <p className="text-sm text-[#A1A1AA]">No staff members yet</p>
        <p className="text-xs text-[#A1A1AA]/60 mt-1">
          Add staff members to start tracking performance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-[#A1A1AA] mr-1" />
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              period === opt.value
                ? "bg-[#16A34A] text-white shadow-sm shadow-[#16A34A]/25"
                : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-[#A1A1AA]/60 uppercase tracking-wider font-semibold">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Staff</div>
          <div className="col-span-2 text-center">Scans</div>
          <div className="col-span-2 text-center">Reviews</div>
          <div className="col-span-2 text-center">Feedback</div>
          <div className="col-span-2 text-center">Rate</div>
        </div>

        {/* Rows */}
        {ranked.map((staff, index) => {
          const rank = RANK_ICONS[index];
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-xl transition-colors ${
                index === 0
                  ? "bg-yellow-400/[0.04] border border-yellow-400/15"
                  : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
              }`}
            >
              {/* Rank */}
              <div className="col-span-1">
                {rank ? (
                  <span className="text-lg">{rank.medal}</span>
                ) : (
                  <span className="text-xs text-[#A1A1AA] font-medium pl-1">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="col-span-3">
                <p className="text-sm font-medium text-white truncate">
                  {staff.name}
                </p>
                <p className="text-[10px] text-[#A1A1AA]/60 truncate">
                  {staff.slug}
                </p>
              </div>

              {/* Scans */}
              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-white tabular-nums">
                  {staff.totalScans}
                </p>
                <p className="text-[10px] text-[#A1A1AA]/50">taps</p>
              </div>

              {/* Public Reviews */}
              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-[#16A34A] tabular-nums">
                  {staff.publicReviews}
                </p>
                <p className="text-[10px] text-[#16A34A]/50">redirected</p>
              </div>

              {/* Private Feedback */}
              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-amber-400 tabular-nums">
                  {staff.privateFeedbacks}
                </p>
                <p className="text-[10px] text-amber-400/50">captured</p>
              </div>

              {/* Conversion Rate */}
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/15">
                  <TrendingUp className="w-2.5 h-2.5 text-[#16A34A]" />
                  <span className="text-xs font-bold text-[#16A34A]">
                    {staff.conversionRate}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA]/60">
          <span>
            Total Staff:{" "}
            <span className="text-white font-semibold">{ranked.length}</span>
          </span>
          <span>
            Total Scans:{" "}
            <span className="text-white font-semibold">
              {ranked.reduce((sum, s) => sum + s.totalScans, 0)}
            </span>
          </span>
          <span>
            Avg Conversion:{" "}
            <span className="text-[#16A34A] font-semibold">
              {ranked.length > 0
                ? Math.round(
                    ranked.reduce((sum, s) => sum + s.conversionRate, 0) /
                      ranked.length
                  )
                : 0}
              %
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
