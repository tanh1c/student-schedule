import mybkApi from "@/services/mybkApi";
import { getDeadlines, getMessages, initLmsSession } from "@/services/lmsApi";
import { dispatchMybkWorkspaceSync } from "@shared/constants/mybkAuth";

const WARMUP_STATE_KEY = "mybk_workspace_warmup_state";
const WARMUP_TTL = 15 * 60 * 1000;
const DEFAULT_DEADLINE_MONTHS = 3;

let warmupPromise = null;

function readJsonStorage(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentSemesterCode(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 8) {
    return `${year}1`;
  }

  if (month <= 1) {
    return `${year - 1}1`;
  }

  return `${year - 1}2`;
}

function getCurrentSemesterWeek(now = new Date()) {
  const year = now.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay();
  const daysToMonday = jan1Day === 0 ? -6 : 1 - jan1Day;
  const week1Monday = new Date(year, 0, 1 + daysToMonday);
  const diffDays = Math.floor((now - week1Monday) / (24 * 60 * 60 * 1000));
  return Math.floor(diffDays / 7) + 1;
}

function getExamTermFromSemesterCode(semesterCode) {
  const normalizedCode = String(semesterCode || getCurrentSemesterCode());
  return {
    year: Number(normalizedCode.slice(0, 4)) || new Date().getFullYear(),
    semester: Number(normalizedCode.slice(4)) || 1,
  };
}

function getStudentId(studentInfo) {
  return studentInfo?.id || studentInfo?.data?.id || studentInfo?.code || "";
}

function getStudentCode(studentInfo) {
  return (
    studentInfo?.code
    || studentInfo?.MSSV
    || studentInfo?.mssv
    || studentInfo?.data?.code
    || studentInfo?.studentId
    || getStudentId(studentInfo)
    || ""
  );
}

function hasUsableWorkspaceCache() {
  const scheduleData = readJsonStorage("scheduleData", []);
  const examSchedule = readJsonStorage("examSchedule", []);
  const gpaDetails = readJsonStorage("mybk_gpa_details", []);
  const deadlines = readJsonStorage("lms_cache_deadlines", null);
  const conversations = readJsonStorage("lms_cache_conversations", null);

  return (
    Array.isArray(scheduleData) && scheduleData.length > 0
    && Array.isArray(examSchedule) && examSchedule.length > 0
    && Array.isArray(gpaDetails) && gpaDetails.length > 0
    && Boolean(deadlines)
    && Boolean(conversations)
  );
}

function shouldSkipWarmup({ force, token }) {
  if (force || !token) {
    return false;
  }

  const warmupState = readJsonStorage(WARMUP_STATE_KEY, null);
  if (!warmupState || warmupState.token !== token) {
    return false;
  }

  const isRecent = Date.now() - Number(warmupState.completedAt || 0) < WARMUP_TTL;
  return isRecent && (warmupState.success || hasUsableWorkspaceCache());
}

function emitWarmupUpdate(detail) {
  dispatchMybkWorkspaceSync({
    source: "mybk-workspace-warmup",
    ...detail,
  });
}

async function runWarmupTask(taskName, task) {
  emitWarmupUpdate({ status: "running", task: taskName });

  try {
    const result = await task();
    emitWarmupUpdate({ status: "success", task: taskName });
    return { task: taskName, success: true, result };
  } catch (error) {
    console.warn(`[MyBK warmup] ${taskName} failed:`, error);
    emitWarmupUpdate({
      status: "error",
      task: taskName,
      error: error?.message || "Không thể đồng bộ",
    });
    return { task: taskName, success: false, error: error?.message || "Không thể đồng bộ" };
  }
}

async function warmSchedule(studentInfo, semesterCode) {
  const studentId = getStudentId(studentInfo);
  if (!studentId) {
    throw new Error("Không tìm thấy mã sinh viên để tải thời khóa biểu");
  }

  const result = await mybkApi.getSchedule(studentId, semesterCode);
  if (!result.success) {
    throw new Error(result.error || "Không thể tải thời khóa biểu");
  }

  const transformedData = mybkApi.transformScheduleData(result.data);
  if (Array.isArray(transformedData) && transformedData.length > 0) {
    writeJsonStorage("scheduleData", transformedData);
    writeJsonStorage("selectedWeek", getCurrentSemesterWeek());
  }

  return transformedData;
}

