import { lazy } from "react";

const CurriculumTab = lazy(() => import("@features/curriculum"));
const DeadlinesTab = lazy(() => import("@features/deadlines"));
const ExamTab = lazy(() => import("@features/exam"));
const GpaTab = lazy(() => import("@features/gpa"));
const MessagesTab = lazy(() => import("@features/messages"));
const NotesPlansTab = lazy(() => import("@features/notes-plans"));
const PreviewRegistrationTab = lazy(() => import("@features/registration/PreviewRegistrationTab"));
const RegistrationTab = lazy(() => import("@features/registration"));
const RoadmapTab = lazy(() => import("@features/roadmap"));
const ScheduleTab = lazy(() => import("@features/schedule"));
const SettingsPage = lazy(() => import("@features/settings"));
const TeachingScheduleTab = lazy(() => import("@features/teaching-schedule"));
const UsefulToolsPage = lazy(() => import("@features/tools"));

export const tabRegistry = {
  schedule: ScheduleTab,
  exam: ExamTab,
  curriculum: CurriculumTab,
  gpa: GpaTab,
  teaching: TeachingScheduleTab,
  notes: NotesPlansTab,
  roadmap: RoadmapTab,
  registration: RegistrationTab,
  messages: MessagesTab,
  deadlines: DeadlinesTab,
  preview: PreviewRegistrationTab,
  tools: UsefulToolsPage,
  settings: SettingsPage,
};
