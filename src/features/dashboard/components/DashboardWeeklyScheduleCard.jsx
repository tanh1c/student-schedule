import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/features/schedule/constants/scheduleConfig";
import {
  getCourseTimeRange,
  isCourseOngoingNow,
} from "@/features/schedule/utils/scheduleTime";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { navigateToTab } from "@/features/dashboard/components/DashboardHelpers";

const ROW_HEIGHT = 34;
const DEFAULT_VISIBLE_ROW_COUNT = 8;
const COURSE_TONES = [
  "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/25 dark:text-emerald-100",
  "bg-violet-50 text-violet-900 dark:bg-violet-900/25 dark:text-violet-100",
  "bg-sky-50 text-sky-900 dark:bg-sky-900/25 dark:text-sky-100",
  "bg-rose-50 text-rose-900 dark:bg-rose-900/25 dark:text-rose-100",
  "bg-amber-50 text-amber-900 dark:bg-amber-900/25 dark:text-amber-100",
];
const QUOTE_TONES = [
  "bg-emerald-50/95 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-100",
  "bg-violet-50/95 text-violet-900 dark:bg-violet-900/35 dark:text-violet-100",
  "bg-sky-50/95 text-sky-900 dark:bg-sky-900/35 dark:text-sky-100",
  "bg-rose-50/95 text-rose-900 dark:bg-rose-900/35 dark:text-rose-100",
  "bg-amber-50/95 text-amber-900 dark:bg-amber-900/35 dark:text-amber-100",
];
const TOOLTIP_TONES = [
  "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/75 dark:text-emerald-50",
  "bg-violet-50 text-violet-900 dark:bg-violet-900/75 dark:text-violet-50",
  "bg-sky-50 text-sky-900 dark:bg-sky-900/75 dark:text-sky-50",
  "bg-rose-50 text-rose-900 dark:bg-rose-900/75 dark:text-rose-50",
  "bg-amber-50 text-amber-900 dark:bg-amber-900/75 dark:text-amber-50",
];

