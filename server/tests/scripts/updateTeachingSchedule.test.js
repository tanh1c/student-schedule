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

    it('requires apply before replacing active snapshots', () => {
        expect(parseArguments(['261', 'apply'])).toEqual({ semester: '261', dryRun: false });
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
