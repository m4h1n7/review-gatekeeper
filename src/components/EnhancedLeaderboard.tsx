"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  TrendingUp,
  Star,
  Users,
  Calendar,
  Crown,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  slug: string;
  role?: string;
  totalScans: number;
  publicReviews: number;
  privateFeedbacks: number;
  positiveReviews: number;
  negativeFeedbacks: number;
  conversionRate: number;
}

type TimePeriod = "week" | "month" | "all";
type LeaderboardFilter = "all" | "top" | "coaching";

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const FILTER_OPTIONS: {
  value: LeaderboardFilter;
  label: string;
  icon: typeof Trophy;
  color: string;
}[] = [
  { value: "all", label: "All Staff", icon: Users, color: "#A1A1AA" },
  { value: "top", label: "Top Performers", icon: ThumbsUp, color: "#16A34A" },
  { value: "coaching", label: "Needs Coaching", icon: AlertTriangle, color: "#F59E0B" },
];

const RANK_ICONS = [
  { medal: "🥇", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  { medal: "🥈", color: "text-gray-300", bg: "bg-gray-300/10", border: "border-gray-300/20" },
  { medal: "🥉", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" },
];

interface EnhancedLeaderboardProps {
  staff: StaffMember[];
}

export default function EnhancedLeaderboard({ staff }: EnhancedLeaderboardProps) {
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [filter, setFilter] = useState<LeaderboardFilter>("all");

  // Simulate period-based filtering
  const filteredStaff = useMemo(() => {
    if (period === "all") return staff;
    const multiplier = period === "week" ? 0.3 : 0.7;
    return staff.map((s) => ({
      ...s,
      totalScans: Math.max(1, Math.round(s.totalScans * multiplier)),
      publicReviews: Math.max(0, Math.round(s.publicReviews * multiplier)),
      privateFeedbacks: Math.max(0, Math.round(s.privateFeedbacks * multiplier)),
      positiveReviews: Math.max(0, Math.round(s.positiveReviews * multiplier)),
      negativeFeedbacks: Math.max(0, Math.round(s.negativeFeedbacks * multiplier)),
      conversionRate: s.conversionRate,
    }));
  }, [staff, period]);

  // Apply performance filter
  const displayStaff = useMemo(() => {
    let result = [...filteredStaff];

    if (filter === "top") {
      // Top performers: highest positive review count
      result = result
        .sort((a, b) => b.positiveReviews - a.positiveReviews)
        .filter((s) => s.positiveReviews > 0);
    } else if (filter === "coaching") {
      // Needs coaching: highest negative feedback count
      result = result
        .sort((a, b) => b.negativeFeedbacks - a.negativeFeedbacks)
        .filter((s) => s.negativeFeedbacks > 0);
    } else {
      result.sort((a, b) => b.totalScans - a.totalScans);
    }

    return result;
  }, [filteredStaff, filter]);

  const ranked = displayStaff;

  if (staff.length === 0) {
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
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Performance Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-[#A1A1AA] mr-1" />
        {FILTER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const count =
            opt.value === "top"
              ? filteredStaff.filter((s) => s.positiveReviews > 0).length
              : opt.value === "coaching"
              ? filteredStaff.filter((s) => s.negativeFeedbacks > 0).length
              : filteredStaff.length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === opt.value
                  ? "text-white shadow-sm"
                  : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
              }`}
              style={
                filter === opt.value
                  ? {
                      backgroundColor: `${opt.color}20`,
                      borderColor: `${opt.color}40`,
                      color: opt.color,
                    }
                  : undefined
              }
            >
              <Icon className="w-3 h-3" />
              {opt.label}
              <span className="ml-0.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-[#A1A1AA]/60 uppercase tracking-wider font-semibold">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Staff</div>
          <div className="col-span-2 text-center">Scans</div>
          <div className="col-span-2 text-center text-[#16A34A]">
            <span className="inline-flex items-center gap-0.5">
              <ThumbsUp className="w-2.5 h-2.5" /> Positive
            </span>
          </div>
          <div className="col-span-2 text-center text-amber-400">
            <span className="inline-flex items-center gap-0.5">
              <ThumbsDown className="w-2.5 h-2.5" /> Negative
            </span>
          </div>
          <div className="col-span-2 text-center">Satisfaction</div>
        </div>

        {/* Rows */}
        <AnimatePresence mode="popLayout">
          {ranked.map((staffMember, index) => {
            const rank = RANK_ICONS[index];
            const satisfactionRate =
              staffMember.totalScans > 0
                ? Math.round(
                    (staffMember.positiveReviews / staffMember.totalScans) * 100
                  )
                : 0;

            return (
              <motion.div
                key={staffMember.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.03 }}
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

                {/* Name + Role */}
                <div className="col-span-3">
                  <p className="text-sm font-medium text-white truncate">
                    {staffMember.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] text-[#A1A1AA]/60 truncate">
                      @{staffMember.slug}
                    </p>
                    {staffMember.role && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1AA]/70 truncate">
                        {staffMember.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Total Scans */}
                <div className="col-span-2 text-center">
                  <p className="text-sm font-bold text-white tabular-nums">
                    {staffMember.totalScans}
                  </p>
                  <p className="text-[10px] text-[#A1A1AA]/50">taps</p>
                </div>

                {/* Positive Reviews (4-5 stars) */}
                <div className="col-span-2 text-center">
                  <p className="text-sm font-bold text-[#16A34A] tabular-nums">
                    {staffMember.positiveReviews}
                  </p>
                  <p className="text-[10px] text-[#16A34A]/50">★ 4-5</p>
                </div>

                {/* Negative Feedback (1-3 stars) */}
                <div className="col-span-2 text-center">
                  <p className="text-sm font-bold text-amber-400 tabular-nums">
                    {staffMember.negativeFeedbacks}
                  </p>
                  <p className="text-[10px] text-amber-400/50">★ 1-3</p>
                </div>

                {/* Satisfaction Rate */}
                <div className="col-span-2 text-center">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                      satisfactionRate >= 70
                        ? "bg-[#16A34A]/10 border-[#16A34A]/15 text-[#16A34A]"
                        : satisfactionRate >= 40
                        ? "bg-amber-400/10 border-amber-400/15 text-amber-400"
                        : "bg-red-500/10 border-red-500/15 text-red-400"
                    }`}
                  >
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span className="text-xs font-bold">
                      {satisfactionRate}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {ranked.length === 0 && (
          <div className="text-center py-6 text-[#A1A1AA]/50 text-sm">
            {filter === "top" && "No top performers found yet. Staff need positive reviews first."}
            {filter === "coaching" && "Great news! No staff members need coaching right now."}
            {filter === "all" && "No staff data available."}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA]/60 flex-wrap">
          <span>
            Total Staff:{" "}
            <span className="text-white font-semibold">{filteredStaff.length}</span>
          </span>
          <span>
            Total Scans:{" "}
            <span className="text-white font-semibold">
              {filteredStaff.reduce((sum, s) => sum + s.totalScans, 0)}
            </span>
          </span>
          <span className="text-[#16A34A]">
            ★ Positive:{" "}
            <span className="font-semibold">
              {filteredStaff.reduce((sum, s) => sum + s.positiveReviews, 0)}
            </span>
          </span>
          <span className="text-amber-400">
            ★ Negative:{" "}
            <span className="font-semibold">
              {filteredStaff.reduce((sum, s) => sum + s.negativeFeedbacks, 0)}
            </span>
          </span>
          <span>
            Avg Satisfaction:{" "}
            <span className="text-[#16A34A] font-semibold">
              {filteredStaff.length > 0
                ? Math.round(
                    filteredStaff.reduce((sum, s) => {
                      const rate =
                        s.totalScans > 0
                          ? (s.positiveReviews / s.totalScans) * 100
                          : 0;
                      return sum + rate;
                    }, 0) / filteredStaff.length
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
