import { access, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';

export function validateSubjectSnapshot(subjects, { minimumSubjects = 1 } = {}) {
    if (!Array.isArray(subjects)) throw new Error('Subject snapshot must be an array');
    if (subjects.length < minimumSubjects) throw new Error('Subject snapshot contains no subjects');

    let groupCount = 0;
    for (const subject of subjects) {
        if (!subject.id || !subject.maMonHoc || !subject.tenMonHoc || !Array.isArray(subject.lichHoc)) {
            throw new Error(`Invalid subject snapshot record: ${subject.maMonHoc || subject.id || 'unknown'}`);
        }
        for (const group of subject.lichHoc) {
            groupCount += 1;
            for (const item of group.classInfo ?? []) {
                if (!Number.isInteger(item.dayOfWeek) || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
                    throw new Error(`Invalid dayOfWeek for ${subject.maMonHoc}/${group.group}`);
                }
                if (!Array.isArray(item.tietHoc) || !Array.isArray(item.week)
                    || !item.tietHoc.every(Number.isInteger) || !item.week.every(Number.isInteger)) {
                    throw new Error(`Invalid lesson or week values for ${subject.maMonHoc}/${group.group}`);
                }
            }
        }
    }
    if (!groupCount) throw new Error('Subject snapshot contains no class groups');

    return { subjectCount: subjects.length, groupCount };
}

function backupPathFor(subjectPath, backupDirectory) {
    const { name, ext } = parse(subjectPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return join(backupDirectory, `${name}.${timestamp}.backup${ext}`);
}

export async function installSubjectSnapshot({ subjects, subjectPath, backupDirectory, minimumSubjects = 1 }) {
    const counts = validateSubjectSnapshot(subjects, { minimumSubjects });
    const existing = await readFile(subjectPath, 'utf8');
    const backupPath = backupPathFor(subjectPath, backupDirectory);
    const temporaryPath = `${subjectPath}.tmp-${process.pid}`;

    await writeFile(backupPath, existing, 'utf8');
    try {
        await writeFile(temporaryPath, `${JSON.stringify(subjects, null, 2)}\n`, 'utf8');
        await rename(temporaryPath, subjectPath);
    } finally {
        try {
            await access(temporaryPath);
            await rm(temporaryPath);
        } catch {
            // The rename already consumed the temporary file.
        }
    }

    return { ...counts, backupPath };
}
