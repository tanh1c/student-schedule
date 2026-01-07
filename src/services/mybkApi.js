/**
 * MyBK API Service
 * Handles authentication and data fetching from MyBK via our proxy server
 */

// Use relative path - Vite will proxy to backend
const API_BASE = '/api';

// Token storage
const TOKEN_KEY = 'mybk_auth_token';
const USER_KEY = 'mybk_user_data';

/**
 * Get stored auth token
 */
export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user data
 */
export function getUserData() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Login with MyBK/CAS credentials
 * @param {string} username - Student username (MSSV or email)
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store token and user data
            localStorage.setItem(TOKEN_KEY, data.token);
            if (data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            return { success: true, user: data.user };
        }

        return { success: false, error: data.error || 'Đăng nhập thất bại' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Không thể kết nối đến server' };
    }
}

/**
 * Logout and clear stored data
 */
export async function logout() {
    const token = getAuthToken();

    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get student info
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getStudentInfo() {
    const token = getAuthToken();

    if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
        const response = await fetch(`${API_BASE}/student/info`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            // Token expired, clear storage
            logout();
            return { success: false, error: 'Phiên đăng nhập đã hết hạn' };
        }

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data.data || data };
        }

        return { success: false, error: data.error || 'Không thể lấy thông tin sinh viên' };
    } catch (error) {
        console.error('Get student info error:', error);
        return { success: false, error: 'Không thể kết nối đến server' };
    }
}

/**
 * Get student schedule
 * @param {string|number} studentId - Student ID
 * @param {string} semesterYear - Semester year code (e.g., "20251")
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getSchedule(studentId, semesterYear) {
    const token = getAuthToken();

    if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
        const response = await fetch(
            `${API_BASE}/student/schedule?studentId=${studentId}&semesterYear=${semesterYear}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (response.status === 401) {
            logout();
            return { success: false, error: 'Phiên đăng nhập đã hết hạn' };
        }

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data.data || data };
        }

        return { success: false, error: data.error || 'Không thể lấy thời khóa biểu' };
    } catch (error) {
        console.error('Get schedule error:', error);
        return { success: false, error: 'Không thể kết nối đến server' };
    }
}

/**
 * Get GPA summary (transcript progress)
 */
export async function getGpaSummary(studentId) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/student/gpa/summary`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        });

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        return { success: true, data: data.data || data };
    } catch (e) {
        console.error('Info fetch error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Get detailed GPA (curriculum subjects)
 */
export async function getGpaDetail(studentId) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/student/gpa/detail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        });

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        return { success: true, data: data.data || [] };
    } catch (e) {
        console.error('Info fetch error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Transform MyBK schedule data to our app format
 * @param {array} mybkData - Raw data from MyBK API
 * @returns {array} - Transformed schedule data for our components
 */
export function transformScheduleData(mybkData) {
    if (!mybkData || !Array.isArray(mybkData)) {
        return [];
    }

    return mybkData.map(item => {
        // Parse period string like "1 - 3" 
        const startPeriod = item.startPeriod || 1;
        const endPeriod = item.endPeriod || startPeriod;

        // Parse weeks from semesterWeek or weekStudy
        const weeks = parseWeeksFromString(item.weekStudy || item.semesterWeek || '');

        return {
            code: item.subject?.code || item.subjectCode || '',
            name: item.subject?.nameVi || item.subjectName || '',
            day: item.dayOfWeek || item.day || 2,
            startPeriod: startPeriod,
            endPeriod: endPeriod,
            room: item.room?.code || item.roomCode || '',
            credits: item.subject?.numOfCredits || item.credits || 0,
            time: item.time || '',
            group: item.subjectClassGroup?.classGroup || item.classGroup || '',
            location: item.room?.building?.campus?.nameVi || item.campus || '',
            weeks: weeks,
            teacher: item.employee ?
                `${item.employee.lastName} ${item.employee.firstName}` :
                item.teacherName || '',
            // Original data for reference
            _raw: item
        };
    });
}

/**
 * Parse weeks string like "35|36|37|38|39|40|41|42|--44|45|46|47|48|49|50"
 */
function parseWeeksFromString(weeksStr) {
    if (!weeksStr) return [];

    const weeks = [];
    const parts = weeksStr.split('|');

    parts.forEach(part => {
        if (part === '--' || !part) return;

        if (part.includes('-') && !part.startsWith('--')) {
            const cleanPart = part.replace(/^--/, '');
            const [start, end] = cleanPart.split('-').map(w => parseInt(w));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    weeks.push(i);
                }
            }
        } else {
            const num = parseInt(part.replace(/^--/, ''));
            if (!isNaN(num)) {
                weeks.push(num);
            }
        }
    });

    return weeks;
}

// ===============================================
// DKMH (Đăng ký môn học) API Functions
// ===============================================

/**
 * Check DKMH session status
 * Since DKMH login is done automatically with MyBK login,
 * this checks if the session has DKMH access
 */
export async function checkDkmhStatus() {
    const token = getAuthToken();
    if (!token) return { authenticated: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return { authenticated: false };
    } catch (e) {
        console.error('DKMH status check error:', e);
        return { authenticated: false, error: e.message };
    }
}

/**
 * Make a proxied request to DKMH system
 * @param {string} url - Full URL to the DKMH endpoint
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body (for POST/PUT)
 */
export async function dkmhRequest(url, method = 'GET', body = null) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/proxy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, method, body })
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return { success: true, data: await response.json() };
            }
            return { success: true, data: await response.text() };
        }

        const errorData = await response.json();
        return { success: false, error: errorData.error || 'DKMH request failed' };
    } catch (e) {
        console.error('DKMH request error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Get DKMH page content (for parsing available courses, etc.)
 */
export async function getDkmhPage() {
    return dkmhRequest('https://mybk.hcmut.edu.vn/dkmh/dangKyMonHocForm.action', 'GET');
}

/**
 * Get list of registration periods (parsed by backend)
 */
export async function getRegistrationPeriods() {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/registration-periods`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        const errorData = await response.json();
        return { success: false, error: errorData.error };
    } catch (e) {
        console.error('Get registration periods error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Get registration period details (registered courses, schedule)
 */
export async function getPeriodDetails(periodId) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/period-details`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ periodId })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        const errorData = await response.json();
        return { success: false, error: errorData.error };
    } catch (e) {
        console.error('Get period details error:', e);
        return { success: false, error: e.message };
    }
}

export default {
    login,
    logout,
    isAuthenticated,
    getAuthToken,
    getUserData,
    getStudentInfo,
    getGpaSummary,
    getGpaDetail,
    getSchedule,
    transformScheduleData,
    // DKMH
    checkDkmhStatus,
    dkmhRequest,
    getDkmhPage,
    getRegistrationPeriods,
    getPeriodDetails,
};
