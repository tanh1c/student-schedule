import express from 'express';
import cors from 'cors';
import nodeFetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Store sessions in memory
const sessions = new Map();

/**
 * Creates a cookie-aware fetch instance
 */
function createCookieFetch() {
    const jar = new CookieJar();
    const fetch = fetchCookie(nodeFetch, jar);
    return { fetch, jar };
}

/**
 * Perform CAS login and get the session
 */
async function performCASLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = 'https://mybk.hcmut.edu.vn/app/login/cas';

    try {
        console.log('[CAS] Step 1: Getting login form...');
        // Step 1: Get the login form to extract execution flow and lt
        const loginPageUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}`;
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
        console.log('[CAS] Got tokens. execution:', execution.substring(0, 10) + '...');

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
        console.log('[CAS] Final URL after login:', finalUrl);

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Search for tokens in HTML
        const pageHtml = await loginResponse.text();

        // DEBUG: Save HTML to file for analysis
        const fs = await import('fs');
        fs.writeFileSync('debug_app.html', pageHtml);
        console.log('[DEBUG] Saved login HTML to server/debug_app.html');

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
        console.log('[CAS] Cookies from /app path:', cookieString);

        if (!cookieString.includes('SESSION')) {
            console.log('[WARN] SESSION cookie missing! Trying root path...');
            const rootCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/');
            console.log('[CAS] Root cookies:', rootCookies.map(c => c.cookieString()).join('; '));
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

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[API] Login request for ${username}`);

    const result = await performCASLogin(username, password);

    if (result.success) {
        const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

        const sessionData = {
            username,
            password, // Store temporarily for DKMH login (consider security implications)
            cookie: result.cookieString,
            jwtToken: result.jwtToken,
            user: result.user,
            createdAt: Date.now(),
            // DKMH will be populated below
            dkmhCookie: null,
            dkmhLoggedIn: false
        };

        // Also login to DKMH in parallel (non-blocking)
        console.log('[API] Also logging into DKMH...');
        performDKMHLogin(username, password).then(dkmhResult => {
            if (dkmhResult.success) {
                sessionData.dkmhCookie = dkmhResult.cookieString;
                sessionData.dkmhLoggedIn = true;
                console.log('[API] DKMH login successful! Session updated.');
            } else {
                console.log('[API] DKMH login failed:', dkmhResult.error);
            }
        }).catch(err => {
            console.error('[API] DKMH login error:', err);
        });

        sessions.set(sessionToken, sessionData);

        res.json({
            success: true,
            token: sessionToken,
            user: result.user
        });
    } else {
        res.status(401).json({ error: result.error });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    sessions.delete(token);
    res.json({ success: true });
});

// Check DKMH status for existing MyBK session
app.get('/api/dkmh/status', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ authenticated: false, error: 'Not logged in' });
    }

    res.json({
        authenticated: !!session.dkmhCookie,
        dkmhLoggedIn: session.dkmhLoggedIn || false,
        username: session.username
    });
});

