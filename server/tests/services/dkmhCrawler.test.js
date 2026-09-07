import { describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import {
    parseRegistrationBatchIds,
    parseRegistrationPeriods,
    selectRegistrationPeriod,
    selectMostCompletePeriod,
    compareRegistrationPeriods,
    crawlTeachingSchedule
} from '../../src/services/dkmhCrawler.js';

const fixture = (name) => readFile(new URL(`../../../htmlSpecs/${name}`, import.meta.url), 'utf8');

describe('dkmhCrawler', () => {
    it('finds HK261 and uses its ketQuaDangKyView argument as hocKyId', () => {
        const periods = parseRegistrationPeriods(`
            <tr onclick="ketQuaDangKyView(685, getDanhSachDotDK)">
                <td>1</td><td>HK261_D1</td><td>Đợt đăng ký</td>
                <td>01/09/2026 08:00</td><td>30/09/2026 23:59</td>
            </tr>`, new Date('2026-09-07T00:00:00Z'));

        expect(selectRegistrationPeriod(periods, '261')).toMatchObject({
            id: '685',
            code: 'HK261_D1'
        });
    });

    it('selects the candidate with the most courses', () => {
        const comparisons = [
            { period: { code: 'HK261_D1' }, courses: [{}, {}] },
            { period: { code: 'HK261_D2' }, courses: [{}, {}, {}] },
            { period: { code: 'HK261_AVNV2' }, courses: [{}] }
        ];

        expect(selectMostCompletePeriod(comparisons).period.code).toBe('HK261_D2');
    });

    it('keeps comparing after a candidate cannot provide registration IDs', async () => {
        const response = (text) => ({ text: async () => text });
        const fetch = jest.fn()
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response('<html></html>'))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response('getLichDangKyByDotDKId(this, 749, 750)'))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(`
                <tr id='monHoc123' onclick='getThongTinNhomLopMonHoc(123, 456)'>
                    <td class="item_list">1</td><td class='item_list'>CO3001</td>
                    <td class='item_list'>Kỹ thuật phần mềm</td><td class='item_list'>3.0</td>
                </tr>`));

        const comparisons = await compareRegistrationPeriods({
            periods: [{ id: '1', code: 'HK261_D1' }, { id: '2', code: 'HK261_D2' }],
            fetch,
            baseHeaders: {}
        });

        expect(comparisons[0]).toMatchObject({
            period: { code: 'HK261_D1' }, courses: [], error: 'Unable to parse DKMH registration batch IDs'
        });
        expect(selectMostCompletePeriod(comparisons).period.code).toBe('HK261_D2');
    });

    it('parses both registration batch IDs', async () => {
        expect(parseRegistrationBatchIds(await fixture('getDanhSachDotDK.action.html')))
            .toEqual({ dotDKHocVienId: '749', dotDKId: '749' });
    });

    it('rejects a missing registration batch callback', () => {
        expect(() => parseRegistrationBatchIds('<html></html>'))
            .toThrow('Unable to parse DKMH registration batch IDs');
    });

    it('rejects a requested period that is not available', async () => {
        const fetch = jest.fn().mockResolvedValue({ text: async () => `
            <tr onclick="ketQuaDangKyView(685, getDanhSachDotDK)">
                <td>1</td><td>HK261_D1</td><td>Đợt đăng ký</td>
                <td>01/09/2026 08:00</td><td>30/09/2026 23:59</td>
            </tr>` });
        await expect(crawlTeachingSchedule({ semester: '261', period: 'HK261_D3', fetch }))
            .rejects.toThrow('Registration period HK261_D3 not found. Available: HK261_D1');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['Thứ 2', '1, 2', 1, [1, 2]],
        ['Thứ 5', '1234567-90123456--------------', 4, [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16]],
        ['Thứ 2', '-----------------------------', 1, []]
    ])('normalizes day %s and weeks %s for the requested period', async (day, weeks, expectedDay, expectedWeeks) => {
        const formHtml = `
            <tr onclick="ketQuaDangKyView(685, getDanhSachDotDK)">
                <td>1</td><td>HK261_D1</td><td>Đợt đăng ký</td>
                <td>01/09/2026 08:00</td><td>30/09/2026 23:59</td>
            </tr>
            <tr onclick="ketQuaDangKyView(686, getDanhSachDotDK)">
                <td>2</td><td>HK261_D2</td><td>Đợt đăng ký</td>
                <td>01/09/2026 08:00</td><td>30/09/2026 23:59</td>
            </tr>`;
        const searchHtml = `
            <tr id='monHoc123' onclick='getThongTinNhomLopMonHoc(123, 456)'>
                <td class="item_list">1</td><td class='item_list'>CO3001</td>
                <td class='item_list'>Kỹ thuật phần mềm</td><td class='item_list'>3.0</td>
            </tr>`;
        const groupHtml = `
            <tr style="border-bottom:2px #ccc  solid;">
                <td class='item_list'>L01</td><td class='item_list'>10/50</td>
                <td class='item_list'>V</td><td class='item_list'>L01</td>
                <td class='item_list'>Nguyễn Văn A</td><td class='item_list'></td>
                <td class='item_list'></td><td class='item_list'>50</td><td class='item_list'></td>
            </tr>
            <table class='table'><tr>
                <td class='item_list'>${day}</td><td class='item_list'>1, 2</td>
                <td class='item_list'>H1-101</td><td class='item_list'>1</td>
                <td class='item_list'>-</td><td class='item_list'>${weeks}</td>
            </tr></table><hr />`;
        const response = (text) => ({ text: async () => text });
        const fetch = jest.fn()
            .mockResolvedValueOnce(response(formHtml))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response('getLichDangKyByDotDKId(this, 749, 750)'))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(searchHtml))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response('getLichDangKyByDotDKId(this, 749, 750)'))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(searchHtml))
            .mockResolvedValueOnce(response(groupHtml));

        const result = await crawlTeachingSchedule({
            semester: '261',
            period: 'HK261_D1',
            fetch,
            now: new Date('2026-09-07T00:00:00Z')
        });

        expect(result).toMatchObject({
            period: { code: 'HK261_D1' },
            hocKyId: '685',
            dotDKHocVienId: '749',
            dotDKId: '750',
            subjects: [{
                id: '123', maMonHoc: 'CO3001', tenMonHoc: 'Kỹ thuật phần mềm', soTinChi: 3,
                lichHoc: [{
                    group: 'L01', siso: '10/50', ngonNgu: 'V', nhomLT: 'L01', giangVien: 'Nguyễn Văn A',
                    classInfo: [{ dayOfWeek: expectedDay, tietHoc: [1, 2], phong: 'H1-101', coSo: '1', week: expectedWeeks }]
                }]
            }]
        });
    });
});
