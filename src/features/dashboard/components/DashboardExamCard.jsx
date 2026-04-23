import React from "react";
import { Clock3 } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import {
  formatCountdown,
  formatDateTime,
  formatTimeOnly,
  navigateToTab,
} from "@/features/dashboard/components/DashboardHelpers";

export function DashboardExamCard({ snapshot, limit = 3, compact = false }) {
  return (
    <DashboardCard title="Lịch thi & sự kiện" actionLabel="Xem tất cả" onAction={() => navigateToTab("exam")} className={compact ? "" : "flex-[0.92] min-h-0"} contentClassName={compact ? "" : "min-h-0"}>
      {!snapshot.exams.hasData || snapshot.exams.items.length === 0 ? (
        <div className={compact ? "flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" : "flex h-full min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}>
          Chưa có lịch thi đã sync
        </div>
      ) : (
        <div className={compact ? "min-w-0 space-y-3" : "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"}>
          {snapshot.exams.items.slice(0, limit).map((exam) => {
            const parsedExamDate = exam.examDate instanceof Date && !Number.isNaN(exam.examDate.getTime())
              ? exam.examDate
              : exam.NGAYTHI;
            const displayDate = formatDateTime(parsedExamDate);
            const displayTime = exam.GIOBD || formatTimeOnly(parsedExamDate);

            return (
              <div key={`${exam.ID || exam.MAMONHOC}-${exam.NGAYTHI}-${exam.GIOBD}`} className="flex min-w-0 items-start gap-3">
              <div className="mt-1 h-8 w-1 rounded-full bg-blue-600" />
              <div className="flex min-w-0 flex-1 w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 w-0">
                  <p className="line-clamp-2 text-[15px] font-semibold text-slate-900 dark:text-slate-100">{exam.TENMONHOC || exam.MAMONHOC}</p>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {exam.MAMONHOC} {(exam.MAPHONG || exam.PHONGTHI) ? `- Phòng ${exam.MAPHONG || exam.PHONGTHI}` : ""}
                  </p>
                  <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 truncate">
                      {displayDate}
                      {(displayDate && displayTime) ? " • " : ""}
                      {displayTime}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <span className="inline-flex max-w-[74px] truncate rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/35 dark:text-blue-300 sm:max-w-none">
                    {formatCountdown(parsedExamDate)}
                  </span>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
