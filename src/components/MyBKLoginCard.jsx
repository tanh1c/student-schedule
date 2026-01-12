import React, { useState, useEffect } from 'react';
import {
    LogIn,
    LogOut,
    Eye,
    EyeOff,
    RefreshCw,
    User,
    GraduationCap,
    CheckCircle2,
    Download,
    Mail,
    Phone,
    CalendarDays,
    Building2,
    AlertCircle,
    ServerOff,
    Loader2
} from 'lucide-react';
import * as mybkApi from '../services/mybkApi';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

/**
 * Generate semester options for dropdown
 */
function getSemesterOptions() {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Generate semesters from 2 years ago to current
    for (let year = currentYear; year >= currentYear - 2; year--) {
        // HK1 of year-year+1
        options.push({
            value: `${year}1`,
            label: `HK1 ${year}-${year + 1}`,
            isCurrent: (currentMonth >= 8 && year === currentYear) || (currentMonth <= 1 && year === currentYear - 1)
        });
        // HK2 of year-year+1
        options.push({
            value: `${year}2`,
            label: `HK2 ${year}-${year + 1}`,
            isCurrent: currentMonth >= 2 && currentMonth <= 7 && year === currentYear - 1
        });
    }

    return options;
}

/**
 * Get current semester code
 */
function getCurrentSemester() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Semester 1: August to January (Aug 2025 - Jan 2026 = 20251)
    // Semester 2: February to July (Feb 2026 - Jul 2026 = 20252)

    // Hardcoded to HK2 2025-2026 as per user request
    return '20252';

    /* Original Logic:
    if (currentMonth >= 8) {
        // Aug-Dec: HK1 of currentYear
        return `${currentYear}1`;
    } else if (currentMonth <= 1) {
        // Jan: still HK1 of previous year
        return `${currentYear - 1}1`;
    } else {
        // Feb-Jul: HK2 of previous year
        return `${currentYear - 1}2`;
    }
    */
}

/**
 * MyBK Login & Sync Component
 * Allows users to login with their MyBK credentials and fetch schedule automatically
 */
// Key for storing credentials
const SAVED_CREDENTIALS_KEY = 'mybk_saved_credentials';

