import { format } from "date-fns";
import { CATEGORY_COLORS } from "../constants/notesConfig";

export const formatTaskDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hôm nay";
  if (date.toDateString() === tomorrow.toDateString()) return "Ngày mai";

  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
};

export const isTaskOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export const getCategoryConfig = (categoryName) =>
  CATEGORY_COLORS.find((category) => category.name === categoryName) ?? CATEGORY_COLORS[0];

export const createTaskPayload = ({
  editingTask,
  title,
  content,
  dueDate,
  priority,
  category,
  targetColumn,
}) => ({
  id: editingTask ? editingTask.id : Date.now(),
  title,
  content,
  dueDate: dueDate ? new Date(dueDate).toISOString() : null,
  priority,
  category,
  status: editingTask ? editingTask.status : targetColumn,
  createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const buildCalendarDays = (selectedCalendarDate) => {
  const year = selectedCalendarDate.getFullYear();
  const month = selectedCalendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const days = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let index = startDay - 1; index >= 0; index -= 1) {
    days.push({
      date: prevMonthLastDay - index,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthLastDay - index),
    });
  }

  for (let date = 1; date <= totalDays; date += 1) {
    days.push({
      date,
      isCurrentMonth: true,
      fullDate: new Date(year, month, date),
    });
  }

  const remaining = 42 - days.length;
  for (let index = 1; index <= remaining; index += 1) {
    days.push({
      date: index,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, index),
    });
  }

  return days;
};

export const getCalendarTaskDateKey = (date) => format(date, "yyyy-MM-dd");
