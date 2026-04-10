import { exportToGoogleCalendar } from "@utils/calendarExport";
import { parseScheduleData } from "@utils/scheduleParser";

export const parseScheduleInput = (input) => parseScheduleData(input);

export const openMyBKSchedulePage = () => {
  window.open(
    "https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/tkb",
    "_blank"
  );
};

export const readScheduleClipboardText = async () => navigator.clipboard.readText();

export const exportScheduleCalendar = (scheduleData, year) =>
  exportToGoogleCalendar(scheduleData, year);
