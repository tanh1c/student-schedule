/**
 * Calendar Export Utility
 * Exports schedule data to iCalendar (.ics) format for Google Calendar import
 * 
 * Logic tuần: Tuần 1 = tuần chứa ngày 1/1 của năm hiện tại
 * Ví dụ: 1/1/2026 là thứ 5 => Tuần 1 bắt đầu từ thứ 2 ngày 29/12/2025
 */

// Time slots mapping (period => start/end time in HH:MM format)
const TIME_SLOTS = {
    1: { start: '06:00', end: '06:50' },
    2: { start: '07:00', end: '07:50' },
    3: { start: '08:00', end: '08:50' },
    4: { start: '09:00', end: '09:50' },
    5: { start: '10:00', end: '10:50' },
    6: { start: '11:00', end: '11:50' },
    7: { start: '12:00', end: '12:50' },
    8: { start: '13:00', end: '13:50' },
    9: { start: '14:00', end: '14:50' },
    10: { start: '15:00', end: '15:50' },
    11: { start: '16:00', end: '16:50' },
    12: { start: '17:00', end: '17:50' },
    13: { start: '18:00', end: '18:50' },
    14: { start: '18:50', end: '19:40' },
    15: { start: '19:40', end: '20:30' },
    16: { start: '20:30', end: '21:10' },
};

/**
 * Get the Monday of Week 1 for a given year
 * Week 1 = tuần chứa ngày 1/1 của năm
 * @param {number} year - Year (e.g. 2026)
 * @returns {Date} - Monday of Week 1
 */
function getWeek1Monday(year) {
    // Ngày 1/1 của năm
    const jan1 = new Date(year, 0, 1);

    // Tìm thứ của ngày 1/1 (0=CN, 1=T2, 2=T3, ..., 6=T7)
    const jan1Day = jan1.getDay();

    // Tính ngày thứ 2 của tuần chứa 1/1
    // Nếu 1/1 là CN (0), thì thứ 2 là ngày trước đó 6 ngày
    // Nếu 1/1 là T2 (1), thì thứ 2 là chính nó
    // Nếu 1/1 là T3 (2), thì thứ 2 là ngày trước đó 1 ngày
    // ...
    const daysToMonday = jan1Day === 0 ? -6 : 1 - jan1Day;

    const week1Monday = new Date(year, 0, 1 + daysToMonday);
    return week1Monday;
}

/**
 * Get the Monday of a specific week number
 * @param {number} weekNumber - Week number (1-indexed)
 * @param {number} year - Year (default: current year)
 * @returns {Date}
 */
function getWeekMonday(weekNumber, year = new Date().getFullYear()) {
    const week1Monday = getWeek1Monday(year);
    const targetMonday = new Date(week1Monday);
    targetMonday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
    return targetMonday;
}

/**
 * Format date to iCalendar format: YYYYMMDD
 */
function formatDateICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Format datetime to iCalendar format: YYYYMMDDTHHMMSS
 */
function formatDateTimeICS(date, time) {
    const [hours, minutes] = time.split(':');
    const dateStr = formatDateICS(date);
    return `${dateStr}T${hours}${minutes}00`;
}

/**
 * Generate unique ID for event
 */
function generateUID(course, weekNumber) {
    const base = `${course.code}-${course.day}-${course.startPeriod}-W${weekNumber}`;
    return `${base}@tkbsv-bk`;
}

/**
 * Escape text for iCalendar format
 * Note: In ICS, newlines in text must be escaped as \n (literal backslash + n)
 */
function escapeICS(text, preserveNewlines = false) {
    if (!text) return '';
    let escaped = text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');

    // For description, we want to convert actual newlines to \n
    if (!preserveNewlines) {
        escaped = escaped.replace(/\n/g, '\\n');
    }

    return escaped;
}

/**
 * Convert schedule data to iCalendar (.ics) format
 * @param {Array} scheduleData - Schedule data from the app
 * @param {number} year - Year to export (default: current year)
 * @returns {string} - ICS file content
 */
