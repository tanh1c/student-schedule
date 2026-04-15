import React from "react";
import { Calendar as CalendarIcon, KanbanSquare, Plus } from "lucide-react";
import { Button } from "@components/ui/button";

export default function NotesPlansHeader({
  viewMode,
  onViewModeChange,
  totalTasks,
  completedTasks,
  completionRate,
  onCreateTask,
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-2.5 shadow-lg shadow-teal-500/20">
            <KanbanSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Task</h1>
            <p className="text-sm text-muted-foreground">Theo dõi công việc và deadline</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg border bg-muted/50 p-1">
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("kanban")}
            className={`h-8 px-3 transition-all ${
              viewMode === "kanban"
                ? "bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                : "hover:bg-muted"
            }`}
          >
            <KanbanSquare className="mr-1.5 h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("calendar")}
            className={`h-8 px-3 transition-all ${
              viewMode === "calendar"
                ? "bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                : "hover:bg-muted"
            }`}
          >
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            Lịch
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6 rounded-xl border bg-card px-5 py-3 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{totalTasks}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng cộng</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hoàn thành</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{completionRate}%</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiến độ</p>
          </div>
        </div>

        <Button
          onClick={onCreateTask}
          className="h-11 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm task
        </Button>
      </div>
    </div>
  );
}
