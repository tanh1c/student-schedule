import React from "react";
import { ArrowRight, Edit2, Flag, GripVertical, Layers, Plus, Trash2 } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { PRIORITY_CONFIG } from "../constants/notesConfig";
import { formatTaskDate, getCategoryConfig, isTaskOverdue } from "../utils/notesHelpers";

export function EmptyColumnState({ onCreateTask }) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
        <Layers className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground">Chưa có task nào</p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 text-teal-600 hover:text-teal-700 dark:text-teal-400"
        onClick={onCreateTask}
      >
        <Plus className="mr-1 h-3 w-3" />
        Thêm task đầu tiên
      </Button>
    </div>
  );
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveNext,
  onDragStart,
  onDragEnd,
}) {
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const categoryConfig = getCategoryConfig(task.category);
  const overdue = task.status !== "done" && isTaskOverdue(task.dueDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-xl border bg-card shadow-sm transition-all duration-150 hover:shadow-md active:scale-[1.02] active:cursor-grabbing active:shadow-lg ${
        overdue ? "border-red-300 dark:border-red-700" : "border-border"
      }`}
    >
      <div className="flex items-start gap-2 p-3 pb-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
        <div className="min-w-0 flex-1">
          <h4
            className={`line-clamp-2 text-sm font-medium ${
              task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {task.status !== "done" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-900/50"
              onClick={onMoveNext}
              title="Di chuyển sang cột tiếp theo"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted" onClick={onEdit}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {task.content && (
        <p className="line-clamp-2 px-3 pb-2 pl-9 text-xs text-muted-foreground">{task.content}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pl-9">
        <Badge
          variant="secondary"
          className={`border-0 text-[10px] font-medium ${categoryConfig.bgLight} ${categoryConfig.textColor}`}
        >
          {task.category}
        </Badge>

        <Badge
          variant="outline"
          className={`text-[10px] ${priorityConfig.textColor} ${priorityConfig.bgLight} ${priorityConfig.borderColor}`}
        >
          <Flag className="mr-0.5 h-2.5 w-2.5" />
          {priorityConfig.label}
        </Badge>

        {task.dueDate && (
          <Badge
            variant="outline"
            className={`text-[10px] ${
              overdue
                ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                : "bg-muted/50"
            }`}
          >
            {formatTaskDate(task.dueDate)}
          </Badge>
        )}
      </div>
    </div>
  );
}
