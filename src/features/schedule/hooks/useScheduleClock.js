import { useEffect, useState } from "react";
import {
  getCurrentScheduleDayId,
  getCurrentTimeSlotInfo,
} from "../utils/scheduleTime";

export const useScheduleClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, []);

  return {
    now,
    currentDayId: getCurrentScheduleDayId(now),
    currentTimeSlotInfo: getCurrentTimeSlotInfo(now),
  };
};