async function warmExamSchedule(studentInfo, semesterCode) {
  const studentCode = getStudentCode(studentInfo);
  if (!studentCode) {
    throw new Error("Không tìm thấy MSSV để tải lịch thi");
  }

  const { year, semester } = getExamTermFromSemesterCode(semesterCode);
  const result = await mybkApi.getExamSchedule(studentCode, year, semester);
  if (!result.success) {
    throw new Error(result.error || "Không thể tải lịch thi");
  }

  const sortedExams = (result.data || []).sort((left, right) => (
    new Date(left.NGAYTHI) - new Date(right.NGAYTHI)
  ));

  writeJsonStorage("examSchedule", sortedExams);
  window.localStorage.setItem("examSelectedYear", String(year));
  window.localStorage.setItem("examSelectedSemester", String(semester));
  window.localStorage.setItem("examLastFetchKey", `${studentCode}-${year}-${semester}`);

  return sortedExams;
}

async function warmGpa(studentInfo) {
  const studentId = getStudentId(studentInfo);
  if (!studentId) {
    throw new Error("Không tìm thấy mã sinh viên để tải GPA");
  }

  const [summaryResult, detailResult] = await Promise.all([
    mybkApi.getGpaSummary(studentId),
    mybkApi.getGpaDetail(studentId),
  ]);

  if (summaryResult.success) {
    writeJsonStorage("mybk_gpa_summary", summaryResult.data);
  }

  if (detailResult.success && Array.isArray(detailResult.data)) {
    writeJsonStorage("mybk_gpa_details", detailResult.data);
  } else if (!detailResult.success) {
    throw new Error(detailResult.error || "Không thể tải chi tiết GPA");
  }

  return {
    summary: summaryResult.success,
    detailCount: Array.isArray(detailResult.data) ? detailResult.data.length : 0,
  };
}

async function warmLms() {
  const initResult = await initLmsSession();
  if (!initResult.success) {
    throw new Error(initResult.error || "Không thể kết nối LMS");
  }

  const [deadlinesResult, messagesResult] = await Promise.all([
    getDeadlines({ months: DEFAULT_DEADLINE_MONTHS, forceRefresh: true }),
    getMessages({ type: 1, limit: 50, offset: 0, forceRefresh: true }),
  ]);

  if (!deadlinesResult.success && !messagesResult.success) {
    throw new Error(deadlinesResult.error || messagesResult.error || "Không thể tải LMS");
  }

  return {
    deadlines: deadlinesResult.success,
    messages: messagesResult.success,
  };
}

export async function warmMybkWorkspaceData(options = {}) {
  const { force = false, reason = "login" } = options;
  const token = mybkApi.getAuthToken();

  if (!token) {
    return { skipped: true, reason: "not-authenticated" };
  }

  if (warmupPromise) {
    return warmupPromise;
  }

  if (shouldSkipWarmup({ force, token })) {
    emitWarmupUpdate({ status: "skipped", reason: "fresh-cache" });
    return { skipped: true, reason: "fresh-cache" };
  }

  warmupPromise = (async () => {
    emitWarmupUpdate({ status: "started", reason });

    const semesterCode = getCurrentSemesterCode();
    const studentResult = await runWarmupTask("student-info", async () => {
      const result = await mybkApi.getStudentInfo(force);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Không thể tải thông tin sinh viên");
      }
      return result.data;
    });

    if (!studentResult.success) {
      emitWarmupUpdate({ status: "finished", success: false });
      return { success: false, results: [studentResult] };
    }

    const studentInfo = studentResult.result;
    const results = [
      studentResult,
      await runWarmupTask("schedule", () => warmSchedule(studentInfo, semesterCode)),
      await runWarmupTask("exam", () => warmExamSchedule(studentInfo, semesterCode)),
      await runWarmupTask("gpa", () => warmGpa(studentInfo)),
      await runWarmupTask("lms", () => warmLms()),
    ];

    const successCount = results.filter((result) => result.success).length;
    const success = successCount > 1;

    writeJsonStorage(WARMUP_STATE_KEY, {
      token,
      semesterCode,
      completedAt: Date.now(),
      success,
      successCount,
      totalCount: results.length,
    });

    emitWarmupUpdate({ status: "finished", success, successCount, totalCount: results.length });
    return { success, results };
  })();

  try {
    return await warmupPromise;
  } finally {
    warmupPromise = null;
  }
}
