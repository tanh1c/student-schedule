import React from "react";
import {
  Calendar,
  Clock,
  Info,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { getSubjectColor } from "@utils/scheduleParser";
import {
  getClassSizeLabel,
  getTeacherLabel,
} from "../utils/scheduleCourseMeta";

export default function CourseDetailPopup({ course, rect, isActive, onClose }) {
  if (!course || !rect) return null;

  const teacherLabel = getTeacherLabel(course);
  const classSizeLabel = getClassSizeLabel(course);
  const viewportPadding = 12;
  const popupGap = 12;
  const cardWidth = Math.min(320, window.innerWidth - (viewportPadding * 2));
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const hasRoomOnRight =
    rect.right + popupGap + cardWidth <= windowWidth - viewportPadding;
  const hasRoomOnLeft =
    rect.left - popupGap - cardWidth >= viewportPadding;

  let left = rect.right + popupGap;
  if (hasRoomOnRight) {
    left = rect.right + popupGap;
  } else if (hasRoomOnLeft) {
    left = rect.left - cardWidth - popupGap;
  } else {
    const centeredLeft = rect.left + (rect.width / 2) - (cardWidth / 2);
    left = Math.min(
      Math.max(centeredLeft, viewportPadding),
      windowWidth - cardWidth - viewportPadding
    );
  }

  const estimatedHeight = 350;
  const centeredTop = rect.top + (rect.height / 2) - (estimatedHeight / 2);
  let top = Math.min(
    Math.max(centeredTop, 70),
    windowHeight - estimatedHeight - viewportPadding
  );

  if (top < 70) top = 70;

  return (
    <div
      className="fixed z-50 animate-in zoom-in-95 fade-in duration-200"
      style={{ top, left, width: cardWidth }}
      onMouseEnter={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <Card className="border border-slate-200 bg-white/95 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: getSubjectColor(course.code) }}
        />

        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-base font-bold leading-snug text-slate-900 dark:text-slate-100">
                {course.name}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {course.code}
                </Badge>
                {course.group && (
                  <Badge variant="secondary" className="text-[10px]">
                    Nhóm {course.group}
                  </Badge>
                )}
              </div>
            </div>

            {isActive && (
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2.5 text-sm">
              <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Phòng học
                </span>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {course.room}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-sm">
              <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Thời gian
                </span>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {course.time} (Tiết {course.startPeriod} - {course.endPeriod})
                </div>
              </div>
            </div>

            {course.weeks && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Tuần học
                  </span>
                  <div className="max-h-20 overflow-y-auto break-words pr-1 text-xs text-muted-foreground">
                    {course.weeks.join(", ")}
                  </div>
                </div>
              </div>
            )}

            {teacherLabel && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Giảng viên
                  </span>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {teacherLabel}
                  </div>
                </div>
              </div>
            )}

            {classSizeLabel && (
              <div className="flex items-start gap-2.5 text-sm">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Sĩ số lớp
                  </span>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {classSizeLabel}
                  </div>
                </div>
              </div>
            )}

            {course.notes && (
              <div className="mt-2 flex items-start gap-2.5 border-t border-dashed border-slate-200 pt-2 text-sm dark:border-slate-800">
                <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                <div className="text-xs italic text-muted-foreground">
                  {course.notes}
                </div>
              </div>
            )}
          </div>

          {!isActive && (
            <div className="mt-1 border-t pt-2 text-center text-[10px] font-medium text-muted-foreground/60">
              Nhấn để xem chi tiết & giữ thẻ này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
