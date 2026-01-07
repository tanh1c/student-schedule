import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    CalendarPlus,
    FileCheck,
    Loader2,
    ArrowLeft,
    BookOpen,
    Lock,
    Users,
    MapPin,
    GraduationCap
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
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isOpen ? 'border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10' : ''}
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

            {/* Courses List */}
            {!loading && courses.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Danh sách môn học đã đăng ký
                    </h3>
                    {courses.map((course, idx) => (
                        <CourseCard key={idx} course={course} index={idx + 1} />
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

// Course Card
function CourseCard({ course, index }) {
    return (
        <Card className={`${course.isLocked ? 'opacity-70' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-primary">{course.code}</span>
                            <span className="text-sm truncate">{course.name}</span>
                            {course.isLocked && (
                                <Lock className="h-3 w-3 text-red-500" />
                            )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {course.credits} TC
                            </span>
                            {course.group && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Nhóm: {course.group}
                                </span>
                            )}
                            {course.day && (
                                <span>{course.day}</span>
                            )}
                            {course.room && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {course.room}
                                </span>
                            )}
                            {course.slots && (
                                <span>SV: {course.slots}</span>
                            )}
                        </div>
                    </div>
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
