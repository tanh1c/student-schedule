import { describe, expect, it, jest } from '@jest/globals';
import { parseArguments, runUpdate } from '../../src/scripts/updateTeachingSchedule.js';

const validSubjects = [{
    id: '1', maMonHoc: 'CO3001', tenMonHoc: 'Kỹ thuật phần mềm', soTinChi: 3,
    lichHoc: [{ group: 'L01', classInfo: [{ dayOfWeek: 1, tietHoc: [1], phong: 'H1', coSo: '1', week: [1] }] }]
}];

describe('updateTeachingSchedule', () => {
    it('parses the required semester and dry-run flag', () => {
        expect(parseArguments(['--semester', '261', '--dry-run']))
            .toEqual({ semester: '261', dryRun: true });
    });

    it('accepts npm-forwarded positional semester values as dry-run', () => {
        expect(parseArguments(['261'])).toEqual({ semester: '261', dryRun: true });
    });

    it('accepts an explicit period with either argument syntax', () => {
        expect(parseArguments(['261', 'HK261_D2']))
            .toEqual({ semester: '261', period: 'HK261_D2', dryRun: true });
        expect(parseArguments(['261', '--period', 'HK261_D3', 'apply']))
            .toEqual({ semester: '261', period: 'HK261_D3', dryRun: false });
        expect(() => parseArguments(['261', '--period'])).toThrow('registration period');
        expect(() => parseArguments(['261', 'HK252_D2'])).toThrow('registration period');
    });

    it('requires apply before replacing active snapshots', () => {
        expect(parseArguments(['261', 'apply'])).toEqual({ semester: '261', dryRun: false });
    });

    it('reports every candidate before the selected period', async () => {
        const output = { write: jest.fn() };
        await runUpdate({
            argv: ['261'],
            prompt: jest.fn().mockResolvedValue('student'),
            crawl: jest.fn().mockResolvedValue({
                period: { code: 'HK261_D2' }, hocKyId: '686', dotDKHocVienId: '750', dotDKId: '751', subjects: validSubjects,
                comparisons: [
                    { period: { code: 'HK261_D1' }, courses: [{}, {}] },
                    { period: { code: 'HK261_D2' }, courses: [{}, {}, {}] },
                    { period: { code: 'HK261_AVNV2' }, courses: [], error: 'Unavailable' }
                ]
            }),
            validate: jest.fn().mockReturnValue({ subjectCount: 1, groupCount: 1 }),
            install: jest.fn(),
            stdout: output,
            paths: { subjectPath: '/tmp/data_subject.json', backupDirectory: '/tmp' }
        });

        expect(output.write).toHaveBeenNthCalledWith(1, 'HK261_D1: 2 courses\n');
        expect(output.write).toHaveBeenNthCalledWith(2, 'HK261_D2: 3 courses\n');
        expect(output.write).toHaveBeenNthCalledWith(3, 'HK261_AVNV2: unavailable (Unavailable)\n');
    });

    it('does not install a snapshot during dry-run', async () => {
        const install = jest.fn();
        const prompt = jest.fn()
            .mockResolvedValueOnce('student')
            .mockResolvedValueOnce('password');
        const result = await runUpdate({
            argv: ['--semester', '261', '--dry-run'],
            prompt,
            crawl: jest.fn().mockResolvedValue({
                period: { code: 'HK261_D1' }, hocKyId: '685',
                dotDKHocVienId: '749', dotDKId: '750', subjects: validSubjects
            }),
            validate: jest.fn().mockReturnValue({ subjectCount: 1, groupCount: 1 }),
            install,
            stdout: { write: jest.fn() },
            paths: { subjectPath: '/tmp/data_subject.json', backupDirectory: '/tmp' }
        });

        expect(install).not.toHaveBeenCalled();
        expect(result).toMatchObject({ dryRun: true, dotDKId: '750', subjectCount: 1 });
        expect(prompt).toHaveBeenNthCalledWith(2, 'MyBK password: ', { hidden: true });
    });
});
