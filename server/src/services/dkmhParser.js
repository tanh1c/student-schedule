/**
 * Helper to parse Vietnamese date format (DD/MM/YYYY HH:mm)
 */
export function parseVietnameseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
        return new Date(year, month - 1, day, hour, minute);
    } catch (e) {
        return null;
    }
}

/**
 * Parse class groups from getThongTinNhomLopMonHoc HTML
 */
export function parseClassGroupsHtml(html) {
    const groups = [];
    // console.log('[DKMH] Parsing class groups, total length: ' + html.length);

    // Split by <hr /> tags which separate each class group section
    const sections = html.split(/<hr\s*\/?>/i);
    // console.log(`[DKMH] Found ${sections.length} potential sections`);

    for (const section of sections) {
        // Find header row with group info: <tr style="border-bottom:2px #ccc  solid;">
        const headerMatch = section.match(/<tr[^>]*style="border-bottom:2px #ccc\s+solid;"[^>]*>([\s\S]*?)<\/tr>/i);
        if (!headerMatch) continue;

        // Parse header cells
        const tdRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/gi;
        const tdValues = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(headerMatch[1])) !== null) {
            tdValues.push(tdMatch[1].trim());
        }

        // Valid group header must have at least 9 columns
        if (tdValues.length < 9) continue;

        const groupCode = tdValues[0];
        const slotsMatch = tdValues[1].match(/(\d+)\/(\d+)/);
        if (!slotsMatch) continue;

        const registered = parseInt(slotsMatch[1]);
        const capacity = parseInt(slotsMatch[2]);
        const actionHtml = tdValues[8];
        const buttonMatch = actionHtml.match(/dangKyNhomLopMonHoc\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

        // Find schedule table in section - look for <table...class='table'>
        const schedules = [];
        const tableMatch = section.match(/<table[^>]*class=['"]table['"][^>]*>([\s\S]*?)<\/table>/i);

        if (tableMatch) {
            const tableContent = tableMatch[1];
            // Find all <tr>...</tr> inside the table
            const allRows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

            for (const row of allRows) {
                // Skip header row (has <th> or style with border)
                if (row.includes('<th') || row.includes('border-bottom:2px')) continue;

                // Extract td values
                const schTdRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/gi;
                const schValues = [];
                let schMatch;
                while ((schMatch = schTdRegex.exec(row)) !== null) {
                    schValues.push(schMatch[1].trim());
                }

                // Check if this is a schedule row
                // Must have at least 6 columns: Day, Time, Room, Campus, BTTN, Weeks
                if (schValues.length >= 6) {
                    const day = schValues[0];
                    const timeRaw = schValues[1];
                    const room = schValues[2];

                    if ((day.trim().length > 0) || (timeRaw.match(/\d/))) {
                        const tietNumbers = timeRaw.match(/\d+/g) || [];
                        const tietDisplay = tietNumbers.length > 0 ? tietNumbers.join(', ') : '-';

                        schedules.push({
                            day: day.replace(/<[^>]*>/g, '').trim(),
                            timeSlots: tietDisplay,
                            room: room.trim(),
                            campus: schValues[3].trim(),
                            bttn: schValues[4].trim(),
                            weeks: schValues[5].replace(/<[^>]*>/g, '').trim()
                        });
                    }
                }
            }
        }

        groups.push({
            groupCode: groupCode,
            registered: registered,
            capacity: capacity,
            language: tdValues[2] || 'V',
            ltGroup: tdValues[3] || '',
            lecturer: tdValues[4] || '',
            btGroup: tdValues[5] || '',
            btLecturer: tdValues[6] || '',
            maxLT: parseInt(tdValues[7]) || 0,
            canRegister: !!buttonMatch,
            nlmhId: buttonMatch ? buttonMatch[1] : null,
            monHocId: buttonMatch ? buttonMatch[2] : null,
            isFull: registered >= capacity,
            schedules: schedules
        });
    }

    return groups;
}

/**
 * Parse course search results from HTML
 */
export function parseSearchResultsHtml(html) {
    const courses = [];
    const rowRegex = /<tr\s+id='monHoc(\d+)'[^>]*onclick='getThongTinNhomLopMonHoc\([^,]+,\s*(\d+)\)'[^>]*>[\s\S]*?<td class="item_list">(\d+)\s*<\/td>[\s\S]*?<td class='item_list'\s*>([A-Z0-9]+)\s*<\/td>\s*<td class='item_list'\s*>([^<]+)<\/td>\s*<td class='item_list'\s*>([\d.]+)<\/td>/g;

    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        courses.push({
            monHocId: match[1],
            nhomLopId: match[2],
            stt: parseInt(match[3]),
            code: match[4].trim(),
            name: match[5].trim(),
            credits: parseFloat(match[6])
        });
    }

    return courses;
}

/**
 * Extract detailed class and schedule info for a specific course
 */
