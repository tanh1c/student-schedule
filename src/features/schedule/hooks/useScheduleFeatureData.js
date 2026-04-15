import { useState } from "react";

const getCurrentSemesterWeek = () => {
  const now = new Date();
  const year = now.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay();
  const daysToMonday = jan1Day === 0 ? -6 : 1 - jan1Day;
  const week1Monday = new Date(year, 0, 1 + daysToMonday);
  const diffDays = Math.floor((now - week1Monday) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

const readLocalStorageValue = (key, fallback) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
};

const writeLocalStorageValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const useScheduleFeatureData = () => {
  const currentWeek = getCurrentSemesterWeek();
  const storedScheduleData = readLocalStorageValue("scheduleData", []);

  const [scheduleData, setScheduleDataState] = useState(storedScheduleData);
  const [selectedWeek, setSelectedWeekState] = useState(() => {
    const storedWeek = readLocalStorageValue("selectedWeek", currentWeek);
    if (Array.isArray(storedScheduleData) && storedScheduleData.length > 0) {
      return currentWeek;
    }
    return storedWeek;
  });

  const setSelectedWeek = (value) => {
    const valueToStore = value instanceof Function ? value(selectedWeek) : value;
    setSelectedWeekState(valueToStore);
    writeLocalStorageValue("selectedWeek", valueToStore);
  };

  const setScheduleData = (value) => {
    const valueToStore = value instanceof Function ? value(scheduleData) : value;
    setScheduleDataState(valueToStore);
    writeLocalStorageValue("scheduleData", valueToStore);

    if (Array.isArray(valueToStore) && valueToStore.length > 0) {
      setSelectedWeekState(currentWeek);
      writeLocalStorageValue("selectedWeek", currentWeek);
    }
  };

  return {
    scheduleData,
    setScheduleData,
    selectedWeek,
    setSelectedWeek,
    currentWeek,
  };
};
