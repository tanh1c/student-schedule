import React from "react";
import { ArrowRight, CalendarClock, NotebookTabs } from "lucide-react";
import { WORKSPACE_TAB_CHANGE_EVENT } from "@/app/navigationEvents";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";

function PeriodItem({ period, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-emerald-200/70 bg-white/75 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-emerald-900/50 dark:bg-slate-950/35 dark:hover:border-emerald-700 dark:hover:bg-slate-950/55"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-emerald-900 dark:text-emerald-100">
            {period.code || "Đợt ĐKMH"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-emerald-700/75 dark:text-emerald-300/75">
            {period.description || "Đang trong thời gian đăng ký"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Mở
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {(period.startTime || period.endTime) ? (
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-emerald-700/70 dark:text-emerald-300/70">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{period.startTime || "--"} → {period.endTime || "--"}</span>
          </div>
        ) : <span />}
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          Vào ĐKMH <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export function DashboardRoadmapCard({ snapshot }) {
  const openPeriods = snapshot.registration?.openPeriods || [];
  const goToRegistration = () => {
    window.dispatchEvent(new CustomEvent(WORKSPACE_TAB_CHANGE_EVENT, {
      detail: { tabId: "registration" },
    }));
  };

  return (
    <DashboardCard
      title="ĐKMH"
      headerActions={<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{snapshot.registration?.openCount || 0} mở</span>}
      className="h-full"
      contentClassName="h-full"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-slate-950">
        {openPeriods.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
            <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-300/80">
              Đợt đăng ký môn học đang mở
            </p>
            <div className="space-y-2">
              {openPeriods.map((period) => (
                <PeriodItem key={period.id || period.code} period={period} onClick={goToRegistration} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-slate-950/40">
              <NotebookTabs className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
            </div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Chưa có đợt ĐKMH nào</p>
            <p className="mt-1 max-w-[220px] text-xs text-emerald-700/70 dark:text-emerald-300/70">
              Khi có kỳ đăng ký đang mở, đợt gần nhất sẽ hiện ở đây.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
