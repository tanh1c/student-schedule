import React from "react";
import { Clock, MapPin, Users } from "lucide-react";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";
import { getSubjectColor } from "@utils/scheduleParser";
import { DAYS_OF_WEEK, TIME_SLOTS } from "../constants/scheduleConfig";
import { isCourseOngoingNow } from "../utils/scheduleTime";

export default function ScheduleWeekGrid({
  scheduleData,
  selectedWeek,
  currentWeek,
  currentDayId,
  currentTimeSlotInfo,
  onCourseHover,
  onCourseLeave,
  onCourseActivate,
}) {
  const rowHeight = 70;
  const isViewingCurrentWeek = selectedWeek === currentWeek;

  const getCoursesForDay = (dayId) =>
    scheduleData.filter((course) => {
      const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
      return isActiveInWeek && course.day === dayId && course.startPeriod > 0;
    });

  return (
    <div className="hidden overflow-hidden rounded-xl border bg-background shadow-sm md:block">
      <ScrollArea className="w-full">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/40 font-medium">
            <div className="border-r p-3 text-center text-sm font-bold">Tiết</div>
            {DAYS_OF_WEEK.map((day) => {
              const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
              return (
                <div
                  key={day.id}
                  className={cn(
                    "border-r p-3 text-center text-sm font-bold text-primary last:border-r-0",
                    isTodayColumn &&
                      "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)] dark:bg-primary/25 dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.32)]"
                  )}
                >
                  <div>{day.label}</div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            {TIME_SLOTS.map((slot) => {
              const isCurrentSlot =
                isViewingCurrentWeek && currentTimeSlotInfo?.id === slot.id;

              return (
                <div
                  key={slot.id}
                  className={cn(
                    "grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] overflow-hidden border-b last:border-b-0",
                    isCurrentSlot && "bg-primary/10 dark:bg-primary/15"
                  )}
                  style={{ height: `${rowHeight}px` }}
                >
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center overflow-hidden border-r bg-muted/10 px-2 py-1 text-center",
                      isCurrentSlot &&
                        "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)] dark:bg-primary/30 dark:text-primary-foreground dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.36)]"
                    )}
                  >
                    <span className="text-[13px] font-bold leading-none">{slot.label}</span>
                    <span
                      className={cn(
                        "mt-1 text-[9px] leading-none",
                        isCurrentSlot
                          ? "text-primary/80 dark:text-primary-foreground/85"
                          : "text-muted-foreground"
                      )}
                    >
                      {slot.time}
                    </span>
                    {isCurrentSlot && (
                      <span className="mt-1 rounded-full bg-primary px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                        Bây giờ
                      </span>
                    )}
                  </div>

                  {DAYS_OF_WEEK.map((day) => {
                    const isTodayColumn = isViewingCurrentWeek && currentDayId === day.id;
                    return (
                      <div
                        key={day.id}
                        className={cn(
                          "overflow-hidden border-r last:border-r-0",
                          isTodayColumn && "bg-primary/[0.08] dark:bg-primary/[0.14]",
                          isTodayColumn &&
                            isCurrentSlot &&
                            "bg-primary/[0.16] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.18)] dark:bg-primary/[0.24] dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.28)]"
                        )}
                      />
                    );
                  })}
                </div>
              );
            })}

            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const courses = getCoursesForDay(day.id);

              return courses.map((course, index) => {
                const numPeriods = course.endPeriod - course.startPeriod + 1;
                const topOffset = (course.startPeriod - 1) * rowHeight;
                const height = numPeriods * rowHeight - 4;
                const isOngoingCourse = isCourseOngoingNow(
                  course,
                  currentDayId,
                  currentTimeSlotInfo,
                  isViewingCurrentWeek
                );

                return (
                  <div
                    key={`${course.code}-${course.group || "na"}-${day.id}-${course.startPeriod}-${index}`}
                    className={cn(
                      "group absolute z-10 cursor-pointer overflow-hidden rounded-lg p-2 text-white shadow-md transition-all hover:shadow-lg",
                      isOngoingCourse && "ring-2 ring-white/90 shadow-xl shadow-primary/25"
                    )}
                    style={{
                      backgroundColor: getSubjectColor(course.code),
                      top: `${topOffset}px`,
                      left: `calc(80px + ${dayIndex} * ((100% - 80px) / ${DAYS_OF_WEEK.length}) + 4px)`,
                      width: `calc((100% - 80px) / ${DAYS_OF_WEEK.length} - 8px)`,
                      height: `${height}px`,
                    }}
                    onMouseEnter={(event) =>
                      onCourseHover(course, event.currentTarget.getBoundingClientRect())
                    }
                    onMouseLeave={onCourseLeave}
                    onClick={(event) => {
                      event.stopPropagation();
                      onCourseActivate(course, event.currentTarget.getBoundingClientRect());
                    }}
                  >
                    <div className="relative flex h-full flex-col px-2 py-1.5">
                      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />

                      <div className="mb-0.5 flex shrink-0 items-start justify-between text-sm font-bold">
                        <span>{course.code}</span>
                        {isOngoingCourse && (
                          <span className="rounded-full bg-white/20 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide">
                            Now
                          </span>
                        )}
                      </div>

                      <div className="mb-1 min-h-0 flex-1 overflow-hidden">
                        <div
                          className="text-xs font-semibold leading-snug opacity-95"
                          title={course.name}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp:
                              numPeriods > 2 ? 4 : numPeriods > 1 ? 3 : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {course.name}
                        </div>
                      </div>

                      <div className="mt-auto flex shrink-0 flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium opacity-95">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{course.room}</span>
                        </div>

                        {course.group && (
                          <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{course.group}</span>
                          </div>
                        )}

                        {numPeriods > 1 && (
                          <div className="mt-0.5 flex items-center gap-1.5 border-t border-white/20 pt-1 text-xs font-medium opacity-90">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{course.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
