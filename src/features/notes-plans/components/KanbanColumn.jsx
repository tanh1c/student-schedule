import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import TaskCard, { EmptyColumnState } from "./TaskCard";

export default function KanbanColumn({
  column,
  tasks,
  isDragOver,
  onCreateTask,
  onDragOver,
  onDragLeave,
  onDrop,
  onEditTask,
  onDeleteTask,
  onMoveTaskNext,
  onDragStartTask,
  onDragEndTask,
}) {
  const Icon = column.icon;

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 ${column.bgColor} ${
        isDragOver
          ? "scale-[1.02] border-teal-400 ring-4 ring-teal-500/20 dark:border-teal-500"
          : column.borderColor
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="border-b border-inherit p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-1.5 ${column.color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <h3 className={`font-semibold ${column.headerColor}`}>{column.title}</h3>
            <Badge variant="secondary" className="ml-1 text-xs font-bold">
              {tasks.length}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/50 dark:hover:bg-white/10"
            onClick={onCreateTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
        <div className="space-y-3 p-3">
          {tasks.length === 0 ? (
            <EmptyColumnState onCreateTask={onCreateTask} />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(event) => {
                  event.stopPropagation();
                  onEditTask(task);
                }}
                onDelete={(event) => {
                  event.stopPropagation();
                  onDeleteTask(task.id);
                }}
                onMoveNext={(event) => {
                  event.stopPropagation();
                  onMoveTaskNext(task);
                }}
                onDragStart={(event) => onDragStartTask(event, task)}
                onDragEnd={onDragEndTask}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
