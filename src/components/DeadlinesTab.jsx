import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    CalendarClock, RefreshCw, AlertCircle, Loader2, LogIn,
    Clock, ExternalLink, BookOpen, FileText, Timer,
    AlertTriangle, CheckCircle2, Sparkles, Filter,
    ChevronDown, ChevronUp, Calendar, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    initLmsSession,
    getDeadlines,
} from '@/services/lmsApi';
import MyBKLoginCard from './MyBKLoginCard';

// ─── Stats Card Component - matches MessagesTab exactly ───
function StatsCard({ icon: Icon, title, value, color, subtitle }) {
    const colorSchemes = {
        rose: {
            gradient: "from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/30 dark:via-red-950/25 dark:to-pink-950/30",
            border: "border-rose-200/60 dark:border-rose-800/50",
            iconBg: "from-rose-400 to-red-500 dark:from-rose-600 dark:to-red-700",
            iconShadow: "shadow-rose-200/50 dark:shadow-rose-950/40",
            text: "text-rose-700 dark:text-rose-400",
            value: "text-rose-900 dark:text-rose-200"
        },
        emerald: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/25 dark:to-teal-950/30",
            border: "border-emerald-200/60 dark:border-emerald-800/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            text: "text-emerald-700 dark:text-emerald-400",
            value: "text-emerald-900 dark:text-emerald-200"
        },
        violet: {
            gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/25 dark:to-fuchsia-950/30",
            border: "border-violet-200/60 dark:border-violet-800/50",
            iconBg: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
            iconShadow: "shadow-violet-200/50 dark:shadow-violet-950/40",
            text: "text-violet-700 dark:text-violet-400",
            value: "text-violet-900 dark:text-violet-200"
        },
        amber: {
            gradient: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/25 dark:to-yellow-950/30",
            border: "border-amber-200/60 dark:border-amber-800/50",
            iconBg: "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700",
            iconShadow: "shadow-amber-200/50 dark:shadow-amber-950/40",
            text: "text-amber-700 dark:text-amber-400",
            value: "text-amber-900 dark:text-amber-200"
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.violet;

    return (
        <div className={`relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-1.5 sm:p-4 shadow-sm w-full min-w-0`}>
            <div className="absolute -top-6 -right-6 h-16 w-16 bg-white/30 dark:bg-white/5 rounded-full blur-xl" />
            <div className="relative flex items-center gap-1 sm:gap-3">
                <div className={`h-7 w-7 sm:h-10 sm:w-10 rounded-md sm:rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg ${scheme.iconShadow} shrink-0`}>
                    <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-base sm:text-2xl font-black ${scheme.value}`}>{value}</p>
                    <p className={`text-[8px] sm:text-xs font-medium ${scheme.text} truncate leading-tight`}>{title}</p>
                    {subtitle && (
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Component Type Icon ───
function ComponentIcon({ component, className = "w-4 h-4" }) {
    switch (component) {
        case 'mod_quiz':
            return <Timer className={className} />;
        case 'mod_assign':
            return <FileText className={className} />;
        case 'mod_forum':
            return <BookOpen className={className} />;
        default:
            return <CalendarClock className={className} />;
    }
}

// ─── Helpers ───
function getComponentLabel(component) {
    switch (component) {
        case 'mod_quiz': return 'Quiz';
        case 'mod_assign': return 'Assignment';
        case 'mod_forum': return 'Forum';
        default: return 'Sự kiện';
    }
}

function getEventTypeLabel(eventType) {
    switch (eventType) {
        case 'close': return 'Đóng';
        case 'due': return 'Hạn nộp';
        case 'open': return 'Mở';
        default: return eventType;
    }
}

const MONTH_NAMES = [
    '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// ─── Event Card - detailed layout with full info ───
function EventCard({ event, type = 'deadline' }) {
    const isDeadline = type === 'deadline';

    const getCardStyle = () => {
        if (isDeadline) {
            return 'from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/30 dark:via-red-950/25 dark:to-orange-950/30 border-rose-200/60 dark:border-rose-800/50';
        }
        return 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/25 dark:to-teal-950/30 border-emerald-200/60 dark:border-emerald-800/50';
    };

    const getIconBgStyle = () => {
        if (isDeadline) return 'from-rose-400 to-red-500 dark:from-rose-600 dark:to-red-700';
        return 'from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700';
    };

    const getBadgeStyle = () => {
        switch (event.component) {
            case 'mod_quiz':
                return 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700';
            case 'mod_assign':
                return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
            case 'mod_forum':
                return 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700';
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return dateStr; }
    };

    const isUrgent = useMemo(() => {
        if (!isDeadline || !event.dayTimestamp) return false;
        const now = Date.now() / 1000;
        const diffDays = (event.dayTimestamp - now) / (60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 3;
    }, [event.dayTimestamp, isDeadline]);

    const isPast = useMemo(() => {
        if (!event.dayTimestamp) return false;
        return event.dayTimestamp * 1000 < Date.now();
    }, [event.dayTimestamp]);

    // Detailed time remaining with days, hours, minutes
    const timeInfo = useMemo(() => {
        if (!event.dayTimestamp) return null;
        const now = Date.now() / 1000;
        const diff = event.dayTimestamp - now;

        if (diff < 0) {
            // Past event — show how long ago
            const absDiff = Math.abs(diff);
            const days = Math.floor(absDiff / (60 * 60 * 24));
            const hours = Math.floor((absDiff % (60 * 60 * 24)) / (60 * 60));
            if (days > 30) return { text: `${Math.floor(days / 30)} tháng trước`, isPast: true, urgency: 'past' };
            if (days > 0) return { text: `${days} ngày ${hours} giờ trước`, isPast: true, urgency: 'past' };
            if (hours > 0) return { text: `${hours} giờ trước`, isPast: true, urgency: 'past' };
            return { text: 'Vừa qua', isPast: true, urgency: 'past' };
        }

        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);

        let urgency = 'normal'; // normal, warning, critical
        if (days <= 1) urgency = 'critical';
        else if (days <= 3) urgency = 'warning';

        if (days > 30) {
            const months = Math.floor(days / 30);
            const remainDays = days % 30;
            return {
                text: remainDays > 0 ? `${months} tháng ${remainDays} ngày` : `${months} tháng`,
                isPast: false,
                urgency
            };
        }
        if (days > 0) {
            return {
                text: `${days} ngày ${hours} giờ ${minutes} phút`,
                isPast: false,
                urgency
            };
        }
        if (hours > 0) {
            return {
                text: `${hours} giờ ${minutes} phút`,
                isPast: false,
                urgency
            };
        }
        if (minutes > 0) {
            return {
                text: `${minutes} phút`,
                isPast: false,
                urgency: 'critical'
            };
        }
        return { text: 'Sắp hết hạn!', isPast: false, urgency: 'critical' };
    }, [event.dayTimestamp]);

    // Countdown pill style based on urgency
    const getCountdownStyle = () => {
        if (!timeInfo) return '';
        if (timeInfo.isPast) return 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400';
        switch (timeInfo.urgency) {
            case 'critical':
                return 'bg-rose-200/80 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 font-semibold';
            case 'warning':
                return 'bg-amber-200/80 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 font-semibold';
            default:
                return 'bg-emerald-200/80 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300';
        }
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-200 border text-left min-w-0
            ${getCardStyle()}
            hover:shadow-md hover:scale-[1.005] active:scale-[0.995]
            ${isPast ? 'opacity-60' : ''}
        `}>
            {/* Urgent indicator */}
            {isUrgent && !isPast && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-rose-500 border-l-[28px] border-l-transparent">
                    <AlertTriangle className="absolute -top-[25px] right-[1px] w-3.5 h-3.5 text-white" />
                </div>
            )}

            {/* Hover glow */}
            <div className="absolute -top-8 -right-8 h-24 w-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-2.5 sm:p-4 flex items-start gap-2 sm:gap-3 min-w-0">
                {/* Icon */}
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0 mt-0.5 ${getIconBgStyle()}`}>
                    <ComponentIcon component={event.component} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Row 1: Badges + action */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-wrap">
                            <Badge className={`text-[9px] sm:text-[10px] px-1.5 py-0 border ${getBadgeStyle()}`}>
                                {getComponentLabel(event.component)}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] sm:text-[10px] px-1.5 py-0
                                ${isDeadline
                                    ? 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                                    : 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'}
                            `}>
                                {getEventTypeLabel(event.eventType)}
                            </Badge>
                            {isPast && (
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 text-slate-500 border-slate-300 dark:border-slate-700">
                                    Đã qua
                                </Badge>
                            )}
                            {isUrgent && !isPast && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                        </div>
                        {/* Link button */}
                        {event.url && (
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors
                                    ${isDeadline
                                        ? 'hover:bg-rose-200/50 dark:hover:bg-rose-800/30 text-rose-500 dark:text-rose-400'
                                        : 'hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30 text-emerald-500 dark:text-emerald-400'}
                                `}
                                title="Mở trên LMS"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>

                    {/* Row 2: Title - wraps instead of truncating */}
                    <p className={`text-sm sm:text-base font-semibold leading-snug mb-1.5
                        ${isDeadline
                            ? 'text-rose-900 dark:text-rose-100'
                            : 'text-emerald-900 dark:text-emerald-100'}
                    `}>
                        {event.name || event.title || 'Không có tên'}
                    </p>

                    {/* Row 3: Course name - full display */}
                    {event.courseName && (
                        <p className={`text-[11px] sm:text-xs leading-snug mb-1.5 flex items-start gap-1
                            ${isDeadline ? 'text-rose-700/70 dark:text-rose-300/70' : 'text-emerald-700/70 dark:text-emerald-300/70'}
                        `}>
                            <BookOpen className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{event.courseName}</span>
                        </p>
                    )}

                    {/* Row 4: Date + Countdown pill */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] sm:text-xs flex items-center gap-1
                            ${isDeadline ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}
                        `}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                        </span>

                        {/* Countdown pill */}
                        {timeInfo && (
                            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getCountdownStyle()}`}>
                                <Clock className="w-3 h-3" />
                                {timeInfo.isPast ? timeInfo.text : `còn ${timeInfo.text}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───
export default function DeadlinesTab() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deadlinesData, setDeadlinesData] = useState(null);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginJustCompleted, setLoginJustCompleted] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showPast, setShowPast] = useState(false);
    const [monthRange, setMonthRange] = useState(3);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Init LMS session
    const initSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await initLmsSession();
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return false;
        }
        setIsInitialized(true);
        return true;
    }, []);

    // Load deadlines
    const loadDeadlines = useCallback(async (months, forceRefresh = false) => {
        setIsLoading(true);
        setError(null);
        const result = await getDeadlines({ months: months || monthRange, forceRefresh });
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return result;
        }
        setDeadlinesData(result.data);
        setIsLoading(false);
        return result;
    }, [monthRange]);

    // Initial load with offline fallback
    useEffect(() => {
        const init = async () => {
            const success = await initSession();
            if (success) {
                await loadDeadlines();
                setIsOfflineMode(false);
            } else {
                // Even if session init fails, try to load cached deadlines for offline mode
                console.log('[Deadlines] Session init failed, attempting to load cached data...');
                const cachedResult = await getDeadlines({ months: monthRange, forceRefresh: false });
                if (cachedResult.success && cachedResult.data) {
                    console.log('[Deadlines] Loaded offline cache successfully');
                    setDeadlinesData(cachedResult.data);
                    setIsLoading(false);
                    setIsOfflineMode(true);
                    setError(null); // Clear error so we can show cached data with offline banner
                }
            }
        };
        init();
    }, [initSession, loadDeadlines]);

    // Handle month range change
    const handleMonthRangeChange = useCallback(async (newMonths) => {
        setMonthRange(newMonths);
        if (isInitialized) await loadDeadlines(newMonths, true);
    }, [isInitialized, loadDeadlines]);

    // Refresh handler - force refresh bypasses cache
    const handleRefresh = async () => {
        setIsOfflineMode(false);
        if (!isInitialized) {
            const success = await initSession();
            if (success) await loadDeadlines(undefined, true);
        } else {
            await loadDeadlines(undefined, true);
        }
    };

    // Filtered events
    const { filteredDeadlines, filteredUpcoming, stats } = useMemo(() => {
        if (!deadlinesData) return { filteredDeadlines: [], filteredUpcoming: [], stats: { total: 0, deadlines: 0, upcoming: 0, urgent: 0 } };

        const now = Date.now() / 1000;
        const allDeadlines = deadlinesData.deadlines || [];
        const allUpcoming = deadlinesData.upcoming || [];

        const futureDeadlines = allDeadlines.filter(e => !e.dayTimestamp || e.dayTimestamp >= now);
        const pastDeadlines = allDeadlines.filter(e => e.dayTimestamp && e.dayTimestamp < now);
        const futureUpcoming = allUpcoming.filter(e => !e.dayTimestamp || e.dayTimestamp >= now);

        const urgentCount = futureDeadlines.filter(e => {
            if (!e.dayTimestamp) return false;
            const diffDays = (e.dayTimestamp - now) / (60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 3;
        }).length;

        let deadlines = showPast ? [...futureDeadlines, ...pastDeadlines] : futureDeadlines;
        let upcoming = futureUpcoming;

        deadlines.sort((a, b) => (a.dayTimestamp || 0) - (b.dayTimestamp || 0));
        upcoming.sort((a, b) => (a.dayTimestamp || 0) - (b.dayTimestamp || 0));

        return {
            filteredDeadlines: deadlines,
            filteredUpcoming: upcoming,
            stats: {
                total: deadlinesData.totalEvents || 0,
                deadlines: futureDeadlines.length,
                upcoming: futureUpcoming.length,
                urgent: urgentCount
            }
        };
    }, [deadlinesData, showPast]);

    // Calendar info
    const calendarInfo = useMemo(() => {
        if (!deadlinesData) return '';
        const fetched = deadlinesData.fetchedMonths;
        if (fetched && fetched.length > 0) {
            const first = fetched[0];
            const last = fetched[fetched.length - 1];
            if (first.month === last.month && first.year === last.year) {
                return `${MONTH_NAMES[first.month]} ${first.year}`;
            }
            return `${MONTH_NAMES[first.month]} → ${MONTH_NAMES[last.month]} ${last.year}`;
        }
        const m = deadlinesData.calendarMonth;
        const y = deadlinesData.calendarYear;
        if (m && y) return `${MONTH_NAMES[m]} ${y}`;
        return '';
    }, [deadlinesData]);

    // Handle reload after login
    const handleReloadDeadlines = async () => {
        setShowLoginForm(false);
        setLoginJustCompleted(false);
        setError(null);
        setIsLoading(true);
        const success = await initSession();
        if (success) await loadDeadlines();
    };

    // ─── Error State ───
    if (error && !isLoading) {
        const isTokenError = error.toLowerCase().includes('token') ||
            error.toLowerCase().includes('expired') ||
            error.toLowerCase().includes('session') ||
            error.toLowerCase().includes('đăng nhập');

        return (
            <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <ScrollArea className="flex-1 p-4 sm:p-6">
                    <div className="max-w-md mx-auto space-y-6">
                        {loginJustCompleted && showLoginForm ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                                    <CalendarClock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                                    Đăng nhập thành công!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Bấm nút bên dưới để tải deadline LMS.
                                </p>
                                <Button
                                    onClick={handleReloadDeadlines}
                                    className="w-full gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                                    size="lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Tải Deadline LMS
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                                        <AlertCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        Không thể kết nối LMS
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {error}
                                    </p>
                                </div>

                                {isTokenError ? (
                                    <div className="space-y-4">
                                        {!showLoginForm ? (
                                            <div className="space-y-3">
                                                <p className="text-center text-sm text-muted-foreground">
                                                    Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.
                                                </p>
                                                <Button
                                                    onClick={() => setShowLoginForm(true)}
                                                    className="w-full gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                                                    size="lg"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                    Đăng nhập MyBK
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleRefresh}
                                                    className="w-full gap-2"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Thử lại không đăng nhập
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <MyBKLoginCard
                                                    onScheduleFetched={() => { }}
                                                    onError={(err) => console.log('Login error:', err)}
                                                    onLoginSuccess={() => setLoginJustCompleted(true)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setShowLoginForm(false)}
                                                    className="w-full text-muted-foreground"
                                                >
                                                    Quay lại
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button onClick={handleRefresh} className="w-full gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Thử lại
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // ─── Loading State ───
    if (isLoading && !deadlinesData) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg animate-pulse">
                    <CalendarClock className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải deadline LMS...</span>
                </div>
            </div>
        );
    }

    // Month range options
    const monthOptions = [
        { value: 1, label: '1T' },
        { value: 2, label: '2T' },
        { value: 3, label: '3T' },
        { value: 4, label: '4T' },
        { value: 6, label: '6T' },
    ];

    // ─── Main Content ───
    return (
        <div className="h-full w-full max-w-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-x-hidden overflow-hidden">
            {/* ── Sticky Header with glassmorphism - matches MessagesTab ── */}
            <div className="w-full max-w-full p-1.5 sm:p-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 overflow-hidden box-border">
                {/* Title Row */}
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
                            <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                                Deadline LMS
                            </h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {calendarInfo || 'BK E-Learning Calendar'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {isLoading && deadlinesData && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Stats Grid - same pattern as MessagesTab */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3 w-full min-w-0">
                    <StatsCard
                        icon={CalendarClock}
                        title="Tổng sự kiện"
                        value={stats.total}
                        color="violet"
                    />
                    <StatsCard
                        icon={AlertTriangle}
                        title="Deadline"
                        value={stats.deadlines}
                        color="rose"
                        subtitle={stats.urgent > 0 ? `${stats.urgent} sắp hết hạn` : ""}
                    />
                    <StatsCard
                        icon={Sparkles}
                        title="Sắp mở"
                        value={stats.upcoming}
                        color="emerald"
                    />
                    <StatsCard
                        icon={Timer}
                        title="Sắp hết hạn"
                        value={stats.urgent}
                        color="amber"
                        subtitle={stats.urgent > 0 ? "trong 3 ngày" : ""}
                    />
                </div>
            </div>

            {/* Offline Mode Banner */}
            {isOfflineMode && (
                <div className="mx-1.5 sm:mx-4 mt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <WifiOff className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                                Chế độ Offline
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Đang xem deadline đã lưu. Kết nối server để cập nhật mới nhất.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="flex-shrink-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Scrollable Content ── */}
            <ScrollArea className="flex-1 w-full max-w-full px-1.5 sm:px-4 min-w-0 overflow-x-hidden">
                <div className="py-3 sm:py-4 space-y-4 min-w-0 w-full overflow-hidden">

                    {/* ── Toolbar: Month Range + Filters ── */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {[
                                { id: 'all', label: 'Tất cả', icon: Filter },
                                { id: 'deadlines', label: 'Deadline', icon: AlertTriangle },
                                { id: 'upcoming', label: 'Sắp mở', icon: Sparkles },
                            ].map(tab => (
                                <Button
                                    key={tab.id}
                                    variant={activeFilter === tab.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`gap-1 text-xs sm:text-sm h-8
                                        ${activeFilter === tab.id
                                            ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md shadow-rose-200/50 dark:shadow-rose-900/30 border-0'
                                            : ''
                                        }
                                    `}
                                >
                                    <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </Button>
                            ))}

                            {/* Show Past Toggle */}
                            <Button
                                variant={showPast ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowPast(!showPast)}
                                className={`gap-1 text-xs sm:text-sm h-8
                                    ${showPast
                                        ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 border-0'
                                        : ''
                                    }
                                `}
                            >
                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Đã qua</span>
                            </Button>
                        </div>

                        {/* Month Range Selector */}
                        <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                            {monthOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleMonthRangeChange(opt.value)}
                                    disabled={isLoading}
                                    className={`px-2 py-1.5 text-[10px] sm:text-xs font-semibold transition-all
                                        ${monthRange === opt.value
                                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                                            : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-750'}
                                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Deadlines Section ── */}
                    {(activeFilter === 'all' || activeFilter === 'deadlines') && (
                        <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                            {/* Section Header */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
                                        <AlertTriangle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                        Deadline / Đóng
                                    </span>
                                    <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700 text-[10px] px-1.5 py-0">
                                        {filteredDeadlines.length}
                                    </Badge>
                                </div>
                            </div>

                            {filteredDeadlines.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm sm:text-base font-medium">Không có deadline nào</p>
                                    <p className="text-xs text-muted-foreground mt-1">Bạn đã hoàn thành tất cả! 🎉</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {filteredDeadlines.map((event, idx) => (
                                        <EventCard key={`deadline-${event.eventId || idx}`} event={event} type="deadline" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Divider between sections */}
                    {activeFilter === 'all' && filteredDeadlines.length > 0 && filteredUpcoming.length > 0 && (
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                        </div>
                    )}

                    {/* ── Upcoming Section ── */}
                    {(activeFilter === 'all' || activeFilter === 'upcoming') && (
                        <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                            {/* Section Header */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                        Sắp mở
                                    </span>
                                    <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 text-[10px] px-1.5 py-0">
                                        {filteredUpcoming.length}
                                    </Badge>
                                </div>
                            </div>

                            {filteredUpcoming.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
                                        <CalendarClock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm sm:text-base font-medium">Không có sự kiện sắp mở</p>
                                </div>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {filteredUpcoming.map((event, idx) => (
                                        <EventCard key={`upcoming-${event.eventId || idx}`} event={event} type="upcoming" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Courses Section ── */}
                    {deadlinesData?.courses && Object.keys(deadlinesData.courses).length > 0 && (
                        <>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        Khoá học có sự kiện
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {Object.keys(deadlinesData.courses).length}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(deadlinesData.courses).map(([id, name]) => (
                                        <div
                                            key={id}
                                            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/60 dark:via-gray-950/50 dark:to-zinc-950/60 border border-slate-200/60 dark:border-slate-800/50 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate"
                                        >
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* ── Footer - matches MessagesTab ── */}
            <div className="p-2 sm:p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <a
                    href="https://lms.hcmut.edu.vn/calendar/view.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center gap-1.5 font-medium"
                >
                    Mở lịch LMS đầy đủ <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