function extractCourseSchedule(html, courseCode) {
    // Find the section for this course
    const codeIdx = html.indexOf(courseCode);
    if (codeIdx === -1) return {};

    // Get section from code to next panel
    const nextPanelIdx = html.indexOf('<div class="panel panel-default">', codeIdx + 1);
    const courseSection = nextPanelIdx > 0
        ? html.substring(codeIdx, nextPanelIdx)
        : html.substring(codeIdx, codeIdx + 4000);

    const classRowMatch = courseSection.match(/<tr style="border-bottom:2px[^"]*">([\s\S]*?)<\/tr>/);

    let classInfo = {
        groupCode: '', registered: '', language: '', groupLT: '',
        lecturer: '', groupBT: '', lecturerBT: '', capacity: ''
    };

    if (classRowMatch) {
        const cells = [];
        const cellRegex = /<td class='item_list'[^>]*>([\s\S]*?)<\/td>/g;
        let cellMatch;
        while ((cellMatch = cellRegex.exec(classRowMatch[1])) !== null) {
            cells.push(cellMatch[1].trim());
        }

        if (cells.length >= 8) {
            classInfo.groupCode = cells[0].trim();
            classInfo.registered = cells[1].trim();
            classInfo.language = cells[2].trim();
            classInfo.groupLT = cells[3].trim();
            classInfo.lecturer = cells[4].trim() || 'Chưa phân công';
            classInfo.groupBT = cells[5].trim();
            classInfo.lecturerBT = cells[6].trim();
            classInfo.capacity = cells[7].trim();
        }
    }

    const schedules = [];
    const scheduleTableMatch = courseSection.match(/<table width="100%" class='table'>([\s\S]*?)<\/table>/);

    if (scheduleTableMatch) {
        const scheduleRowRegex = /<tr>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td class='item_list'[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/g;
        let scheduleMatch;

        while ((scheduleMatch = scheduleRowRegex.exec(scheduleTableMatch[1])) !== null) {
            const day = scheduleMatch[1].trim();
            const timeSlots = scheduleMatch[2].replace(/\s+/g, ' ').trim();
            if (day && day !== 'Thứ') {
                schedules.push({
                    day,
                    timeSlots,
                    room: scheduleMatch[3].trim(),
                    campus: scheduleMatch[4].trim(),
                    bttn: scheduleMatch[5].trim(),
                    weeks: scheduleMatch[6].trim()
                });
            }
        }
    }

    const firstSchedule = schedules[0] || {};
    return {
        group: classInfo.groupCode,
        slots: classInfo.registered,
        capacity: classInfo.capacity,
        language: classInfo.language,
        groupLT: classInfo.groupLT,
        lecturer: classInfo.lecturer,
        groupBT: classInfo.groupBT,
        lecturerBT: classInfo.lecturerBT,
        day: firstSchedule.day || '',
        room: firstSchedule.room || '',
        campus: firstSchedule.campus || '',
        timeSlots: firstSchedule.timeSlots || '',
        weeks: firstSchedule.weeks || '',
        schedules
    };
}

/**
 * Parse schedule from getLichDangKy HTML
 */
export function parseScheduleHtml(html) {
    const inScheduleMatch = html.match(/id="hdTrongHanDK"\s+value="(\w+)"/);
    const dates = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/g) || [];

    return {
        from: dates[0] || '',
        to: dates[1] || '',
        isOpen: inScheduleMatch ? inScheduleMatch[1] === 'true' : false
    };
}

/**
 * Parse course details from ketQuaDangKyView HTML
 */
export function parsePeriodDetailsHtml(html) {
    const courses = [];
    const panelRegex = /<div class='col-md-1'>(\d+)<\/div>[\s\S]*?<div class='col-md-8'>([\s\S]*?)<\/div>[\s\S]*?<div class='col-md-1'>[\s\S]*?([\d.]+)[\s\S]*?<\/div>/g;

    let match;
    let count = 0;
    while ((match = panelRegex.exec(html)) !== null) {
        const stt = parseInt(match[1]);
        const col8Content = match[2];
        const credits = parseFloat(match[3]);

        const courseMatch = col8Content.match(/([A-Z]{2}\d{4})\s*-\s*([^<]+)/);
        if (!courseMatch) continue;

        const code = courseMatch[1].trim();
        const name = courseMatch[2].trim();

        const ketquaMatch = col8Content.match(/hieuChinhKetQuaDangKyForm\((\d+)\)|xoaKetQuaDangKy\((\d+)/);
        const ketquaId = ketquaMatch ? (ketquaMatch[1] || ketquaMatch[2]) : null;

        count++;
        const scheduleInfo = extractCourseSchedule(html, code);

        const courseIdx = html.indexOf(code);
        const nextPanelIdx = html.indexOf('<div class="panel panel-default">', courseIdx + 1);
        const courseSection = nextPanelIdx > 0
            ? html.substring(courseIdx, nextPanelIdx)
            : html.substring(courseIdx, courseIdx + 2000);
        const isLocked = courseSection.includes('fa-lock');
        const canDelete = !isLocked && !!ketquaId;

        courses.push({
            stt, code, name, credits,
            isLocked, ketquaId, canDelete,
            ...scheduleInfo
        });
    }

    const totalCreditsMatch = html.match(/Tổng số tín chỉ đăng ký:\s*([\d.]+)/);
    const totalCoursesMatch = html.match(/Tổng số môn đăng ký:\s*(\d+)/);

    return {
        courses,
        totalCredits: totalCreditsMatch ? parseFloat(totalCreditsMatch[1]) : 0,
        totalCourses: totalCoursesMatch ? parseInt(totalCoursesMatch[1]) : courses.length
    };
}
