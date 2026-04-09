import React, { useState } from "react";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Loader2,
    Lock,
    Search,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import mybkApi from "@/services/mybkApi";
import CourseCard from "@/features/registration/components/CourseCard";
import SearchResultCard from "@/features/registration/components/SearchResultCard";
import { getRegistrationStatusBadge } from "@/features/registration/utils/statusBadge";

export default function PeriodDetailsView({ period, details, loading, onBack }) {
    const courses = details?.courses?.courses || [];
    const totalCredits = details?.courses?.totalCredits || 0;
    const totalCourses = details?.courses?.totalCourses || 0;
    const schedule = details?.schedule || {};

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [forceMode, setForceMode] = useState(false);

    const isOpen = period.status === "open";
    const isUpcoming = period.status === "upcoming";

    const colorScheme = {
        open: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
            border: "border-emerald-200/60 dark:border-emerald-900/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            decoration1: "bg-emerald-200/30 dark:bg-emerald-900/20",
            decoration2: "bg-green-200/30 dark:bg-green-900/20",
            textColor: "text-emerald-700 dark:text-emerald-400"
        },
        upcoming: {
            gradient: "from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20",
            border: "border-blue-200/60 dark:border-blue-900/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            decoration1: "bg-blue-200/30 dark:bg-blue-900/20",
            decoration2: "bg-indigo-200/30 dark:bg-indigo-900/20",
            textColor: "text-blue-700 dark:text-blue-400"
        },
        closed: {
            gradient: "from-zinc-50 via-gray-50 to-slate-50 dark:from-zinc-950/20 dark:via-gray-950/15 dark:to-slate-950/20",
            border: "border-zinc-200/60 dark:border-zinc-800/50",
            iconBg: "from-zinc-400 to-gray-500 dark:from-zinc-600 dark:to-gray-700",
            iconShadow: "shadow-zinc-200/50 dark:shadow-zinc-950/40",
            decoration1: "bg-zinc-200/20 dark:bg-zinc-900/15",
            decoration2: "bg-gray-200/20 dark:bg-gray-900/15",
            textColor: "text-zinc-600 dark:text-zinc-500"
        }
    };

    const colors = isOpen ? colorScheme.open : (isUpcoming ? colorScheme.upcoming : colorScheme.closed);
    const StatusIcon = isOpen ? CheckCircle2 : (isUpcoming ? Clock : Lock);

    const handleSearch = async (event) => {
        const isForceClick = event?.shiftKey === true;
        let query = searchQuery.trim();
        const hasForceCommand = query.toLowerCase().includes("#force");
        if (hasForceCommand) {
            query = query.replace(/#force/gi, "").trim();
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
                    setSearchError("Không tìm thấy môn học nào");
                }
            } else {
                setSearchError(result.error || "Không thể tìm kiếm môn học");
            }
        } catch (error) {
            setSearchError(error.message);
        } finally {
            setSearching(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4 px-3 pt-3 pb-24 sm:px-4 sm:pt-6">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${colors.gradient} border ${colors.border} p-4 sm:p-5 shadow-sm`}>
                <div className={`absolute -top-10 -right-10 h-32 w-32 ${colors.decoration1} rounded-full blur-2xl`} />
                <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${colors.decoration2} rounded-full blur-2xl`} />

                <div className="relative flex items-start gap-4">
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

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className={`font-bold text-lg sm:text-xl ${colors.textColor}`}>
                                {period.code}
                            </h2>
                            {getRegistrationStatusBadge(period.status)}
                        </div>
                        <p className="text-sm text-foreground/70 dark:text-foreground/60 line-clamp-2">
                            {period.description}
                        </p>
                    </div>
                </div>

                <div className="relative flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/30 dark:border-white/10">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/10 ${colors.textColor} text-xs font-medium`}>
                        <Clock className="h-3 w-3" />
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

            {loading && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải danh sách môn học...</p>
                </div>
            )}

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

            {!loading && period.status === "open" && (
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
                                {showSearch ? "Ẩn" : "Mở rộng"}
                            </button>
                        </div>

                        {showSearch && (
                            <div className="space-y-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/30">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        onKeyDown={handleKeyDown}
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

                                {searchError && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                        <XCircle className="h-4 w-4" />
                                        {searchError}
                                    </p>
                                )}

                                {forceMode && searchResults.length > 0 && (
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2 border border-purple-200 dark:border-purple-800">
                                        <span className="text-lg">🔓</span>
                                        <span><strong>Force Mode:</strong> Bypass validation đã kích hoạt!</span>
                                    </div>
                                )}

                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                                            Tìm thấy {searchResults.length} môn học
                                            {forceMode && <span className="ml-1 text-purple-500">(Force Mode)</span>}
                                        </p>
                                        {searchResults.map((course, index) => (
                                            <SearchResultCard
                                                key={course.monHocId || index}
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

            {!loading && courses.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground">Danh sách môn đã đăng ký</h3>
                    </div>
                    {courses.map((course, index) => (
                        <CourseCard
                            key={course.ketquaId || index}
                            course={course}
                            index={index + 1}
                            periodId={period.id}
                            onDeleted={onBack}
                        />
                    ))}
                </div>
            )}

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
