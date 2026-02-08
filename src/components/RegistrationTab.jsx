import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    ChevronDown,
    CalendarPlus,
    FileCheck,
    Loader2,
    ArrowLeft,
    BookOpen,
    Lock,
    Users,
    MapPin,
    GraduationCap,
    Search,
    Trash2,
    FlaskConical,
    X
} from "lucide-react";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import mybkApi from "../services/mybkApi";

// Beta Warning Banner Component - Dark mode optimized
function BetaWarningBanner({ onDismiss }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-900/50 p-4 sm:p-5 shadow-sm">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-amber-200/20 dark:bg-amber-900/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-2xl" />

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-950/40">
                    <FlaskConical className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-amber-900 dark:text-amber-400/90 text-base sm:text-lg">
                            Tính năng đang thử nghiệm
                        </h3>
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-500 dark:bg-amber-900/40 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                            Beta
                        </Badge>
                    </div>

                    <p className="text-sm text-amber-800/80 dark:text-amber-400/70 leading-relaxed mb-3">
                        Trang đăng ký môn học đang trong giai đoạn <strong>phát triển</strong>.
                        Một số tính năng có thể <strong>chưa ổn định</strong> hoặc thay đổi trong tương lai.
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/60 dark:bg-amber-950/50 text-amber-700 dark:text-amber-500/90 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Có thể gặp lỗi
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/60 dark:bg-orange-950/50 text-orange-700 dark:text-orange-500/90 font-medium">
                            <Clock className="h-3 w-3" />
                            Đang cải tiến
                        </span>
                    </div>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/70 flex items-center justify-center text-amber-600 dark:text-amber-500 transition-colors"
                    title="Ẩn thông báo này"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function RegistrationTab() {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dkmhStatus, setDkmhStatus] = useState({ authenticated: false });
    const [filter, setFilter] = useState('all');

    // Beta warning banner state
    const [showBetaWarning, setShowBetaWarning] = useState(() => {
        return localStorage.getItem('hideBetaWarning_registration') !== 'true';
    });

    const dismissBetaWarning = () => {
        setShowBetaWarning(false);
        localStorage.setItem('hideBetaWarning_registration', 'true');
    };

    // Detail view state
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [periodDetails, setPeriodDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const cached = localStorage.getItem("dkmh_periods");
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setPeriods(data);
            } catch (e) { }
        }
        checkAndLoadPeriods();
    }, []);

    const checkAndLoadPeriods = async () => {
        const status = await mybkApi.checkDkmhStatus();
        setDkmhStatus(status);

        if (status.authenticated || status.dkmhLoggedIn) {
            await loadPeriods();
        }
    };

    // forceRefresh = true khi user click "Làm mới", false khi chuyển tab
    const loadPeriods = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mybkApi.getRegistrationPeriods(forceRefresh);

            if (result.success && result.data) {
                setPeriods(result.data);
                localStorage.setItem("dkmh_periods", JSON.stringify(result.data));
            } else {
                setError(result.error || 'Không thể tải danh sách đợt đăng ký');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPeriodDetails = async (period) => {
        setSelectedPeriod(period);
        setLoadingDetails(true);
        setPeriodDetails(null);

        try {
            const result = await mybkApi.getPeriodDetails(period.id);

            if (result.success && result.data) {
                setPeriodDetails(result.data);
            } else {
                setError(result.error || 'Không thể tải chi tiết đợt đăng ký');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const goBack = () => {
        setSelectedPeriod(null);
        setPeriodDetails(null);
    };

    const filteredPeriods = periods.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    const openCount = periods.filter(p => p.status === 'open').length;
    const upcomingCount = periods.filter(p => p.status === 'upcoming').length;

    // Show details view
    if (selectedPeriod) {
        return (
            <PeriodDetailsView
                period={selectedPeriod}
                details={periodDetails}
                loading={loadingDetails}
                onBack={goBack}
            />
        );
    }

    return (
        <div className="space-y-4 p-3 sm:p-6 pb-24">
            {/* Beta Warning Banner */}
            {showBetaWarning && (
                <BetaWarningBanner onDismiss={dismissBetaWarning} />
            )}

            {/* Header with Status and Actions */}
            <div className="flex flex-wrap items-center gap-3">
                {/* DKMH Status Warning - Inline Badge */}
                {!dkmhStatus.authenticated && !dkmhStatus.dkmhLoggedIn && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">Đang chờ kết nối DKMH... Vui lòng đăng nhập MyBK trước.</span>
                        <span className="sm:hidden">Chờ đăng nhập MyBK</span>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Refresh Button - force refresh when clicked */}
                <Button
                    onClick={() => loadPeriods(true)}
                    disabled={loading}
                    size="sm"
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Đang tải..." : "Làm mới"}
                </Button>
            </div>

            {/* Error */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="py-3 px-4">
                        <p className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Stats & Filter - Premium Tab Design */}
            {periods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 dark:bg-muted/30 rounded-xl border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'all'
                            ? 'bg-background dark:bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            }`}
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Tất cả</span>
                        <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                            {periods.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => setFilter('open')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'open'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-sm'
                            : 'text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Đang mở</span>
                        {openCount > 0 && (
                            <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs bg-emerald-500 dark:bg-emerald-600 text-white border-0">
                                {openCount}
                            </Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'upcoming'
                            ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm'
                            : 'text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Sắp mở</span>
                        {upcomingCount > 0 && (
                            <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs bg-blue-500 dark:bg-blue-600 text-white border-0">
                                {upcomingCount}
                            </Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setFilter('closed')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'closed'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm'
                            : 'text-muted-foreground hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <Lock className="h-4 w-4" />
                        <span>Đã đóng</span>
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && periods.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <CalendarPlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chưa có dữ liệu đợt đăng ký</p>
                    <Button variant="link" size="sm" onClick={loadPeriods}>
                        Nhấn để tải dữ liệu
                    </Button>
                </div>
            )}

            {/* Loading */}
            {loading && periods.length === 0 && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải danh sách đợt đăng ký...</p>
                </div>
            )}

            {/* Registration Periods List */}
            <div className="space-y-3">
                {filteredPeriods.map((period, idx) => (
                    <RegistrationPeriodCard
                        key={period.id || idx}
                        period={period}
                        onClick={() => loadPeriodDetails(period)}
                    />
                ))}
            </div>

            {/* Footer info */}
            {periods.length > 0 && (
                <p className="text-center text-xs text-muted-foreground pt-4">
                    Hiển thị {periods.length} đợt đăng ký gần nhất • {openCount} đang mở
                </p>
            )}
        </div>
    );
}

// Registration Period Card Component - Premium Style
function RegistrationPeriodCard({ period, onClick }) {
    const isOpen = period.status === 'open';
    const isUpcoming = period.status === 'upcoming';
    const isClosed = period.status === 'closed';
    const hasResult = period.hasResult;

    // Color schemes based on status - Dark mode optimized for eye comfort
    const colorScheme = {
        open: {
            gradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20',
            border: 'border-emerald-200/60 dark:border-emerald-900/50',
            iconBg: 'from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700',
            iconShadow: 'shadow-emerald-200/50 dark:shadow-emerald-950/40',
            decoration1: 'bg-emerald-200/30 dark:bg-emerald-900/20',
            decoration2: 'bg-green-200/30 dark:bg-green-900/20',
            codeColor: 'text-emerald-700 dark:text-emerald-400/90',
            timeColor: 'text-emerald-600 dark:text-emerald-500/80',
            arrowBg: 'bg-emerald-100 dark:bg-emerald-950/60',
            arrowColor: 'text-emerald-600 dark:text-emerald-500'
        },
        upcoming: {
            gradient: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20',
            border: 'border-blue-200/60 dark:border-blue-900/50',
            iconBg: 'from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700',
            iconShadow: 'shadow-blue-200/50 dark:shadow-blue-950/40',
            decoration1: 'bg-blue-200/30 dark:bg-blue-900/20',
            decoration2: 'bg-indigo-200/30 dark:bg-indigo-900/20',
            codeColor: 'text-blue-700 dark:text-blue-400/90',
            timeColor: 'text-blue-600 dark:text-blue-500/80',
            arrowBg: 'bg-blue-100 dark:bg-blue-950/60',
            arrowColor: 'text-blue-600 dark:text-blue-500'
        },
        closed: {
            gradient: 'from-zinc-50 via-gray-50 to-slate-50 dark:from-zinc-950/20 dark:via-gray-950/15 dark:to-slate-950/20',
            border: 'border-zinc-200/60 dark:border-zinc-800/50',
            iconBg: 'from-zinc-400 to-gray-500 dark:from-zinc-600 dark:to-gray-700',
            iconShadow: 'shadow-zinc-200/50 dark:shadow-zinc-950/40',
            decoration1: 'bg-zinc-200/20 dark:bg-zinc-900/15',
            decoration2: 'bg-gray-200/20 dark:bg-gray-900/15',
            codeColor: 'text-zinc-600 dark:text-zinc-500',
            timeColor: 'text-zinc-500 dark:text-zinc-600',
            arrowBg: 'bg-zinc-100 dark:bg-zinc-900/60',
            arrowColor: 'text-zinc-500 dark:text-zinc-600'
        }
    };

    const colors = isOpen ? colorScheme.open : (isUpcoming ? colorScheme.upcoming : colorScheme.closed);

    // Status icon
    const StatusIcon = isOpen ? CheckCircle2 : (isUpcoming ? Clock : Lock);

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                bg-gradient-to-r ${colors.gradient}
                border ${colors.border}
                p-4 sm:p-5 shadow-sm
                transition-all duration-300 cursor-pointer
                hover:shadow-lg hover:scale-[1.01]
                ${isClosed ? 'opacity-75' : ''}
            `}
            onClick={onClick}
        >
            {/* Background decorations */}
            <div className={`absolute -top-10 -right-10 h-32 w-32 ${colors.decoration1} rounded-full blur-2xl`} />
            <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${colors.decoration2} rounded-full blur-2xl`} />

            <div className="relative flex items-start gap-4">
                {/* Status Icon Container */}
                <div className={`flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg ${colors.iconShadow}`}>
                    <StatusIcon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Code & Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`font-bold text-base sm:text-lg ${colors.codeColor}`}>
                            {period.code}
                        </span>
                        {getStatusBadgeInline(period.status)}
                        {hasResult && (
                            <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-none text-[10px] px-2 py-0.5 font-bold">
                                <FileCheck className="h-3 w-3 mr-1" />
                                Có kết quả
                            </Badge>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/80 dark:text-foreground/70 leading-relaxed mb-3 line-clamp-2">
                        {period.description}
                    </p>

                    {/* Time Info */}
                    <div className="flex flex-wrap gap-3 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/5 ${colors.timeColor} font-medium`}>
                            <Calendar className="h-3 w-3" />
                            {period.startTime}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/5 ${colors.timeColor} font-medium`}>
                            <Clock className="h-3 w-3" />
                            {period.endTime}
                        </span>
                    </div>
                </div>

                {/* Arrow Button */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colors.arrowBg} flex items-center justify-center ${colors.arrowColor} transition-transform group-hover:translate-x-1`}>
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

// Period Details View - Premium UI matching main page style
function PeriodDetailsView({ period, details, loading, onBack }) {
    const courses = details?.courses?.courses || [];
    const totalCredits = details?.courses?.totalCredits || 0;
    const totalCourses = details?.courses?.totalCourses || 0;
    const schedule = details?.schedule || {};

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [forceMode, setForceMode] = useState(false);

    // Determine period status colors
    const isOpen = period.status === 'open';
    const isUpcoming = period.status === 'upcoming';

    const colorScheme = {
        open: {
            gradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20',
            border: 'border-emerald-200/60 dark:border-emerald-900/50',
            iconBg: 'from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700',
            iconShadow: 'shadow-emerald-200/50 dark:shadow-emerald-950/40',
            decoration1: 'bg-emerald-200/30 dark:bg-emerald-900/20',
            decoration2: 'bg-green-200/30 dark:bg-green-900/20',
            textColor: 'text-emerald-700 dark:text-emerald-400',
            badgeBg: 'bg-emerald-100 dark:bg-emerald-950/50',
            badgeText: 'text-emerald-700 dark:text-emerald-400'
        },
        upcoming: {
            gradient: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20',
            border: 'border-blue-200/60 dark:border-blue-900/50',
            iconBg: 'from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700',
            iconShadow: 'shadow-blue-200/50 dark:shadow-blue-950/40',
            decoration1: 'bg-blue-200/30 dark:bg-blue-900/20',
            decoration2: 'bg-indigo-200/30 dark:bg-indigo-900/20',
            textColor: 'text-blue-700 dark:text-blue-400',
            badgeBg: 'bg-blue-100 dark:bg-blue-950/50',
            badgeText: 'text-blue-700 dark:text-blue-400'
        },
        closed: {
            gradient: 'from-zinc-50 via-gray-50 to-slate-50 dark:from-zinc-950/20 dark:via-gray-950/15 dark:to-slate-950/20',
            border: 'border-zinc-200/60 dark:border-zinc-800/50',
            iconBg: 'from-zinc-400 to-gray-500 dark:from-zinc-600 dark:to-gray-700',
            iconShadow: 'shadow-zinc-200/50 dark:shadow-zinc-950/40',
            decoration1: 'bg-zinc-200/20 dark:bg-zinc-900/15',
            decoration2: 'bg-gray-200/20 dark:bg-gray-900/15',
            textColor: 'text-zinc-600 dark:text-zinc-500',
            badgeBg: 'bg-zinc-100 dark:bg-zinc-900/50',
            badgeText: 'text-zinc-600 dark:text-zinc-500'
        }
    };

    const colors = isOpen ? colorScheme.open : (isUpcoming ? colorScheme.upcoming : colorScheme.closed);
    const StatusIcon = isOpen ? CheckCircle2 : (isUpcoming ? Clock : Lock);

    const handleSearch = async (e) => {
        const isForceClick = e?.shiftKey === true;
        let query = searchQuery.trim();
        const hasForceCommand = query.toLowerCase().includes('#force');
        if (hasForceCommand) {
            query = query.replace(/#force/gi, '').trim();
        }
        const useForceMode = isForceClick || hasForceCommand;

        if (!query) return;

        setSearching(true);
        setSearchError(null);
        setSearchResults([]);
        setForceMode(useForceMode);

        try {
            const result = await mybkApi.searchCourses(period.id, query, useForceMode);
            if (result.success && result.data) {
                setSearchResults(result.data);
                if (result.data.length === 0) {
                    setSearchError('Không tìm thấy môn học nào');
                }
            } else {
                setSearchError(result.error || 'Không thể tìm kiếm môn học');
            }
        } catch (e) {
            setSearchError(e.message);
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4 p-3 sm:p-6 pb-24">
            {/* Premium Header Card */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${colors.gradient} border ${colors.border} p-4 sm:p-5 shadow-sm`}>
                {/* Background decorations */}
                <div className={`absolute -top-10 -right-10 h-32 w-32 ${colors.decoration1} rounded-full blur-2xl`} />
                <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${colors.decoration2} rounded-full blur-2xl`} />

                <div className="relative flex items-start gap-4">
                    {/* Back Button + Icon */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="h-10 w-10 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/20 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-foreground/70" />
                        </button>
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg ${colors.iconShadow}`}>
                            <StatusIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className={`font-bold text-lg sm:text-xl ${colors.textColor}`}>
                                {period.code}
                            </h2>
                            {getStatusBadgeInline(period.status)}
                        </div>
                        <p className="text-sm text-foreground/70 dark:text-foreground/60 line-clamp-2">
                            {period.description}
                        </p>
                    </div>
                </div>

                {/* Schedule Info Row */}
                <div className="relative flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/30 dark:border-white/10">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/10 ${colors.textColor} text-xs font-medium`}>
                        <Calendar className="h-3 w-3" />
                        {schedule.from || period.startTime}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/10 ${colors.textColor} text-xs font-medium`}>
                        <Clock className="h-3 w-3" />
                        {schedule.to || period.endTime}
                    </span>
                    {schedule.isOpen && (
                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-none text-[10px] px-2 py-0.5 font-bold">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Trong hạn ĐK
                        </Badge>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải danh sách môn học...</p>
                </div>
            )}

            {/* Stats Cards - Premium Style */}
            {!loading && details && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20 border border-blue-200/60 dark:border-blue-900/50 p-4 shadow-sm">
                        <div className="absolute -top-8 -right-8 h-20 w-20 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-xl" />
                        <div className="relative flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200/50 dark:shadow-blue-950/40">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-blue-900 dark:text-blue-300">{totalCourses}</p>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-500">Môn đăng ký</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/50 p-4 shadow-sm">
                        <div className="absolute -top-8 -right-8 h-20 w-20 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-xl" />
                        <div className="relative flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700 flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-emerald-950/40">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{totalCredits}</p>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Tín chỉ</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Section - Premium Style */}
            {!loading && period.status === 'open' && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/15 dark:to-fuchsia-950/20 border border-violet-200/60 dark:border-violet-900/50 p-4 shadow-sm">
                    <div className="absolute -top-10 -right-10 h-32 w-32 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-2xl" />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200/50 dark:shadow-violet-950/40">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-violet-800 dark:text-violet-300">Đăng ký hiệu chỉnh</h3>
                                    <p className="text-xs text-violet-600/70 dark:text-violet-400/70">Tìm và đăng ký thêm môn học</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="h-8 px-3 rounded-lg bg-violet-100 dark:bg-violet-950/60 hover:bg-violet-200 dark:hover:bg-violet-900/70 text-violet-700 dark:text-violet-400 text-xs font-medium transition-colors"
                            >
                                {showSearch ? 'Ẩn' : 'Mở rộng'}
                            </button>
                        </div>

                        {showSearch && (
                            <div className="space-y-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/30">
                                {/* Search Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập mã hoặc tên môn học (VD: CO3005)"
                                        className="flex-1 h-10 px-3 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        disabled={searching || !searchQuery.trim()}
                                        className="h-10 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl"
                                    >
                                        {searching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Search Error */}
                                {searchError && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                        <XCircle className="h-4 w-4" />
                                        {searchError}
                                    </p>
                                )}

                                {/* Force Mode Indicator */}
                                {forceMode && searchResults.length > 0 && (
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2 border border-purple-200 dark:border-purple-800">
                                        <span className="text-lg">🔓</span>
                                        <span><strong>Force Mode:</strong> Bypass validation đã kích hoạt!</span>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                                            Tìm thấy {searchResults.length} môn học
                                            {forceMode && <span className="ml-1 text-purple-500">(Force Mode)</span>}
                                        </p>
                                        {searchResults.map((course, idx) => (
                                            <SearchResultCard
                                                key={course.monHocId || idx}
                                                course={course}
                                                periodId={period.id}
                                                forceMode={forceMode}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Courses List - Premium Style */}
            {!loading && courses.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground">Danh sách môn đã đăng ký</h3>
                    </div>
                    {courses.map((course, idx) => (
                        <CourseCard
                            key={course.ketquaId || idx}
                            course={course}
                            index={idx + 1}
                            periodId={period.id}
                            onDeleted={onBack}
                        />
                    ))}
                </div>
            )}

            {/* Empty State - Premium Style */}
            {!loading && courses.length === 0 && details && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/20 dark:via-gray-950/15 dark:to-zinc-950/20 border-2 border-dashed border-slate-300 dark:border-slate-700 p-8">
                    <div className="absolute -top-10 -right-10 h-32 w-32 bg-slate-200/30 dark:bg-slate-900/20 rounded-full blur-2xl" />
                    <div className="relative text-center">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Chưa có môn học nào được đăng ký</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Sử dụng chức năng tìm kiếm để đăng ký môn</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Search Result Card with expandable class groups
function SearchResultCard({ course, periodId, forceMode = false }) {
    const [expanded, setExpanded] = useState(false);
    const [classGroups, setClassGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupsError, setGroupsError] = useState(null);

    const handleClick = async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }

        setExpanded(true);
        setLoadingGroups(true);
        setGroupsError(null);

        try {
            const result = await mybkApi.getClassGroups(periodId, course.monHocId);
            if (result.success && result.data) {
                setClassGroups(result.data);
            } else {
                setGroupsError(result.error || 'Không thể tải danh sách nhóm lớp');
            }
        } catch (e) {
            setGroupsError(e.message);
        } finally {
            setLoadingGroups(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-card hover:shadow-md transition-shadow border-2 border-gray-100 dark:border-gray-800">
            <CardContent className="p-3">
                {/* Course Header - Clickable */}
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={handleClick}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{course.code}</span>
                            <Badge variant="outline" className="text-xs">
                                {course.credits} TC
                            </Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{course.name}</p>
                    </div>
                    {expanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {/* Expanded Class Groups */}
                {expanded && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        {loadingGroups && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Đang tải nhóm lớp...</span>
                            </div>
                        )}

                        {groupsError && (
                            <p className="text-sm text-red-500 py-2">{groupsError}</p>
                        )}

                        {!loadingGroups && classGroups.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                    {classGroups.length} nhóm lớp có sẵn
                                </p>
                                {classGroups.map((group, idx) => (
                                    <ClassGroupRow key={idx} group={group} periodId={periodId} forceMode={forceMode} />
                                ))}
                            </div>
                        )}

                        {!loadingGroups && classGroups.length === 0 && !groupsError && (
                            <p className="text-sm text-muted-foreground py-2">
                                Không có nhóm lớp nào
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Class Group Row with full schedule info
function ClassGroupRow({ group, periodId, forceMode = false }) {
    const availableSlots = group.capacity - group.registered;
    const isFull = availableSlots <= 0;
    const [showSchedule, setShowSchedule] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [registerResult, setRegisterResult] = useState(null);

    const handleRegister = async (e) => {
        e.stopPropagation();
        if (!group.nlmhId || registering) return;

        setRegistering(true);
        setRegisterResult(null);

        if (forceMode) {
            console.log('🔓 Force Mode registration for NLMHId:', group.nlmhId);
        }

        try {
            const result = await mybkApi.registerCourse(periodId, group.nlmhId, group.monHocId, forceMode);

            if (result.success) {
                setRegisterResult({
                    type: 'success',
                    message: forceMode
                        ? '🔓 Force ĐK thành công! (bypass validation)'
                        : (result.message || 'Đã gửi đăng ký!')
                });
            } else {
                setRegisterResult({ type: 'error', message: result.error || 'Đăng ký thất bại' });
            }
        } catch (err) {
            setRegisterResult({ type: 'error', message: err.message });
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className={`rounded-lg border-2 overflow-hidden ${isFull ? 'bg-gray-50 dark:bg-gray-800/50 opacity-70 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-card border-blue-100 dark:border-blue-900/40'}`}>
            {/* Register Result Toast */}
            {registerResult && (
                <div className={`p-2 text-xs font-medium flex items-center gap-2 ${registerResult.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {registerResult.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {registerResult.message}
                </div>
            )}

            {/* Header Row */}
            <div
                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 ${isFull ? '' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                onClick={() => setShowSchedule(!showSchedule)}
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isFull ? "secondary" : "default"} className="text-xs font-bold">
                        {group.groupCode}
                    </Badge>
                    <span className={`text-xs font-medium ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                        {group.registered}/{group.capacity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({group.language === 'V' ? 'Việt' : group.language === 'E' ? 'Anh' : group.language})
                    </span>
                    {group.lecturer && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            • GV: {group.lecturer}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Show register button in Force Mode even for full classes */}
                    {((group.canRegister && !isFull) || forceMode) && registerResult?.type !== 'success' ? (
                        <Button
                            size="sm"
                            className={`h-6 text-xs ${forceMode
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-green-600 hover:bg-green-700'}`}
                            onClick={handleRegister}
                            disabled={registering}
                        >
                            {registering ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            {forceMode && !registering && <span className="mr-1">🔓</span>}
                            {registering ? 'Đang ĐK...' : (forceMode ? 'Force ĐK' : 'Đăng ký')}
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {isFull ? 'Đã đầy' : ''}
                        </span>
                    )}
                    {showSchedule ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Schedule Details */}
            {showSchedule && group.schedules && group.schedules.length > 0 && (
                <div className="border-t bg-gray-50/50 dark:bg-gray-800/20">
                    {/* Schedule Header */}
                    <div className="grid grid-cols-5 gap-1 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                        <span>Thứ</span>
                        <span>Tiết</span>
                        <span>Phòng</span>
                        <span>CS</span>
                        <span>Tuần học</span>
                    </div>
                    {/* Schedule Rows */}
                    {group.schedules.map((sch, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-1 px-2 py-1.5 text-xs border-b last:border-b-0">
                            <span className="font-medium">{sch.day}</span>
                            <span className="text-primary">{sch.timeSlots}</span>
                            <span>{sch.room}</span>
                            <span>{sch.campus}</span>
                            <span className="text-muted-foreground text-[10px] truncate" title={sch.weeks}>
                                {sch.weeks}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* No schedule info */}
            {showSchedule && (!group.schedules || group.schedules.length === 0) && (
                <div className="border-t p-2 text-xs text-muted-foreground text-center">
                    Chưa có thông tin lịch học
                </div>
            )}
        </div>
    );
}

// Course Card with delete functionality
function CourseCard({ course, index, periodId, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [deleteResult, setDeleteResult] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        if (!course.ketquaId || deleting) return;

        setDeleting(true);
        setDeleteResult(null);

        try {
            const result = await mybkApi.cancelCourseRegistration(
                periodId,
                course.ketquaId,
                course.code
            );

            if (result.success) {
                setDeleteResult({ type: 'success', message: `Đã hủy đăng ký ${course.code}` });
                // Notify parent to refresh after a short delay
                setTimeout(() => {
                    if (onDeleted) onDeleted();
                }, 1500);
            } else {
                setDeleteResult({ type: 'error', message: result.error || 'Hủy đăng ký thất bại' });
            }
        } catch (err) {
            setDeleteResult({ type: 'error', message: err.message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <Card className={`${course.isLocked ? 'opacity-70' : ''} ${deleteResult?.type === 'success' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
            {/* Delete Result Toast */}
            {deleteResult && (
                <div className={`p-2 text-xs font-medium flex items-center gap-2 ${deleteResult.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {deleteResult.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {deleteResult.message}
                </div>
            )}

            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index}
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* Course Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-primary">{course.code}</span>
                            <span className="text-sm truncate">{course.name}</span>
                            <Badge variant="outline" className="text-xs">{course.credits} TC</Badge>
                            {course.isLocked && (
                                <Badge variant="destructive" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Đã khóa
                                </Badge>
                            )}
                        </div>

                        {/* Class Info Row */}
                        {course.group && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                    <Users className="h-3 w-3" />
                                    {course.group}
                                </span>
                                {course.slots && (
                                    <span className="text-muted-foreground">
                                        SV: {course.slots}
                                    </span>
                                )}
                                {course.language && (
                                    <Badge variant="outline" className="text-xs h-5">
                                        {course.language === 'V' ? 'Việt' : course.language === 'E' ? 'Anh' : course.language}
                                    </Badge>
                                )}
                                {course.lecturer && course.lecturer !== 'Chưa phân công' && (
                                    <span className="text-muted-foreground">
                                        GV: {course.lecturer}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Schedule Info */}
                        {(course.day || course.room || course.schedules?.length > 0) && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                                {course.schedules?.length > 0 ? (
                                    <div className="space-y-1">
                                        {course.schedules.map((sch, idx) => (
                                            <div key={idx} className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">{sch.day}</span>
                                                <span>Tiết: {sch.timeSlots}</span>
                                                {sch.room && sch.room !== '------' && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {sch.room}
                                                    </span>
                                                )}
                                                {sch.campus && <span>CS{sch.campus}</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        {course.day && <span>{course.day}</span>}
                                        {course.timeSlots && <span>Tiết: {course.timeSlots}</span>}
                                        {course.room && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {course.room}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Delete Button */}
                    {course.canDelete && !course.isLocked && deleteResult?.type !== 'success' && (
                        <div className="flex-shrink-0">
                            {confirmDelete ? (
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-6 text-xs px-2"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Xác nhận'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs px-2"
                                        onClick={() => setConfirmDelete(false)}
                                        disabled={deleting}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setConfirmDelete(true)}
                                    title="Hủy đăng ký"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getStatusBadgeInline(status) {
    switch (status) {
        case 'open':
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Đang mở
                </Badge>
            );
        case 'upcoming':
            return (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Sắp mở
                </Badge>
            );
        case 'closed':
            return (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
                    Đã đóng
                </Badge>
            );
        default:
            return null;
    }
}

