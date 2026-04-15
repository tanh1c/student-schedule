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

export function calculateSemesterGpa(courses) {
    let totalCredits = 0;
    let totalScore10 = 0;
    let totalScore4 = 0;
    let validCourses = 0;

    courses.forEach((course) => {
        const credits = parseInt(course.credits, 10) || 0;
        const aim = parseFloat(course.aim);

        if (credits > 0 && !Number.isNaN(aim) && aim >= 0 && aim <= 10) {
            totalCredits += credits;
            totalScore10 += aim * credits;
            totalScore4 += convertToGpa4(aim) * credits;
            validCourses += 1;
        }
    });

    if (totalCredits === 0) return null;

    return {
        gpa10: (totalScore10 / totalCredits).toFixed(2),
        gpa4: (totalScore4 / totalCredits).toFixed(2),
        validCourses
    };
}
