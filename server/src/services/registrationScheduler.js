import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import logger from '../utils/logger.js';
import { decryptCookie } from './registrationCookieCrypto.js';
import { getTemplateByOwner } from './registrationTemplateStore.js';
import { listDueJobs, saveRawJob } from './registrationSchedulerStore.js';
import { runTemplateCourses } from '../controllers/registrationTemplateController.js';

let schedulerTimer = null;
let isRunningDueJobs = false;

function buildStoredData(job) {
    const cookie = decryptCookie(job.encryptedCookie);
    const jar = new CookieJar();
    const fetch = fetchCookie(nodeFetch, jar);

    return {
        fetch,
        jar,
        baseHeaders: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookie
        },
        periodId: job.periodId
    };
}

function getJobStatus(result) {
    if (result.summary?.success > 0) return 'success';
    if (result.summary?.draft > 0) return 'draft';
    return 'failed';
}

async function runJobAttempt(job, attemptIndex) {
    const startedAt = new Date().toISOString();
    const template = await getTemplateByOwner(job.ownerKey, job.templateId);
    if (!template) throw new Error('Template not found');

    const result = await runTemplateCourses(template, buildStoredData(job));
    const status = getJobStatus(result);

    return {
        startedAt,
        finishedAt: new Date().toISOString(),
        attempt: attemptIndex,
        status,
        summary: result.summary,
        runLog: result.runLog,
        registrationResult: result.registrationResult
    };
}

async function runScheduledJob(job) {
    let currentJob = await saveRawJob({
        ...job,
        status: 'running',
        startedAt: job.startedAt || new Date().toISOString()
    });
    const attempts = Array.isArray(currentJob.attempts) ? [...currentJob.attempts] : [];
    const maxAttempts = Math.max(1, Number(currentJob.retryCount || 0) + 1);
    let finalAttempt = null;

    for (let attemptIndex = 1; attemptIndex <= maxAttempts; attemptIndex += 1) {
        try {
            finalAttempt = await runJobAttempt(currentJob, attemptIndex);
        } catch (error) {
            finalAttempt = {
                startedAt: new Date().toISOString(),
                finishedAt: new Date().toISOString(),
                attempt: attemptIndex,
                status: 'failed',
                error: error.message
            };
        }

        attempts.push(finalAttempt);
        currentJob = await saveRawJob({
            ...currentJob,
            attempts,
            lastError: finalAttempt.error,
            status: finalAttempt.status === 'failed' && attemptIndex < maxAttempts ? 'running' : finalAttempt.status,
            summary: finalAttempt.summary,
            runLog: finalAttempt.runLog,
            registrationResult: finalAttempt.registrationResult
        });

        if (finalAttempt.status !== 'failed') break;
    }

    return saveRawJob({
        ...currentJob,
        status: finalAttempt.status,
        finishedAt: new Date().toISOString(),
        encryptedCookie: undefined,
        lastError: finalAttempt.error
    });
}

export async function runDueScheduledJobs(now = new Date()) {
    if (isRunningDueJobs) return { checked: 0, ran: 0 };

    isRunningDueJobs = true;
    try {
        const dueJobs = await listDueJobs(now);
        for (const job of dueJobs) {
            await runScheduledJob(job);
        }
        return { checked: dueJobs.length, ran: dueJobs.length };
    } finally {
        isRunningDueJobs = false;
    }
}

export function startRegistrationScheduler(intervalMs = 5000) {
    if (process.env.NODE_ENV === 'test' || schedulerTimer) return schedulerTimer;

    schedulerTimer = setInterval(() => {
        runDueScheduledJobs().catch((error) => logger.error('[DKMH_SCHEDULER] run failed:', error));
    }, intervalMs);
    schedulerTimer.unref?.();
    return schedulerTimer;
}

export function stopRegistrationScheduler() {
    if (schedulerTimer) clearInterval(schedulerTimer);
    schedulerTimer = null;
}
