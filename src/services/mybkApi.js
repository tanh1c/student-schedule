/**
 * MyBK API Service
 * Handles authentication and data fetching from MyBK via our proxy server
 */

// Use relative path - Vite will proxy to backend
const API_BASE = '/api';

// Token storage
const TOKEN_KEY = 'mybk_auth_token';
const USER_KEY = 'mybk_user_data';
const REFRESH_TOKEN_KEY = 'mybk_refresh_token';

// Migration: Remove old insecure credential storage (Base64 plaintext password)
// This runs once — after all users have updated, this block can be removed
try {
    if (localStorage.getItem('mybk_saved_credentials')) {
        localStorage.removeItem('mybk_saved_credentials');
        console.log('[mybkApi] Removed legacy insecure credential storage');
    }
} catch (e) { /* ignore */ }

// Cache for student info to avoid repeated API calls
let studentInfoCache = {
    data: null,
    timestamp: 0,
    promise: null  // For deduplicating concurrent requests
};
const STUDENT_INFO_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
 * @param {boolean} rememberMe - Whether to create a refresh token
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function login(username, password, rememberMe = false) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, rememberMe }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store token and user data
            localStorage.setItem(TOKEN_KEY, data.token);
            if (data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            // Store refresh token if server provided one (rememberMe was true)
            if (data.refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
            } else {
                localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
            return { success: true, user: data.user };
        }

        // Return code if present (e.g., MAX_SESSIONS_REACHED)
        return {
            success: false,
            error: data.error || 'Đăng nhập thất bại',
            code: data.code || null
        };
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
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear all local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Clear cache
    studentInfoCache = { data: null, timestamp: 0, promise: null };
}

/**
 * Clear student info cache (call on logout or when data changes)
 */
export function clearStudentInfoCache() {
    studentInfoCache = { data: null, timestamp: 0, promise: null };
}

/**
 * Get stored refresh token
 */
export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if a refresh token exists (for auto-login UI)
 */
export function hasRefreshToken() {
    return !!localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Refresh session using stored refresh token
 * Used when session expires but user had "Remember Me" enabled
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function refreshSession() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return { success: false, error: 'No refresh token' };
    }

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update session token
            localStorage.setItem(TOKEN_KEY, data.token);
            if (data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            return { success: true, user: data.user };
        }

        // If refresh failed, clear the invalid refresh token
        if (data.code === 'REFRESH_TOKEN_EXPIRED' || data.code === 'REFRESH_AUTH_FAILED') {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }

        return {
            success: false,
            error: data.error || 'Refresh failed',
            code: data.code || null,
        };
    } catch (error) {
        console.error('Refresh session error:', error);
        return { success: false, error: 'Không thể kết nối đến server' };
    }
}

/**
 * Get student info with caching
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getStudentInfo(forceRefresh = false) {
    const token = getAuthToken();

    if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
    }

    const now = Date.now();

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && studentInfoCache.data && (now - studentInfoCache.timestamp) < STUDENT_INFO_CACHE_TTL) {
        console.log('[Cache] Using cached student info');
        return { success: true, data: studentInfoCache.data };
    }

    // If there's already a request in progress, wait for it
    if (studentInfoCache.promise) {
        console.log('[Cache] Waiting for pending student info request');
        return studentInfoCache.promise;
    }

    // Create new request
    studentInfoCache.promise = (async () => {
        try {
            const response = await fetch(`${API_BASE}/student/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                // Token expired, clear storage
                logout();
                clearStudentInfoCache();
                return { success: false, error: 'Phiên đăng nhập đã hết hạn' };
            }

            const data = await response.json();

            if (response.ok) {
                const studentData = data.data || data;
                // Save to localStorage so other components can access
                localStorage.setItem(USER_KEY, JSON.stringify(studentData));

                // Update cache
                studentInfoCache.data = studentData;
                studentInfoCache.timestamp = Date.now();

                return { success: true, data: studentData };
            }

            return { success: false, error: data.error || 'Không thể lấy thông tin sinh viên' };
        } catch (error) {
            console.error('Get student info error:', error);
            return { success: false, error: 'Không thể kết nối đến server' };
        } finally {
            // Clear the pending promise
            studentInfoCache.promise = null;
        }
    })();

    return studentInfoCache.promise;
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
 * Get student exam schedule
 * @param {string|number} studentId - Student ID (MSSV)
 * @param {number} namhoc - Academic year (e.g., 2025)
 * @param {number} hocky - Semester (1 or 2)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getExamSchedule(studentId, namhoc, hocky) {
    const token = getAuthToken();

    if (!token) {
        return { success: false, error: 'Chưa đăng nhập' };
    }

    try {
        const response = await fetch(
            `${API_BASE}/student/exam-schedule?studentId=${studentId}&namhoc=${namhoc}&hocky=${hocky}`,
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

        if (response.ok && (data.code === '200' || data.code === 200)) {
            return { success: true, data: data.data?.data || [] };
        }

        return { success: false, error: data.msg || 'Không thể lấy lịch thi' };
    } catch (error) {
        console.error('Get exam schedule error:', error);
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
        // Parse period: API uses startLesson (1-indexed lesson number) and numOfLesson
        const startPeriod = item.startLesson || item.startPeriod || 1;
        const numOfLessons = item.numOfLesson || item.numOfPeriod || 1;
        const endPeriod = startPeriod + numOfLessons - 1;

        // Parse weeks from weekSeriesDisplay or semesterWeek or weekStudy
        const weeksStr = item.weekSeriesDisplay || item.weekStudy || item.semesterWeek || '';
        const weeks = parseWeeksFromString(weeksStr);

        // dayOfWeek: API uses same numbering as our calendar
        // API dayOfWeek: 2=Thứ 2 (Monday), 3=Thứ 3, 4=Thứ 4, 5=Thứ 5, 6=Thứ 6, 7=Thứ 7
        // dayOfWeek: 0 means not scheduled (like SA0002 with startTime 0:00)
        let day = item.dayOfWeek;
        if (day === undefined) {
            day = item.day || 2;
        }
        // If day is 0, it's not scheduled - skip or hide
        // Keep day as is since API uses same numbering

        return {
            code: item.subject?.code || item.subjectCode || '',
            name: item.subject?.nameVi || item.subjectName || '',
            day: day,
            startPeriod: startPeriod,
            endPeriod: endPeriod,
            room: item.room?.code || item.roomCode || '',
            credits: item.subject?.numOfCredits || item.credits || 0,
            time: item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : (item.time || ''),
            group: item.subjectClassGroup?.classGroup || item.classGroup || '',
            location: item.room?.building?.campus?.nameVi || item.campus || '',
            weeks: weeks,
            teacher: item.employee ?
                `${item.employee.lastName || ''} ${item.employee.firstName || ''}`.trim() :
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

// Cache for registration periods
let registrationPeriodsCache = {
    data: null,
    timestamp: 0,
    promise: null
};
const REGISTRATION_PERIODS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Clear registration periods cache
 */
