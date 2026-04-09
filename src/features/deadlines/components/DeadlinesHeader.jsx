import React from "react";
import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  RefreshCw,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/features/deadlines/components/DeadlinesStatsCard";

export default function DeadlinesHeader({
  calendarInfo,
  stats,
  isLoading,
  onRefresh,
}) {
  return (
    <div className="sticky top-0 z-10 box-border w-full max-w-full overflow-hidden border-b bg-white/80 p-1.5 backdrop-blur-md dark:bg-slate-900/80 sm:p-4">
      <div className="mb-2 flex items-center justify-between sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-red-500 shadow-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <CalendarClock className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
              Deadline LMS
            </h2>
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              {calendarInfo || "BK E-Learning Calendar"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-3">
        <StatsCard
          icon={CalendarClock}
          title="Tổng sự kiện"
          value={stats.total}
          color="violet"
        />
        <StatsCard
          icon={AlertTriangle}
          title="Deadline"
          value={stats.deadlines}
          color="rose"
          subtitle={stats.urgent > 0 ? `${stats.urgent} sắp hết hạn` : ""}
        />
        <StatsCard
          icon={Sparkles}
          title="Sắp mở"
          value={stats.upcoming}
          color="emerald"
        />
        <StatsCard
          icon={Timer}
          title="Sắp hết hạn"
          value={stats.urgent}
          color="amber"
          subtitle={stats.urgent > 0 ? "trong 3 ngày" : ""}
        />
      </div>
    </div>
  );
}
