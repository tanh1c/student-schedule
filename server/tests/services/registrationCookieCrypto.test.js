import { describe, expect, it } from '@jest/globals';

const crypto = await import('../../src/services/registrationCookieCrypto.js');

describe('registrationCookieCrypto', () => {
    it('should encrypt and decrypt a DKMH cookie', () => {
        const cookie = 'JSESSIONID=abc123; DKMH=value';

        const encrypted = crypto.encryptCookie(cookie);
        const decrypted = crypto.decryptCookie(encrypted);

        expect(decrypted).toBe(cookie);
        expect(encrypted).not.toContain(cookie);
        expect(encrypted).not.toContain('abc123');
    });
});
