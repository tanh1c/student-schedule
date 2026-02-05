import config from '../../config/default.js';
import { createCookieFetch } from './authService.js';
import { maskCookie, maskUrl } from '../utils/masking.js';
import logger from '../utils/logger.js';

/**
 * Perform SSO login for DKMH system
 * Service URL: https://mybk.hcmut.edu.vn/my/homeSSO.action
 * Target: https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action
 */
export async function performDKMHLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = config.urls.dkmhInfo.serviceUrl;

    try {
        logger.info('[DKMH] Step 1: Getting SSO login form...');
        const loginPageUrl = `${config.urls.loginPage}?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            logger.info('[DKMH] Failed to parse login form');
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        const execution = executionMatch[1];
        const lt = ltMatch[1];
        logger.info('[DKMH] Got SSO tokens');

        // Step 2: Submit credentials
        logger.info('[DKMH] Step 2: Submitting credentials...');
        const loginParams = new URLSearchParams({
            username: username,
            password: password,
            execution: execution,
            _eventId: 'submit',
            lt: lt,
            submit: 'Login'
        });

        const loginResponse = await fetch(loginPageUrl, {
            method: 'POST',
            body: loginParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            redirect: 'follow'
        });

        const finalUrl = loginResponse.url;
        logger.info('[DKMH] Final URL after SSO login:', maskUrl(finalUrl));

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Verify we reached homeSSO
        if (!finalUrl.includes('homeSSO.action')) {
            logger.info('[DKMH] Did not reach homeSSO, final URL:', maskUrl(finalUrl));
        }

        // Step 3: Access DKMH - it may redirect to home.action first
        logger.info('[DKMH] Step 3: Accessing DKMH system...');

        // First, access the main DKMH entry point
        const dkmhEntryUrl = config.urls.dkmhInfo.entryUrl;
        const entryResponse = await fetch(dkmhEntryUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': config.urls.dkmhInfo.serviceUrl
            },
            redirect: 'follow'
        });

        logger.info('[DKMH] Entry URL response:', entryResponse.url);

        // Now access home.action to establish session
        const homeUrl = config.urls.dkmhInfo.homeUrl;
        const homeResponse = await fetch(homeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': entryResponse.url
            },
            redirect: 'follow'
        });

        logger.info('[DKMH] Home URL response:', homeResponse.url);

        // Finally access the registration form
        const dkmhUrl = config.urls.dkmhInfo.formUrl;
        const dkmhResponse = await fetch(dkmhUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': homeResponse.url
            },
            redirect: 'follow'
        });

        const dkmhFinalUrl = dkmhResponse.url;
        logger.info('[DKMH] DKMH Final URL:', dkmhFinalUrl);

        // Check if we successfully reached DKMH or got redirected to login
        if (dkmhFinalUrl.includes('sso.hcmut.edu.vn') || dkmhFinalUrl.includes('cas/login')) {
            logger.info('[DKMH] Redirected to login, session may be invalid');
            return { success: false, error: 'Không thể truy cập trang DKMH' };
        }

        const dkmhHtml = await dkmhResponse.text();

        // Get all cookies
        const ssoCookies = await jar.getCookies('https://sso.hcmut.edu.vn');
        const mybkCookies = await jar.getCookies('https://mybk.hcmut.edu.vn');
        const dkmhCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/dkmh');

        const allCookiesMap = new Map();
        [...ssoCookies, ...dkmhCookies].forEach(c => {
            allCookiesMap.set(c.key, c.cookieString());
        });

        // Ensure MyBK cookies are included and valid
        mybkCookies.forEach(c => {
            allCookiesMap.set(c.key, c.cookieString());
        });

        const cookieString = Array.from(allCookiesMap.values()).join('; ');

        // Check if page contains expected content
        const isLoggedIn = dkmhHtml.includes('Đăng ký môn học') ||
            dkmhHtml.includes('dangKyMonHoc') ||
            dkmhHtml.includes('logout') ||
            dkmhHtml.includes('Đăng xuất') ||
            dkmhHtml.includes('dkmh') ||
            dkmhHtml.length > 1000;

        if (isLoggedIn) {
            logger.info('[DKMH] Page content looks good (length:', dkmhHtml.length, ')');
        } else {
            logger.info('[DKMH] Page content may not indicate successful login');
        }

        return {
            success: true,
            cookieString: cookieString,
            jar: jar,
            dkmhUrl: dkmhFinalUrl
        };

    } catch (error) {
        logger.error('[DKMH] Error:', error);
        return { success: false, error: error.message };
    }
}
