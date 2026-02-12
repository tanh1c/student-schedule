import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

const {
    parseVietnameseDate,
    parseClassGroupsHtml,
    parseSearchResultsHtml,
    parseScheduleHtml,
    parsePeriodDetailsHtml
} = await import('../../src/services/dkmhParser.js');

describe('DKMH Parser', () => {
    describe('parseVietnameseDate', () => {
        it('should parse date with time', () => {
            const result = parseVietnameseDate('12/02/2024 14:30');
            expect(result).toBeInstanceOf(Date);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(1); // February is month 1 (0-indexed)
            expect(result.getDate()).toBe(12);
            expect(result.getHours()).toBe(14);
            expect(result.getMinutes()).toBe(30);
        });

        it('should parse date without time', () => {
            const result = parseVietnameseDate('01/01/2024 ');
            expect(result).toBeInstanceOf(Date);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
        });

        it('should return null for invalid date', () => {
            expect(parseVietnameseDate('invalid')).toBeNull();
        });

        it('should return null for empty string', () => {
            expect(parseVietnameseDate('')).toBeNull();
        });

        it('should return null for null input', () => {
            expect(parseVietnameseDate(null)).toBeNull();
        });
    });

    describe('parseClassGroupsHtml', () => {
        it('should parse valid class group HTML', () => {
            const html = `
                <tr style="border-bottom:2px #ccc  solid;">
                    <td class='item_list'>NHOM01</td>
                    <td class='item_list'>30/40</td>
                    <td class='item_list'>V</td>
                    <td class='item_list'>LT01</td>
                    <td class='item_list'>Nguyen Van A</td>
                    <td class='item_list'>BT01</td>
                    <td class='item_list'>Tran Van B</td>
                    <td class='item_list'>2</td>
                    <td class='item_list'><button onclick="dangKyNhomLopMonHoc(this, 123, 456)">Register</button></td>
                </tr>
                <table class='table'>
                    <tr><td class='item_list'>Thứ 2</td><td class='item_list'>7-9</td><td class='item_list'>A101</td><td class='item_list'>CS1</td><td class='item_list'>-</td><td class='item_list'>1-16</td></tr>
                </table>
                <hr />
            `;

            const result = parseClassGroupsHtml(html);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                groupCode: 'NHOM01',
                registered: 30,
                capacity: 40,
                language: 'V',
                ltGroup: 'LT01',
                lecturer: 'Nguyen Van A',
                btGroup: 'BT01',
                btLecturer: 'Tran Van B',
                maxLT: 2,
                canRegister: true,
                nlmhId: '123',
                monHocId: '456',
                isFull: false
            });
            expect(result[0].schedules).toHaveLength(1);
        });

        it('should handle empty HTML', () => {
            const result = parseClassGroupsHtml('');
            expect(result).toHaveLength(0);
        });

        it('should detect full class group', () => {
            const html = `
                <tr style="border-bottom:2px #ccc  solid;">
                    <td class='item_list'>NHOM01</td>
                    <td class='item_list'>40/40</td>
                    <td class='item_list'>V</td>
                    <td class='item_list'>LT01</td>
                    <td class='item_list'>Nguyen Van A</td>
                    <td class='item_list'>BT01</td>
                    <td class='item_list'>Tran Van B</td>
                    <td class='item_list'>2</td>
                    <td class='item_list'></td>
                </tr>
                <hr />
            `;

            const result = parseClassGroupsHtml(html);
            expect(result[0].isFull).toBe(true);
            expect(result[0].canRegister).toBe(false);
        });
    });

    describe('parseSearchResultsHtml', () => {
        it('should parse course search results', () => {
            const html = `
                <tr id='monHoc123' onclick='getThongTinNhomLopMonHoc(123, 456)'>
                    <td class="item_list">1</td>
                    <td class='item_list'>MT1003</td>
                    <td class='item_list'>Toán cao cấp 1</td>
                    <td class='item_list'>4.0</td>
                </tr>
                <tr id='monHoc124' onclick='getThongTinNhomLopMonHoc(124, 457)'>
                    <td class="item_list">2</td>
                    <td class='item_list'>PH1005</td>
                    <td class='item_list'>Vật lý 1</td>
                    <td class='item_list'>3.5</td>
                </tr>
            `;

            const result = parseSearchResultsHtml(html);

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                monHocId: '123',
                nhomLopId: '456',
                stt: 1,
                code: 'MT1003',
                name: 'Toán cao cấp 1',
                credits: 4.0
            });
            expect(result[1]).toMatchObject({
                monHocId: '124',
                nhomLopId: '457',
                stt: 2,
                code: 'PH1005',
                name: 'Vật lý 1',
                credits: 3.5
            });
        });

        it('should handle empty HTML', () => {
            const result = parseSearchResultsHtml('');
            expect(result).toHaveLength(0);
        });
    });

    describe('parseScheduleHtml', () => {
        it('should parse schedule with open registration', () => {
            const html = `
                <input id="hdTrongHanDK" value="true" />
                <div>01/01/2024 08:00</div>
                <div>15/01/2024 23:59</div>
            `;

            const result = parseScheduleHtml(html);

            expect(result).toMatchObject({
                from: '01/01/2024 08:00',
                to: '15/01/2024 23:59',
                isOpen: true
            });
        });

        it('should parse schedule with closed registration', () => {
            const html = `
                <input id="hdTrongHanDK" value="false" />
                <div>01/01/2024 08:00</div>
                <div>15/01/2024 23:59</div>
            `;

            const result = parseScheduleHtml(html);
            expect(result.isOpen).toBe(false);
        });

        it('should handle missing dates', () => {
            const html = '<input id="hdTrongHanDK" value="true" />';
            const result = parseScheduleHtml(html);
            expect(result.from).toBe('');
            expect(result.to).toBe('');
        });
    });

    describe('parsePeriodDetailsHtml', () => {
        it('should parse registered courses', () => {
            const html = `
                <div class='col-md-1'>1</div>
                <div class='col-md-8'>MT1003 - Toán cao cấp 1<button onclick="hieuChinhKetQuaDangKyForm(123)">Edit</button></div>
                <div class='col-md-1'>4.0</div>
                <div class='col-md-1'>2</div>
                <div class='col-md-8'>PH1005 - Vật lý 1<button onclick="xoaKetQuaDangKy(456)">Delete</button></div>
                <div class='col-md-1'>3.5</div>
                Tổng số tín chỉ đăng ký: 7.5
                Tổng số môn đăng ký: 2
            `;

            const result = parsePeriodDetailsHtml(html);

            expect(result.courses).toHaveLength(2);
            expect(result.totalCredits).toBe(7.5);
            expect(result.totalCourses).toBe(2);
        });

        it('should detect locked courses', () => {
            const html = `
                <div class='col-md-1'>1</div>
                <div class='col-md-8'>MT1003 - Toán cao cấp 1<i class="fa-lock"></i></div>
                <div class='col-md-1'>4.0</div>
            `;

            const result = parsePeriodDetailsHtml(html);
            expect(result.courses[0].isLocked).toBe(true);
            expect(result.courses[0].canDelete).toBe(false);
        });

        it('should handle empty HTML', () => {
            const result = parsePeriodDetailsHtml('');
            expect(result.courses).toHaveLength(0);
            expect(result.totalCredits).toBe(0);
        });
    });
});