app.get('/api/student/info', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log('[API] Proxying get-student-info...');

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const response = await nodeFetch('https://mybk.hcmut.edu.vn/api/v1/student/get-student-info?null', { headers });
        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return res.status(502).json({ error: 'Invalid response from upstream' });
        }

        if (data.code === "200" || data.code === 200 || !data.code) {
            session.user = data.data || data;
        }

        res.json(data);
    } catch (e) {
        console.error('[API] Error details:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/student/schedule', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { studentId, semesterYear } = req.query;
    console.log(`[API] Proxying schedule for ${studentId}, sem ${semesterYear}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = `https://mybk.hcmut.edu.vn/api/v1/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}&null`;
        const response = await nodeFetch(url, { headers });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error('[API] Schedule Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// New Endpoint: Get Transcript Summary (GPA, Credits, Info)
app.post('/api/student/gpa/summary', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { studentId } = req.body;

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log(`[API] Proxying GPA Summary for ${studentId}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie,
            'Content-Type': 'application/json'
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/thong-tin-mo-ta-ctdt/v2?tuychon=VIEWONLINE';

        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });

        const responseText = await response.text();
        console.log(`[DEBUG] GPA Summary Response: ${response.status}`);
        // console.log(`[DEBUG] GPA Summary Body: ${responseText.substring(0, 300)}`);

        try {
            const data = JSON.parse(responseText);
            res.json(data);
        } catch (e) {
            console.error('[API] Failed to parse JSON:', responseText.substring(0, 100));
            res.status(502).send(responseText);
        }
    } catch (e) {
        console.error('[API] GPA Summary Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// New Endpoint: Get Detailed Transcript (List of subjects)
app.post('/api/student/gpa/detail', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { studentId } = req.body;

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    console.log(`[API] Proxying GPA Detail for ${studentId}...`);

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mybk.hcmut.edu.vn/app/sinh-vien/ket-qua-hoc-tap/chuong-trinh-dao-tao',
            'Origin': 'https://mybk.hcmut.edu.vn',
            'Cookie': session.cookie,
            'Content-Type': 'application/json'
        };
        if (session.jwtToken) headers['Authorization'] = session.jwtToken;

        const url = 'https://mybk.hcmut.edu.vn/api/share/ket-qua-hoc-tap/danh-sach-mon-hoc-ctdt/v2';

        const response = await nodeFetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentId)
        });

        const responseText = await response.text();
        console.log(`[DEBUG] GPA Detail Response: ${response.status}`);
        // console.log(`[DEBUG] GPA Detail Body: ${responseText.substring(0, 300)}`);

        try {
            const data = JSON.parse(responseText);
            res.json(data);
        } catch (e) {
            console.error('[API] Failed to parse JSON:', responseText.substring(0, 100));
            res.status(502).send(responseText);
        }
    } catch (e) {
        console.error('[API] GPA Detail Error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ===============================================
// DKMH (Đăng ký môn học) SSO Login
// ===============================================

/**
 * Perform SSO login for DKMH system
 * Service URL: https://mybk.hcmut.edu.vn/my/homeSSO.action
 * Target: https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action
 */
async function performDKMHLogin(username, password) {
    const { fetch, jar } = createCookieFetch();
    const serviceUrl = 'https://mybk.hcmut.edu.vn/my/homeSSO.action';

    try {
        console.log('[DKMH] Step 1: Getting SSO login form...');
        const loginPageUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}`;
        const formResponse = await fetch(loginPageUrl);
        const html = await formResponse.text();

        const executionMatch = html.match(/name="execution"\s+value="([^"]+)"/);
        const ltMatch = html.match(/name="lt"\s+value="([^"]+)"/);

        if (!executionMatch || !ltMatch) {
            console.log('[DKMH] Failed to parse login form');
            return { success: false, error: 'Không thể tải form đăng nhập SSO' };
        }

        const execution = executionMatch[1];
        const lt = ltMatch[1];
        console.log('[DKMH] Got SSO tokens');

        // Step 2: Submit credentials
        console.log('[DKMH] Step 2: Submitting credentials...');
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
        console.log('[DKMH] Final URL after SSO login:', finalUrl);

        if (finalUrl.includes('sso.hcmut.edu.vn/cas/login')) {
            return { success: false, error: 'Sai thông tin đăng nhập' };
        }

        // Verify we reached homeSSO
        if (!finalUrl.includes('homeSSO.action')) {
            console.log('[DKMH] Did not reach homeSSO, final URL:', finalUrl);
        }

        // Step 3: Access DKMH - it may redirect to home.action first
        console.log('[DKMH] Step 3: Accessing DKMH system...');

        // First, access the main DKMH entry point
        const dkmhEntryUrl = 'https://mybk.hcmut.edu.vn/dkmh/';
        const entryResponse = await fetch(dkmhEntryUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://mybk.hcmut.edu.vn/my/homeSSO.action'
            },
            redirect: 'follow'
        });

        console.log('[DKMH] Entry URL response:', entryResponse.url);

        // Now access home.action to establish session
        const homeUrl = 'https://mybk.hcmut.edu.vn/dkmh/home.action';
        const homeResponse = await fetch(homeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': entryResponse.url
            },
            redirect: 'follow'
        });

        console.log('[DKMH] Home URL response:', homeResponse.url);

        // Finally access the registration form
        const dkmhUrl = 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action';
        const dkmhResponse = await fetch(dkmhUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': homeResponse.url
            },
            redirect: 'follow'
        });

        const dkmhFinalUrl = dkmhResponse.url;
        console.log('[DKMH] DKMH Final URL:', dkmhFinalUrl);

        // Check if we successfully reached DKMH or got redirected to login
        if (dkmhFinalUrl.includes('sso.hcmut.edu.vn') || dkmhFinalUrl.includes('cas/login')) {
            console.log('[DKMH] Redirected to login, session may be invalid');
            return { success: false, error: 'Không thể truy cập trang DKMH' };
        }

        const dkmhHtml = await dkmhResponse.text();

        // Save for debugging
        const fs = await import('fs');
        fs.writeFileSync('debug_dkmh.html', dkmhHtml);
        console.log('[DEBUG] Saved DKMH HTML to server/debug_dkmh.html');

        // Get all cookies
        const ssoCookies = await jar.getCookies('https://sso.hcmut.edu.vn');
        const mybkCookies = await jar.getCookies('https://mybk.hcmut.edu.vn');
        const dkmhCookies = await jar.getCookies('https://mybk.hcmut.edu.vn/dkmh');

        const allCookiesMap = new Map();
        [...ssoCookies, ...mybkCookies, ...dkmhCookies].forEach(c => {
            allCookiesMap.set(c.key, c.cookieString());
        });
        const cookieString = Array.from(allCookiesMap.values()).join('; ');

        console.log('[DKMH] Cookies collected:', cookieString.substring(0, 100) + '...');

        // Check if page contains expected content
        const isLoggedIn = dkmhHtml.includes('Đăng ký môn học') ||
            dkmhHtml.includes('dangKyMonHoc') ||
            dkmhHtml.includes('logout') ||
            dkmhHtml.includes('Đăng xuất') ||
            dkmhHtml.includes('dkmh') ||
            dkmhHtml.length > 1000; // If page is substantial, likely logged in

        if (!isLoggedIn) {
            console.log('[DKMH] Page content may not indicate successful login (length:', dkmhHtml.length, ')');
        } else {
            console.log('[DKMH] Page content looks good (length:', dkmhHtml.length, ')');
        }

        return {
            success: true,
            cookieString: cookieString,
            jar: jar,
            dkmhUrl: dkmhFinalUrl
        };

    } catch (error) {
        console.error('[DKMH] Error:', error);
        return { success: false, error: error.message };
    }
}

