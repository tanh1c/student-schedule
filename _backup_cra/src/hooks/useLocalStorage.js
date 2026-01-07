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

// Hook for managing schedule data
export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useLocalStorage('scheduleData', []);
  const [selectedWeek, setSelectedWeek] = useLocalStorage('selectedWeek', 1);
  
  return {
    scheduleData,
    setScheduleData,
    selectedWeek,
    setSelectedWeek
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
