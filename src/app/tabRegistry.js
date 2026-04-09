import CurriculumTab from "@features/curriculum";
import DeadlinesTab from "@features/deadlines";
import MessagesTab from "@features/messages";
import PreviewRegistrationTab from "@features/registration/PreviewRegistrationTab";
import RegistrationTab from "@features/registration";
import RoadmapTab from "@features/roadmap";
import ExamTab from "@components/ExamTab";
import GpaTab from "@components/GpaTab";
import NotesPlansTab from "@components/NotesPlansTab";
import ScheduleTab from "@components/ScheduleTab";
import SettingsPage from "@components/SettingsPage";
import TeachingScheduleTab from "@components/TeachingScheduleTab";

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
  settings: SettingsPage,
};