// DKMH Login endpoint - uses same credentials as MyBK
app.post('/api/dkmh/login', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    // Option 1: Reuse existing session credentials
    // Option 2: Use credentials from request body
    const { username, password } = req.body;

    let loginUsername, loginPassword;

    if (username && password) {
        loginUsername = username;
        loginPassword = password;
    } else if (session && session.username) {
        // We don't store password, so we can't auto-login
        // User must provide credentials
        return res.status(400).json({
            error: 'Vui lòng cung cấp username và password cho DKMH',
            message: 'DKMH requires separate login credentials'
        });
    } else {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    console.log(`[API] DKMH Login request for ${loginUsername}`);

    const result = await performDKMHLogin(loginUsername, loginPassword);

    if (result.success) {
        // Store DKMH session info
        const dkmhSessionToken = Buffer.from(`dkmh:${loginUsername}:${Date.now()}`).toString('base64');

        sessions.set(dkmhSessionToken, {
            type: 'dkmh',
            username: loginUsername,
            cookie: result.cookieString,
            dkmhUrl: result.dkmhUrl,
            createdAt: Date.now()
        });

        // Also update existing MyBK session if available
        if (session) {
            session.dkmhCookie = result.cookieString;
            session.dkmhToken = dkmhSessionToken;
        }

        res.json({
            success: true,
            dkmhToken: dkmhSessionToken,
            message: 'Đăng nhập DKMH thành công'
        });
    } else {
        res.status(401).json({ error: result.error });
    }
});