function MyBKLoginCard({ onScheduleFetched, onError }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester());
    const [rememberMe, setRememberMe] = useState(false);
    const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

    const semesterOptions = getSemesterOptions();

    // Load saved credentials on mount
    const loadSavedCredentials = () => {
        try {
            const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY);
            if (saved) {
                const decoded = JSON.parse(atob(saved));
                if (decoded.username && decoded.password) {
                    setUsername(decoded.username);
                    setPassword(decoded.password);
                    setRememberMe(true);
                    return decoded;
                }
            }
        } catch (e) {
            console.error('Error loading saved credentials:', e);
            localStorage.removeItem(SAVED_CREDENTIALS_KEY);
        }
        return null;
    };

    // Save credentials to localStorage
    const saveCredentials = (user, pass) => {
        try {
            const encoded = btoa(JSON.stringify({ username: user, password: pass }));
            localStorage.setItem(SAVED_CREDENTIALS_KEY, encoded);
        } catch (e) {
            console.error('Error saving credentials:', e);
        }
    };

    // Clear saved credentials
    const clearSavedCredentials = () => {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
    };

    useEffect(() => {
        checkServerStatus();

        // Load saved credentials
        const savedCreds = loadSavedCredentials();

        if (mybkApi.isAuthenticated()) {
            setIsLoggedIn(true);
            loadStudentInfo();
        } else if (savedCreds && !autoLoginAttempted) {
            // Auto-login if credentials are saved and not already attempted
            setAutoLoginAttempted(true);
        }
    }, []);

    // Auto-login effect when credentials are loaded
    useEffect(() => {
        if (autoLoginAttempted && username && password && serverStatus === 'online' && !isLoggedIn) {
            handleLogin();
        }
    }, [autoLoginAttempted, username, password, serverStatus]);

    const checkServerStatus = async () => {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                setServerStatus('online');
            } else {
                setServerStatus('offline');
            }
        } catch (err) {
            setServerStatus('offline');
        }
    };

    const loadStudentInfo = async () => {
        const result = await mybkApi.getStudentInfo();
        if (result.success && result.data) {
            setStudentInfo(result.data);
        }
    };

    const handleLogin = async (e) => {
        e?.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await mybkApi.login(username, password);

            if (result.success) {
                setIsLoggedIn(true);

                // Save credentials if Remember Me is checked
                if (rememberMe) {
                    saveCredentials(username, password);
                } else {
                    clearSavedCredentials();
                }

                setPassword('');
                await loadStudentInfo();
            } else {
                setError(result.error || 'Đăng nhập thất bại');
                // Clear saved credentials if login fails
                clearSavedCredentials();
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async (clearRemembered = false) => {
        await mybkApi.logout();
        setIsLoggedIn(false);
        setStudentInfo(null);

        if (clearRemembered) {
            clearSavedCredentials();
            setUsername('');
            setPassword('');
            setRememberMe(false);
        } else {
            // Keep username for convenience, reload password if saved
            loadSavedCredentials();
        }
    };

    const handleSyncSchedule = async () => {
        if (!studentInfo) {
            setError('Không có thông tin sinh viên');
            return;
        }

        setSyncing(true);
        setError('');

        try {
            const result = await mybkApi.getSchedule(studentInfo.id, selectedSemester);

            if (result.success && result.data) {
                const transformedData = mybkApi.transformScheduleData(result.data);
                if (transformedData.length > 0) {
                    onScheduleFetched?.(transformedData);
                    setError('');
                } else {
                    setError(`Không tìm thấy thời khóa biểu cho ${semesterOptions.find(s => s.value === selectedSemester)?.label}`);
                }
            } else {
                setError(result.error || 'Không thể lấy thời khóa biểu');
                onError?.(result.error);
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi đồng bộ');
            onError?.(err.message);
        } finally {
            setSyncing(false);
        }
    };

    // Server offline state
    if (serverStatus === 'offline') {
        return (
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
                <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
                    <ServerOff className="h-4 w-4" />
                    Backend Server chưa chạy
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Để sử dụng tính năng đồng bộ tự động, bạn cần khởi động backend server:
                </p>
                <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono mb-3">
                    cd server<br />npm install<br />npm start
                </div>
                <Button variant="outline" size="sm" onClick={checkServerStatus}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Kiểm tra lại
                </Button>
            </div>
        );
    }

    if (serverStatus === 'checking') {
        return (
            <div className="flex items-center gap-3 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Đang kiểm tra kết nối server...</span>
            </div>
        );
    }

    // Logged in state - Show full student info
    if (isLoggedIn) {
        return (
            <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/10 dark:bg-green-900/5 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold text-sm">Đã kết nối MyBK</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-foreground h-auto p-1 px-2"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                    </Button>
                </div>

                {/* Full Student Info Card */}
                {studentInfo && (
                    <Card className="mb-4">
                        <CardContent className="p-4">
                            {/* Name and Status */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                                    {studentInfo.firstName?.[0] || 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg">
                                        {studentInfo.lastName} {studentInfo.firstName}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="font-mono">
                                            {studentInfo.code}
                                        </Badge>
                                        <Badge className="bg-green-600 text-white hover:bg-green-700">
                                            {studentInfo.status?.name || 'Đang học'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-3" />

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Lớp</div>
                                        <div className="font-medium">{studentInfo.classCode}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Khoa</div>
                                        <div className="font-medium">{studentInfo.teachingDep?.nameVi || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Ngành</div>
                                        <div className="font-medium">{studentInfo.major?.nameVi || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Chương trình</div>
                                        <div className="font-medium">{studentInfo.program?.code || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Email</div>
                                        <div className="font-medium truncate">{studentInfo.orgEmail || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">SĐT</div>
                                        <div className="font-medium">{studentInfo.phoneNumber || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="secondary">Khóa {studentInfo.startYear}</Badge>
                                <Badge variant="secondary">{studentInfo.trainingType?.nameVi || 'Chính quy'}</Badge>
                                <Badge variant="secondary">TN dự kiến: {studentInfo.graduationTime || 'N/A'}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-md mb-4 border border-red-100 dark:border-red-900/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Semester Selector & Sync Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:min-w-[180px] sm:w-[180px]">
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent dark:bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            {semesterOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="dark:bg-background dark:text-foreground">
                                    {opt.label} {opt.isCurrent && '(HT)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        className="flex-1 h-10"
                        size="default"
                        onClick={handleSyncSchedule}
                        disabled={syncing}
                    >
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {syncing ? 'Đang tải...' : 'Tải thời khóa biểu'}
                    </Button>
                </div>
            </div>
        );
    }

    // Login form state
    return (
        <Card className="border-2 border-primary/20">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Đăng nhập MyBK</h3>
                        <p className="text-sm text-muted-foreground">Tự động lấy thời khóa biểu từ hệ thống</p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-md mb-4 border border-red-100 dark:border-red-900/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <Input
                            placeholder="Tài khoản (MSSV)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={loading || !username || !password}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập & Đồng bộ'}
                    </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground mt-4">
                    🔒 Thông tin đăng nhập được gửi trực tiếp đến hệ thống SSO của trường
                    {rememberMe && (
                        <span className="block mt-1 text-amber-600 dark:text-amber-400">
                            ⚠️ Đang lưu thông tin đăng nhập trên máy này
                        </span>
                    )}
                </p>
            </CardContent>
        </Card>
    );
}

export default MyBKLoginCard;
