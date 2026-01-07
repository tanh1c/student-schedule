import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
    Chip,
    Divider,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Login as LoginIcon,
    Logout as LogoutIcon,
    Visibility,
    VisibilityOff,
    Sync as SyncIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    CheckCircle as CheckIcon,
    CloudDownload as DownloadIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarMonth as CalendarIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import * as mybkApi from '../services/mybkApi';

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
}

/**
 * MyBK Login & Sync Component
 * Allows users to login with their MyBK credentials and fetch schedule automatically
 */
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

    const semesterOptions = getSemesterOptions();

    useEffect(() => {
        checkServerStatus();
        if (mybkApi.isAuthenticated()) {
            setIsLoggedIn(true);
            loadStudentInfo();
        }
    }, []);

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
                setPassword('');
                await loadStudentInfo();
            } else {
                setError(result.error || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await mybkApi.logout();
        setIsLoggedIn(false);
        setStudentInfo(null);
        setUsername('');
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
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    bgcolor: 'warning.light',
                    borderColor: 'warning.main',
                    borderRadius: 2
                }}
            >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    ⚠️ Backend Server chưa chạy
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Để sử dụng tính năng đồng bộ tự động, bạn cần khởi động backend server:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <code>cd server<br />npm install<br />npm start</code>
                </Paper>
                <Button
                    size="small"
                    onClick={checkServerStatus}
                    sx={{ mt: 2 }}
                    startIcon={<SyncIcon />}
                >
                    Kiểm tra lại
                </Button>
            </Paper>
        );
    }

    if (serverStatus === 'checking') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                    Đang kiểm tra kết nối server...
                </Typography>
            </Box>
        );
    }

    // Logged in state - Show full student info
    if (isLoggedIn) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    borderColor: 'success.main',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckIcon color="success" />
                        <Typography variant="subtitle2" fontWeight={600} color="success.main">
                            Đã kết nối MyBK
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Đăng xuất
                    </Button>
                </Box>

                {/* Full Student Info Card */}
                {studentInfo && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                        {/* Name and Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 48, height: 48,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}>
                                {studentInfo.firstName?.[0] || 'S'}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {studentInfo.lastName} {studentInfo.firstName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Chip
                                        size="small"
                                        label={studentInfo.code}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        size="small"
                                        label={studentInfo.status?.name || 'Đang học'}
                                        color="success"
                                        variant="filled"
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Info Grid */}
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SchoolIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Lớp</Typography>
                                        <Typography variant="body2" fontWeight={500}>{studentInfo.classCode}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Khoa</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {studentInfo.teachingDep?.nameVi || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Ngành</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {studentInfo.major?.nameVi || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Chương trình</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {studentInfo.program?.code || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                            {studentInfo.orgEmail || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">SĐT</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {studentInfo.phoneNumber || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Additional Info */}
                        <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                size="small"
                                label={`Khóa ${studentInfo.startYear}`}
                                variant="outlined"
                            />
                            <Chip
                                size="small"
                                label={studentInfo.trainingType?.nameVi || 'Chính quy'}
                                variant="outlined"
                            />
                            <Chip
                                size="small"
                                label={`TN dự kiến: ${studentInfo.graduationTime || 'N/A'}`}
                                variant="outlined"
                            />
                        </Box>
                    </Paper>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Semester Selector & Sync Button */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Học kỳ</InputLabel>
                        <Select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            label="Học kỳ"
                        >
                            {semesterOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label} {opt.isCurrent && '(Hiện tại)'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSyncSchedule}
                        disabled={syncing}
                        startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                        sx={{ flex: 1 }}
                    >
                        {syncing ? 'Đang tải...' : 'Tải thời khóa biểu'}
                    </Button>
                </Box>
            </Paper>
        );
    }

    // Login form state
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: 'primary.main',
                borderWidth: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                    width: 40, height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <LoginIcon />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Đăng nhập MyBK
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Tự động lấy thời khóa biểu từ hệ thống
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleLogin}>
                <TextField
                    fullWidth
                    size="small"
                    label="Tài khoản (MSSV)"
                    placeholder="Nhập MSSV hoặc email BK"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={loading}
                />

                <TextField
                    fullWidth
                    size="small"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={loading}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !username || !password}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập & Đồng bộ'}
                </Button>
            </form>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                🔒 Thông tin đăng nhập được gửi trực tiếp đến hệ thống SSO của trường
            </Typography>
        </Paper>
    );
}

export default MyBKLoginCard;
