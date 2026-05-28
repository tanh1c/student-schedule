function normalizeDay(day) {
    const text = String(day || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const match = text.match(/(?:thu|thứ)\s*(\d+)/i) || text.match(/\b(2|3|4|5|6|7|8|cn|chu nhat)\b/i);
    if (!match) return text.trim();
    const value = match[1];
    return value === "cn" || value === "chu nhat" ? "8" : value;
}

function parseTimeSlots(timeSlots) {
    return String(timeSlots || "")
        .match(/\d+/g)
        ?.map(Number)
        .filter((slot) => Number.isFinite(slot)) || [];
}

function hasOverlap(firstSlots, secondSlots) {
    const secondSet = new Set(secondSlots);
    return firstSlots.some((slot) => secondSet.has(slot));
}

function getPrimaryChoices(template) {
    return (template?.courses || [])
        .map((course) => {
            const priority = course.priority?.[0];
            if (!priority) return null;
            return {
                courseCode: course.code,
                courseName: course.name,
                groupCode: priority.groupCode || priority.ltGroup || "Nhóm",
                nlmhId: priority.nlmhId,
                schedules: priority.schedules || []
            };
        })
        .filter(Boolean);
}

export function findTemplateScheduleConflicts(template) {
    const choices = getPrimaryChoices(template);
    const conflicts = [];

    for (let firstIndex = 0; firstIndex < choices.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < choices.length; secondIndex += 1) {
            const firstChoice = choices[firstIndex];
            const secondChoice = choices[secondIndex];

            for (const firstSchedule of firstChoice.schedules) {
                const firstDay = normalizeDay(firstSchedule.day);
                const firstSlots = parseTimeSlots(firstSchedule.timeSlots);
                if (!firstDay || firstSlots.length === 0) continue;

                for (const secondSchedule of secondChoice.schedules) {
                    const secondDay = normalizeDay(secondSchedule.day);
                    const secondSlots = parseTimeSlots(secondSchedule.timeSlots);
                    if (firstDay !== secondDay || secondSlots.length === 0) continue;
                    if (!hasOverlap(firstSlots, secondSlots)) continue;

                    conflicts.push({
                        first: firstChoice,
                        second: secondChoice,
                        day: firstSchedule.day || secondSchedule.day,
                        timeSlots: firstSlots.filter((slot) => secondSlots.includes(slot)).join(", ")
                    });
                }
            }
        }
    }

    return conflicts;
}

export function templateChoiceHasConflict(conflicts, course, priority) {
    const courseCode = course?.code;
    const nlmhId = String(priority?.nlmhId || "");

    return conflicts.some((conflict) => [conflict.first, conflict.second].some((choice) => (
        choice.courseCode === courseCode && String(choice.nlmhId || "") === nlmhId
    )));
}
