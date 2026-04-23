import React from "react";
import { Bell, Clock3 } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { formatCountdown, formatDateTime, navigateToTab } from "@/features/dashboard/components/DashboardHelpers";

export function DashboardDeadlineCard({ snapshot, limit = 3, compact = false }) {
  return (
    <DashboardCard title="Deadline LMS" actionLabel="Xem tất cả" onAction={() => navigateToTab("deadlines")} className={compact ? "" : "flex-[1.08] min-h-0"} contentClassName={compact ? "" : "min-h-0"}>
      {!snapshot.deadlines.hasData || snapshot.deadlines.items.length === 0 ? (
        <div className={compact ? "flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" : "flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}>
          Chưa có dữ liệu deadline LMS
        </div>
      ) : (
        <div className={compact ? "min-w-0 space-y-3" : "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"}>
          {snapshot.deadlines.items.slice(0, limit).map((item, index) => (
            <div key={`${item.name}-${item.date}-${index}`} className="flex min-w-0 items-start gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-slate-800">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 w-0">
                <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">{item.name || item.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{item.courseName || "Môn học LMS"}</p>
                <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 truncate">{formatDateTime(item.eventDate)}</span>
                </div>
              </div>
              <Badge className="max-w-[74px] shrink-0 truncate rounded-full border-0 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 shadow-none dark:bg-rose-950/35 dark:text-rose-300 sm:max-w-none sm:px-3">
                {formatCountdown(item.eventDate)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
