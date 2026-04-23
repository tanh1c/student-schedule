import React from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  GraduationCap,
  MessageSquare,
  RefreshCcw,
  Route,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { cn } from "@lib/utils";
import { WORKSPACE_TAB_CHANGE_EVENT } from "@app/navigationEvents";
import { getCourseTimeRange } from "@/features/schedule/utils/scheduleTime";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";

const WEEK_DAYS = [
  { id: 2, label: "T2" },
  { id: 3, label: "T3" },
  { id: 4, label: "T4" },
  { id: 5, label: "T5" },
  { id: 6, label: "T6" },
  { id: 7, label: "T7" },
  { id: 8, label: "CN" },
];

const TIME_MARKERS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "17:00"];

const COURSE_PASTELS = [
  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-100",
  "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-700/40 dark:bg-violet-900/20 dark:text-violet-100",
  "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-700/40 dark:bg-sky-900/20 dark:text-sky-100",
  "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-100",
  "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-100",
];

function navigateToTab(tabId) {
  window.dispatchEvent(new CustomEvent(WORKSPACE_TAB_CHANGE_EVENT, { detail: { tabId } }));
}

function getMinutesFromTime(timeValue) {
  const [hours, minutes] = String(timeValue || "00:00").split(":").map(Number);
  return (hours * 60) + minutes;
}

