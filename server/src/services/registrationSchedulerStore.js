import { randomUUID } from 'crypto';
import { getClient, trackCommand } from './redisService.js';
import { getOwnerKey } from './registrationTemplateStore.js';

const JOBS_KEY = 'DKMH_SCHEDULED_JOBS';
let schedulerStoreClient = null;

export function setSchedulerStoreClient(client) {
    schedulerStoreClient = client;
}

function getSchedulerStoreClient() {
    return schedulerStoreClient || getClient();
}

function sanitizeJob(job) {
    const { encryptedCookie: _encryptedCookie, ...safeJob } = job;
    return safeJob;
}

async function readJobs() {
    const client = getSchedulerStoreClient();
    if (!client || !client.isOpen) throw new Error('Scheduler storage unavailable');

    trackCommand();
    const raw = await client.get(JOBS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
}

async function writeJobs(jobs) {
    const client = getSchedulerStoreClient();
    if (!client || !client.isOpen) throw new Error('Scheduler storage unavailable');

    trackCommand();
    await client.set(JOBS_KEY, JSON.stringify(jobs));
}

export async function listJobs(session) {
    const ownerKey = getOwnerKey(session);
    const jobs = await readJobs();
    return jobs.filter((job) => job.ownerKey === ownerKey).map(sanitizeJob);
}

export async function saveRawJob(job) {
    const jobs = await readJobs();
    const now = new Date().toISOString();
    const existing = jobs.find((current) => current.id === job.id);
    const saved = {
        createdAt: existing?.createdAt || now,
        attempts: [],
        retryCount: 3,
        retryDelaySeconds: 10,
        status: 'scheduled',
        ...existing,
        ...job,
        id: job.id || existing?.id || randomUUID(),
        updatedAt: now
    };
    const nextJobs = existing
        ? jobs.map((current) => (current.id === saved.id ? saved : current))
        : [...jobs, saved];

    await writeJobs(nextJobs);
    return saved;
}

export async function saveJob(session, job) {
    const ownerKey = getOwnerKey(session);
    const saved = await saveRawJob({ ...job, ownerKey });
    return sanitizeJob(saved);
}

export async function cancelJob(session, jobId) {
    const ownerKey = getOwnerKey(session);
    const jobs = await readJobs();
    const job = jobs.find((current) => current.id === jobId && current.ownerKey === ownerKey);
    if (!job) return null;

    const cancelled = {
        ...job,
        status: 'cancelled',
        encryptedCookie: undefined,
        updatedAt: new Date().toISOString()
    };
    await writeJobs(jobs.map((current) => (current.id === jobId ? cancelled : current)));
    return sanitizeJob(cancelled);
}

export async function deleteJob(session, jobId) {
    const ownerKey = getOwnerKey(session);
    const jobs = await readJobs();
    const nextJobs = jobs.filter((job) => !(job.id === jobId && job.ownerKey === ownerKey));
    if (nextJobs.length === jobs.length) return false;

    await writeJobs(nextJobs);
    return true;
}

export async function listDueJobs(now = new Date()) {
    const jobs = await readJobs();
    const nowTime = now.getTime();
    return jobs.filter((job) => (
        job.status === 'scheduled' &&
        job.encryptedCookie &&
        Number.isFinite(Date.parse(job.runAt)) &&
        Date.parse(job.runAt) <= nowTime
    ));
}
