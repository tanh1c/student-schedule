import { randomUUID } from 'crypto';
import { getClient, trackCommand } from './redisService.js';

const TEMPLATE_PREFIX = 'DKMH_TEMPLATE:';
let templateStoreClient = null;

export function setTemplateStoreClient(client) {
    templateStoreClient = client;
}

function getTemplateStoreClient() {
    return templateStoreClient || getClient();
}

export function getOwnerKey(session) {
    const ownerKey = session?.username || session?.user?.studentId || session?.user?.id;
    if (!ownerKey) throw new Error('Cannot determine template owner');
    return String(ownerKey);
}

function getTemplateKey(session) {
    return `${TEMPLATE_PREFIX}${getOwnerKey(session)}`;
}

function getTemplateKeyByOwner(ownerKey) {
    return `${TEMPLATE_PREFIX}${ownerKey}`;
}

async function readTemplates(session) {
    const client = getTemplateStoreClient();
    if (!client || !client.isOpen) throw new Error('Template storage unavailable');

    trackCommand();
    const raw = await client.get(getTemplateKey(session));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
}

async function readTemplatesByOwner(ownerKey) {
    const client = getTemplateStoreClient();
    if (!client || !client.isOpen) throw new Error('Template storage unavailable');

    trackCommand();
    const raw = await client.get(getTemplateKeyByOwner(ownerKey));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
}

async function writeTemplates(session, templates) {
    const client = getTemplateStoreClient();
    if (!client || !client.isOpen) throw new Error('Template storage unavailable');

    trackCommand();
    await client.set(getTemplateKey(session), JSON.stringify(templates));
}

export async function listTemplates(session) {
    return readTemplates(session);
}

export async function getTemplate(session, templateId) {
    const templates = await readTemplates(session);
    return templates.find((template) => template.id === templateId) || null;
}

export async function getTemplateByOwner(ownerKey, templateId) {
    const templates = await readTemplatesByOwner(ownerKey);
    return templates.find((template) => template.id === templateId) || null;
}

export async function saveTemplate(session, template) {
    const ownerKey = getOwnerKey(session);
    const templates = await readTemplates(session);
    const now = Date.now();
    const id = template.id || randomUUID();
    const existing = templates.find((current) => current.id === id);
    const saved = {
        createdAt: existing?.createdAt || now,
        ...existing,
        ...template,
        id,
        ownerKey,
        updatedAt: now,
        courses: Array.isArray(template.courses) ? template.courses : []
    };

    const nextTemplates = existing
        ? templates.map((current) => (current.id === id ? saved : current))
        : [...templates, saved];

    await writeTemplates(session, nextTemplates);
    return saved;
}

export async function deleteTemplate(session, templateId) {
    const templates = await readTemplates(session);
    const nextTemplates = templates.filter((template) => template.id !== templateId);
    if (nextTemplates.length === templates.length) return false;

    await writeTemplates(session, nextTemplates);
    return true;
}