function formatDateTime(value) {
  if (!value) return "";
  return value.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTimeOnly(value) {
  if (!value) return "";
  return value.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(targetDate) {
  if (!targetDate) return "";
  const now = new Date();
  const today = new Date(now);
  const target = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "Hôm nay";
  return `Còn ${diffDays} ngày`;
}

function getRoadmapProgress(snapshot) {
  const totalSemesters = Math.max(snapshot.roadmap.semesterCount || 0, 1);
  const semesterProgress = Math.min(100, Math.round((snapshot.roadmap.semesterCount / 8) * 100));
  const courseProgress = Math.min(100, Math.round((snapshot.roadmap.totalCourses / 45) * 100));
  const creditProgress = Math.min(100, Math.round((snapshot.roadmap.totalCredits / 140) * 100));
  const gpaProgress = snapshot.roadmap.goal ? Math.min(100, Math.round((snapshot.roadmap.goal.gpa4 / 4) * 100)) : 0;

  return [
    { label: "Kế hoạch học kỳ", value: semesterProgress, tone: "bg-emerald-500" },
    { label: "Môn đã lên", value: courseProgress, tone: "bg-sky-500" },
    { label: "Tín chỉ", value: creditProgress, tone: "bg-amber-500" },
    { label: "Mục tiêu GPA", value: gpaProgress, tone: "bg-violet-500" },
  ].slice(0, totalSemesters > 0 ? 4 : 0);
}

function DashboardCard({ title, actionLabel, onAction, children, className, contentClassName }) {
  return (
    <Card className={cn("overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950", className)}>
      <CardContent className={cn("flex h-full min-h-0 flex-col p-4 xl:p-5", contentClassName)}>
        {(title || actionLabel) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
            {onAction && actionLabel ? (
              <button
                type="button"
                onClick={onAction}
                className="text-[13px] font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function TimetableBoard({ snapshot, refresh, isRefreshing }) {
  const weeklyClasses = snapshot.schedule.weeklyClasses || [];

  return (
    <DashboardCard title={`Thời khóa biểu tuần: Tuần ${snapshot.schedule.currentWeek}`} className="h-full" contentClassName="h-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {snapshot.greeting}
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">{snapshot.heroDateLabel}</span>
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

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute left-0 top-0 z-10 w-12 border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950" />

        <div className="flex border-b border-slate-100 pl-12 dark:border-slate-800">
          {WEEK_DAYS.map((day) => (
            <div key={day.id} className="flex-1 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {day.label}
            </div>
          ))}
        </div>

        <div className="relative h-[348px]">
          {TIME_MARKERS.map((time, index) => (
            <div key={time} className="flex h-[34.8px] border-b border-slate-100 last:border-b-0 dark:border-slate-800">
              <div className="w-12 pr-2 pt-1 text-right text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {time}
              </div>
              <div className="grid flex-1 grid-cols-7 border-l border-slate-100 dark:border-slate-800">
                {WEEK_DAYS.map((day) => (
                  <div key={`${time}-${day.id}`} className={cn("border-r border-slate-100 dark:border-slate-800", index === TIME_MARKERS.length - 1 && "border-b-0")} />
                ))}
              </div>
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 left-12">
            {weeklyClasses.map((course, index) => {
              const { startTime, endTime } = getCourseTimeRange(course);
              const startMinutes = getMinutesFromTime(startTime);
              const endMinutes = getMinutesFromTime(endTime);
              const baseMinutes = 7 * 60;
              const totalMinutes = 10 * 60;
              const top = ((startMinutes - baseMinutes) / totalMinutes) * 100;
              const height = Math.max(9, ((endMinutes - startMinutes) / totalMinutes) * 100);
              const palette = COURSE_PASTELS[index % COURSE_PASTELS.length];
              const dayIndex = Math.max(0, WEEK_DAYS.findIndex((day) => day.id === Number(course.day)));
              const columnWidth = 100 / WEEK_DAYS.length;

              return (
                <div
                  key={`${course.code}-${course.day}-${course.startPeriod}-${course.room || "na"}`}
                  className={cn(
                    "pointer-events-auto absolute rounded-2xl border p-2 shadow-sm",
                    palette,
                  )}
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    left: `calc(${dayIndex * columnWidth}% + 8px)`,
                    width: `calc(${columnWidth}% - 16px)`,
                  }}
                >
                  <p className="text-[13px] font-semibold leading-tight">{course.code}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">{course.room || "TBA"}</p>
                </div>
              );
            })}
          </div>
        </div>
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

function DeadlineList({ snapshot }) {
  return (
    <DashboardCard title="Deadline LMS" actionLabel="Xem tất cả" onAction={() => navigateToTab("deadlines")} className="flex-[1.08] min-h-0" contentClassName="min-h-0">
      {!snapshot.deadlines.hasData || snapshot.deadlines.items.length === 0 ? (
        <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Chưa có dữ liệu deadline LMS
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {snapshot.deadlines.items.slice(0, 3).map((item, index) => (
            <div key={`${item.name}-${item.date}-${index}`} className={cn("flex items-start gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-slate-800")}>
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">{item.name || item.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.courseName || "Môn học LMS"}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{formatDateTime(item.eventDate)}</span>
                </div>
              </div>
              <Badge className="rounded-full border-0 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 shadow-none dark:bg-rose-950/35 dark:text-rose-300">
                {formatCountdown(item.eventDate)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function ExamList({ snapshot }) {
  return (
    <DashboardCard title="Lịch thi & sự kiện" actionLabel="Xem tất cả" onAction={() => navigateToTab("exam")} className="flex-[0.92] min-h-0" contentClassName="min-h-0">
      {!snapshot.exams.hasData || snapshot.exams.items.length === 0 ? (
        <div className="flex h-full min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Chưa có lịch thi đã sync
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {snapshot.exams.items.slice(0, 3).map((exam) => (
            <div key={`${exam.ID || exam.MAMONHOC}-${exam.NGAYTHI}-${exam.GIOBD}`} className="flex items-start gap-3">
              <div className="mt-1 h-8 w-1 rounded-full bg-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{exam.TENMONHOC || exam.MAMONHOC}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {exam.MAMONHOC} {exam.PHONGTHI ? `- Phòng ${exam.PHONGTHI}` : ""}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{formatDateTime(exam.examDate)} • {exam.GIOBD || formatTimeOnly(exam.examDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function ActivityList({ snapshot }) {
  return (
    <DashboardCard title="Hoạt động LMS" className="flex-[0.82] min-h-0" contentClassName="min-h-0">
      {!snapshot.messages.hasData || (snapshot.messages.recentActivities || []).length === 0 ? (
        <div className="flex h-full min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Chưa có hoạt động LMS gần đây
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {snapshot.messages.recentActivities.map((activity, index) => (
            <div key={`${activity.id}-${index}`} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{activity.sender}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{activity.preview || "Không có nội dung xem trước."}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{activity.timeLabel}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function GpaCard({ snapshot }) {
  const gpa4 = snapshot.gpa.snapshot?.gpa4?.toFixed(2) ?? "--";
  const gpa10 = snapshot.gpa.snapshot?.gpa10?.toFixed(2) ?? "--";
  const deltaText = snapshot.gpa.snapshot ? `${gpa10} / 10` : "Chưa sync GPA";

  return (
    <DashboardCard title="GPA hiện tại" className="h-full" contentClassName="h-full">
      <div className="flex flex-1 flex-col">
        <div className="flex items-end gap-2 tracking-tight">
          <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-50">{gpa4}</span>
          <span className="mb-1 text-lg font-semibold text-slate-400 dark:text-slate-500">/ 4.0</span>
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{deltaText}</p>

        <div className="mt-6 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid h-full grid-cols-5 items-end gap-2">
            {[42, 56, 54, 69, 82].map((value, index) => (
              <div key={value} className="flex flex-col items-center justify-end gap-2">
                <div className="w-full rounded-full bg-blue-100 dark:bg-blue-950/40" style={{ height: `${value}%` }}>
                  <div className="h-full w-full rounded-full bg-blue-600/85" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4">
        <button
          type="button"
          onClick={() => navigateToTab("gpa")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardCard>
  );
}

function RoadmapCard({ snapshot }) {
  const progressItems = getRoadmapProgress(snapshot);

  return (
    <DashboardCard title="Roadmap học tập" className="h-full" contentClassName="h-full">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {snapshot.roadmap.goal?.semesterName || "Kế hoạch học kỳ hiện tại"}
      </p>

      <div className="mt-5 flex-1 space-y-4">
        {progressItems.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={cn("h-2 rounded-full", item.tone)} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4">
        <button
          type="button"
          onClick={() => navigateToTab("roadmap")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Xem roadmap
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardCard>
  );
}

function MobileFallback({ snapshot, refresh, isRefreshing }) {
  return (
    <div className="space-y-3 lg:hidden">
      <DashboardCard title="Tổng quan nhanh">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{snapshot.greeting}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{snapshot.heroDateLabel}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={refresh} disabled={isRefreshing} className="h-9 w-9 rounded-full border">
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Lớp hôm nay", value: snapshot.stats.classesToday },
              { label: "Deadline gần", value: snapshot.stats.urgentDeadlines },
              { label: "Lịch thi", value: snapshot.stats.upcomingExams },
              { label: "GPA", value: snapshot.gpa.snapshot?.gpa4?.toFixed(2) ?? "--" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

export default function DashboardPage() {
  const { snapshot, refresh, isRefreshing } = useDashboardOverview();

  return (
    <div className="flex w-full max-w-none flex-col gap-5 px-4 pb-32 pt-4 md:px-6 md:pt-6 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-6 lg:pb-6 lg:pt-6">
      <MobileFallback snapshot={snapshot} refresh={refresh} isRefreshing={isRefreshing} />

      <div className="hidden h-full min-h-0 lg:grid lg:grid-cols-12 lg:grid-rows-[minmax(0,1.48fr)_minmax(0,0.82fr)] lg:gap-5">
        <div className="col-span-8 row-span-1 min-h-0">
          <TimetableBoard snapshot={snapshot} refresh={refresh} isRefreshing={isRefreshing} />
        </div>

        <div className="col-span-8 row-start-2 grid min-h-0 grid-cols-2 gap-5">
          <GpaCard snapshot={snapshot} />
          <RoadmapCard snapshot={snapshot} />
        </div>

        <div className="col-span-4 row-span-2 flex min-h-0 flex-col gap-5">
          <DeadlineList snapshot={snapshot} />
          <ExamList snapshot={snapshot} />
          <ActivityList snapshot={snapshot} />
        </div>
      </div>
    </div>
  );
}
