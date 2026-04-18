import { useCallback, useEffect, useRef, useState } from "react";
import { calculatePreciseCurrentGpa } from "@/features/gpa/utils/gpaGradeScale";
import { calculateSemesterGpa } from "@/features/roadmap/utils/gpa";
import {
  getCurrentScheduleDayId,
  getCurrentTimeSlotInfo,
  getCourseTimeRange,
} from "@/features/schedule/utils/scheduleTime";

const SCHEDULE_STORAGE_KEY = "scheduleData";
const DEADLINES_STORAGE_KEY = "lms_cache_deadlines";
const CONVERSATIONS_STORAGE_KEY = "lms_cache_conversations";
const EXAM_STORAGE_KEY = "examSchedule";
const GPA_DETAILS_STORAGE_KEY = "mybk_gpa_details";
const ROADMAP_STORAGE_KEY = "studyRoadmap";
const TASKS_STORAGE_KEY = "kanbanTasks";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_IN_SECONDS = 24 * 60 * 60;

function readJsonStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

function getCurrentSemesterWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay();
  const daysToMonday = jan1Day === 0 ? -6 : 1 - jan1Day;
  const week1Monday = new Date(year, 0, 1 + daysToMonday);
  const diffDays = Math.floor((now - week1Monday) / DAY_IN_MS);
  return Math.floor(diffDays / 7) + 1;
}

