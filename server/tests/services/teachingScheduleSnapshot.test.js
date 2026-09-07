import { describe, expect, it } from '@jest/globals';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
    installSubjectSnapshot,
    validateSubjectSnapshot
} from '../../src/services/teachingScheduleSnapshot.js';

const validSubjects = [{
    id: '1', maMonHoc: 'CO3001', tenMonHoc: 'Kỹ thuật phần mềm', soTinChi: 3,
    lichHoc: [{
        group: 'L01',
        classInfo: [{ dayOfWeek: 1, tietHoc: [1], phong: 'H1', coSo: '1', week: [1] }]
    }]
}];

describe('teachingScheduleSnapshot', () => {
    it('rejects an empty subject snapshot', () => {
        expect(() => validateSubjectSnapshot([], { minimumSubjects: 1 }))
            .toThrow('Subject snapshot contains no subjects');
    });

    it('backs up the active file and replaces it after validation', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'schedule-snapshot-'));
        const subjectPath = join(directory, 'data_subject.json');
        await writeFile(subjectPath, JSON.stringify([{ id: 'old' }]));

        const result = await installSubjectSnapshot({
            subjects: validSubjects,
            subjectPath,
            backupDirectory: directory,
            minimumSubjects: 1
        });

        expect(JSON.parse(await readFile(subjectPath, 'utf8'))).toEqual(validSubjects);
        expect(JSON.parse(await readFile(result.backupPath, 'utf8'))).toEqual([{ id: 'old' }]);
    });
});