export function clearRegistrationPeriodsCache() {
    registrationPeriodsCache = { data: null, timestamp: 0, promise: null };
}

/**
 * Get list of registration periods (parsed by backend) - with caching
 * @param {boolean} forceRefresh - Force refresh from API
 */
export async function getRegistrationPeriods(forceRefresh = false) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    const now = Date.now();

    // Return cached data if valid
    if (!forceRefresh && registrationPeriodsCache.data && (now - registrationPeriodsCache.timestamp) < REGISTRATION_PERIODS_CACHE_TTL) {
        console.log('[Cache] Using cached registration periods');
        return registrationPeriodsCache.data;
    }

    // If request in progress, wait for it
    if (registrationPeriodsCache.promise) {
        console.log('[Cache] Waiting for pending registration periods request');
        return registrationPeriodsCache.promise;
    }

    // Create new request
    registrationPeriodsCache.promise = (async () => {
        try {
            const response = await fetch(`${API_BASE}/dkmh/registration-periods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Update cache
                registrationPeriodsCache.data = data;
                registrationPeriodsCache.timestamp = Date.now();
                return data;
            }

            const errorData = await response.json();
            return { success: false, error: errorData.error };
        } catch (e) {
            console.error('Get registration periods error:', e);
            return { success: false, error: e.message };
        } finally {
            registrationPeriodsCache.promise = null;
        }
    })();

    return registrationPeriodsCache.promise;
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

/**
 * Search courses for registration
 * @param {string} periodId - Registration period ID
 * @param {string} query - Course code or name to search
 * @param {boolean} forceMode - (Hidden) Skip validation for force registration
 */
export async function searchCourses(periodId, query, forceMode = false) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/search-courses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ periodId, query, forceMode })
        });

        if (response.ok) {
            const data = await response.json();
            // Pass forceMode flag to response for UI to know
            data.forceMode = forceMode;
            return data;
        }

        const errorData = await response.json();
        return { success: false, error: errorData.error };
    } catch (e) {
        console.error('Search courses error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Get class groups for a course
 * @param {string} periodId - Registration period ID
 * @param {string} monHocId - Course ID
 */
export async function getClassGroups(periodId, monHocId) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/class-groups`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ periodId, monHocId })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        const errorData = await response.json();
        return { success: false, error: errorData.error };
    } catch (e) {
        console.error('Get class groups error:', e);
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
    getExamSchedule,
    transformScheduleData,
    // Auth - Refresh
    refreshSession,
    hasRefreshToken,
    getRefreshToken,
    // DKMH
    checkDkmhStatus,
    dkmhRequest,
    getDkmhPage,
    getRegistrationPeriods,
    getPeriodDetails,
    searchCourses,
    getClassGroups,
    registerCourse,
    getRegistrationResult,
    cancelCourseRegistration,
};

/**
 * Register for a class group
 * @param {string} periodId - Registration period ID
 * @param {string} nlmhId - Class group ID (NLMHId)
 * @param {string} monHocId - Course ID
 * @param {boolean} forceMode - (Hidden) Force registration bypassing validation
 */
export async function registerCourse(periodId, nlmhId, monHocId, forceMode = false) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ periodId, nlmhId, monHocId, forceMode })
        });

        const data = await response.json();
        return data;
    } catch (e) {
        console.error('Register course error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Get registration result (updated list after registration)
 * @param {string} periodId - Registration period ID
 */
export async function getRegistrationResult(periodId) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/registration-result`, {
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
        console.error('Get registration result error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Cancel registration for a course
 * @param {string} periodId - Registration period ID
 * @param {string} ketquaId - Registration result ID
 * @param {string} monHocMa - Course code
 */
export async function cancelCourseRegistration(periodId, ketquaId, monHocMa) {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Chưa đăng nhập' };

    try {
        const response = await fetch(`${API_BASE}/dkmh/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ periodId, ketquaId, monHocMa })
        });

        const data = await response.json();
        return data;
    } catch (e) {
        console.error('Cancel course registration error:', e);
        return { success: false, error: e.message };
    }
}
