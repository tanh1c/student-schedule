import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeadlinesCoursesSection from "@/features/deadlines/components/DeadlinesCoursesSection";
import DeadlinesErrorState from "@/features/deadlines/components/DeadlinesErrorState";
import DeadlinesEventSection from "@/features/deadlines/components/DeadlinesEventSection";
import DeadlinesHeader from "@/features/deadlines/components/DeadlinesHeader";
import DeadlinesOfflineBanner from "@/features/deadlines/components/DeadlinesOfflineBanner";
import DeadlinesToolbar from "@/features/deadlines/components/DeadlinesToolbar";
import { useDeadlinesData } from "@/features/deadlines/hooks/useDeadlinesData";
import { buildDeadlinesViewModel } from "@/features/deadlines/utils/deadlineViewModel";

export default function DeadlinesTab() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPast, setShowPast] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  const nowSeconds = nowTimestamp / 1000;
  const {
    isLoading,
    error,
    deadlinesData,
    showLoginForm,
    loginJustCompleted,
    monthRange,
    isOfflineMode,
    setShowLoginForm,
    setLoginJustCompleted,
    handleMonthRangeChange,
    handleRefresh,
    handleReloadDeadlines,
  } = useDeadlinesData();

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, []);

  const { calendarInfo, filteredDeadlines, filteredUpcoming, stats } = useMemo(
    () => buildDeadlinesViewModel(deadlinesData, nowSeconds, showPast),
    [deadlinesData, nowSeconds, showPast]
  );

  if (error && !isLoading) {
    return (
      <DeadlinesErrorState
        error={error}
        showLoginForm={showLoginForm}
        loginJustCompleted={loginJustCompleted}
        onShowLoginForm={() => setShowLoginForm(true)}
        onHideLoginForm={() => setShowLoginForm(false)}
        onRefresh={handleRefresh}
        onReloadDeadlines={handleReloadDeadlines}
        onLoginSuccess={() => setLoginJustCompleted(true)}
      />
    );
  }

  if (isLoading && !deadlinesData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 shadow-lg animate-pulse">
          <CalendarClock className="h-8 w-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải deadline LMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <DeadlinesHeader
        calendarInfo={calendarInfo}
        stats={stats}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {isOfflineMode && <DeadlinesOfflineBanner onRefresh={handleRefresh} />}

      <ScrollArea className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden px-1.5 sm:px-3">
        <div className="min-w-0 w-full space-y-4 overflow-hidden py-3 sm:py-4">
          <DeadlinesToolbar
            activeFilter={activeFilter}
            showPast={showPast}
            monthRange={monthRange}
            isLoading={isLoading}
            onFilterChange={setActiveFilter}
            onToggleShowPast={() => setShowPast((current) => !current)}
            onMonthRangeChange={handleMonthRangeChange}
          />

          {(activeFilter === "all" || activeFilter === "deadlines") && (
            <DeadlinesEventSection
              variant="deadlines"
              events={filteredDeadlines}
              nowSeconds={nowSeconds}
            />
          )}

          {activeFilter === "all" &&
            filteredDeadlines.length > 0 &&
            filteredUpcoming.length > 0 && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
              </div>
            )}

          {(activeFilter === "all" || activeFilter === "upcoming") && (
            <DeadlinesEventSection
              variant="upcoming"
              events={filteredUpcoming}
              nowSeconds={nowSeconds}
            />
          )}

          <DeadlinesCoursesSection courses={deadlinesData?.courses} />
        </div>
      </ScrollArea>

      <div className="border-t bg-slate-50/50 p-2 text-center dark:bg-slate-900/50 sm:p-3">
        <a
          href="https://lms.hcmut.edu.vn/calendar/view.php"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 sm:text-sm"
        >
          Mở lịch LMS đầy đủ <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
