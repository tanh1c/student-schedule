import React, { useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { buildCalendarDays, getCalendarTaskDateKey } from "../utils/notesHelpers";

const PRIORITY_COLORS = {
  high: "border-l-red-500 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  medium:
    "border-l-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "border-l-green-500 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function CalendarView({
  tasks,
  selectedCalendarDate,
  onCalendarDateChange,
  onOpenDialog,
}) {
  const today = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);

  const days = useMemo(() => buildCalendarDays(selectedCalendarDate), [selectedCalendarDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              const newDate = new Date(selectedCalendarDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onCalendarDateChange(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold">
            {format(selectedCalendarDate, "MMMM yyyy", { locale: vi })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              const newDate = new Date(selectedCalendarDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onCalendarDateChange(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => onCalendarDateChange(new Date())}>
          Hôm nay
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 dark:bg-muted/10">
          {WEEKDAY_LABELS.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-semibold ${
                index === 0 ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = getCalendarTaskDateKey(day.fullDate);
            const dayTasks = tasks.filter((task) => {
              if (!task.dueDate || task.status === "done") return false;
              return task.dueDate.split("T")[0] === dateKey;
            });
            const isToday = day.fullDate.getTime() === today.getTime();

            return (
              <div
                key={`${dateKey}-${index}`}
                className={`min-h-[100px] cursor-pointer border-b border-r border-border/50 p-1.5 transition-colors dark:border-border/30 md:min-h-[120px] ${
                  !day.isCurrentMonth
                    ? "bg-muted/20 text-muted-foreground dark:bg-muted/5"
                    : isToday
                      ? "bg-teal-50 ring-2 ring-inset ring-teal-500/30 dark:bg-teal-900/30 dark:ring-teal-400/30"
                      : "bg-card hover:bg-accent/50 dark:bg-card dark:hover:bg-accent/20"
                }`}
                onClick={() => {
                  if (day.isCurrentMonth) {
                    onOpenDialog("todo", null, dateKey);
                  }
                }}
              >
                <div
                  className={`mb-1 text-sm font-medium ${
                    isToday
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm dark:bg-teal-600"
                      : index % 7 === 0
                        ? "text-red-500 dark:text-red-400"
                        : !day.isCurrentMonth
                          ? "text-muted-foreground/40 dark:text-muted-foreground/30"
                          : "text-foreground"
                  }`}
                >
                  {day.date}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`truncate rounded border-l-2 px-1.5 py-0.5 text-[10px] hover:opacity-80 ${
                        PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenDialog(task.status, task);
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{dayTasks.length - 3} khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/50 bg-card p-3 text-xs text-muted-foreground dark:bg-card/50">
        <span className="font-semibold text-foreground">Chú thích:</span>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm dark:bg-red-600" />
          <span>Ưu tiên cao</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm dark:bg-amber-600" />
          <span>Trung bình</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm dark:bg-green-600" />
          <span>Thấp</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-teal-500 shadow-sm dark:bg-teal-600" />
          <span>Hôm nay</span>
        </div>
      </div>
    </div>
  );
}
