import { Calendar, CalendarDays, Clock } from "lucide-react";

export const TIME_SLOTS = [
  { id: 1, label: "Tiết 1", time: "06:00-06:50" },
  { id: 2, label: "Tiết 2", time: "07:00-07:50" },
  { id: 3, label: "Tiết 3", time: "08:00-08:50" },
  { id: 4, label: "Tiết 4", time: "09:00-09:50" },
  { id: 5, label: "Tiết 5", time: "10:00-10:50" },
  { id: 6, label: "Tiết 6", time: "11:00-11:50" },
  { id: 7, label: "Tiết 7", time: "12:00-12:50" },
  { id: 8, label: "Tiết 8", time: "13:00-13:50" },
  { id: 9, label: "Tiết 9", time: "14:00-14:50" },
  { id: 10, label: "Tiết 10", time: "15:00-15:50" },
  { id: 11, label: "Tiết 11", time: "16:00-16:50" },
  { id: 12, label: "Tiết 12", time: "17:00-17:50" },
  { id: 13, label: "Tiết 13", time: "18:00-18:50" },
  { id: 14, label: "Tiết 14", time: "18:50-19:40" },
  { id: 15, label: "Tiết 15", time: "19:40-20:30" },
  { id: 16, label: "Tiết 16", time: "20:30-21:10" },
];

export const DAYS_OF_WEEK = [
  { id: 2, label: "Thứ 2", short: "T2" },
  { id: 3, label: "Thứ 3", short: "T3" },
  { id: 4, label: "Thứ 4", short: "T4" },
  { id: 5, label: "Thứ 5", short: "T5" },
  { id: 6, label: "Thứ 6", short: "T6" },
  { id: 7, label: "Thứ 7", short: "T7" },
  { id: 8, label: "Chủ Nhật", short: "CN" },
];

export const SCHEDULE_VIEW_MODES = [
  { id: "timeline", label: "Lịch tuần", icon: CalendarDays },
  { id: "agenda", label: "Agenda", icon: Clock },
  { id: "day", label: "Theo ngày", icon: Calendar },
];

export const SCHEDULE_VIEW_MODE_KEY = "scheduleViewMode";
