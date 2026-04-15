import { useEffect } from "react";
import { useLocalStorage } from "@hooks/useLocalStorage";
import {
  SCHEDULE_VIEW_MODES,
  SCHEDULE_VIEW_MODE_KEY,
} from "../constants/scheduleConfig";

export const useScheduleViewMode = () => {
  const [scheduleViewMode, setScheduleViewMode] = useLocalStorage(
    SCHEDULE_VIEW_MODE_KEY,
    "timeline"
  );

  useEffect(() => {
    if (!SCHEDULE_VIEW_MODES.some((mode) => mode.id === scheduleViewMode)) {
      setScheduleViewMode("timeline");
    }
  }, [scheduleViewMode, setScheduleViewMode]);

  return { scheduleViewMode, setScheduleViewMode };
};
