export const getTeacherLabel = (course) => {
  if (!course?.teacher) return "";

  const normalizedTeacher = course.teacher.trim();
  if (!normalizedTeacher || normalizedTeacher === "Chưa biết chưa biết") {
    return "";
  }

  return normalizedTeacher;
};

export const getClassSizeLabel = (course) => {
  const candidates = [
    course?.classSize,
    course?.memberCount,
    course?.studentCount,
    course?._raw?.classSize,
    course?._raw?.memberCount,
    course?._raw?.studentCount,
    course?._raw?.numberOfStudents,
    course?._raw?.numOfStudents,
    course?._raw?.subjectClassGroup?.numberOfStudents,
    course?._raw?.subjectClassGroup?.studentCount,
    course?._raw?.subjectClassGroup?.classSize,
  ];

  const classSize = candidates.find((value) => {
    if (typeof value === "number") return Number.isFinite(value) && value > 0;
    if (typeof value === "string") return value.trim() !== "";
    return false;
  });

  if (classSize === undefined) return "";
  return typeof classSize === "number" ? `${classSize} sinh viên` : classSize;
};

export const getWeekLabel = (weekNum) => `Tuần ${String(weekNum).padStart(2, "0")}`;
