import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  campusOptions,
  dayNames,
  tietTimeMap,
} from "../constants/searchConfig";
import {
  browseTeachingScheduleByTime,
  fetchTeachingBootstrapData,
  searchTeachingByCourseCode,
  searchTeachingByLecturerName,
} from "../services/teachingScheduleApi";
import {
  buildSearchResultFields,
  buildTimeResultSearchFields,
  filterLecturers,
  filterIndexedResults,
  filterSubjects,
  getSelectedCampusMeta,
  getSelectedTietRange,
  getSelectedTietSummary,
} from "../utils/searchHelpers";

export function useTeachingScheduleSearch() {
  const [searchTab, setSearchTab] = useState("code");
  const [courseCode, setCourseCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [timeResults, setTimeResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTiet, setSelectedTiet] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [strictTietFilter, setStrictTietFilter] = useState(false);
  const [resultsQuery, setResultsQuery] = useState("");
  const [allSubjects, setAllSubjects] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const deferredResultsQuery = useDeferredValue(resultsQuery);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoadingData(true);

      try {
        const data = await fetchTeachingBootstrapData();
        if (!isMounted) return;
        setAllSubjects(data.subjects);
        setAllLecturers(data.lecturers);
      } catch (fetchError) {
        console.error("Error loading teaching schedule bootstrap data:", fetchError);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab) => {
    setSearchTab(tab);
    setError(null);
    setShowSuggestions(false);
    setResultsQuery("");
  };

  const runSearch = async (executor, emptyMessage) => {
    setLoading(true);
    setError(null);

    try {
      const data = await executor();
      if (data.length === 0) {
        setError(emptyMessage);
      }
      setResultsQuery("");
      return data;
    } catch (requestError) {
      console.error("Teaching schedule search failed:", requestError);
      setError("Lỗi kết nối server");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchByCode = async () => {
    if (!courseCode.trim()) return;

    const data = await runSearch(
      () => searchTeachingByCourseCode(courseCode),
      "Không tìm thấy môn học"
    );

    if (data) {
      setSearchResults(data);
    }
  };

  const searchByLecturer = async () => {
    if (!lecturerName.trim()) return;

    const data = await runSearch(
      () => searchTeachingByLecturerName(lecturerName),
      "Không tìm thấy giảng viên"
    );

    if (data) {
      setSearchResults(data);
    }
  };

  const searchByTime = async () => {
    if (selectedDay === null) return;

    const data = await runSearch(
      () =>
        browseTeachingScheduleByTime({
          selectedDay,
          selectedTiet,
          selectedCampus,
          strictTietFilter,
        }),
      "Không tìm thấy lớp học nào trong thời gian đã chọn"
    );

    if (data) {
      setTimeResults(data);
    }
  };

  const handleLookupKeyDown = (event) => {
    if (event.key !== "Enter") return;

    if (searchTab === "code") {
      searchByCode();
      return;
    }

    if (searchTab === "lecturer") {
      searchByLecturer();
    }
  };

  const toggleTiet = (tiet) => {
    setSelectedTiet((previousTiet) =>
      previousTiet.includes(tiet)
        ? previousTiet.filter((value) => value !== tiet)
        : [...previousTiet, tiet].sort((a, b) => a - b)
    );
  };

  const resetTimeFilters = () => {
    setSelectedDay(null);
    setSelectedTiet([]);
    setSelectedCampus("");
    setStrictTietFilter(false);
  };

  const filteredSubjects = useMemo(
    () => filterSubjects(allSubjects, courseCode),
    [allSubjects, courseCode]
  );

  const filteredLecturers = useMemo(
    () => filterLecturers(allLecturers, lecturerName),
    [allLecturers, lecturerName]
  );

  const selectedCampusMeta = useMemo(
    () => getSelectedCampusMeta(selectedCampus),
    [selectedCampus]
  );

  const selectedTietSummary = useMemo(
    () => getSelectedTietSummary(selectedTiet),
    [selectedTiet]
  );

  const selectedTietRange = useMemo(
    () => getSelectedTietRange(selectedTiet),
    [selectedTiet]
  );

  const indexedTimeResults = useMemo(
    () =>
      timeResults.map((item) => ({
        item,
        searchableFields: buildTimeResultSearchFields(item),
      })),
    [timeResults]
  );

  const indexedSearchResults = useMemo(
    () =>
      searchResults.map((item) => ({
        item,
        searchableFields: buildSearchResultFields(item),
      })),
    [searchResults]
  );

  const filteredTimeResults = useMemo(
    () => filterIndexedResults(indexedTimeResults, deferredResultsQuery),
    [indexedTimeResults, deferredResultsQuery]
  );

  const filteredSearchResults = useMemo(
    () => filterIndexedResults(indexedSearchResults, deferredResultsQuery),
    [indexedSearchResults, deferredResultsQuery]
  );

  const totalResultsCount = searchTab === "time" ? timeResults.length : searchResults.length;
  const visibleResultsCount =
    searchTab === "time" ? filteredTimeResults.length : filteredSearchResults.length;

  return {
    searchTab,
    setSearchTab: handleTabChange,
    courseCode,
    setCourseCode,
    lecturerName,
    setLecturerName,
    searchResults,
    timeResults,
    loading,
    loadingData,
    error,
    setError,
    selectedDay,
    setSelectedDay,
    selectedTiet,
    setSelectedTiet,
    toggleTiet,
    selectedCampus,
    setSelectedCampus,
    strictTietFilter,
    setStrictTietFilter,
    resultsQuery,
    setResultsQuery,
    isResultsFilterPending: resultsQuery !== deferredResultsQuery,
    showSuggestions,
    setShowSuggestions,
    filteredSubjects,
    filteredLecturers,
    selectedCampusMeta,
    selectedTietSummary,
    selectedTietRange,
    filteredTimeResults,
    filteredSearchResults,
    totalResultsCount,
    visibleResultsCount,
    hasServerResults: totalResultsCount > 0,
    hasFilteredResults: visibleResultsCount > 0,
    resultsFilterPlaceholder:
      searchTab === "time"
        ? "Lọc theo môn, giảng viên, phòng, nhóm hoặc tiết..."
        : "Lọc theo mã môn, tên môn, giảng viên, nhóm hoặc phòng...",
    searchByCode,
    searchByLecturer,
    searchByTime,
    handleLookupKeyDown,
    resetTimeFilters,
    campusOptions,
    dayNames,
    tietTimeMap,
  };
}
