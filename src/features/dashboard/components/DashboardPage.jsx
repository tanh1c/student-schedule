import React from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Clock3,
  GraduationCap,
  Inbox,
  ListTodo,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@lib/utils";
import { WORKSPACE_TAB_CHANGE_EVENT } from "@app/navigationEvents";
import { getCourseTimeRange } from "@/features/schedule/utils/scheduleTime";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";

const toneStyles = {
  sky: {
    card: "border-sky-200/60 bg-sky-50 shadow-sky-200/50 dark:border-sky-700/40 dark:bg-sky-900/20 dark:shadow-sky-900/30",
    icon: "bg-sky-200/90 text-sky-700 dark:bg-sky-700/45 dark:text-sky-100",
    action: "border border-sky-300/80 bg-sky-200/90 text-sky-900 shadow-sm hover:bg-sky-300/85 dark:border-sky-700/55 dark:bg-sky-800/40 dark:text-sky-50 dark:hover:bg-sky-800/55",
  },
  rose: {
    card: "border-pink-200/60 bg-pink-50 shadow-pink-200/50 dark:border-pink-700/40 dark:bg-pink-900/20 dark:shadow-pink-900/30",
    icon: "bg-pink-200/90 text-pink-700 dark:bg-pink-700/45 dark:text-pink-100",
    action: "border border-pink-300/80 bg-pink-200/90 text-pink-900 shadow-sm hover:bg-pink-300/85 dark:border-pink-700/55 dark:bg-pink-800/40 dark:text-pink-50 dark:hover:bg-pink-800/55",
  },
  violet: {
    card: "border-violet-200/60 bg-violet-50 shadow-violet-200/50 dark:border-violet-700/40 dark:bg-violet-900/20 dark:shadow-violet-900/30",
    icon: "bg-violet-200/90 text-violet-700 dark:bg-violet-700/45 dark:text-violet-100",
    action: "border border-violet-300/80 bg-violet-200/90 text-violet-900 shadow-sm hover:bg-violet-300/85 dark:border-violet-700/55 dark:bg-violet-800/40 dark:text-violet-50 dark:hover:bg-violet-800/55",
  },
  emerald: {
    card: "border-emerald-200/60 bg-emerald-50 shadow-emerald-200/50 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:shadow-emerald-900/30",
    icon: "bg-emerald-200/90 text-emerald-700 dark:bg-emerald-700/45 dark:text-emerald-100",
    action: "border border-emerald-300/80 bg-emerald-200/90 text-emerald-900 shadow-sm hover:bg-emerald-300/85 dark:border-emerald-700/55 dark:bg-emerald-800/40 dark:text-emerald-50 dark:hover:bg-emerald-800/55",
  },
  cyan: {
    card: "border-cyan-200/60 bg-cyan-50 shadow-cyan-200/50 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:shadow-cyan-900/30",
    icon: "bg-cyan-200/90 text-cyan-700 dark:bg-cyan-700/45 dark:text-cyan-100",
    action: "border border-cyan-300/80 bg-cyan-200/90 text-cyan-900 shadow-sm hover:bg-cyan-300/85 dark:border-cyan-700/55 dark:bg-cyan-800/40 dark:text-cyan-50 dark:hover:bg-cyan-800/55",
  },
  amber: {
    card: "border-orange-200/60 bg-orange-50 shadow-orange-200/50 dark:border-orange-700/40 dark:bg-orange-900/20 dark:shadow-orange-900/30",
    icon: "bg-orange-200/90 text-orange-700 dark:bg-orange-700/45 dark:text-orange-100",
    action: "border border-orange-300/80 bg-orange-200/90 text-orange-900 shadow-sm hover:bg-orange-300/85 dark:border-orange-700/55 dark:bg-orange-800/40 dark:text-orange-50 dark:hover:bg-orange-800/55",
  },
};

