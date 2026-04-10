import { API_BASE } from "../constants/searchConfig";

const parseJsonResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchTeachingBootstrapData = async () => {
  const [subjectsResponse, lecturersResponse] = await Promise.all([
    fetch(`${API_BASE}/lecturer/subjects`),
    fetch(`${API_BASE}/lecturer/list`),
  ]);

  const [subjects, lecturers] = await Promise.all([
    subjectsResponse.ok ? subjectsResponse.json() : [],
    lecturersResponse.ok ? lecturersResponse.json() : [],
  ]);

  return {
    subjects: Array.isArray(subjects) ? subjects : [],
    lecturers: Array.isArray(lecturers) ? lecturers : [],
  };
};

export const searchTeachingByCourseCode = async (courseCode) => {
  let searchId = courseCode.trim();
  if (searchId.includes(" - ")) {
    searchId = searchId.split(" - ")[0].trim();
  }

  return parseJsonResponse(
    await fetch(`${API_BASE}/lecturer/search?id=${encodeURIComponent(searchId)}`)
  );
};

export const searchTeachingByLecturerName = async (lecturerName) =>
  parseJsonResponse(
    await fetch(`${API_BASE}/lecturer/search?gv=${encodeURIComponent(lecturerName.trim())}`)
  );

export const browseTeachingScheduleByTime = async ({
  selectedDay,
  selectedTiet,
  selectedCampus,
  strictTietFilter,
}) => {
  let url = `${API_BASE}/lecturer/browse-schedule?day=${selectedDay}`;

  if (selectedTiet.length > 0) {
    url += `&tiet=${selectedTiet.join(",")}`;
  }

  if (selectedCampus) {
    url += `&campus=${encodeURIComponent(selectedCampus)}`;
  }

  if (strictTietFilter) {
    url += "&strict=true";
  }

  return parseJsonResponse(await fetch(url));
};
