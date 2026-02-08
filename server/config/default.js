export default {
    server: {
        port: process.env.PORT || 3001,
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },
    session: {
        timeoutMs: 15 * 60 * 1000, // 15 minutes
        cleanupIntervalMs: 3 * 60 * 1000, // 3 minutes
        maxSessions: 40
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
