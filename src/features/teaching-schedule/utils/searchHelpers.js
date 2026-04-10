import { campusOptions, dayNames, tietTimeMap } from "../constants/searchConfig";

export const getTietTimeRange = (tietArray) => {
  if (!tietArray || tietArray.length === 0) return "";

  const sortedTiets = [...tietArray].sort((a, b) => a - b);
  const firstTiet = sortedTiets[0];
  const lastTiet = sortedTiets[sortedTiets.length - 1];
  const startTime = tietTimeMap[firstTiet]?.start || "";
  const endTime = tietTimeMap[lastTiet]?.end || "";

  return startTime && endTime ? `${startTime}-${endTime}` : "";
};

export const removeVietnameseAccents = (value) => {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

export const smartVietnameseMatch = (text, query) => {
  if (!text || !query) return false;

  const textNorm = removeVietnameseAccents(text);
  const queryNorm = removeVietnameseAccents(query.trim());

  if (!queryNorm) return true;
  if (textNorm.includes(queryNorm)) return true;

  const words = textNorm.split(/\s+/);
  const acronym = words.map((word) => word[0]).join("");
  if (acronym.includes(queryNorm)) return true;

  const queryWords = queryNorm.split(/\s+/);
  const allWordsMatch = queryWords.every((queryWord) =>
    words.some((word) => word.startsWith(queryWord))
  );
  if (allWordsMatch && queryWords.length > 0) return true;

  const phoneticMap = {
    z: "d",
    gi: "d",
    r: "z",
    k: "c",
    q: "k",
    f: "ph",
    ph: "f",
    kh: "h",
  };

  let phoneticQuery = queryNorm;
  Object.entries(phoneticMap).forEach(([from, to]) => {
    phoneticQuery = phoneticQuery.replace(new RegExp(from, "g"), to);
  });

  return phoneticQuery !== queryNorm && textNorm.includes(phoneticQuery);
};

export const matchesResultsQuery = (fields, query) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  return fields.some((field) => {
    if (field === null || field === undefined) return false;

    const value = String(field).trim();
    if (!value) return false;

    return smartVietnameseMatch(value, trimmedQuery);
  });
};

export const filterSubjects = (subjects, query) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return subjects
    .filter((subject) => {
      if (subject.id.toLowerCase().includes(trimmedQuery.toLowerCase())) return true;
      return smartVietnameseMatch(subject.name, trimmedQuery);
    })
    .slice(0, 10);
};

export const filterLecturers = (lecturers, query) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return lecturers.filter((lecturer) => smartVietnameseMatch(lecturer.name, trimmedQuery)).slice(0, 10);
};

export const getSelectedCampusMeta = (selectedCampus) =>
  campusOptions.find((campus) => campus.value === selectedCampus) ?? campusOptions[0];

export const getSelectedTietSummary = (selectedTiet) =>
  selectedTiet.length > 0 ? `Tiết ${selectedTiet.join(", ")}` : "Tất cả tiết";

export const getSelectedTietRange = (selectedTiet) =>
  selectedTiet.length > 0
    ? `${tietTimeMap[selectedTiet[0]]?.start} - ${tietTimeMap[selectedTiet[selectedTiet.length - 1]]?.end}`
    : "Không giới hạn khung giờ";

export const filterTimeResults = (timeResults, resultsQuery) =>
  timeResults.filter((item) =>
    matchesResultsQuery(
      [
        item.maMonHoc,
        item.tenMonHoc,
        item.group,
        item.giangVien,
        item.email,
        item.siso,
        ...(item.classInfo ?? []).flatMap((classInfo) => [
          classInfo.phong,
          `Tiết ${classInfo.tietHoc?.join("-")}`,
          getTietTimeRange(classInfo.tietHoc),
        ]),
      ],
      resultsQuery
    )
  );

export const filterSearchResults = (searchResults, resultsQuery) =>
  searchResults.filter((result) =>
    matchesResultsQuery(
      [
        result.maMonHoc,
        result.tenMonHoc,
        result.soTinChi,
        ...(result.lichHoc ?? []).flatMap((lichHoc) => [
          lichHoc.group,
          lichHoc.giangVien,
          lichHoc.email,
          lichHoc.phone,
          lichHoc.giangVienBT,
          lichHoc.emailBT,
          lichHoc.siso,
          lichHoc.ngonNgu,
          ...(lichHoc.classInfo ?? []).flatMap((classInfo) => [
            dayNames[classInfo.dayOfWeek] || classInfo.dayOfWeek,
            `Tiết ${classInfo.tietHoc?.join("-")}`,
            getTietTimeRange(classInfo.tietHoc),
            classInfo.phong,
            classInfo.coSo,
          ]),
        ]),
      ],
      resultsQuery
    )
  );

export const buildTimeResultSearchFields = (item) => [
  item.maMonHoc,
  item.tenMonHoc,
  item.group,
  item.giangVien,
  item.email,
  item.siso,
  ...(item.classInfo ?? []).flatMap((classInfo) => [
    classInfo.phong,
    `Tiết ${classInfo.tietHoc?.join("-")}`,
    getTietTimeRange(classInfo.tietHoc),
  ]),
];

export const buildSearchResultFields = (result) => [
  result.maMonHoc,
  result.tenMonHoc,
  result.soTinChi,
  ...(result.lichHoc ?? []).flatMap((lichHoc) => [
    lichHoc.group,
    lichHoc.giangVien,
    lichHoc.email,
    lichHoc.phone,
    lichHoc.giangVienBT,
    lichHoc.emailBT,
    lichHoc.siso,
    lichHoc.ngonNgu,
    ...(lichHoc.classInfo ?? []).flatMap((classInfo) => [
      dayNames[classInfo.dayOfWeek] || classInfo.dayOfWeek,
      `Tiết ${classInfo.tietHoc?.join("-")}`,
      getTietTimeRange(classInfo.tietHoc),
      classInfo.phong,
      classInfo.coSo,
    ]),
  ]),
];

export const filterIndexedResults = (indexedItems, resultsQuery) =>
  indexedItems
    .filter(({ searchableFields }) => matchesResultsQuery(searchableFields, resultsQuery))
    .map(({ item }) => item);
