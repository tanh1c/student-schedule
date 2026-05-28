import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import config from '../../config/default.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
    return Buffer.from(config.security.encryptionKey, 'hex');
}

export function encryptCookie(cookie) {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(cookie, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptCookie(payload) {
    const [ivPayload, authTagPayload, encryptedPayload] = String(payload).split(':');
    const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivPayload, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagPayload, 'base64'));

    return Buffer.concat([
        decipher.update(Buffer.from(encryptedPayload, 'base64')),
        decipher.final()
    ]).toString('utf8');
}
