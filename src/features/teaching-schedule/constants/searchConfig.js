export const API_BASE = "/api";

export const dayNames = {
  0: "CN",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

export const dayShortNames = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
};

export const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export const tietTimeMap = {
  1: { start: "06:00", end: "06:50" },
  2: { start: "07:00", end: "07:50" },
  3: { start: "08:00", end: "08:50" },
  4: { start: "09:00", end: "09:50" },
  5: { start: "10:00", end: "10:50" },
  6: { start: "11:00", end: "11:50" },
  7: { start: "12:00", end: "12:50" },
  8: { start: "13:00", end: "13:50" },
  9: { start: "14:00", end: "14:50" },
  10: { start: "15:00", end: "15:50" },
  11: { start: "16:00", end: "16:50" },
  12: { start: "17:00", end: "17:50" },
  13: { start: "18:00", end: "18:50" },
  14: { start: "18:50", end: "19:40" },
  15: { start: "19:40", end: "20:30" },
  16: { start: "20:30", end: "21:10" },
};

export const tietGroups = [
  { label: "Sáng", tiets: [1, 2, 3, 4, 5, 6], timeRange: "06:00 - 11:50" },
  { label: "Chiều", tiets: [7, 8, 9, 10, 11, 12], timeRange: "12:00 - 17:50" },
  { label: "Tối", tiets: [13, 14, 15, 16], timeRange: "18:00 - 21:10" },
];

export const allTietOptions = Array.from({ length: 16 }, (_, index) => index + 1);

export const campusOptions = [
  { value: "", label: "Tất cả cơ sở", helper: "Không giới hạn tòa nhà" },
  { value: "1", label: "CS1 (A, B, C)", helper: "Tòa A1-A5, B1-B12, C1-C6" },
  { value: "2", label: "CS2 (H)", helper: "Tòa H1-H6" },
];