function getCourseTone(courseCode) {
  const seed = String(courseCode || "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return COURSE_TONES[seed % COURSE_TONES.length];
}

function getQuoteTone(courseCode) {
  const seed = String(courseCode || "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return QUOTE_TONES[seed % QUOTE_TONES.length];
}

function getTooltipTone(courseCode) {
  const seed = String(courseCode || "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return TOOLTIP_TONES[seed % TOOLTIP_TONES.length];
}

export function DashboardWeeklyScheduleCard({ snapshot, refresh, isRefreshing, compact = false }) {
  const tooltipId = useId();
  const scrollAreaRef = useRef(null);
  const [viewportMetrics, setViewportMetrics] = useState({
    scrollTop: 0,
    viewportHeight: DEFAULT_VISIBLE_ROW_COUNT * ROW_HEIGHT,
  });
  const weeklyClasses = snapshot.schedule.weeklyClasses || [];
  const todayClasses = snapshot.schedule.todayClasses || [];
  const selectedWeek = snapshot.schedule.selectedWeek ?? snapshot.schedule.currentWeek;
  const currentWeek = snapshot.schedule.currentWeek;
  const currentDayId = snapshot.schedule.currentDayId;
  const currentTimeSlotInfo = snapshot.schedule.currentTimeSlotInfo;
  const isViewingCurrentWeek = selectedWeek === currentWeek;
  const hiddenCourseIndicators = DAYS_OF_WEEK.map((day) => {
    const hiddenCourses = weeklyClasses.filter((course) => (
      course.day === day.id
      && ((Number(course.startPeriod) - 1) * ROW_HEIGHT) >= (viewportMetrics.scrollTop + viewportMetrics.viewportHeight - ROW_HEIGHT)
    ));

    return {
      day,
      count: hiddenCourses.length,
      tone: hiddenCourses[0] ? getQuoteTone(hiddenCourses[0].code) : null,
    };
  }).filter((item) => item.count > 0);

  useEffect(() => {
    if (compact) {
      return undefined;
    }

    const root = scrollAreaRef.current;
    const viewport = root?.querySelector?.("[data-radix-scroll-area-viewport]");

    if (!viewport) {
      return undefined;
    }

    const updateViewportMetrics = () => {
      setViewportMetrics({
        scrollTop: viewport.scrollTop,
        viewportHeight: viewport.clientHeight,
      });
    };

    updateViewportMetrics();
    viewport.addEventListener("scroll", updateViewportMetrics, { passive: true });
    window.addEventListener("resize", updateViewportMetrics);

    return () => {
      viewport.removeEventListener("scroll", updateViewportMetrics);
      window.removeEventListener("resize", updateViewportMetrics);
    };
  }, [compact, weeklyClasses.length]);

  if (compact) {
    return (
      <DashboardCard title="Lịch học hôm nay">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Tuần {selectedWeek}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">{snapshot.heroDateLabel}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {todayClasses.length > 0 ? `${todayClasses.length} lớp trong ngày` : "Không có lớp nào hôm nay"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isRefreshing}
            className="h-9 w-9 shrink-0 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Đang diễn ra</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {snapshot.schedule.currentClass?.code || "--"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {snapshot.schedule.currentClass ? getCourseTimeRange(snapshot.schedule.currentClass).startTime : "Không có"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Kế tiếp</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {snapshot.schedule.nextClass?.code || "--"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {snapshot.schedule.nextClass ? getCourseTimeRange(snapshot.schedule.nextClass).startTime : "Chưa có"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {todayClasses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Hôm nay chưa có lớp học nào trong thời khóa biểu đã lưu.
            </div>
          ) : (
            todayClasses.slice(0, 3).map((course) => {
              const { startTime, endTime } = getCourseTimeRange(course);
              return (
                <div
                  key={`${course.code}-${course.day}-${course.startPeriod}-${course.room || "na"}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{course.code}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{course.name || "Môn học"}</p>
                    </div>
                    <Badge className="rounded-full border-0 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/35 dark:text-blue-300">
                      {startTime}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {course.room || "TBA"} • Tiết {course.startPeriod}-{course.endPeriod} • {startTime}-{endTime}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center">
          <button
            type="button"
            onClick={() => navigateToTab("schedule")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mở thời khóa biểu
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title={`Thời khóa biểu tuần: Tuần ${selectedWeek}`}
      className="h-full"
      contentClassName="h-full"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {selectedWeek === currentWeek ? snapshot.greeting : `Tuần đã chọn`}
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {selectedWeek === currentWeek ? snapshot.heroDateLabel : "Đồng bộ với tab thời khóa biểu"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={refresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
        >
          <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[54px_repeat(7,minmax(0,1fr))] border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
              <div className="border-r border-slate-200/80 px-1.5 py-2 text-center text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Tiết
              </div>
              {DAYS_OF_WEEK.map((day) => {
                const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
                return (
                  <div
                    key={day.id}
                    className={cn(
                      "border-r border-slate-200/80 px-1.5 py-2 text-center text-[11px] font-bold text-slate-500 last:border-r-0 dark:border-slate-800 dark:text-slate-400",
                      isTodayColumn && "bg-blue-50/80 text-blue-700 dark:bg-blue-950/25 dark:text-blue-300",
                    )}
                  >
                    {day.short}
                  </div>
                );
              })}
            </div>

            <div className="relative" style={{ height: `${TIME_SLOTS.length * ROW_HEIGHT}px` }}>
              {TIME_SLOTS.map((slot) => {
                const isCurrentSlot = isViewingCurrentWeek && currentTimeSlotInfo?.id === slot.id;

                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "grid grid-cols-[54px_repeat(7,minmax(0,1fr))] overflow-hidden border-b border-slate-200/70 last:border-b-0 dark:border-slate-800",
                      isCurrentSlot && "bg-blue-50/60 dark:bg-blue-950/15",
                    )}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    <div
                      className={cn(
                        "border-r px-1.5 py-1 text-center dark:border-slate-800",
                        isCurrentSlot && "bg-blue-100/80 dark:bg-blue-950/25",
                      )}
                    >
                      <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                        {slot.label.replace("Tiết ", "T")}
                      </div>
                      <div className="mt-0.5 text-[8px] text-slate-400 dark:text-slate-500">
                        {slot.time.split("-")[0]}
                      </div>
                    </div>

                    {DAYS_OF_WEEK.map((day) => {
                      const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
                      return (
                        <div
                          key={`${slot.id}-${day.id}`}
                          className={cn(
                            "border-r border-slate-200/70 last:border-r-0 dark:border-slate-800",
                            isTodayColumn && "bg-blue-50/40 dark:bg-blue-950/10",
                          )}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const courses = weeklyClasses.filter((course) => course.day === day.id);

                return courses.map((course, index) => {
                  const numPeriods = course.endPeriod - course.startPeriod + 1;
                  const topOffset = (course.startPeriod - 1) * ROW_HEIGHT;
                  const height = numPeriods * ROW_HEIGHT - 4;
                  const isOngoingCourse = isCourseOngoingNow(
                    course,
                    currentDayId,
                    currentTimeSlotInfo,
                    isViewingCurrentWeek,
                  );

                  return (
                    <div
                      key={`${course.code}-${course.group || "na"}-${day.id}-${course.startPeriod}-${index}`}
                      className={cn(
                        "group absolute z-10 overflow-visible rounded-xl px-2 py-1.5 shadow-sm transition-all hover:z-[60] hover:shadow-md",
                        getCourseTone(course.code),
                        isOngoingCourse && "ring-2 ring-blue-300/80 shadow-lg shadow-blue-500/10 dark:ring-blue-300/40",
                      )}
                      style={{
                        top: `${topOffset + 2}px`,
                        left: `calc(54px + ${dayIndex} * ((100% - 54px) / ${DAYS_OF_WEEK.length}) + 4px)`,
                        width: `calc((100% - 54px) / ${DAYS_OF_WEEK.length} - 8px)`,
                        height: `${height}px`,
                      }}
                    >
                      <div className="flex h-full min-w-0 flex-col">
                        <div className="flex items-start justify-between gap-1">
                          <span className="truncate text-[11px] font-bold leading-tight">
                            {course.code}
                          </span>
                          {isOngoingCourse ? (
                            <span className="shrink-0 rounded-full bg-blue-600/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white dark:bg-blue-400/90 dark:text-slate-950">
                              Now
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 truncate text-[9px] font-medium opacity-75">
                          {course.room || "TBA"}
                        </div>
                      </div>

                      <div
                        id={`${tooltipId}-${day.id}-${index}`}
                        className={cn(
                          "pointer-events-none absolute left-1/2 top-full z-[70] mt-2 hidden w-[190px] -translate-x-1/2 rounded-xl px-3 py-2 text-left shadow-xl group-hover:block",
                          getTooltipTone(course.code),
                        )}
                      >
                        <p className="text-[11px] font-bold">
                          {course.code}
                        </p>
                        <p className="mt-1 text-[11px] leading-snug opacity-90">
                          {course.name || "Môn học"}
                        </p>
                        <p className="mt-2 text-[10px] opacity-75">
                          {course.room || "TBA"}
                          {course.group ? ` • ${course.group}` : ""}
                        </p>
                        <p className="mt-1 text-[10px] opacity-75">
                          {getCourseTimeRange(course).startTime} - {getCourseTimeRange(course).endTime}
                        </p>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {hiddenCourseIndicators.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 px-2">
            {hiddenCourseIndicators.map((hiddenItem) => {
              const dayIndex = DAYS_OF_WEEK.findIndex((day) => day.id === hiddenItem.day.id);
              return (
                <div
                  key={`floating-hidden-indicator-${hiddenItem.day.id}`}
                  className={cn(
                    "absolute flex min-h-[46px] items-center justify-center rounded-xl px-2 py-1.5 text-center shadow-sm backdrop-blur-sm",
                    hiddenItem.tone || "bg-white/92 text-slate-700 dark:bg-slate-900/92 dark:text-slate-200",
                  )}
                  style={{
                    left: `calc(54px + ${dayIndex} * ((100% - 54px) / ${DAYS_OF_WEEK.length}) + 4px)`,
                    width: `calc((100% - 54px) / ${DAYS_OF_WEEK.length} - 8px)`,
                    bottom: "0px",
                  }}
                >
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">
                      Còn bên dưới
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold">
                      +{hiddenItem.count} môn
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center">
        <button
          type="button"
          onClick={() => navigateToTab("schedule")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Xem thời khóa biểu toàn bộ
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardCard>
  );
}
