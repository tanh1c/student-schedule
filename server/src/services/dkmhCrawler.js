import {
    parseClassGroupsHtml,
    parseSearchResultsHtml,
    parseVietnameseDate
} from './dkmhParser.js';
import config from '../../config/default.js';

export function parseRegistrationPeriods(html, now = new Date()) {
    const rowRegex = /<tr[^>]*onclick="ketQuaDangKyView\((\d+)[^"]*"[^>]*>\s*<td>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;
    const periods = [];
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
        const startTime = match[5].trim();
        const endTime = match[6].trim();
        const start = parseVietnameseDate(startTime);
        const end = parseVietnameseDate(endTime);
        const status = now >= start && now <= end
            ? 'open'
            : now > end
                ? 'closed'
                : 'upcoming';

        periods.push({
            id: match[1],
            stt: Number(match[2]),
            code: match[3].trim(),
            description: match[4].replace(/<[^>]+>/g, '').trim(),
            startTime,
            endTime,
            start: start?.toISOString(),
            end: end?.toISOString(),
            status,
            hasResult: match[4].toLowerCase().includes('kết quả')
        });
    }

    return periods;
}

export function selectRegistrationPeriod(periods, semester) {
    const matches = periods.filter(({ code }) => code.startsWith(`HK${semester}`));
    if (!matches.length) throw new Error(`No DKMH registration period found for HK${semester}`);

    return matches.find(({ status }) => status === 'open') ?? matches[0];
}

export function parseRegistrationBatchIds(html) {
    const match = html.match(/getLichDangKyByDotDKId\s*\(\s*this\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) throw new Error('Unable to parse DKMH registration batch IDs');

    return { dotDKHocVienId: match[1], dotDKId: match[2] };
}

export function selectMostCompletePeriod(comparisons) {
    const winner = comparisons.reduce((best, candidate) =>
        candidate.courses.length > (best?.courses.length ?? 0) ? candidate : best,
    null);
    if (!winner?.courses.length) throw new Error('No DKMH registration period returned courses');
    return winner;
}

const dayOfWeek = {
    'Chủ nhật': 0,
    'Thứ 2': 1,
    'Thứ 3': 2,
    'Thứ 4': 3,
    'Thứ 5': 4,
    'Thứ 6': 5,
    'Thứ 7': 6
};

function parseNumbers(value) {
    return (value.match(/\d+/g) ?? []).map(Number);
}

function normalizeSubject(course, groups) {
    return {
        id: course.monHocId,
        maMonHoc: course.code,
        tenMonHoc: course.name,
        soTinChi: course.credits,
        lichHoc: groups.map((group) => ({
            group: group.groupCode,
            siso: `${group.registered}/${group.capacity}`,
            ngonNgu: group.language,
            nhomLT: group.ltGroup,
            giangVien: group.lecturer,
            nhomBT: group.btGroup,
            giangVienBT: group.btLecturer,
            sisoLT: String(group.maxLT),
            classInfo: group.schedules
                .filter(({ day }) => dayOfWeek[day] !== undefined)
                .map((schedule) => ({
                    dayOfWeek: dayOfWeek[schedule.day],
                    tietHoc: parseNumbers(schedule.timeSlots),
                    phong: schedule.room,
                    coSo: schedule.campus,
                    week: parseNumbers(schedule.weeks)
                }))
        }))
    };
}

const dkmhUrls = {
    result: 'https://mybk.hcmut.edu.vn/dkmh/ketQuaDangKyView.action',
    batches: 'https://mybk.hcmut.edu.vn/dkmh/getDanhSachDotDK.action',
    schedule: 'https://mybk.hcmut.edu.vn/dkmh/getLichDangKy.action',
    courses: 'https://mybk.hcmut.edu.vn/dkmh/getDanhSachMonHocDangKy.action',
    search: 'https://mybk.hcmut.edu.vn/dkmh/searchMonHocDangKy.action',
    groups: 'https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action'
};

async function postText(fetch, url, body, headers) {
    const response = await fetch(url, { method: 'POST', body, headers });
    return response.text();
}

async function loadPeriodCourses(period, fetch, baseHeaders) {
    const hocKyId = period.id;
    await postText(fetch, dkmhUrls.result, `hocKyId=${hocKyId}`, baseHeaders);
    const batchHtml = await postText(fetch, dkmhUrls.batches, `hocKyId=${hocKyId}`, baseHeaders);
    const { dotDKHocVienId, dotDKId } = parseRegistrationBatchIds(batchHtml);

    await postText(fetch, dkmhUrls.schedule, `dotDKId=${dotDKId}&dotDKHocVienId=${dotDKHocVienId}`, baseHeaders);
    await postText(fetch, dkmhUrls.courses, `dotDKId=${dotDKId}`, baseHeaders);
    const searchHtml = await postText(fetch, dkmhUrls.search, 'msmh=+', baseHeaders);

    return {
        period,
        hocKyId,
        dotDKHocVienId,
        dotDKId,
        courses: parseSearchResultsHtml(searchHtml)
    };
}

export async function compareRegistrationPeriods({ periods, fetch, baseHeaders }) {
    const comparisons = [];
    for (const period of periods) {
        try {
            comparisons.push(await loadPeriodCourses(period, fetch, baseHeaders));
        } catch (error) {
            comparisons.push({ period, courses: [], error: error.message });
        }
    }
    return comparisons;
}

export async function crawlTeachingSchedule({ semester, fetch, now = new Date() }) {
    const baseHeaders = {
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://mybk.hcmut.edu.vn',
        'Referer': config.urls.dkmhInfo.formUrl
    };
    const formHtml = await (await fetch(config.urls.dkmhInfo.formUrl, { headers: baseHeaders })).text();
    const periods = parseRegistrationPeriods(formHtml, now)
        .filter(({ code }) => code.startsWith(`HK${semester}`));
    if (!periods.length) throw new Error(`No DKMH registration period found for HK${semester}`);

    const comparisons = await compareRegistrationPeriods({ periods, fetch, baseHeaders });
    const selected = selectMostCompletePeriod(comparisons);
    const activePeriod = await loadPeriodCourses(selected.period, fetch, baseHeaders);
    const subjects = [];
    for (const course of activePeriod.courses) {
        const groupHtml = await postText(fetch, dkmhUrls.groups, `monHocId=${course.monHocId}`, baseHeaders);
        subjects.push(normalizeSubject(course, parseClassGroupsHtml(groupHtml)));
    }

    return { ...activePeriod, subjects, comparisons };
}
