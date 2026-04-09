import {
  BadgePercent,
  CalendarClock,
  GraduationCap,
  LayoutDashboard,
  Mail,
  NotebookPen,
  NotebookTabs,
  Route,
  ScrollText,
  Settings,
} from "lucide-react";
import { curriculumTabMeta } from "@features/curriculum/constants/meta";
import { deadlinesTabMeta } from "@features/deadlines/constants/meta";
import { messagesTabMeta } from "@features/messages/constants/meta";
import {
  previewRegistrationTabMeta,
  registrationTabMeta,
} from "@features/registration/constants/meta";
import { roadmapTabMeta } from "@features/roadmap/constants/meta";

export const defaultTabId = "schedule";

export const menuItems = [
  {
    id: "schedule",
    label: "Thời khóa biểu",
    shortLabel: "TKB",
    icon: CalendarClock,
  },
  {
    id: "exam",
    label: "Lịch thi",
    shortLabel: "Thi",
    icon: NotebookPen,
  },
  {
    ...curriculumTabMeta,
    icon: GraduationCap,
  },
  {
    id: "gpa",
    label: "Tính GPA",
    shortLabel: "GPA",
    icon: BadgePercent,
  },
  {
    id: "teaching",
    label: "Lịch giảng dạy",
    shortLabel: "Dạy",
    icon: LayoutDashboard,
  },
  {
    id: "notes",
    label: "Ghi chú",
    shortLabel: "Note",
    icon: ScrollText,
  },
  {
    ...roadmapTabMeta,
    icon: Route,
  },
  {
    ...registrationTabMeta,
    icon: NotebookTabs,
  },
  {
    ...messagesTabMeta,
    icon: Mail,
  },
  {
    ...deadlinesTabMeta,
    icon: CalendarClock,
  },
  {
    ...previewRegistrationTabMeta,
    icon: ScrollText,
  },
  {
    id: "settings",
    label: "Cài đặt",
    shortLabel: "CĐ",
    icon: Settings,
  },
];

export const mobileNavMenuItems = menuItems.slice(0, 5);
