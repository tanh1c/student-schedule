/**
 * ═══════════════════════════════════════════════════════
 * PRIVACY HELPERS - Mask sensitive data in logs
 * ═══════════════════════════════════════════════════════
 */

/**
 * Mask sensitive string - show first 4 chars + ...
 * @param {string} str 
 * @param {number} showChars 
 */
export function maskSensitive(str, showChars = 4) {
    if (!str || str.length <= showChars) return '***';
    return str.substring(0, showChars) + '...';
}

/**
 * Mask student ID (MSSV) - show first 3 + last 2 digits
 * @param {string|number} mssv 
 */
export function maskStudentId(mssv) {
    if (!mssv) return '***';
    const str = String(mssv);
    if (str.length <= 5) return '***';
    return str.substring(0, 3) + '***' + str.substring(str.length - 2);
}

/**
 * Mask cookie string - hide values but show keys
 * @param {string} cookieStr 
 */
export function maskCookie(cookieStr) {
    if (!cookieStr) return '(empty)';
    return cookieStr.replace(/=([^;]+)/g, '=***');
}

/**
 * Mask URL containing sensitive params
 * @param {string} url 
 */
export function maskUrl(url) {
    if (!url) return '';
    return url
        .replace(/masv=\d+/g, 'masv=***')
        .replace(/jsessionid=[^&;/]+/gi, 'jsessionid=***')
        .replace(/SESSION=[^&;]+/gi, 'SESSION=***');
}
