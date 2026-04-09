import { AlertTriangle, Filter, Sparkles } from "lucide-react";

export const deadlineFilterTabs = [
  { id: "all", label: "Tất cả", icon: Filter },
  { id: "deadlines", label: "Deadline", icon: AlertTriangle },
  { id: "upcoming", label: "Sắp mở", icon: Sparkles },
];

export const deadlineMonthOptions = [
  { value: 1, label: "1T" },
  { value: 2, label: "2T" },
  { value: 3, label: "3T" },
  { value: 4, label: "4T" },
  { value: 6, label: "6T" },
];
