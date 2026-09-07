import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';
import { performDKMHLogin } from '../services/dkmhService.js';
import { crawlTeachingSchedule } from '../services/dkmhCrawler.js';
import { installSubjectSnapshot, validateSubjectSnapshot } from '../services/teachingScheduleSnapshot.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultPaths = {
    subjectPath: resolve(scriptDirectory, '../../data/data_subject.json'),
    backupDirectory: resolve(scriptDirectory, '../../data')
};

export function parseArguments(argv) {
    const semesterIndex = argv.indexOf('--semester');
    const semester = semesterIndex >= 0 ? argv[semesterIndex + 1] : argv.find((value) => /^\d{3}$/.test(value));
    if (!/^\d{3}$/.test(semester ?? '')) {
        throw new Error('Use --semester with a three-digit value, for example 261');
    }

    return { semester, dryRun: !argv.includes('apply') && !argv.includes('--apply') };
}

export async function runUpdate({
    argv,
    prompt,
    crawl,
    validate,
    install,
    stdout: output,
    paths = defaultPaths
}) {
    const { semester, dryRun } = parseArguments(argv);
    const username = await prompt('MyBK username: ');
    const password = await prompt('MyBK password: ', { hidden: true });
    const result = await crawl({ username, password, semester });
    const counts = validate(result.subjects, { minimumSubjects: 1 });
    const installation = dryRun ? null : await install({
        subjects: result.subjects,
        subjectPath: paths.subjectPath,
        backupDirectory: paths.backupDirectory,
        minimumSubjects: 1
    });

    for (const comparison of result.comparisons ?? []) {
        const detail = comparison.error
            ? `unavailable (${comparison.error})`
            : `${comparison.courses.length} courses`;
        output.write(`${comparison.period.code}: ${detail}\n`);
    }
    output.write(`Period: ${result.period.code}\n`);
    output.write(`hocKyId=${result.hocKyId} dotDKHocVienId=${result.dotDKHocVienId} dotDKId=${result.dotDKId}\n`);
    output.write(`Subjects: ${counts.subjectCount}; groups: ${counts.groupCount}\n`);
    output.write(dryRun ? 'Dry run: active files unchanged.\n' : `Backup: ${installation.backupPath}\n`);
    output.write('LMS: skipped (best-effort enrichment is not implemented).\n');

    return {
        dryRun,
        ...result,
        ...counts,
        backupPath: installation?.backupPath,
        lmsStatus: 'skipped'
    };
}

async function promptCredentials(message, { hidden = false } = {}) {
    if (!hidden) {
        const readline = createInterface({ input: stdin, output: stdout });
        try {
            return await readline.question(message);
        } finally {
            readline.close();
        }
    }

    stdout.write(message);
    return new Promise((resolve) => {
        let value = '';
        const finish = () => {
            stdin.off('data', onData);
            stdin.setRawMode(false);
            stdout.write('\n');
            resolve(value);
        };
        const onData = (chunk) => {
            const key = chunk.toString();
            if (key === '\r' || key === '\n') return finish();
            if (key === '') process.exit(130);
            if (key === '' || key === '\b') {
                value = value.slice(0, -1);
                return;
            }
            value += key;
        };

        stdin.setRawMode(true);
        stdin.resume();
        stdin.on('data', onData);
    });
}

async function crawlWithCredentials({ username, password, semester }) {
    const login = await performDKMHLogin(username, password);
    if (!login.success) throw new Error(login.error);

    return crawlTeachingSchedule({
        semester,
        fetch: fetchCookie(nodeFetch, login.jar)
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runUpdate({
        argv: process.argv.slice(2),
        prompt: promptCredentials,
        crawl: crawlWithCredentials,
        validate: validateSubjectSnapshot,
        install: installSubjectSnapshot,
        stdout,
        paths: defaultPaths
    }).catch((error) => {
        stdout.write(`Update failed: ${error.message}\n`);
        process.exitCode = 1;
    });
}