// DKMH Session Check
app.get('/api/dkmh/check', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session || session.type !== 'dkmh') {
        return res.status(401).json({
            authenticated: false,
            error: 'DKMH session not found'
        });
    }

    // Optionally verify by making a request to DKMH
    try {
        const testUrl = 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action';
        const response = await nodeFetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': session.cookie,
                'Referer': 'https://mybk.hcmut.edu.vn/my/homeSSO.action'
            },
            redirect: 'manual'
        });

        // If redirected to login, session is invalid
        if (response.status === 302 || response.status === 301) {
            const location = response.headers.get('location');
            if (location && (location.includes('login') || location.includes('sso'))) {
                sessions.delete(token);
                return res.json({ authenticated: false, error: 'Session expired' });
            }
        }

        res.json({
            authenticated: true,
            username: session.username,
            createdAt: session.createdAt
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Proxy endpoint for DKMH requests
app.all('/api/dkmh/proxy', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.type === 'dkmh' ? session.cookie : session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found. Please login to DKMH first.' });
    }

    const { url, method = 'GET', body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[DKMH Proxy] ${method} ${url}`);

    try {
        const options = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': dkmhCookie,
                'Referer': 'https://mybk.hcmut.edu.vn/dkmh/',
                'Origin': 'https://mybk.hcmut.edu.vn',
                'Accept': 'application/json, text/html, */*'
            }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = typeof body === 'string' ? body : JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await nodeFetch(url, options);
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.send(text);
        }
    } catch (e) {
        console.error('[DKMH Proxy] Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get list of registration periods (parsed from DKMH page)
app.get('/api/dkmh/registration-periods', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.dkmhCookie;

    if (!dkmhCookie) {
        return res.status(401).json({
            error: 'DKMH session not found. Please wait for DKMH login to complete.',
            dkmhLoggedIn: false
        });
    }

    console.log('[DKMH] Fetching registration periods...');

    try {
        // Fetch the DKMH page
        const response = await nodeFetch('https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': dkmhCookie,
                'Referer': 'https://mybk.hcmut.edu.vn/dkmh/home.action',
                'Accept': 'text/html,application/xhtml+xml'
            }
        });

        const html = await response.text();

        // Parse registration periods from HTML
        const periods = [];

        // Match pattern: onclick="ketQuaDangKyView(ID, ...);" followed by table cells
        const rowRegex = /<tr[^>]*onclick="ketQuaDangKyView\((\d+)[^"]*"[^>]*>\s*<td>(\d+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;

        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            const id = parseInt(match[1]);
            const stt = parseInt(match[2]);
            const code = match[3].trim();
            // Clean HTML tags from description
            const description = match[4].replace(/<[^>]+>/g, '').trim();
            const startTime = match[5].trim();
            const endTime = match[6].trim();

            // Determine status based on current time
            const now = new Date();
            const start = parseVietnameseDate(startTime);
            const end = parseVietnameseDate(endTime);

            let status = 'upcoming'; // sắp mở
            if (now >= start && now <= end) {
                status = 'open'; // đang mở
            } else if (now > end) {
                status = 'closed'; // đã đóng
            }

            // Check if it's a result period
            const hasResult = description.toLowerCase().includes('kết quả');

            periods.push({
                id,
                stt,
                code,
                description,
                startTime,
                endTime,
                start: start?.toISOString(),
                end: end?.toISOString(),
                status,
                hasResult
            });
        }

        // Limit to 10 periods
        const limitedPeriods = periods.slice(0, 10);

        console.log(`[DKMH] Parsed ${periods.length} periods, returning ${limitedPeriods.length}`);

        res.json({
            success: true,
            data: limitedPeriods,
            total: limitedPeriods.length,
            allTotal: periods.length
        });

    } catch (e) {
        console.error('[DKMH] Error parsing registration periods:', e);
        res.status(500).json({ error: e.message });
    }
});

// Get registration period details (courses registered, schedule)
app.post('/api/dkmh/period-details', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);
    const { periodId } = req.body;

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const dkmhCookie = session.dkmhCookie;
    if (!dkmhCookie) {
        return res.status(401).json({ error: 'DKMH session not found' });
    }

    if (!periodId) {
        return res.status(400).json({ error: 'periodId is required' });
    }

    console.log(`[DKMH] Fetching period details for ID: ${periodId}`);

    try {
        // Create a new cookie jar for this sequence of requests
        const { CookieJar } = await import('tough-cookie');
        const fetchCookieModule = await import('fetch-cookie');
        const fetchCookie = fetchCookieModule.default;

        const jar = new CookieJar();
        const fetch = fetchCookie(nodeFetch, jar);

        // Initialize jar with existing cookies
        const cookieParts = dkmhCookie.split('; ');
        for (const part of cookieParts) {
            try {
                await jar.setCookie(part, 'https://mybk.hcmut.edu.vn');
            } catch (e) { }
        }

        const baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action',
            'Accept': '*/*'
        };

        // Step 1: ketQuaDangKyView.action - This returns the actual course HTML!
        // IMPORTANT: Parameter is "hocKyId" not "dotDKId"
        console.log('[DKMH] Step 1: ketQuaDangKyView.action with hocKyId=' + periodId);
        const ketQuaResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/ketQuaDangKyView.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `hocKyId=${periodId}`
        });
        const ketQuaHtml = await ketQuaResponse.text();
        console.log('[DKMH] ketQuaDangKyView response length:', ketQuaHtml.length);

        // Step 2: getDanhSachDotDK.action
        console.log('[DKMH] Step 2: getDanhSachDotDK.action...');
        await fetch('https://mybk.hcmut.edu.vn/dkmh/getDanhSachDotDK.action', {
            method: 'POST',
            headers: baseHeaders,
            body: ''
        });

        // Step 3: getLichDangKy.action
        console.log('[DKMH] Step 3: getLichDangKy.action...');
        const lichResponse = await fetch('https://mybk.hcmut.edu.vn/dkmh/getLichDangKy.action', {
            method: 'POST',
            headers: baseHeaders,
            body: `dotDKId=${periodId}`
        });
        const lichHtml = await lichResponse.text();

        // Parse courses from ketQuaDangKyView HTML (not getKetQuaDangKy)
        const courses = parsePeriodDetailsHtml(ketQuaHtml);
        const schedule = parseScheduleHtml(lichHtml);

        res.json({
            success: true,
            data: {
                courses,
                schedule,
                periodId,
                rawHtml: ketQuaHtml.substring(0, 500) + '...'
            }
        });

    } catch (e) {
        console.error('[DKMH] Error fetching period details:', e);
        res.status(500).json({ error: e.message });
    }
});

// Parse course details from ketQuaDangKyView HTML
function parsePeriodDetailsHtml(html) {
    const courses = [];

    // Save HTML for debugging (async, but we don't wait)
    import('fs').then(fs => {
        fs.writeFileSync('debug_period_details.html', html);
        console.log('[DKMH] Saved period details HTML to server/debug_period_details.html');
    });

    // Match each panel (course) block - handle newlines with [\s\S]
    // Structure: <div class='col-md-1'>1</div>\n<div class='col-md-8'>\nSA0004 - Name\n</div>\n<div class='col-md-1'>\n0.0\n</div>
    const panelRegex = /<div class='col-md-1'>(\d+)<\/div>[\s\S]*?<div class='col-md-8'>[\s\S]*?([A-Z]{2}\d{4})\s*-\s*([\s\S]*?)<\/div>[\s\S]*?<div class='col-md-1'>[\s\S]*?([\d.]+)[\s\S]*?<\/div>/g;

    let match;
    let count = 0;
    while ((match = panelRegex.exec(html)) !== null) {
        count++;
        const stt = parseInt(match[1]);
        const code = match[2].trim();
        const name = match[3].replace(/<[^>]+>/g, '').trim();
        const credits = parseFloat(match[4]);

        // Try to find schedule info for this course
        const scheduleInfo = extractCourseSchedule(html, code);

        // Check if locked by looking for fa-lock after the course section
        const courseIdx = html.indexOf(code);
        const nextPanelIdx = html.indexOf('<div class="panel panel-default">', courseIdx + 1);
        const courseSection = nextPanelIdx > 0
            ? html.substring(courseIdx, nextPanelIdx)
            : html.substring(courseIdx, courseIdx + 2000);
        const isLocked = courseSection.includes('fa-lock');

        courses.push({
            stt,
            code,
            name,
            credits,
            isLocked,
            ...scheduleInfo
        });
    }

    console.log(`[DKMH] Parsed ${count} courses from HTML`);

    // Extract total credits and count from HTML
    const totalCreditsMatch = html.match(/Tổng số tín chỉ đăng ký:\s*([\d.]+)/);
    const totalCoursesMatch = html.match(/Tổng số môn đăng ký:\s*(\d+)/);

    return {
        courses,
        totalCredits: totalCreditsMatch ? parseFloat(totalCreditsMatch[1]) : 0,
        totalCourses: totalCoursesMatch ? parseInt(totalCoursesMatch[1]) : courses.length
    };
}

// Extract schedule info for a specific course
function extractCourseSchedule(html, courseCode) {
    // Find the section for this course
    const codeIdx = html.indexOf(courseCode);
    if (codeIdx === -1) return {};

    // Get section from code to next panel
    const nextPanelIdx = html.indexOf('<div class="panel panel-default">', codeIdx + 1);
    const courseSection = nextPanelIdx > 0
        ? html.substring(codeIdx, nextPanelIdx)
        : html.substring(codeIdx, codeIdx + 3000);

    // Extract group (first item_list after the table headers)
    const groupMatch = courseSection.match(/<td class='item_list'>\s*\n?\s*([A-Z0-9_]+)\s*\n?\s*<\/td>/);

    // Extract slots (DK/Sĩ số format: 800/800)
    const slotsMatch = courseSection.match(/<td class='item_list'>(\d+\/\d+)/);

    // Extract day (Thứ X or Chưa biết)
    const dayMatch = courseSection.match(/<td class='item_list'>(Thứ \d|Chưa biết)/);

    // Extract room (pattern like A5-HTA5, B4-402)
    const roomMatch = courseSection.match(/<td class='item_list'>([A-Z]\d+-[A-Z0-9]+)/);

    return {
        group: groupMatch ? groupMatch[1].trim() : '',
        slots: slotsMatch ? slotsMatch[1] : '',
        day: dayMatch ? dayMatch[1] : '',
        room: roomMatch ? roomMatch[1] : ''
    };
}

// Parse schedule from getLichDangKy HTML
function parseScheduleHtml(html) {
    const fromMatch = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    const toMatch = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})[\s\S]*?<\/td>\s*<\/tr>/);
    const inScheduleMatch = html.match(/id="hdTrongHanDK"\s+value="(\w+)"/);

    // Find both date times
    const dates = html.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/g) || [];

    return {
        from: dates[0] || '',
        to: dates[1] || '',
        isOpen: inScheduleMatch ? inScheduleMatch[1] === 'true' : false
    };
}

// Helper to parse Vietnamese date format (DD/MM/YYYY HH:mm)
function parseVietnameseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
        return new Date(year, month - 1, day, hour, minute);
    } catch (e) {
        return null;
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Advanced MyBK Proxy running on http://localhost:${PORT}`);
});

