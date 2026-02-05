import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import config from '../../config/default.js';
import fs from 'fs';
import { maskCookie, maskUrl, maskSensitive } from '../utils/masking.js';

/**
 * Creates a cookie-aware fetch instance
 */
export function createCookieFetch() {
    const jar = new CookieJar();
    const fetch = fetchCookie(nodeFetch, jar);
    return { fetch, jar };
}

/**
 * Perform CAS login and get the session
 * @param {string} username 
 * @param {string} password 
 */
export async function performCASLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = config.urls.serviceUrl;

    try {
        console.log('[CAS] Step 1: Getting login form...');
        // Step 1: Get the login form to extract execution flow and lt
        const loginPageUrl = `${config.urls.loginPage}?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            console.log('[CAS] Failed to parse login form. HTML length:', html.length);
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        const execution = executionMatch[1];
        const lt = ltMatch[1];
        console.log('[CAS] Got tokens. execution:', maskSensitive(execution));

        // Step 2: Submit login form
        console.log('[CAS] Step 2: Submitting credentials...');
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
        console.log('[CAS] Final URL after login:', maskUrl(finalUrl));

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Search for tokens in HTML
        const pageHtml = await loginResponse.text();
        let jwtToken = null;

        // Search for hidden input token (Correct pattern for MyBK)
        const hiddenTokenMatch = pageHtml.match(/id="hid_Token"\s+value="([^"]+)"/);

        // Also keep other patterns just in case
        const localStoreMatch = pageHtml.match(/localStorage\.setItem\(['"]token['"]\s*,\s*['"]([^'"]+)['"]/);
        const windowMatch = pageHtml.match(/window\.token\s*=\s*['"]([^'"]+)['"]/);

        if (hiddenTokenMatch) {
            jwtToken = `Bearer ${hiddenTokenMatch[1]}`;
            console.log('[AUTH] Found token via hid_Token input! 🎉');
        } else if (localStoreMatch) {
            jwtToken = `Bearer ${localStoreMatch[1]}`;
            console.log('[AUTH] Found token via localStorage pattern');
        } else if (windowMatch) {
            jwtToken = `Bearer ${windowMatch[1]}`;
            console.log('[AUTH] Found token via window pattern');
        } else {
            // Fallback to searching for raw JWT string if nothing specific found
            const jwtMatch = pageHtml.match(/eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/);
            if (jwtMatch) {
                console.log('[AUTH] Found raw JWT pattern, trying it...');
                jwtToken = `Bearer ${jwtMatch[0]}`;
            } else {
                console.log('[AUTH] Could not find token in HTML.');
            }
        }

        // Get cookie explicitly from the APP PATH
        const cookies = await jar.getCookies('https://mybk.hcmut.edu.vn/app');
        const cookieString = cookies.map(c => c.cookieString()).join('; ');
        console.log('[CAS] Cookies from /app path:', maskCookie(cookieString));

        if (!cookieString.includes('SESSION')) {
            console.log('[WARN] SESSION cookie missing! Trying root path...');
            const rootCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/');
            console.log('[CAS] Root cookies:', maskCookie(rootCookies.map(c => c.cookieString()).join('; ')));
        }

        // Step 4: Verify by fetching student info
        console.log('[AUTH] Verifying with get-student-info...');
        const apiHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': cookieString
        };
        if (jwtToken) {
            apiHeaders['Authorization'] = jwtToken;
        }

        const infoResponse = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', {
            headers: apiHeaders
        });

        let userData = null;
        if (infoResponse.ok) {
            const responseText = await infoResponse.text();
            try {
                const data = JSON.parse(responseText);
                if (data.code === "200" || data.code === 200 || !data.code) {
                    userData = data.data || data;
                    console.log('[AUTH] Student info fetched successfully!');
                } else {
                    console.log(`[AUTH] Login OK but info denied: ${data.code} - ${data.msg}`);
                }
            } catch (e) { console.log('[AUTH] Response not JSON', e); }

            const authHeader = infoResponse.headers.get('authorization');
            if (authHeader) {
                jwtToken = authHeader;
                console.log('[AUTH] Found token in API response header');
            }
        } else {
            console.log('[AUTH] Failed to fetch student info:', infoResponse.status);
        }

        return {
            success: true,
            cookieString: cookieString,
            user: userData,
            jwtToken: jwtToken
        };

    } catch (error) {
        console.error('[CAS] Error:', error);
        return { success: false, error: error.message };
    }
}