const panelSurfaceSoft = "rounded-xl border border-sky-200/70 bg-sky-100/85 dark:border-sky-700/35 dark:bg-sky-900/30";
const emptyToneStyles = {
  sky: {
    card: "border-sky-200/70 bg-sky-100/68 dark:border-sky-700/40 dark:bg-sky-800/34",
    icon: "bg-sky-200/90 text-sky-900 dark:bg-sky-700/52 dark:text-sky-50",
    button: "border-sky-300/80 bg-sky-200/92 text-sky-900 hover:bg-sky-300/88 dark:border-sky-700/50 dark:bg-sky-800/52 dark:text-sky-50 dark:hover:bg-sky-800/68",
    description: "dark:text-sky-100/78",
  },
  rose: {
    card: "border-pink-200/70 bg-pink-100/68 dark:border-pink-700/40 dark:bg-pink-800/34",
    icon: "bg-pink-200/90 text-pink-900 dark:bg-pink-700/52 dark:text-pink-50",
    button: "border-pink-300/80 bg-pink-200/92 text-pink-900 hover:bg-pink-300/88 dark:border-pink-700/50 dark:bg-pink-800/52 dark:text-pink-50 dark:hover:bg-pink-800/68",
    description: "dark:text-pink-100/78",
  },
  violet: {
    card: "border-violet-200/70 bg-violet-100/68 dark:border-violet-700/40 dark:bg-violet-800/34",
    icon: "bg-violet-200/90 text-violet-900 dark:bg-violet-700/52 dark:text-violet-50",
    button: "border-violet-300/80 bg-violet-200/92 text-violet-900 hover:bg-violet-300/88 dark:border-violet-700/50 dark:bg-violet-800/52 dark:text-violet-50 dark:hover:bg-violet-800/68",
    description: "dark:text-violet-100/78",
  },
  emerald: {
    card: "border-emerald-200/70 bg-emerald-100/68 dark:border-emerald-700/40 dark:bg-emerald-800/34",
    icon: "bg-emerald-200/90 text-emerald-900 dark:bg-emerald-700/52 dark:text-emerald-50",
    button: "border-emerald-300/80 bg-emerald-200/92 text-emerald-900 hover:bg-emerald-300/88 dark:border-emerald-700/50 dark:bg-emerald-800/52 dark:text-emerald-50 dark:hover:bg-emerald-800/68",
    description: "dark:text-emerald-100/78",
  },
  cyan: {
    card: "border-cyan-200/70 bg-cyan-100/68 dark:border-cyan-700/40 dark:bg-cyan-800/34",
    icon: "bg-cyan-200/90 text-cyan-900 dark:bg-cyan-700/52 dark:text-cyan-50",
    button: "border-cyan-300/80 bg-cyan-200/92 text-cyan-900 hover:bg-cyan-300/88 dark:border-cyan-700/50 dark:bg-cyan-800/52 dark:text-cyan-50 dark:hover:bg-cyan-800/68",
    description: "dark:text-cyan-100/78",
  },
  amber: {
    card: "border-orange-200/70 bg-orange-100/68 dark:border-orange-700/40 dark:bg-orange-800/34",
    icon: "bg-orange-200/90 text-orange-900 dark:bg-orange-700/52 dark:text-orange-50",
    button: "border-orange-300/80 bg-orange-200/92 text-orange-900 hover:bg-orange-300/88 dark:border-orange-700/50 dark:bg-orange-800/52 dark:text-orange-50 dark:hover:bg-orange-800/68",
    description: "dark:text-orange-100/78",
  },
};
const toneBadgeStyles = {
  sky: "border-sky-300/80 bg-sky-200/92 text-sky-900 dark:border-sky-700/50 dark:bg-sky-800/52 dark:text-sky-50",
  rose: "border-pink-300/80 bg-pink-200/92 text-pink-900 dark:border-pink-700/50 dark:bg-pink-800/52 dark:text-pink-50",
  violet: "border-violet-300/80 bg-violet-200/92 text-violet-900 dark:border-violet-700/50 dark:bg-violet-800/52 dark:text-violet-50",
  emerald: "border-emerald-300/80 bg-emerald-200/92 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-800/52 dark:text-emerald-50",
  cyan: "border-cyan-300/80 bg-cyan-200/92 text-cyan-900 dark:border-cyan-700/50 dark:bg-cyan-800/52 dark:text-cyan-50",
  amber: "border-orange-300/80 bg-orange-200/92 text-orange-900 dark:border-orange-700/50 dark:bg-orange-800/52 dark:text-orange-50",
};

function navigateToTab(tabId) {
  window.dispatchEvent(new CustomEvent(WORKSPACE_TAB_CHANGE_EVENT, { detail: { tabId } }));
}

function formatFullDate(value) {
  if (!value) return "";
  return value.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function formatRelativeDate(targetDate) {
  if (!targetDate) return "";
  const now = new Date();
  const today = new Date(now);
  const date = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - today) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Ngày mai";
  if (diffDays > 1) return `${diffDays} ngày nữa`;
  return `${Math.abs(diffDays)} ngày trước`;
}

function Lane({ title, description, children }) {
  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">{children}</div>
    </div>
  );
}

