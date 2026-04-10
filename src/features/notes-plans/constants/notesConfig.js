import {
  CheckCircle2,
  Circle,
  Timer,
} from "lucide-react";

export const KANBAN_COLUMNS = [
  {
    id: "todo",
    title: "Cần làm",
    icon: Circle,
    color: "bg-slate-500",
    bgColor: "bg-slate-50/80 dark:bg-slate-800/50",
    borderColor: "border-slate-200 dark:border-slate-700",
    headerColor: "text-slate-700 dark:text-slate-200",
  },
  {
    id: "inprogress",
    title: "Đang làm",
    icon: Timer,
    color: "bg-teal-500",
    bgColor: "bg-teal-50/80 dark:bg-teal-900/30",
    borderColor: "border-teal-200 dark:border-teal-700",
    headerColor: "text-teal-700 dark:text-teal-200",
  },
  {
    id: "done",
    title: "Hoàn thành",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50/80 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-700",
    headerColor: "text-emerald-700 dark:text-emerald-200",
  },
];

export const PRIORITY_CONFIG = {
  high: {
    label: "Cao",
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-300",
    bgLight: "bg-red-50 dark:bg-red-900/40",
    borderColor: "border-red-200 dark:border-red-700",
    icon: "🔥",
  },
  medium: {
    label: "Trung bình",
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-300",
    bgLight: "bg-amber-50 dark:bg-amber-900/40",
    borderColor: "border-amber-200 dark:border-amber-700",
    icon: "⚡",
  },
  low: {
    label: "Thấp",
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-300",
    bgLight: "bg-green-50 dark:bg-green-900/40",
    borderColor: "border-green-200 dark:border-green-700",
    icon: "💡",
  },
};

export const CATEGORY_COLORS = [
  {
    name: "Học tập",
    color: "bg-blue-500",
    textColor: "text-blue-700 dark:text-blue-200",
    bgLight: "bg-blue-100 dark:bg-blue-800/40",
  },
  {
    name: "Dự án",
    color: "bg-purple-500",
    textColor: "text-purple-700 dark:text-purple-200",
    bgLight: "bg-purple-100 dark:bg-purple-800/40",
  },
  {
    name: "Cá nhân",
    color: "bg-pink-500",
    textColor: "text-pink-700 dark:text-pink-200",
    bgLight: "bg-pink-100 dark:bg-pink-800/40",
  },
  {
    name: "Công việc",
    color: "bg-orange-500",
    textColor: "text-orange-700 dark:text-orange-200",
    bgLight: "bg-orange-100 dark:bg-orange-800/40",
  },
  {
    name: "Ý tưởng",
    color: "bg-cyan-500",
    textColor: "text-cyan-700 dark:text-cyan-200",
    bgLight: "bg-cyan-100 dark:bg-cyan-800/40",
  },
];

export const KANBAN_STATUS_ORDER = ["todo", "inprogress", "done"];
