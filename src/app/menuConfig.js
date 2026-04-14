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
  Wrench,
} from "lucide-react";
import { scheduleTabMeta } from "@features/schedule/constants/meta";
import { curriculumTabMeta } from "@features/curriculum/constants/meta";
import { deadlinesTabMeta } from "@features/deadlines/constants/meta";
import { examTabMeta } from "@features/exam/constants/meta";
import { gpaTabMeta } from "@features/gpa/constants/meta";
import { messagesTabMeta } from "@features/messages/constants/meta";
import {
  previewRegistrationTabMeta,
  registrationTabMeta,
} from "@features/registration/constants/meta";
import { roadmapTabMeta } from "@features/roadmap/constants/meta";
import { settingsTabMeta } from "@features/settings/constants/meta";
import { teachingScheduleTabMeta } from "@features/teaching-schedule/constants/meta";
import { notesPlansTabMeta } from "@features/notes-plans/constants/meta";
import { toolsTabMeta } from "@features/tools/constants/meta";

export const defaultTabId = "schedule";

export const mobilePrimaryTabIds = ["schedule", "exam", "curriculum", "gpa"];

export const menuItems = [
  {
    ...scheduleTabMeta,
    icon: CalendarClock,
  },
  {
    ...examTabMeta,
    icon: NotebookPen,
  },
  {
    ...curriculumTabMeta,
    icon: GraduationCap,
  },
  {
    ...gpaTabMeta,
    icon: BadgePercent,
  },
  {
    ...teachingScheduleTabMeta,
    icon: LayoutDashboard,
  },
  {
    ...notesPlansTabMeta,
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
    ...toolsTabMeta,
    icon: Wrench,
  },
  {
    ...settingsTabMeta,
    icon: Settings,
  },
];

export const mobileNavMenuItems = mobilePrimaryTabIds
  .map((id) => menuItems.find((item) => item.id === id))
  .filter(Boolean);

export const mobileMenuGroups = [
  {
    id: "study",
    label: "Học tập",
    description: "Các tab học vụ và lập kế hoạch học tập.",
    itemIds: ["schedule", "exam", "curriculum", "gpa", "roadmap", "notes-plans"],
  },
  {
    id: "services",
    label: "Dịch vụ",
    description: "Các dịch vụ học tập, LMS và đăng ký.",
    itemIds: [
      "teaching-schedule",
      "registration",
      "preview",
      "messages",
      "deadlines",
    ],
  },
  {
    id: "workspace",
    label: "Khác",
    description: "Công cụ hỗ trợ và cài đặt hệ thống.",
    itemIds: ["tools", "settings"],
  },
];