function ToneCard({ tone = "sky", icon, title, description, actionLabel = "Mở", onAction, children }) {
  const toneStyle = toneStyles[tone] ?? toneStyles.sky;
  const iconNode = React.createElement(icon, { className: "h-4.5 w-4.5" });

  return (
    <Card className={cn("border shadow-sm", toneStyle.card)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-2xl", toneStyle.icon)}>
                {iconNode}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>}
              </div>
            </div>
          </div>
          {onAction && (
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 shrink-0 rounded-full px-3 text-xs", toneStyle.action)}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ tone = "sky", icon, title, description, actionLabel, actionTabId }) {
  const emptyTone = emptyToneStyles[tone] ?? emptyToneStyles.sky;
  const toneStyle = toneStyles[tone] ?? toneStyles.sky;
  const iconNode = React.createElement(icon, { className: "h-5 w-5" });

  return (
    <div className={cn("flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-6 text-center", emptyTone.card)}>
      <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm dark:shadow-none", toneStyle.action)}>
        {iconNode}
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className={cn("mt-2 text-sm leading-6 text-muted-foreground", emptyTone.description)}>{description}</p>
      {actionLabel && actionTabId && (
        <Button
          variant="outline"
          className={cn("mt-4 rounded-full", toneStyle.action)}
          onClick={() => navigateToTab(actionTabId)}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function ScheduleItem({ course, isCurrent, isNext }) {
  const { startTime, endTime } = getCourseTimeRange(course);

  return (
    <div className="rounded-2xl border border-sky-200/70 bg-sky-100/78 p-3 shadow-sm shadow-sky-200/35 dark:border-sky-700/35 dark:bg-sky-900/30 dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="border-sky-300/80 bg-sky-200/92 font-mono text-[11px] text-sky-900 dark:border-sky-700/55 dark:bg-sky-800/50 dark:text-sky-50">{course.code}</Badge>
            {isCurrent && <Badge className="bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950">Đang học</Badge>}
            {isNext && (
              <Badge variant="outline" className="border-orange-300/90 bg-orange-100/85 text-orange-800 dark:border-orange-700/50 dark:bg-orange-950/32 dark:text-orange-200">
                Kế tiếp
              </Badge>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground">{course.name}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-sky-200/85 px-3 py-2 text-right dark:bg-sky-800/45">
          <p className="text-sm font-semibold text-foreground">{startTime}</p>
          <p className="text-[11px] text-muted-foreground">{endTime}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {course.room || "TBA"}
        </span>
        {course.group && <span>• Nhóm {course.group}</span>}
        <span>• Tiết {course.startPeriod}-{course.endPeriod}</span>
      </div>
    </div>
  );
}

function MobileOverviewCard({ label, value, meta }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/68">{meta}</p>
    </div>
  );
}

function MobileQuickAction({ action }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={() => navigateToTab(action.tabId)}
      className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-white/12 bg-white/10 p-3 text-left backdrop-blur transition-colors hover:bg-white/14"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/16 text-white shadow-sm">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{action.label}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/65">{action.meta}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const { snapshot, refresh } = useDashboardOverview();
  const totalPeriodsToday = snapshot.schedule.todayClasses.reduce(
    (total, course) => total + (Number(course.endPeriod) - Number(course.startPeriod) + 1),
    0,
  );

  const quickActions = [
    { label: "Lịch học", meta: "Lịch tuần và agenda", tabId: "schedule", icon: CalendarClock },
    { label: "Deadline", meta: "Mốc LMS gần nhất", tabId: "deadlines", icon: Target },
    { label: "Roadmap", meta: "Kế hoạch học kỳ", tabId: "roadmap", icon: Route },
    { label: "Tin nhắn", meta: "LMS & thông báo", tabId: "messages", icon: MessageSquare },
  ];
  const mobileOverviewCards = [
    {
      label: "Lớp hôm nay",
      value: snapshot.stats.classesToday,
      meta: totalPeriodsToday > 0 ? `${totalPeriodsToday} tiết trong ngày` : "Không có lớp nào",
    },
    {
      label: "Deadline gần",
      value: snapshot.stats.urgentDeadlines,
      meta: snapshot.deadlines.hasData ? `${snapshot.deadlines.totalCount} mốc đã sync` : "Chưa sync LMS",
    },
    {
      label: "Tin nhắn",
      value: snapshot.messages.unreadCount,
      meta: snapshot.messages.hasData ? `${snapshot.messages.totalCount} hội thoại` : "Chưa có cache",
    },
    {
      label: "GPA hiện tại",
      value: snapshot.gpa.snapshot ? snapshot.gpa.snapshot.gpa4.toFixed(2) : "--",
      meta: snapshot.roadmap.hasData ? `${snapshot.roadmap.semesterCount} kỳ roadmap` : "Chưa sync GPA",
    },
  ];
  const mobileDeadlineItems = snapshot.deadlines.items.slice(0, 2);
  const mobileExamItems = snapshot.exams.items.slice(0, 2);
  const mobileTaskItems = snapshot.tasks.items.slice(0, 2);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 pb-32 pt-4 md:px-6 md:pt-6 lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-6">
      <Card className="hidden shrink-0 overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.34),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.28),transparent_24%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#1d4ed8_100%)] text-white shadow-2xl shadow-slate-950/15 lg:block">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.72fr)]">
            <div className="min-w-0">
              <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                {snapshot.greeting} • {snapshot.heroDateLabel}
              </Badge>
              <div className="mt-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[1.95rem]">
                  Dashboard học tập gọn, nhanh và đủ việc cần ưu tiên
                </h1>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                  {snapshot.schedule.hasData ? `Tuần ${snapshot.schedule.currentWeek}` : "Dùng dữ liệu local đã sync"}
                </Badge>
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                  {snapshot.schedule.currentClass ? "Đang có lớp" : "Không có lớp hiện tại"}
                </Badge>
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                  {snapshot.deadlines.hasData ? `${snapshot.deadlines.urgentCount} deadline gần` : "Chưa sync deadline"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col justify-center xl:pl-2">
              <button
                type="button"
                onClick={refresh}
                className="group mx-auto w-full max-w-md rounded-2xl border border-white/12 bg-white/10 p-4 text-left backdrop-blur transition-colors hover:bg-white/16"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Làm mới snapshot</p>
                    <p className="mt-1 text-xs leading-5 text-white/68">Cập nhật dashboard từ cache và local data hiện có</p>
                  </div>
                  <RefreshCcw className="h-4 w-4 shrink-0 text-white/72 transition-transform group-hover:rotate-45" />
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 lg:hidden">
        <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.2),transparent_24%),linear-gradient(160deg,#020617_0%,#0f172a_52%,#1d4ed8_100%)] text-white shadow-xl shadow-slate-950/15">
          <CardContent className="p-4">
            <div className="min-w-0">
              <Badge className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
                {snapshot.greeting} • {snapshot.shortDateLabel}
              </Badge>
              <h2 className="mt-3 text-2xl font-bold leading-tight">Hôm nay cần ưu tiên gì?</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Mở nhanh lịch, deadline, roadmap và LMS từ một màn mobile gọn hơn.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={refresh}
              className="mt-4 flex h-11 w-full items-center justify-between rounded-2xl border border-white/12 bg-white/10 px-4 text-white hover:bg-white/16 hover:text-white"
            >
              <span className="text-sm font-semibold">Làm mới snapshot</span>
              <RefreshCcw className="h-4.5 w-4.5" />
            </Button>

            <div className="mt-4 grid grid-cols-1 gap-2 min-[430px]:grid-cols-2">
              {mobileOverviewCards.map((item) => (
                <MobileOverviewCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  meta={item.meta}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
              {quickActions.map((action) => (
                <MobileQuickAction key={`${action.tabId}-mobile`} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>

        <ToneCard
          tone="sky"
          icon={CalendarClock}
          title="Lịch học hôm nay"
          description={`Tuần ${snapshot.schedule.currentWeek} • ${snapshot.shortDateLabel}`}
          actionLabel="Lịch"
          onAction={() => navigateToTab("schedule")}
        >
          {!snapshot.schedule.hasData ? (
            <EmptyState
              tone="sky"
              icon={CalendarClock}
              title="Chưa có thời khóa biểu"
              description="Sync hoặc import thời khóa biểu để dashboard mobile hiện nhịp học trong ngày."
              actionLabel="Mở thời khóa biểu"
              actionTabId="schedule"
            />
          ) : snapshot.schedule.todayClasses.length === 0 ? (
            <EmptyState
              tone="sky"
              icon={Sparkles}
              title="Hôm nay khá trống"
              description="Không có lớp nào trong ngày hiện tại. Bạn có thể mở lịch tuần để xem các buổi kế tiếp."
              actionLabel="Xem lịch tuần"
              actionTabId="schedule"
            />
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(panelSurfaceSoft, "px-3 py-2.5")}>
                  <p className="text-lg font-semibold text-foreground">{snapshot.schedule.todayClasses.length}</p>
                  <p className="text-[11px] text-muted-foreground">Môn</p>
                </div>
                <div className={cn(panelSurfaceSoft, "px-3 py-2.5")}>
                  <p className="text-lg font-semibold text-foreground">{totalPeriodsToday}</p>
                  <p className="text-[11px] text-muted-foreground">Tiết</p>
                </div>
                <div className={cn(panelSurfaceSoft, "col-span-2 px-3 py-2.5")}>
                  <p className="text-sm font-semibold text-foreground">
                    {snapshot.schedule.nextClass ? snapshot.schedule.nextClass.code : "--"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Kế tiếp</p>
                </div>
              </div>

              <div className="space-y-2">
                {snapshot.schedule.todayClasses.map((course) => {
                  const isCurrent = snapshot.schedule.currentClass?.code === course.code
                    && snapshot.schedule.currentClass?.startPeriod === course.startPeriod;
                  const isNext = !isCurrent
                    && snapshot.schedule.nextClass?.code === course.code
                    && snapshot.schedule.nextClass?.startPeriod === course.startPeriod;

                  return (
                    <ScheduleItem
                      key={`${course.code}-${course.startPeriod}-${course.room || "na"}-mobile`}
                      course={course}
                      isCurrent={isCurrent}
                      isNext={isNext}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </ToneCard>

        <div className="grid gap-3 min-[560px]:grid-cols-2">
          <ToneCard
            tone="rose"
            icon={Target}
            title="Deadline gần nhất"
            description={snapshot.deadlines.urgentCount > 0 ? `${snapshot.deadlines.urgentCount} deadline cần ưu tiên` : "Từ dữ liệu LMS đã sync"}
            onAction={() => navigateToTab("deadlines")}
          >
            {!snapshot.deadlines.hasData ? (
              <EmptyState
                tone="rose"
                icon={Target}
                title="Chưa có cache deadline LMS"
                description="Mở tab Deadline LMS một lần để dashboard mobile gom các mốc gần nhất cho bạn."
                actionLabel="Mở deadline LMS"
                actionTabId="deadlines"
              />
            ) : (
              <div className="space-y-2.5">
                {mobileDeadlineItems.map((item) => (
                  <div key={`${item.name}-${item.date}-${item.bucket}-mobile`} className="rounded-2xl border border-pink-200/70 bg-pink-100/72 p-3 shadow-sm shadow-pink-200/35 dark:border-pink-700/35 dark:bg-pink-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.name || item.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.courseName || "Sự kiện LMS"}</p>
                      </div>
                      <Badge variant="outline" className={cn(toneStyles.rose.action, "pointer-events-none border-transparent dark:border-transparent")}>
                        {formatRelativeDate(item.eventDate)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatFullDate(item.eventDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>

          <ToneCard
            tone="violet"
            icon={MessageSquare}
            title="Tin nhắn LMS"
            description={snapshot.messages.hasData ? `${snapshot.messages.unreadCount} cuộc trò chuyện chưa đọc` : "Từ cache LMS gần nhất"}
            onAction={() => navigateToTab("messages")}
          >
            {!snapshot.messages.hasData ? (
              <EmptyState
                tone="violet"
                icon={Inbox}
                title="Chưa có dữ liệu hội thoại"
                description="Mở tab Tin nhắn LMS để dashboard hiện nhanh tin mới và số cuộc trò chuyện chưa đọc."
                actionLabel="Mở Tin nhắn LMS"
                actionTabId="messages"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-violet-200/70 bg-violet-100/72 p-3 shadow-sm shadow-violet-200/35 dark:border-violet-700/35 dark:bg-violet-900/28 dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Chưa đọc</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.messages.unreadCount}</p>
                    </div>
                    <Badge variant="outline" className={cn(toneStyles.violet.action, "pointer-events-none border-transparent dark:border-transparent")}>
                      {snapshot.messages.totalCount} hội thoại
                    </Badge>
                  </div>
                </div>
                {snapshot.messages.latest && (
                  <div className="rounded-2xl border border-violet-200/70 bg-violet-100/72 p-3 shadow-sm shadow-violet-200/35 dark:border-violet-700/35 dark:bg-violet-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{snapshot.messages.latest.sender}</p>
                      <Badge variant="outline" className={cn(toneStyles.violet.action, "pointer-events-none border-transparent dark:border-transparent")}>
                        {snapshot.messages.latest.timeLabel}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {snapshot.messages.latest.preview || "Chưa có nội dung xem trước."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ToneCard>
        </div>

        <div className="grid gap-3 min-[560px]:grid-cols-2">
          <ToneCard
            tone="emerald"
            icon={GraduationCap}
            title="Lịch thi sắp tới"
            description={snapshot.exams.nextExam ? `${formatRelativeDate(snapshot.exams.nextExam.examDate)} có môn thi tiếp theo` : "Từ cache lịch thi đã lưu"}
            onAction={() => navigateToTab("exam")}
          >
            {!snapshot.exams.hasData ? (
              <EmptyState
                tone="emerald"
                icon={GraduationCap}
                title="Chưa có lịch thi"
                description="Sau khi vào tab Lịch thi và tải dữ liệu, dashboard sẽ hiển thị môn thi kế tiếp."
                actionLabel="Mở Lịch thi"
                actionTabId="exam"
              />
            ) : (
              <div className="space-y-2.5">
                {mobileExamItems.map((exam) => (
                  <div key={`${exam.ID || `${exam.MAMONHOC}-${exam.NGAYTHI}`}-mobile`} className="rounded-2xl border border-emerald-200/70 bg-emerald-100/72 p-3 shadow-sm shadow-emerald-200/35 dark:border-emerald-700/35 dark:bg-emerald-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{exam.MAMONHOC}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exam.TENMONHOC}</p>
                      </div>
                      <Badge variant="outline" className={toneBadgeStyles.emerald}>{formatRelativeDate(exam.examDate)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatFullDate(exam.examDate)}</span>
                      {exam.GIOBD && <span>• {exam.GIOBD}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>

          <ToneCard
            tone="amber"
            icon={ListTodo}
            title="Kế hoạch & việc cần làm"
            description="Task gần hạn và tiến độ xử lý."
            onAction={() => navigateToTab("notes")}
          >
            {!snapshot.tasks.hasData ? (
              <EmptyState
                tone="amber"
                icon={ListTodo}
                title="Chưa có task nào"
                description="Thêm việc trong tab Ghi chú/Kế hoạch để dashboard bắt đầu nhắc deadline và tiến độ."
                actionLabel="Mở Ghi chú"
                actionTabId="notes"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-orange-200/70 bg-orange-100/72 p-3 shadow-sm shadow-orange-200/35 dark:border-orange-700/35 dark:bg-orange-900/28 dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tỷ lệ hoàn thành</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.tasks.completionRate}%</p>
                    </div>
                    <Badge variant="outline" className={cn(toneStyles.amber.action, "pointer-events-none border-transparent dark:border-transparent")}>
                      {snapshot.tasks.dueSoonCount} gần hạn
                    </Badge>
                  </div>
                </div>
                {mobileTaskItems.map((task) => (
                  <div key={`${task.id}-mobile`} className="rounded-2xl border border-orange-200/70 bg-orange-100/72 p-3 shadow-sm shadow-orange-200/35 dark:border-orange-700/35 dark:bg-orange-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {task.content || "Task chưa có ghi chú chi tiết."}
                        </p>
                      </div>
                      {task.dueDateValue && (
                        <Badge variant="outline" className={cn(toneStyles.amber.action, "pointer-events-none border-transparent dark:border-transparent")}>
                          {formatRelativeDate(task.dueDateValue)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>
        </div>

        <ToneCard tone="cyan" icon={Route} title="Tiến độ học tập" description="GPA hiện tại, roadmap và mục tiêu học kỳ.">
          {!snapshot.gpa.hasData && !snapshot.roadmap.hasData ? (
            <EmptyState
              tone="cyan"
              icon={Route}
              title="Chưa có dữ liệu GPA hoặc roadmap"
              description="Sync GPA hoặc tạo roadmap trước để mobile dashboard hiện bức tranh học tập ngắn hạn và dài hạn."
              actionLabel="Mở Roadmap"
              actionTabId="roadmap"
            />
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">GPA hiện tại</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {snapshot.gpa.snapshot ? snapshot.gpa.snapshot.gpa4.toFixed(2) : "--"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {snapshot.gpa.snapshot ? `${snapshot.gpa.snapshot.gpa10.toFixed(2)} / 10` : "Chưa sync GPA"}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Roadmap đã lên</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.roadmap.semesterCount || 0} kỳ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {snapshot.roadmap.totalCourses || 0} môn • {snapshot.roadmap.totalCredits || 0} tín chỉ
                  </p>
                </div>
              </div>
              {snapshot.roadmap.goal && (
                <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Mục tiêu gần nhất</p>
                      <p className="mt-1 text-sm text-muted-foreground">{snapshot.roadmap.goal.semesterName}</p>
                    </div>
                    <Badge variant="outline" className={toneBadgeStyles.cyan}>{snapshot.roadmap.goal.gpa4} / 4</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </ToneCard>
      </div>

      <div className="hidden gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-2 xl:grid-cols-4 lg:grid">
        <Lane title="Hôm nay" description="Nhịp trong ngày và các lớp học hiện tại.">
          <ToneCard
            tone="sky"
            icon={CalendarClock}
            title="Lịch học hôm nay"
            description={`Tuần ${snapshot.schedule.currentWeek} • ${snapshot.shortDateLabel}`}
            actionLabel="Lịch"
            onAction={() => navigateToTab("schedule")}
          >
            {!snapshot.schedule.hasData ? (
              <EmptyState
                tone="sky"
                icon={CalendarClock}
                title="Chưa có thời khóa biểu"
                description="Sync hoặc import thời khóa biểu để dashboard hiển thị lịch học trong ngày."
                actionLabel="Mở thời khóa biểu"
                actionTabId="schedule"
              />
            ) : snapshot.schedule.todayClasses.length === 0 ? (
              <EmptyState
                tone="sky"
                icon={Sparkles}
                title="Hôm nay khá trống"
                description="Không có lớp nào trong ngày hiện tại. Bạn có thể xem lại tuần học ở tab thời khóa biểu."
                actionLabel="Xem lịch tuần"
                actionTabId="schedule"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div className={cn(panelSurfaceSoft, "px-3 py-2.5")}>
                    <p className="text-lg font-semibold text-foreground">{snapshot.schedule.todayClasses.length}</p>
                    <p className="text-[11px] text-muted-foreground">Môn</p>
                  </div>
                  <div className={cn(panelSurfaceSoft, "px-3 py-2.5")}>
                    <p className="text-lg font-semibold text-foreground">{totalPeriodsToday}</p>
                    <p className="text-[11px] text-muted-foreground">Tiết</p>
                  </div>
                  <div className={cn(panelSurfaceSoft, "px-3 py-2.5")}>
                    <p className="text-sm font-semibold text-foreground">
                      {snapshot.schedule.nextClass ? snapshot.schedule.nextClass.code : "--"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Kế tiếp</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {snapshot.schedule.todayClasses.map((course) => {
                    const isCurrent = snapshot.schedule.currentClass?.code === course.code
                      && snapshot.schedule.currentClass?.startPeriod === course.startPeriod;
                    const isNext = !isCurrent
                      && snapshot.schedule.nextClass?.code === course.code
                      && snapshot.schedule.nextClass?.startPeriod === course.startPeriod;

                    return (
                      <ScheduleItem
                        key={`${course.code}-${course.startPeriod}-${course.room || "na"}`}
                        course={course}
                        isCurrent={isCurrent}
                        isNext={isNext}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </ToneCard>
        </Lane>

        <Lane title="LMS" description="Deadline và hội thoại mới nhất.">
          <ToneCard
            tone="rose"
            icon={Target}
            title="Deadline gần nhất"
            description={snapshot.deadlines.urgentCount > 0 ? `${snapshot.deadlines.urgentCount} deadline cần ưu tiên` : "Từ dữ liệu LMS đã sync"}
            onAction={() => navigateToTab("deadlines")}
          >
            {!snapshot.deadlines.hasData ? (
              <EmptyState
                tone="rose"
                icon={Target}
                title="Chưa có cache deadline LMS"
                description="Mở tab Deadline LMS một lần để tải dữ liệu, sau đó dashboard sẽ tự gom các mốc gần nhất cho bạn."
                actionLabel="Mở deadline LMS"
                actionTabId="deadlines"
              />
            ) : (
              <div className="space-y-2.5">
                {snapshot.deadlines.items.map((item) => (
                  <div key={`${item.name}-${item.date}-${item.bucket}`} className="rounded-2xl border border-pink-200/70 bg-pink-100/72 p-3 shadow-sm shadow-pink-200/35 dark:border-pink-700/35 dark:bg-pink-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.name || item.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.courseName || "Sự kiện LMS"}</p>
                      </div>
                      <Badge variant="outline" className={cn(toneStyles.rose.action, "pointer-events-none border-transparent dark:border-transparent")}>{formatRelativeDate(item.eventDate)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatFullDate(item.eventDate)}</span>
                      {item.component && <span>• {item.component.replace("mod_", "")}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>

          <ToneCard
            tone="violet"
            icon={MessageSquare}
            title="Tin nhắn LMS"
            description={snapshot.messages.hasData ? `${snapshot.messages.unreadCount} cuộc trò chuyện chưa đọc` : "Từ cache LMS gần nhất"}
            onAction={() => navigateToTab("messages")}
          >
            {!snapshot.messages.hasData ? (
              <EmptyState
                tone="violet"
                icon={Inbox}
                title="Chưa có dữ liệu hội thoại"
                description="Mở tab Tin nhắn LMS để tải danh sách hội thoại. Sau đó dashboard sẽ hiện nhanh tin mới và số cuộc trò chuyện chưa đọc."
                actionLabel="Mở Tin nhắn LMS"
                actionTabId="messages"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-violet-200/70 bg-violet-100/72 p-3 shadow-sm shadow-violet-200/35 dark:border-violet-700/35 dark:bg-violet-900/28 dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Chưa đọc</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.messages.unreadCount}</p>
                    </div>
                    <Badge variant="outline" className={cn(toneStyles.violet.action, "pointer-events-none border-transparent dark:border-transparent")}>{snapshot.messages.totalCount} hội thoại</Badge>
                  </div>
                </div>
                {snapshot.messages.latest && (
                  <div className="rounded-2xl border border-violet-200/70 bg-violet-100/72 p-3 shadow-sm shadow-violet-200/35 dark:border-violet-700/35 dark:bg-violet-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{snapshot.messages.latest.sender}</p>
                      <Badge variant="outline" className={cn(toneStyles.violet.action, "pointer-events-none border-transparent dark:border-transparent")}>{snapshot.messages.latest.timeLabel}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {snapshot.messages.latest.preview || "Chưa có nội dung xem trước."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ToneCard>
        </Lane>

        <Lane title="Kế hoạch" description="Lịch thi và task quan trọng.">
          <ToneCard
            tone="emerald"
            icon={GraduationCap}
            title="Lịch thi sắp tới"
            description={snapshot.exams.nextExam ? `${formatRelativeDate(snapshot.exams.nextExam.examDate)} có môn thi tiếp theo` : "Từ cache lịch thi đã lưu"}
            onAction={() => navigateToTab("exam")}
          >
            {!snapshot.exams.hasData ? (
              <EmptyState
                tone="emerald"
                icon={GraduationCap}
                title="Chưa có lịch thi"
                description="Sau khi vào tab Lịch thi và tải dữ liệu, dashboard sẽ hiển thị môn thi kế tiếp ngay tại đây."
                actionLabel="Mở Lịch thi"
                actionTabId="exam"
              />
            ) : (
              <div className="space-y-2.5">
                {snapshot.exams.items.map((exam) => (
                  <div key={exam.ID || `${exam.MAMONHOC}-${exam.NGAYTHI}`} className="rounded-2xl border border-emerald-200/70 bg-emerald-100/72 p-3 shadow-sm shadow-emerald-200/35 dark:border-emerald-700/35 dark:bg-emerald-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{exam.MAMONHOC}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{exam.TENMONHOC}</p>
                      </div>
                      <Badge variant="outline" className={toneBadgeStyles.emerald}>{formatRelativeDate(exam.examDate)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatFullDate(exam.examDate)}</span>
                      {exam.GIOBD && <span>• {exam.GIOBD}</span>}
                      {exam.MAPHONG && <span>• {exam.MAPHONG}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>

          <ToneCard
            tone="amber"
            icon={ListTodo}
            title="Kế hoạch & việc cần làm"
            description="Task gần hạn và tiến độ xử lý."
            onAction={() => navigateToTab("notes")}
          >
            {!snapshot.tasks.hasData ? (
              <EmptyState
                tone="amber"
                icon={ListTodo}
                title="Chưa có task nào"
                description="Thêm việc trong tab Ghi chú/Kế hoạch để dashboard bắt đầu nhắc deadline và tiến độ hoàn thành."
                actionLabel="Mở Ghi chú"
                actionTabId="notes"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-orange-200/70 bg-orange-100/72 p-3 shadow-sm shadow-orange-200/35 dark:border-orange-700/35 dark:bg-orange-900/28 dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tỷ lệ hoàn thành</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.tasks.completionRate}%</p>
                    </div>
                    <Badge variant="outline" className={cn(toneStyles.amber.action, "pointer-events-none")}>{snapshot.tasks.dueSoonCount} gần hạn</Badge>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-200/70 dark:bg-orange-950/40">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.max(snapshot.tasks.completionRate, 6)}%` }} />
                  </div>
                </div>
                {snapshot.tasks.items.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-orange-200/70 bg-orange-100/72 p-3 shadow-sm shadow-orange-200/35 dark:border-orange-700/35 dark:bg-orange-900/28 dark:shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {task.content || "Task chưa có ghi chú chi tiết."}
                        </p>
                      </div>
                      {task.dueDateValue && (
                        <Badge variant="outline" className={cn(toneStyles.amber.action, "pointer-events-none")}>
                          {formatRelativeDate(task.dueDateValue)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.category && <span>{task.category}</span>}
                      {task.priority && <span>• {task.priority}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToneCard>
        </Lane>

        <Lane title="Tiến độ" description="GPA, roadmap và các lối đi nhanh.">
          <ToneCard tone="cyan" icon={Route} title="Tiến độ học tập" description="GPA hiện tại, roadmap và mục tiêu học kỳ.">
            {!snapshot.gpa.hasData && !snapshot.roadmap.hasData ? (
              <EmptyState
                tone="cyan"
                icon={Route}
                title="Chưa có dữ liệu GPA hoặc roadmap"
                description="Sync GPA hoặc tạo roadmap trước. Dashboard sẽ dùng chúng để hiện bức tranh học tập ngắn hạn và dài hạn."
                actionLabel="Mở Roadmap"
                actionTabId="roadmap"
              />
            ) : (
              <div className="space-y-2.5">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">GPA hiện tại</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {snapshot.gpa.snapshot ? snapshot.gpa.snapshot.gpa4.toFixed(2) : "--"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {snapshot.gpa.snapshot ? `${snapshot.gpa.snapshot.gpa10.toFixed(2)} / 10` : "Chưa sync GPA từ MyBK"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Roadmap đã lên</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{snapshot.roadmap.semesterCount || 0} kỳ</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {snapshot.roadmap.totalCredits || 0} tín chỉ • {snapshot.roadmap.totalCourses || 0} môn
                    </p>
                  </div>
                </div>
                {snapshot.roadmap.goal && (
                  <div className="rounded-2xl border border-cyan-200/70 bg-cyan-100/72 p-3 shadow-sm shadow-cyan-200/35 dark:border-cyan-700/35 dark:bg-cyan-900/28 dark:shadow-none">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Mục tiêu gần nhất</p>
                        <p className="mt-1 text-sm text-muted-foreground">{snapshot.roadmap.goal.semesterName}</p>
                      </div>
                      <Badge variant="outline" className={toneBadgeStyles.cyan}>{snapshot.roadmap.goal.gpa4} / 4</Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ToneCard>

          <ToneCard tone="sky" icon={BookOpen} title="Mở nhanh các khu vực" description="Đi thẳng tới nơi bạn dùng nhiều nhất.">
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <button
                  key={`${action.tabId}-inline`}
                  type="button"
                  onClick={() => navigateToTab(action.tabId)}
                  className="flex items-center justify-between rounded-2xl border border-sky-200/70 bg-sky-100/72 px-3 py-3 text-left shadow-sm shadow-sky-200/35 transition-colors hover:bg-sky-200/72 dark:border-sky-700/35 dark:bg-sky-900/28 dark:shadow-none dark:hover:bg-sky-900/38"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.meta}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ToneCard>
        </Lane>
      </div>
    </div>
  );
}
