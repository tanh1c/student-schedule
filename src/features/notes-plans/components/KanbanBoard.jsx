import React from "react";
import KanbanColumn from "./KanbanColumn";
import NotesPlansAlerts from "./NotesPlansAlerts";
import { KANBAN_COLUMNS } from "../constants/notesConfig";

export default function KanbanBoard({
  notifications,
  dragOverColumn,
  getTasksByColumn,
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
  return (
    <>
      <NotesPlansAlerts notifications={notifications} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByColumn(column.id)}
            isDragOver={dragOverColumn === column.id}
            onCreateTask={() => onCreateTask(column.id)}
            onDragOver={(event) => onDragOver(event, column.id)}
            onDragLeave={onDragLeave}
            onDrop={(event) => onDrop(event, column.id)}
            onEditTask={(task) => onEditTask(task.status, task)}
            onDeleteTask={onDeleteTask}
            onMoveTaskNext={onMoveTaskNext}
            onDragStartTask={onDragStartTask}
            onDragEndTask={onDragEndTask}
          />
        ))}
      </div>
    </>
  );
}
