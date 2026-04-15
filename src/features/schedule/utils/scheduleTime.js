import { TIME_SLOTS } from "../constants/scheduleConfig";

export const getCurrentScheduleDayId = (date = new Date()) => {
  const today = date.getDay();
  return today === 0 ? 8 : today + 1;
};

export const getMinutesFromTime = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return (hours * 60) + minutes;
};

export const getCurrentTimeSlotInfo = (date = new Date()) => {
  const currentMinutes = (date.getHours() * 60) + date.getMinutes();

  return TIME_SLOTS.find((slot) => {
    const [startTime, endTime] = slot.time.split("-");
    const startMinutes = getMinutesFromTime(startTime);
    const endMinutes = getMinutesFromTime(endTime);
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }) ?? null;
};

export const getCourseTimeRange = (course) => {
  if (course.time && course.time.includes("-")) {
    const [startTime, endTime] = course.time.split("-").map((value) => value.trim());
    return { startTime, endTime };
  }

  return {
    startTime: TIME_SLOTS[course.startPeriod - 1]?.time.split("-")[0] || "",
    endTime: TIME_SLOTS[course.endPeriod - 1]?.time.split("-")[1] || "",
  };
};

export const isCourseOngoingNow = (
  course,
  currentDayId,
  currentTimeSlotInfo,
  isViewingCurrentWeek
) =>
  Boolean(
    isViewingCurrentWeek &&
      currentTimeSlotInfo &&
      course.day === currentDayId &&
      currentTimeSlotInfo.id >= course.startPeriod &&
      currentTimeSlotInfo.id <= course.endPeriod
  );
