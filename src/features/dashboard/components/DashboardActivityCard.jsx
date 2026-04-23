import React from "react";
import { MessageSquare } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { navigateToTab } from "@/features/dashboard/components/DashboardHelpers";

export function DashboardActivityCard({ snapshot, limit = 3, compact = false }) {
  return (
    <DashboardCard
      title="Hoạt động LMS"
      actionLabel="Xem tất cả"
      onAction={() => navigateToTab("messages")}
      className={compact ? "" : "flex-[0.82] min-h-0"}
      contentClassName={compact ? "" : "min-h-0"}
    >
      {!snapshot.messages.hasData || (snapshot.messages.recentActivities || []).length === 0 ? (
        <div className={compact ? "flex min-h-[110px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" : "flex h-full min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}>
          Chưa có hoạt động LMS gần đây
        </div>
      ) : (
        <div className={compact ? "min-w-0 space-y-3" : "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"}>
          {snapshot.messages.recentActivities.slice(0, limit).map((activity, index) => (
            <div key={`${activity.id}-${index}`} className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 w-0">
                <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">{activity.sender}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{activity.preview || "Không có nội dung xem trước."}</p>
              </div>
              <span className="max-w-[64px] shrink-0 truncate text-xs text-slate-400 dark:text-slate-500 sm:max-w-none">{activity.timeLabel}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
