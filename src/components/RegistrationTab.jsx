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
    Trash2
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

export default function RegistrationTab() {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dkmhStatus, setDkmhStatus] = useState({ authenticated: false });
    const [filter, setFilter] = useState('all');

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

    const loadPeriods = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await mybkApi.getRegistrationPeriods();

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                        <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        Đăng ký môn học
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Danh sách các đợt đăng ký môn học
                    </p>
                </div>
                <Button
                    onClick={loadPeriods}
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

            {/* DKMH Status Warning */}
            {!dkmhStatus.authenticated && !dkmhStatus.dkmhLoggedIn && (
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                    <CardContent className="py-3 px-4">
                        <p className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Đang chờ kết nối đến hệ thống DKMH... Vui lòng đăng nhập MyBK trước.
                        </p>
                    </CardContent>
                </Card>
            )}

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

            {/* Stats & Filter */}
            {periods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="h-8"
                    >
                        Tất cả ({periods.length})
                    </Button>
                    <Button
                        variant={filter === 'open' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('open')}
                        className={`h-8 ${filter === 'open' ? '' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Đang mở ({openCount})
                    </Button>
                    <Button
                        variant={filter === 'upcoming' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('upcoming')}
                        className={`h-8 ${filter === 'upcoming' ? '' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        Sắp mở ({upcomingCount})
                    </Button>
                    <Button
                        variant={filter === 'closed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('closed')}
                        className="h-8"
                    >
                        Đã đóng
                    </Button>
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

// Registration Period Card Component
function RegistrationPeriodCard({ period, onClick }) {
    const isOpen = period.status === 'open';
    const isClosed = period.status === 'closed';
    const hasResult = period.hasResult;

    return (
        <Card
            className={`
        relative overflow-hidden
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isOpen ? 'border border-green-200/60 bg-gradient-to-br from-green-100/70 to-white dark:from-green-950/45 dark:to-card ring-1 ring-green-200/50 dark:ring-green-900/40' : ''}
        ${isClosed ? 'opacity-70' : ''}
      `}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Code & Status */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-bold text-primary text-sm sm:text-base">
                                {period.code}
                            </span>
                            {getStatusBadgeInline(period.status)}
                            {hasResult && (
                                <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    Có kết quả
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-2">
                            {period.description}
                        </p>

                        {/* Time Info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Bắt đầu: <span className="font-medium text-foreground">{period.startTime}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Kết thúc: <span className="font-medium text-foreground">{period.endTime}</span>
                            </span>
                        </div>
                    </div>

                    {/* Action Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
            </CardContent>
        </Card>
    );
}

// Period Details View
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

    const handleSearch = async (e) => {
        // Check for shift+click to trigger force mode
        const isForceClick = e?.shiftKey === true;

        // Also check if query contains #force command
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

        if (useForceMode) {
            console.log('🔓 Force Mode activated! Bypassing validation...');
        }

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
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-9 px-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-primary">{period.code}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{period.description}</p>
                </div>
            </div>

            {/* Schedule Info */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="py-3 px-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Từ: <span className="font-medium">{schedule.from || period.startTime}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Đến: <span className="font-medium">{schedule.to || period.endTime}</span>
                        </span>
                        {schedule.isOpen && (
                            <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Đang trong hạn đăng ký
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải danh sách môn học...</p>
                </div>
            )}

            {/* Summary */}
            {!loading && details && (
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="py-4 px-4 text-center">
                            <BookOpen className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                            <p className="text-2xl font-bold">{totalCourses}</p>
                            <p className="text-xs text-muted-foreground">Môn đăng ký</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4 px-4 text-center">
                            <GraduationCap className="h-6 w-6 mx-auto mb-1 text-green-500" />
                            <p className="text-2xl font-bold">{totalCredits}</p>
                            <p className="text-xs text-muted-foreground">Tín chỉ</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search Section - Only show for open periods */}
            {!loading && period.status === 'open' && (
                <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Search className="h-4 w-4 text-green-600" />
                                Đăng ký hiệu chỉnh
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSearch(!showSearch)}
                                className="h-7 text-xs"
                            >
                                {showSearch ? 'Ẩn' : 'Mở rộng'}
                            </Button>
                        </div>

                        {showSearch && (
                            <div className="space-y-3">
                                {/* Search Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập mã hoặc tên môn học (VD: CO3005)"
                                        className="flex-1 h-10 px-3 rounded-md border-[1.5px] border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        disabled={searching || !searchQuery.trim()}
                                        className="h-10 bg-green-600 hover:bg-green-700 text-white"
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
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <XCircle className="h-4 w-4" />
                                        {searchError}
                                    </p>
                                )}

                                {/* Force Mode Indicator */}
                                {forceMode && searchResults.length > 0 && (
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
                                        <span className="text-lg">🔓</span>
                                        <span><strong>Force Mode:</strong> Bypass validation đã kích hoạt. Có thể đăng ký môn trùng lịch!</span>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
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
                    </CardContent>
                </Card>
            )}

            {/* Courses List */}
            {!loading && courses.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Danh sách môn học đã đăng ký
                    </h3>
                    {courses.map((course, idx) => (
                        <CourseCard
                            key={course.ketquaId || idx}
                            course={course}
                            index={idx + 1}
                            periodId={period.id}
                            onDeleted={onBack} // Trigger refresh by going back
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && courses.length === 0 && details && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chưa có môn học nào được đăng ký trong đợt này</p>
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

