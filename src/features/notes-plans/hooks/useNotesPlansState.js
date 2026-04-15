import { useMemo, useState } from "react";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { CATEGORY_COLORS, KANBAN_STATUS_ORDER } from "../constants/notesConfig";
import { createTaskPayload } from "../utils/notesHelpers";

export function useNotesPlansState() {
  const [viewMode, setViewMode] = useState("kanban");
  const [tasks, setTasksRaw] = useLocalStorage("kanbanTasks", []);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState(CATEGORY_COLORS[0].name);
  const [targetColumn, setTargetColumn] = useState("todo");

  const setTasks = (newTasks) => {
    setTasksRaw(newTasks);
    window.dispatchEvent(new CustomEvent("kanbanTasksChanged"));
  };

  const notifications = useMemo(() => {
    const today = new Date();

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;
      const deadline = new Date(task.dueDate);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 3;
    });
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleOpenDialog = (columnId = "todo", task = null, preSelectedDate = null) => {
    setEditingTask(task);
    setTargetColumn(columnId);

    if (task) {
      setTitle(task.title);
      setContent(task.content || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setPriority(task.priority || "medium");
      setCategory(task.category || CATEGORY_COLORS[0].name);
    } else {
      setTitle("");
      setContent("");
      setDueDate(preSelectedDate || "");
      setPriority("medium");
      setCategory(CATEGORY_COLORS[0].name);
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setTitle("");
    setContent("");
    setDueDate("");
    setPriority("medium");
    setCategory(CATEGORY_COLORS[0].name);
  };

  const handleSave = () => {
    const newTask = createTaskPayload({
      editingTask,
      title,
      content,
      dueDate,
      priority,
      category,
      targetColumn,
    });

    if (editingTask) {
      setTasks(tasks.map((task) => (task.id === editingTask.id ? newTask : task)));
    } else {
      setTasks([...tasks, newTask]);
    }

    handleCloseDialog();
  };

  const handleDelete = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const moveToNextColumn = (task) => {
    const currentIndex = KANBAN_STATUS_ORDER.indexOf(task.status);
    if (currentIndex < KANBAN_STATUS_ORDER.length - 1) {
      const nextStatus = KANBAN_STATUS_ORDER[currentIndex + 1];
      setTasks(
        tasks.map((currentTask) =>
          currentTask.id === task.id
            ? { ...currentTask, status: nextStatus, updatedAt: new Date().toISOString() }
            : currentTask
        )
      );
    }
  };

  const handleDragStart = (event, task) => {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      event.target.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (event) => {
    event.target.style.opacity = "1";
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (event, columnId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();

    if (draggedTask && draggedTask.status !== columnId) {
      setTasks(
        tasks.map((task) =>
          task.id === draggedTask.id
            ? { ...task, status: columnId, updatedAt: new Date().toISOString() }
            : task
        )
      );
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getTasksByColumn = (columnId) => tasks.filter((task) => task.status === columnId);

  return {
    viewMode,
    setViewMode,
    tasks,
    notifications,
    totalTasks,
    completedTasks,
    completionRate,
    draggedTask,
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
    setTargetColumn,
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
  };
}