function parseDateTime(dateValue, timeValue = "00:00") {
  if (!dateValue) return null;

  if (typeof dateValue === "number") {
    return new Date(dateValue);
  }

  const normalizedTime = String(timeValue || "00:00").slice(0, 5);
  const cleanedValue = String(dateValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedValue)) {
    return new Date(`${cleanedValue}T${normalizedTime || "00:00"}`);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanedValue)) {
    const [day, month, year] = cleanedValue.split("/");
    return new Date(`${year}-${month}-${day}T${normalizedTime || "00:00"}`);
  }

  const fallbackDate = new Date(cleanedValue);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function stripHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getGreeting(now) {
  const hour = now.getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function getRelativeDayLabel(targetDate, now = new Date()) {
  if (!targetDate) return "";

  const startOfNow = new Date(now);
  startOfNow.setHours(0, 0, 0, 0);

  const startOfTarget = new Date(targetDate);
  startOfTarget.setHours(0, 0, 0, 0);

  const diffDays = Math.round((startOfTarget - startOfNow) / DAY_IN_MS);

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Ngày mai";
  if (diffDays === -1) return "Hôm qua";
  if (diffDays > 1) return `${diffDays} ngày nữa`;
  return `${Math.abs(diffDays)} ngày trước`;
}

function formatDisplayDate(value, options) {
  if (!value) return "";
  return value.toLocaleDateString(
    "vi-VN",
    options ?? { weekday: "long", day: "numeric", month: "long" },
  );
}

function loadDashboardSnapshot() {
  const now = new Date();
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const currentWeek = getCurrentSemesterWeek();
  const currentDayId = getCurrentScheduleDayId(now);
  const currentTimeSlotInfo = getCurrentTimeSlotInfo(now);

  const scheduleData = readJsonStorage(SCHEDULE_STORAGE_KEY, []);
  const examSchedule = readJsonStorage(EXAM_STORAGE_KEY, []);
  const deadlinesData = readJsonStorage(DEADLINES_STORAGE_KEY, null);
  const conversationsData = readJsonStorage(CONVERSATIONS_STORAGE_KEY, null);
  const roadmapSemesters = readJsonStorage(ROADMAP_STORAGE_KEY, []);
  const gpaDetails = readJsonStorage(GPA_DETAILS_STORAGE_KEY, []);
  const tasks = readJsonStorage(TASKS_STORAGE_KEY, []);

  const todayClasses = scheduleData
    .filter((course) => {
      const matchesWeek = Array.isArray(course.weeks)
        ? course.weeks.includes(currentWeek)
        : true;
      return matchesWeek && course.day === currentDayId && Number(course.startPeriod) > 0;
    })
    .sort((left, right) => Number(left.startPeriod) - Number(right.startPeriod));

  const currentClass = currentTimeSlotInfo
    ? todayClasses.find((course) => (
        currentTimeSlotInfo.id >= Number(course.startPeriod)
        && currentTimeSlotInfo.id <= Number(course.endPeriod)
      ))
    : null;

  const nextClass = todayClasses.find((course) => {
    const { startTime } = getCourseTimeRange(course);
    const parsedStart = parseDateTime(now.toISOString().slice(0, 10), startTime);
    return parsedStart && parsedStart.getTime() > now.getTime();
  }) ?? null;

  const deadlineEvents = [
    ...((deadlinesData?.deadlines || []).map((event) => ({ ...event, bucket: "deadline" }))),
    ...((deadlinesData?.upcoming || []).map((event) => ({ ...event, bucket: "upcoming" }))),
  ]
    .map((event) => {
      const eventDate =
        (event.dayTimestamp ? new Date(event.dayTimestamp * 1000) : null)
        ?? parseDateTime(event.date);

      return {
        ...event,
        eventDate,
      };
    })
    .filter((event) => event.eventDate && event.eventDate.getTime() >= now.getTime() - DAY_IN_MS)
    .sort((left, right) => left.eventDate - right.eventDate);

  const urgentDeadlinesCount = deadlineEvents.filter((event) => {
    const timestamp = event.dayTimestamp ?? Math.floor(event.eventDate.getTime() / 1000);
    return timestamp >= nowSeconds && timestamp - nowSeconds <= (3 * DAY_IN_SECONDS);
  }).length;

  const upcomingExams = examSchedule
    .map((exam) => ({
      ...exam,
      examDate: parseDateTime(exam.NGAYTHI, exam.GIOBD),
    }))
    .filter((exam) => exam.examDate && exam.examDate.getTime() >= now.getTime() - DAY_IN_MS)
    .sort((left, right) => left.examDate - right.examDate);

  const populatedSemesters = roadmapSemesters.filter((semester) => (
    (semester?.courses?.length ?? 0) > 0
    || Boolean(semester?.note?.trim?.())
  ));

  const totalPlannedCourses = populatedSemesters.reduce(
    (total, semester) => total + (semester.courses?.length ?? 0),
    0,
  );
  const totalPlannedCredits = populatedSemesters.reduce(
    (total, semester) => (
      total + (semester.courses || []).reduce(
        (creditsTotal, course) => creditsTotal + (parseInt(course.credits, 10) || 0),
        0,
      )
    ),
    0,
  );
  const roadmapGoal = populatedSemesters
    .map((semester) => ({
      semester,
      gpa: calculateSemesterGpa(semester.courses || []),
    }))
    .find((item) => item.gpa);

  const gpaSnapshot = calculatePreciseCurrentGpa(gpaDetails);

  const openTasks = tasks.filter((task) => task.status !== "done");
  const dueSoonTasks = openTasks.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = parseDateTime(task.dueDate);
    if (!taskDate) return false;
    const diff = taskDate.getTime() - now.getTime();
    return diff >= -DAY_IN_MS && diff <= (3 * DAY_IN_MS);
  });
  const upcomingTasks = openTasks
    .map((task) => ({
      ...task,
      dueDateValue: parseDateTime(task.dueDate),
    }))
    .filter((task) => task.dueDateValue)
    .sort((left, right) => left.dueDateValue - right.dueDateValue);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const conversations = conversationsData?.conversations || [];
  const latestConversation = [...conversations]
    .sort((left, right) => {
      const leftTime = Number(left.messages?.[0]?.timecreated || 0);
      const rightTime = Number(right.messages?.[0]?.timecreated || 0);
      return rightTime - leftTime;
    })[0] ?? null;

  return {
    generatedAt: now,
    greeting: getGreeting(now),
    heroDateLabel: formatDisplayDate(now),
    shortDateLabel: formatDisplayDate(now, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }),
    stats: {
      classesToday: todayClasses.length,
      urgentDeadlines: urgentDeadlinesCount,
      upcomingExams: upcomingExams.filter(
        (exam) => exam.examDate.getTime() - now.getTime() <= 14 * DAY_IN_MS,
      ).length,
      taskCompletionRate: completionRate,
    },
    schedule: {
      hasData: scheduleData.length > 0,
      currentWeek,
      todayClasses,
      currentClass,
      nextClass,
    },
    deadlines: {
      hasData: Boolean(deadlinesData),
      items: deadlineEvents.slice(0, 4),
      urgentCount: urgentDeadlinesCount,
      totalCount: deadlineEvents.length,
    },
    exams: {
      hasData: examSchedule.length > 0,
      items: upcomingExams.slice(0, 4),
      nextExam: upcomingExams[0] ?? null,
    },
    roadmap: {
      hasData: roadmapSemesters.length > 0,
      semesterCount: populatedSemesters.length,
      totalCourses: totalPlannedCourses,
      totalCredits: totalPlannedCredits,
      goal: roadmapGoal
        ? {
            semesterName: roadmapGoal.semester.name,
            gpa10: roadmapGoal.gpa.gpa10,
            gpa4: roadmapGoal.gpa.gpa4,
          }
        : null,
    },
    gpa: {
      hasData: gpaDetails.length > 0,
      snapshot: gpaSnapshot,
    },
    tasks: {
      hasData: tasks.length > 0,
      completionRate,
      dueSoonCount: dueSoonTasks.length,
      items: upcomingTasks.slice(0, 3),
    },
    messages: {
      hasData: conversations.length > 0,
      unreadCount: conversations.filter((conversation) => !conversation.isread).length,
      totalCount: conversations.length,
      latest: latestConversation
        ? {
            id: latestConversation.id,
            sender: latestConversation.members?.[0]?.fullname || "Không rõ",
            preview: stripHtml(latestConversation.messages?.[0]?.text || ""),
            timeLabel: latestConversation.messages?.[0]?.timecreated
              ? getRelativeDayLabel(
                  new Date(Number(latestConversation.messages[0].timecreated) * 1000),
                  now,
                )
              : "",
          }
        : null,
    },
  };
}

export function useDashboardOverview() {
  const [snapshot, setSnapshot] = useState(() => loadDashboardSnapshot());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);

  const refresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }

    setIsRefreshing(true);
    setSnapshot(loadDashboardSnapshot());

    refreshTimerRef.current = window.setTimeout(() => {
      setIsRefreshing(false);
      refreshTimerRef.current = null;
    }, 650);
  }, []);

  useEffect(() => {
    const handleFocus = () => refresh();
    const handleStorage = () => refresh();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("kanbanTasksChanged", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("kanbanTasksChanged", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    snapshot,
    refresh,
    isRefreshing,
  };
}
