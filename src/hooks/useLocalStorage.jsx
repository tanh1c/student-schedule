import { useState } from 'react';

// Custom hook for localStorage management
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Helper to calculate current semester week
const getCurrentSemesterWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek) + 1;
};

// Hook for managing schedule data
export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useLocalStorage('scheduleData', []);
  const currentWeek = getCurrentSemesterWeek();

  // Initialize selectedWeek with current week if not set or invalid
  const [selectedWeek, setSelectedWeek] = useLocalStorage('selectedWeek', currentWeek);

  // Wrapper to auto-set current week when schedule data is loaded/updated
  const setScheduleDataWithWeek = (data) => {
    setScheduleData(data);
    // If data is being loaded (not empty), ensure we show current week
    if (data && data.length > 0) {
      // Only reset to current week if the current selectedWeek is 1 (default)
      // This preserves user's week selection after they change it
      const storedWeek = JSON.parse(localStorage.getItem('selectedWeek') || '1');
      if (storedWeek === 1) {
        setSelectedWeek(currentWeek);
      }
    }
  };

  return {
    scheduleData,
    setScheduleData: setScheduleDataWithWeek,
    selectedWeek,
    setSelectedWeek,
    currentWeek
  };
};

// Hook for managing exam data
export const useExamData = () => {
  const [examData, setExamData] = useLocalStorage('examData', []);

  return {
    examData,
    setExamData
  };
};

// Hook for managing GPA data
export const useGpaData = () => {
  const [courses, setCourses] = useLocalStorage('gpaCourses', []);

  return {
    courses,
    setCourses
  };
};

// Hook for managing notes and plans
export const useNotesPlans = () => {
  const [items, setItems] = useLocalStorage('notesPlans', []);

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem
  };
};

// Hook for managing app preferences
export const useAppPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('appPreferences', {
    theme: 'light',
    language: 'vi',
    defaultView: 'desktop',
    notifications: true
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    setPreferences,
    updatePreference
  };
};
