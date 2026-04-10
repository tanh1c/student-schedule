export function convertToGpa4(score10) {
  const score = parseFloat(score10);
  if (Number.isNaN(score)) return 0;
  if (score >= 8.5) return 4.0;
  if (score >= 8.0) return 3.5;
  if (score >= 7.0) return 3.0;
  if (score >= 6.5) return 2.5;
  if (score >= 5.5) return 2.0;
  if (score >= 5.0) return 1.5;
  if (score >= 4.0) return 1.0;
  return 0.0;
}

export function getLetterGrade(score10) {
  const score = parseFloat(score10);
  if (Number.isNaN(score)) return "";
  if (score >= 9.5) return "A+";
  if (score >= 8.5) return "A";
  if (score >= 8.0) return "B+";
  if (score >= 7.0) return "B";
  if (score >= 6.5) return "C+";
  if (score >= 5.5) return "C";
  if (score >= 5.0) return "D+";
  if (score >= 4.0) return "D";
  return "F";
}

export function getGradeColor(grade) {
  const upper = String(grade).toUpperCase();
  if (upper === "A+" || upper === "A") return "text-emerald-600 dark:text-emerald-400";
  if (upper === "B+" || upper === "B") return "text-blue-600 dark:text-blue-400";
  if (upper === "C+" || upper === "C") return "text-amber-600 dark:text-amber-400";
  if (upper === "D+" || upper === "D") return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function calculatePreciseCurrentGpa(rawDetails) {
  if (!rawDetails || rawDetails.length === 0) return null;

  let totalGpaCredits = 0;
  let totalScore10 = 0;
  let totalScore4 = 0;
  let totalAccumulatedCredits = 0;

  rawDetails.forEach((item) => {
    const credits = parseFloat(item.sotc) || 0;
    if (!item.mamonhoc || credits === 0) return;

    if (item.diemso && item.diemso !== "--" && !Number.isNaN(parseFloat(item.diemso))) {
      const score10 = parseFloat(item.diemso);

      if (score10 >= 4.0) {
        totalAccumulatedCredits += credits;
      }

      if (score10 >= 0 && score10 <= 10) {
        totalGpaCredits += credits;
        totalScore10 += score10 * credits;
        totalScore4 += convertToGpa4(score10) * credits;
      }
    }
  });

  if (totalGpaCredits === 0) return null;

  return {
    gpa10: totalScore10 / totalGpaCredits,
    gpa4: totalScore4 / totalGpaCredits,
    accumulatedCredits: totalAccumulatedCredits,
    baseGpaCredits: totalGpaCredits,
    baseScore10: totalScore10,
    baseScore4: totalScore4,
  };
}
