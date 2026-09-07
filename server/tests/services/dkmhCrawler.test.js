import { describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import {
    parseRegistrationBatchIds,
    parseRegistrationPeriods,
    selectRegistrationPeriod,
    crawlTeachingSchedule
} from '../../src/services/dkmhCrawler.js';

const fixture = (name) => readFile(new URL(`../../../htmlSpecs/${name}`, import.meta.url), 'utf8');

describe('dkmhCrawler', () => {
    it('finds HK261 and uses its ketQuaDangKyView argument as hocKyId', async () => {
        const periods = parseRegistrationPeriods(
            await fixture('dangKyMonHocForm.action.html'),
            new Date('2026-09-07T00:00:00Z')
        );

        expect(selectRegistrationPeriod(periods, '261')).toMatchObject({
            id: '685',
            code: 'HK261_D1'
        });
    });

    it('parses both registration batch IDs', async () => {
        expect(parseRegistrationBatchIds(await fixture('getDanhSachDotDK.action.html')))
            .toEqual({ dotDKHocVienId: '749', dotDKId: '749' });
    });

    it('rejects a missing registration batch callback', () => {
        expect(() => parseRegistrationBatchIds('<html></html>'))
            .toThrow('Unable to parse DKMH registration batch IDs');
    });

    it('normalizes crawled class groups to the subject snapshot schema', async () => {
        const formHtml = `
            <tr onclick="ketQuaDangKyView(685, getDanhSachDotDK)">
                <td>1</td><td>HK261_D1</td><td>Đợt đăng ký</td>
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
                <td class='item_list'>Thứ 2</td><td class='item_list'>1, 2</td>
                <td class='item_list'>H1-101</td><td class='item_list'>1</td>
                <td class='item_list'>-</td><td class='item_list'>1, 2</td>
            </tr></table><hr />`;
        const response = (text) => ({ text: async () => text });
        const fetch = jest.fn()
            .mockResolvedValueOnce(response(formHtml))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response('getLichDangKyByDotDKId(this, 749, 750)'))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(''))
            .mockResolvedValueOnce(response(searchHtml))
            .mockResolvedValueOnce(response(groupHtml));

        const result = await crawlTeachingSchedule({
            semester: '261',
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
                    classInfo: [{ dayOfWeek: 1, tietHoc: [1, 2], phong: 'H1-101', coSo: '1', week: [1, 2] }]
                }]
            }]
        });
    });
});
