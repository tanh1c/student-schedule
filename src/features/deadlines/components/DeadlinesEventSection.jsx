import React from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/features/deadlines/components/DeadlineEventCard";

const sectionConfig = {
  deadlines: {
    title: "Deadline / Đóng",
    countClassName:
      "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700",
    titleClassName: "text-rose-700 dark:text-rose-400",
    iconWrapClassName: "bg-gradient-to-br from-rose-400 to-red-500",
    emptyTitle: "Không có deadline nào",
    emptySubtitle: "Bạn đã hoàn thành tất cả! 🎉",
    emptyIcon: CheckCircle2,
    emptyIconWrapClassName:
      "bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800",
    emptyIconClassName: "text-emerald-500 dark:text-emerald-400",
    icon: AlertTriangle,
    type: "deadline",
  },
  upcoming: {
    title: "Sắp mở",
    countClassName:
      "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700",
    titleClassName: "text-emerald-700 dark:text-emerald-400",
    iconWrapClassName: "bg-gradient-to-br from-emerald-400 to-green-500",
    emptyTitle: "Không có sự kiện sắp mở",
    emptySubtitle: "",
    emptyIcon: CalendarClock,
    emptyIconWrapClassName:
      "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800",
    emptyIconClassName: "text-slate-400 dark:text-slate-500",
    icon: Sparkles,
    type: "upcoming",
  },
};

export default function DeadlinesEventSection({
  variant,
  events,
  nowSeconds,
}) {
  const config = sectionConfig[variant];
  const Icon = config.icon;
  const EmptyIcon = config.emptyIcon;

  return (
    <div className="min-w-0 space-y-2 overflow-hidden sm:space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-lg ${config.iconWrapClassName}`}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${config.titleClassName}`}
          >
            {config.title}
          </span>
          <Badge className={`px-1.5 py-0 text-[10px] ${config.countClassName}`}>
            {events.length}
          </Badge>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${config.emptyIconWrapClassName}`}
          >
            <EmptyIcon className={`h-8 w-8 ${config.emptyIconClassName}`} />
          </div>
          <p className="text-sm font-medium sm:text-base">{config.emptyTitle}</p>
          {config.emptySubtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {config.emptySubtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {events.map((event, index) => (
            <EventCard
              key={`${config.type}-${event.eventId || index}`}
              event={event}
              type={config.type}
              nowSeconds={nowSeconds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
