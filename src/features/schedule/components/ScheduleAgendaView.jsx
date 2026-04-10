import React from "react";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { getSubjectColor } from "@utils/scheduleParser";
import { DAYS_OF_WEEK } from "../constants/scheduleConfig";
import { getTeacherLabel } from "../utils/scheduleCourseMeta";
import { getCourseTimeRange, isCourseOngoingNow } from "../utils/scheduleTime";

export default function ScheduleAgendaView({
  getClassesForDay,
  selectedWeek,
  currentWeek,
  currentDayId,
  currentTimeSlotInfo,
  onCourseHover,
  onCourseLeave,
  onCourseActivate,
}) {
  const isViewingCurrentWeek = selectedWeek === currentWeek;
  const weeklySections = DAYS_OF_WEEK.map((day) => ({
    ...day,
    classes: getClassesForDay(day.id).filter((course) => course.startPeriod > 0),
  })).filter((section) => section.classes.length > 0);

  if (weeklySections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Tuần này chưa có lịch học</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thử chuyển sang tuần khác hoặc đồng bộ lại dữ liệu từ MyBK.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {weeklySections.map((section) => {
        const isTodaySection = isViewingCurrentWeek && currentDayId === section.id;

        return (
          <Card
            key={section.id}
            className={isTodaySection ? "border-primary/30 shadow-primary/5" : "border shadow-sm"}
          >
            <CardHeader className={isTodaySection ? "border-b bg-primary/5 pb-4" : "border-b bg-muted/30 pb-4"}>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base md:text-lg">{section.label}</CardTitle>
                {isTodaySection && (
                  <Badge className="border-0 bg-primary text-primary-foreground">
                    Hôm nay
                  </Badge>
                )}
                <Badge variant="secondary">{section.classes.length} môn</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-3 sm:p-4">
              {section.classes.map((course, index) => {
                const { startTime, endTime } = getCourseTimeRange(course);
                const teacherLabel = getTeacherLabel(course);
                const isOngoingCourse = isCourseOngoingNow(
                  course,
                  currentDayId,
                  currentTimeSlotInfo,
                  isViewingCurrentWeek
                );

                return (
                  <Button
                    key={`${section.id}-${course.code}-${course.group || "na"}-${index}`}
                    type="button"
                    variant="ghost"
                    className={`group flex h-auto w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:shadow-md ${
                      isOngoingCourse
                        ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : ""
                    }`}
                    onMouseEnter={(event) =>
                      onCourseHover(course, event.currentTarget.getBoundingClientRect())
                    }
                    onMouseLeave={onCourseLeave}
                    onClick={(event) =>
                      onCourseActivate(course, event.currentTarget.getBoundingClientRect())
                    }
                  >
                    <div
                      className="flex min-h-[72px] w-20 flex-none flex-col items-center justify-center rounded-xl px-2 text-white shadow-sm"
                      style={{ backgroundColor: getSubjectColor(course.code) }}
                    >
                      <span className="text-xs font-bold">{startTime}</span>
                      <span className="my-1 text-[10px] font-medium opacity-80">đến</span>
                      <span className="text-xs font-bold">{endTime}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-sm font-bold text-foreground sm:text-base">
                            {course.name}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {course.code}
                            </Badge>
                            {course.group && (
                              <Badge variant="secondary" className="text-[10px]">
                                Nhóm {course.group}
                              </Badge>
                            )}
                            {isOngoingCourse && (
                              <Badge className="border-0 bg-emerald-500 text-[10px] text-white">
                                Đang diễn ra
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground sm:text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                          <Clock className="h-3.5 w-3.5" />
                          Tiết {course.startPeriod}-{course.endPeriod}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {course.room || "TBA"}
                        </span>
                        {teacherLabel && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                            <Users className="h-3.5 w-3.5" />
                            {teacherLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
