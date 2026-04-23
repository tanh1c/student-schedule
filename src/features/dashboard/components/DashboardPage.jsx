import React from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { DashboardActivityCard } from "@/features/dashboard/components/DashboardActivityCard";
import { DashboardDeadlineCard } from "@/features/dashboard/components/DashboardDeadlineCard";
import { DashboardExamCard } from "@/features/dashboard/components/DashboardExamCard";
import { DashboardGpaCard } from "@/features/dashboard/components/DashboardGpaCard";
import { DashboardRoadmapCard } from "@/features/dashboard/components/DashboardRoadmapCard";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { DashboardWeeklyScheduleCard } from "@/features/dashboard/components/DashboardWeeklyScheduleCard";

function MobileFallback({ snapshot, refresh, isRefreshing }) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-hidden">
      <DashboardCard title="Tổng quan nhanh">
        <div className="min-w-0 space-y-3">
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{snapshot.greeting}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{snapshot.heroDateLabel}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={refresh} disabled={isRefreshing} className="h-9 w-9 shrink-0 rounded-full border">
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3">
            {[
              { label: "Lớp hôm nay", value: snapshot.stats.classesToday },
              { label: "Deadline gần", value: snapshot.stats.urgentDeadlines },
              { label: "Lịch thi", value: snapshot.stats.upcomingExams },
              { label: "GPA", value: snapshot.gpa.snapshot?.gpa4?.toFixed(2) ?? "--" },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{item.label}</p>
                <p className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-slate-50">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      <DashboardWeeklyScheduleCard snapshot={snapshot} refresh={refresh} isRefreshing={isRefreshing} compact />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardGpaCard snapshot={snapshot} compact />
        <DashboardRoadmapCard snapshot={snapshot} compact />
      </div>

      <DashboardDeadlineCard snapshot={snapshot} limit={2} compact />
      <DashboardExamCard snapshot={snapshot} limit={2} compact />
      <DashboardActivityCard snapshot={snapshot} limit={2} compact />
    </div>
  );
}

export default function DashboardPage() {
  const { snapshot, refresh, isRefreshing } = useDashboardOverview();

  return (
    <div className="h-full w-full min-w-0 max-w-full overflow-hidden">
      <div className="flex h-[calc(100dvh-57px)] w-[100dvw] max-w-full min-w-0 flex-col overflow-hidden lg:hidden">
        <ScrollArea className="min-w-0 flex-1 w-full max-w-full overflow-hidden px-4">
          <div className="w-full min-w-0 max-w-full overflow-hidden pb-32 pt-4">
            <MobileFallback snapshot={snapshot} refresh={refresh} isRefreshing={isRefreshing} />
          </div>
        </ScrollArea>
      </div>

      <div className="hidden h-full min-h-0 w-full min-w-0 max-w-full overflow-hidden px-6 py-6 lg:grid lg:grid-cols-12 lg:grid-rows-[minmax(0,1.48fr)_minmax(0,0.82fr)] lg:gap-5">
        <div className="col-span-8 row-span-1 min-h-0">
          <DashboardWeeklyScheduleCard snapshot={snapshot} refresh={refresh} isRefreshing={isRefreshing} />
        </div>

        <div className="col-span-8 row-start-2 grid min-h-0 grid-cols-2 gap-5">
          <DashboardGpaCard snapshot={snapshot} />
          <DashboardRoadmapCard snapshot={snapshot} />
        </div>

        <div className="col-span-4 row-span-2 flex min-h-0 flex-col gap-5">
          <DashboardDeadlineCard snapshot={snapshot} />
          <DashboardExamCard snapshot={snapshot} />
          <DashboardActivityCard snapshot={snapshot} />
        </div>
      </div>
    </div>
  );
}