export function generateICS(scheduleData, year = new Date().getFullYear()) {
    if (!scheduleData || scheduleData.length === 0) {
        throw new Error('Không có dữ liệu thời khóa biểu để xuất');
    }

    const events = [];

    // Generate events for each course and each week
    scheduleData.forEach(course => {
        // Skip unscheduled courses
        if (!course.day || course.day === 0 || course.startPeriod === 0) {
            return;
        }

        const weeks = course.weeks || [];
        if (weeks.length === 0) return;

        weeks.forEach(weekNumber => {
            // Get the Monday of this week
            const weekMonday = getWeekMonday(weekNumber, year);

            // Calculate the actual date (dayOfWeek: 2=Monday, 3=Tuesday, etc.)
            const eventDate = new Date(weekMonday);
            eventDate.setDate(eventDate.getDate() + (course.day - 2)); // -2 because day 2 = Monday (offset 0)

            // Get start and end times
            const startSlot = TIME_SLOTS[course.startPeriod];
            const endSlot = TIME_SLOTS[course.endPeriod];

            if (!startSlot || !endSlot) return;

            const startDateTime = formatDateTimeICS(eventDate, startSlot.start);
            const endDateTime = formatDateTimeICS(eventDate, endSlot.end);

            // Build description - join with actual newlines, escapeICS will handle conversion
            const descParts = [];
            if (course.code) descParts.push(`Mã MH: ${course.code}`);
            if (course.group) descParts.push(`Nhóm: ${course.group}`);
            if (course.teacher) descParts.push(`GV: ${course.teacher}`);
            if (course.credits) descParts.push(`Tín chỉ: ${course.credits}`);
            descParts.push(`Tiết: ${course.startPeriod}-${course.endPeriod}`);
            descParts.push(`Tuần: ${weekNumber}`);

            // Join with actual newlines - escapeICS will convert to \n for ICS format
            const description = descParts.join('\n');
            const location = course.room || '';
            const summary = `${course.code} - ${course.name}`;

            events.push({
                uid: generateUID(course, weekNumber),
                summary: escapeICS(summary),
                description: escapeICS(description),
                location: escapeICS(location),
                startDateTime,
                endDateTime,
            });
        });
    });

    if (events.length === 0) {
        throw new Error('Không có sự kiện nào để xuất. Vui lòng kiểm tra dữ liệu thời khóa biểu.');
    }

    // Build ICS file content
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TKBSV-BK//ThoiKhoaBieu//VI',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:TKB ${year}`,
        `X-WR-TIMEZONE:Asia/Ho_Chi_Minh`,
    ];

    // Add timezone definition
    icsLines.push(
        'BEGIN:VTIMEZONE',
        'TZID:Asia/Ho_Chi_Minh',
        'BEGIN:STANDARD',
        'DTSTART:19700101T000000',
        'TZOFFSETFROM:+0700',
        'TZOFFSETTO:+0700',
        'END:STANDARD',
        'END:VTIMEZONE'
    );

    // Add events
    events.forEach(event => {
        icsLines.push(
            'BEGIN:VEVENT',
            `UID:${event.uid}`,
            `DTSTAMP:${formatDateTimeICS(new Date(), '00:00')}Z`,
            `DTSTART;TZID=Asia/Ho_Chi_Minh:${event.startDateTime}`,
            `DTEND;TZID=Asia/Ho_Chi_Minh:${event.endDateTime}`,
            `SUMMARY:${event.summary}`,
            `DESCRIPTION:${event.description}`,
            `LOCATION:${event.location}`,
            'STATUS:CONFIRMED',
            'END:VEVENT'
        );
    });

    icsLines.push('END:VCALENDAR');

    return icsLines.join('\r\n');
}

/**
 * Download ICS file
 * @param {string} icsContent - ICS file content
 * @param {string} filename - Filename without extension
 */
export function downloadICS(icsContent, filename = 'tkb-bk') {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Export schedule to Google Calendar
 * Main function to be called from UI
 * @param {Array} scheduleData - Schedule data
 * @param {number} year - Year (default: current year)
 */
export function exportToGoogleCalendar(scheduleData, year = new Date().getFullYear()) {
    try {
        const icsContent = generateICS(scheduleData, year);
        downloadICS(icsContent, `tkb-bk-${year}`);
        return { success: true, eventCount: scheduleData.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get current week number (based on Week 1 = week containing Jan 1)
 * This is now just for reference, the main app uses its own calculation
 */
export function getCurrentWeekNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const week1Monday = getWeek1Monday(year);

    const diffMs = now - week1Monday;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return weekNumber;
}
