import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import { cn } from "@lib/utils";
import { getSubjectColor } from "@utils/scheduleParser";
import { DAYS_OF_WEEK } from "../constants/scheduleConfig";
import { getTeacherLabel } from "../utils/scheduleCourseMeta";
import { getCourseTimeRange, isCourseOngoingNow } from "../utils/scheduleTime";

export default function ScheduleDayView({
  selectedDay,
  onSelectDay,
  getClassesForDay,
  currentDayId,
  currentTimeSlotInfo,
  isViewingCurrentWeek,
  onCourseHover,
  onCourseLeave,
  onCourseActivate,
  mobileOnly = false,
}) {
  const classesForDay = getClassesForDay(selectedDay).filter(
    (course) => course.startPeriod > 0
  );

  return (
    <div className={cn("w-full min-w-0 overflow-hidden", mobileOnly && "md:hidden")}>
      <div className="sticky top-0 z-30 -mx-1 mb-3 border-b bg-background/95 px-1 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const classCount = getClassesForDay(day.id).filter(
              (course) => course.startPeriod > 0
            ).length;
            const isSelected = selectedDay === day.id;
            const isToday = isViewingCurrentWeek && currentDayId === day.id;

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                className={cn(
                  "flex h-[52px] flex-1 flex-col items-center justify-center rounded-lg border-2 transition-all duration-200",
                  isSelected
                    ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg"
                    : isToday
                      ? "border-primary/70 bg-primary/15 text-primary shadow-sm dark:border-primary/80 dark:bg-primary/25"
                      : "border-transparent bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span className="text-[10px] font-medium opacity-80">{day.label}</span>
                <span className="text-base font-bold leading-none">
                  {day.short.replace("T", "")}
                </span>
                {classCount > 0 && (
                  <div
                    className={cn(
                      "mt-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-bold",
                      isSelected ? "bg-white/30 text-white" : "bg-primary text-white"
                    )}
                  >
                    {classCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {classesForDay.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Không có lịch học</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {DAYS_OF_WEEK.find((day) => day.id === selectedDay)?.label} tuần này bạn được nghỉ!
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 space-y-2.5 pb-20">
          {classesForDay.map((course, index) => {
            const { startTime, endTime } = getCourseTimeRange(course);
            const numPeriods = course.endPeriod - course.startPeriod + 1;
            const teacherLabel = getTeacherLabel(course);
            const isOngoingCourse = isCourseOngoingNow(
              course,
              currentDayId,
              currentTimeSlotInfo,
              isViewingCurrentWeek
            );

            return (
              <Card
                key={`${course.code}-${course.group || "na"}-${course.day}-${course.startPeriod}-${index}`}
                className={cn(
                  "w-full min-w-0 overflow-hidden border-none bg-card shadow-md ring-1 ring-border/50 transition-all hover:shadow-lg active:scale-[0.99]",
                  isOngoingCourse && "ring-2 ring-primary shadow-lg shadow-primary/15"
                )}
                onMouseEnter={(event) =>
                  onCourseHover(course, event.currentTarget.getBoundingClientRect())
                }
                onMouseLeave={onCourseLeave}
                onClick={(event) =>
                  onCourseActivate(course, event.currentTarget.getBoundingClientRect())
                }
              >
                <div className="flex h-full w-full min-w-0">
                  <div
                    className="flex w-16 flex-none flex-col items-center justify-center p-1.5 text-white sm:w-20 sm:p-2"
                    style={{ backgroundColor: getSubjectColor(course.code) }}
                  >
                    <span className="text-xs font-bold sm:text-sm">{startTime}</span>
                    <div className="my-0.5 flex flex-col items-center sm:my-1">
                      <div className="h-1.5 w-0.5 rounded-full bg-white/40 sm:h-2" />
                      <span className="my-0.5 text-[9px] font-medium opacity-80 sm:text-[10px]">
                        {numPeriods} tiết
                      </span>
                      <div className="h-1.5 w-0.5 rounded-full bg-white/40 sm:h-2" />
                    </div>
                    <span className="text-xs font-bold sm:text-sm">{endTime}</span>
                  </div>

                  <div className="w-0 min-w-0 flex-1 p-2.5 sm:p-3">
                    <div className="mb-1.5 flex min-w-0 items-start justify-between gap-1.5 sm:gap-2">
                      <h4
                        className="min-w-0 line-clamp-2 text-sm font-bold leading-tight sm:text-base"
                        title={course.name}
                      >
                        {course.name}
                      </h4>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          className="whitespace-nowrap border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary sm:text-[10px]"
                          variant="outline"
                        >
                          {course.code}
                        </Badge>
                        {isOngoingCourse && (
                          <Badge className="border-0 bg-emerald-500 px-1.5 py-0 text-[9px] font-bold text-white">
                            Đang diễn ra
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
                      <div className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                        <span className="truncate font-medium">{course.room || "TBA"}</span>
                      </div>

                      {course.group && (
                        <div className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm">
                          <Users className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                          <span className="font-medium">{course.group}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-xs sm:gap-1.5 sm:px-2 sm:py-1 sm:text-sm">
                        <Clock className="h-3 w-3 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                        <span>
                          Tiết {course.startPeriod}-{course.endPeriod}
                        </span>
                      </div>
                    </div>

                    {teacherLabel && (
                      <div className="mt-2 flex items-center gap-1.5 border-t border-border/50 pt-2 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{teacherLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
