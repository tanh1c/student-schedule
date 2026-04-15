import React from "react";
import NotesPlansHeader from "./NotesPlansHeader";
import KanbanBoard from "./KanbanBoard";
import CalendarView from "./CalendarView";
import TaskDialog from "./TaskDialog";
import { useNotesPlansState } from "../hooks/useNotesPlansState";

export default function NotesPlansTab() {
  const {
    viewMode,
    setViewMode,
    tasks,
    notifications,
    totalTasks,
    completedTasks,
    completionRate,
    dragOverColumn,
    openDialog,
    editingTask,
    selectedCalendarDate,
    setSelectedCalendarDate,
    title,
    setTitle,
    content,
    setContent,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    category,
    setCategory,
    targetColumn,
    handleOpenDialog,
    handleCloseDialog,
    handleSave,
    handleDelete,
    moveToNextColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    getTasksByColumn,
  } = useNotesPlansState();

  return (
    <div className="mx-auto max-w-[1800px] space-y-4 p-3 md:space-y-6 md:p-6">
      <NotesPlansHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        completionRate={completionRate}
        onCreateTask={() => handleOpenDialog("todo")}
      />

      {viewMode === "kanban" ? (
        <KanbanBoard
          notifications={notifications}
          dragOverColumn={dragOverColumn}
          getTasksByColumn={getTasksByColumn}
          onCreateTask={handleOpenDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onEditTask={handleOpenDialog}
          onDeleteTask={handleDelete}
          onMoveTaskNext={moveToNextColumn}
          onDragStartTask={handleDragStart}
          onDragEndTask={handleDragEnd}
        />
      ) : (
        <CalendarView
          tasks={tasks}
          selectedCalendarDate={selectedCalendarDate}
          onCalendarDateChange={setSelectedCalendarDate}
          onOpenDialog={handleOpenDialog}
        />
      )}

      <TaskDialog
        open={openDialog}
        editingTask={editingTask}
        targetColumn={targetColumn}
        title={title}
        content={content}
        dueDate={dueDate}
        priority={priority}
        category={category}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onDueDateChange={setDueDate}
        onPriorityChange={setPriority}
        onCategoryChange={setCategory}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </div>
  );
}
