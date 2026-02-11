export default {
    env: process.env.NODE_ENV || 'development',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    server: {
        port: process.env.PORT || 3001,
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },
    session: {
        timeoutMs: 15 * 60 * 1000, // 15 minutes
        cleanupIntervalMs: 3 * 60 * 1000, // 3 minutes
        maxSessions: 40,
        refreshTokenTTLMs: 7 * 24 * 60 * 60 * 1000, // 7 days for "Remember Me"
    },
    security: {
        // AES-256-GCM encryption key for saved credentials in Redis
        // MUST be exactly 32 bytes (64 hex chars). Set via env var in production!
        encryptionKey: process.env.CREDENTIALS_ENCRYPTION_KEY || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    },
    urls: {
        serviceUrl: 'https://mybk.hcmut.edu.vn/app/login/cas',
        loginPage: 'https://sso.hcmut.edu.vn/cas/login',
        dkmhInfo: {
            serviceUrl: 'https://mybk.hcmut.edu.vn/my/homeSSO.action',
            entryUrl: 'https://mybk.hcmut.edu.vn/dkmh/',
            homeUrl: 'https://mybk.hcmut.edu.vn/dkmh/home.action',
            formUrl: 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action'
        },
        lms: {
            baseUrl: 'https://lms.hcmut.edu.vn',
            serviceUrl: 'https://lms.hcmut.edu.vn/login/index.php?authCAS=CAS',
            ajaxUrl: 'https://lms.hcmut.edu.vn/lib/ajax/service.php'
        }
    }
};
