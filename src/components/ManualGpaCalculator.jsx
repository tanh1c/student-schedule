import React, { useState, useMemo, useEffect } from "react";
import {
    Plus,
    Trash2,
    Calculator,
    BookOpen,
    Search,
    Sparkles,
    TrendingUp,
    Target,
    GraduationCap,
    ChevronDown,
    Save,
    RotateCcw,
    X,
    CalendarDays,
    CheckCircle2,
    Circle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";

// Các hàm tính điểm (theo chuẩn BK)
const convertToGpa4 = (score10) => {
    const score = parseFloat(score10);
    if (isNaN(score)) return 0;
    if (score >= 8.5) return 4.0;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.5) return 2.5;
    if (score >= 5.5) return 2.0;
    if (score >= 5.0) return 1.5;
    if (score >= 4.0) return 1.0;
    return 0.0;
};

const getLetterGrade = (score10) => {
    const score = parseFloat(score10);
    if (isNaN(score)) return '';
    if (score >= 9.5) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.5) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'D+';
    if (score >= 4.0) return 'D';
    return 'F';
};

const getGradeColor = (grade) => {
    const upper = String(grade).toUpperCase();
    if (upper === 'A+' || upper === 'A') return 'text-emerald-600 dark:text-emerald-400';
    if (upper === 'B+' || upper === 'B') return 'text-blue-600 dark:text-blue-400';
    if (upper === 'C+' || upper === 'C') return 'text-amber-600 dark:text-amber-400';
    if (upper === 'D+' || upper === 'D') return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
};

export default function ManualGpaCalculator() {
    const [courses, setCourses] = useLocalStorage("manual_gpa_courses", []);
    const [referenceCourses, setReferenceCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [semesterName, setSemesterName] = useLocalStorage("manual_gpa_semester_name", "Học kỳ 1");

    // State for TKB import
    const [showTkbImport, setShowTkbImport] = useState(false);
    const [tkbCourses, setTkbCourses] = useState([]);
    const [selectedTkbCourses, setSelectedTkbCourses] = useState([]);

    // Load danh sách môn học tham khảo
    useEffect(() => {
        fetch('/data/all_courses_master.json')
            .then(res => res.json())
            .then(data => setReferenceCourses(data))
            .catch(err => console.error("Lỗi load danh sách môn học:", err));
    }, []);

    // Load danh sách môn từ TKB khi mở dialog
    const loadTkbCourses = () => {
        try {
            const savedSchedule = localStorage.getItem('scheduleData');
            if (savedSchedule) {
                const parsed = JSON.parse(savedSchedule);
                // Loại bỏ môn trùng lặp (theo mã môn)
                const uniqueCourses = [];
                const seenCodes = new Set();
                parsed.forEach(c => {
                    if (c.code && !seenCodes.has(c.code)) {
                        seenCodes.add(c.code);
                        uniqueCourses.push({
                            code: c.code,
                            name: c.name,
                            credits: c.credits || 3
                        });
                    }
                });
                setTkbCourses(uniqueCourses);
                setSelectedTkbCourses([]);
            } else {
                setTkbCourses([]);
            }
        } catch (err) {
            console.error("Lỗi load TKB:", err);
            setTkbCourses([]);
        }
        setShowTkbImport(true);
    };

    // Toggle chọn môn từ TKB
    const toggleTkbCourse = (code) => {
        setSelectedTkbCourses(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    // Import các môn đã chọn từ TKB
    const importSelectedTkbCourses = () => {
        const existingCodes = new Set(courses.map(c => c.code));
        const newCourses = tkbCourses
            .filter(c => selectedTkbCourses.includes(c.code) && !existingCodes.has(c.code))
            .map(c => ({
                id: Date.now() + Math.random(),
                code: c.code,
                name: c.name,
                credits: String(c.credits),
                score: ""
            }));

        if (newCourses.length > 0) {
            setCourses(prev => [...prev, ...newCourses]);
        }
        setShowTkbImport(false);
        setSelectedTkbCourses([]);
    };

    // Lọc danh sách môn học dựa trên searchTerm
    const filteredCourses = useMemo(() => {
        if (!searchTerm.trim()) return referenceCourses.slice(0, 15);
        const query = searchTerm.toLowerCase().trim();
        const matches = referenceCourses.filter(c =>
            c.code.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query)
        );
        return matches.slice(0, 30);
    }, [referenceCourses, searchTerm]);

    // Tính toán GPA
    const gpaStats = useMemo(() => {
        let totalCredits = 0;
        let totalScore10 = 0;
        let totalScore4 = 0;
        let passedCredits = 0;

        courses.forEach(course => {
            const credits = parseInt(course.credits) || 0;
            const score = parseFloat(course.score);

            if (credits > 0 && !isNaN(score) && score >= 0 && score <= 10) {
                totalCredits += credits;
                totalScore10 += score * credits;
                totalScore4 += convertToGpa4(score) * credits;

                if (score >= 4.0) {
                    passedCredits += credits;
                }
            }
        });

        if (totalCredits === 0) return null;

        return {
            gpa10: (totalScore10 / totalCredits).toFixed(2),
            gpa4: (totalScore4 / totalCredits).toFixed(2),
            totalCredits,
            passedCredits,
            courseCount: courses.length
        };
    }, [courses]);

    // Thêm môn từ CTDT
    const addCourseFromReference = (ref) => {
        setCourses(prev => [...prev, {
            id: Date.now(),
            code: ref.code,
            name: ref.name,
            credits: ref.credits,
            score: ""
        }]);
        setShowSearch(false);
        setSearchTerm("");
    };

    // Thêm môn thủ công
    const addEmptyCourse = () => {
        setCourses(prev => [...prev, {
            id: Date.now(),
            code: "",
            name: "",
            credits: "3",
            score: ""
        }]);
    };

    // Xóa môn
    const removeCourse = (id) => {
        setCourses(prev => prev.filter(c => c.id !== id));
    };

    // Cập nhật môn
    const updateCourse = (id, field, value) => {
        setCourses(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    // Reset tất cả
    const resetAll = () => {
        if (window.confirm("Xóa tất cả môn học đã nhập?")) {
            setCourses([]);
            setSemesterName("Học kỳ 1");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header với tên học kỳ và actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400">
                            <GraduationCap className="h-4 w-4" />
                        </div>
                        <Input
                            value={semesterName}
                            onChange={(e) => setSemesterName(e.target.value)}
                            className="pl-9 pr-4 h-10 w-48 font-bold text-sm bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-xl"
                            placeholder="Tên học kỳ..."
                        />
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                        {courses.length} môn
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {courses.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetAll}
                            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* GPA Summary Cards - Premium Style */}
            {gpaStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* GPA Hệ 10 */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-sky-950/20 border border-blue-200/60 dark:border-blue-900/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute -top-6 -right-6 h-16 w-16 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-6 -left-6 h-16 w-16 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-md shadow-blue-200/50 dark:shadow-blue-950/40">
                                    <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-blue-700/80 dark:text-blue-400/80">GPA Hệ 10</p>
                            </div>
                            <p className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-300 mt-2">{gpaStats.gpa10}</p>
                        </div>
                    </div>

                    {/* GPA Hệ 4 */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute -top-6 -right-6 h-16 w-16 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-6 -left-6 h-16 w-16 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700 flex items-center justify-center shadow-md shadow-emerald-200/50 dark:shadow-emerald-950/40">
                                    <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">GPA Hệ 4</p>
                            </div>
                            <p className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-2">{gpaStats.gpa4}</p>
                        </div>
                    </div>

                    {/* Tín chỉ */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/15 dark:to-fuchsia-950/20 border border-violet-200/60 dark:border-violet-900/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute -top-6 -right-6 h-16 w-16 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-6 -left-6 h-16 w-16 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700 flex items-center justify-center shadow-md shadow-violet-200/50 dark:shadow-violet-950/40">
                                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-violet-700/80 dark:text-violet-400/80">Tín chỉ</p>
                            </div>
                            <p className="text-xl sm:text-2xl font-black text-violet-900 dark:text-violet-300 mt-2">{gpaStats.totalCredits}</p>
                        </div>
                    </div>

                    {/* Số môn */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-900/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute -top-6 -right-6 h-16 w-16 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-6 -left-6 h-16 w-16 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-md shadow-amber-200/50 dark:shadow-amber-950/40">
                                    <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80">Số môn</p>
                            </div>
                            <p className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300 mt-2">{gpaStats.courseCount}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Course List */}
            <Card className="border-border/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">Danh sách môn học</CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Import từ TKB */}
                        <Popover open={showTkbImport} onOpenChange={setShowTkbImport}>
                            <PopoverTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={loadTkbCourses}
                                    className="h-8 text-xs gap-1.5 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Từ TKB</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                                <div className="p-3 border-b">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                                        Import từ Thời khóa biểu
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">Chọn các môn muốn thêm vào danh sách</p>
                                </div>

                                {tkbCourses.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Chưa có dữ liệu lịch học</p>
                                        <p className="text-xs mt-1">Vui lòng sync dữ liệu từ trang Lịch học trước</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {tkbCourses.map((c) => {
                                                const isSelected = selectedTkbCourses.includes(c.code);
                                                const isExisting = courses.some(existing => existing.code === c.code);

                                                return (
                                                    <button
                                                        key={c.code}
                                                        onClick={() => !isExisting && toggleTkbCourse(c.code)}
                                                        disabled={isExisting}
                                                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${isExisting
                                                            ? 'opacity-50 cursor-not-allowed bg-muted/30'
                                                            : isSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                                                                : 'hover:bg-muted'
                                                            }`}
                                                    >
                                                        {isExisting ? (
                                                            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        ) : isSelected ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                        ) : (
                                                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
                                                                {isExisting && <span className="text-[10px] text-muted-foreground">(đã có)</span>}
                                                            </div>
                                                            <p className="text-xs truncate text-muted-foreground">{c.name}</p>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground shrink-0">{c.credits} TC</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="p-3 border-t flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                Đã chọn: {selectedTkbCourses.length}/{tkbCourses.filter(c => !courses.some(existing => existing.code === c.code)).length}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={importSelectedTkbCourses}
                                                disabled={selectedTkbCourses.length === 0}
                                                className="h-8 bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" />
                                                Thêm {selectedTkbCourses.length} môn
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Tìm từ CTDT */}
                        <Popover open={showSearch} onOpenChange={setShowSearch}>
                            <PopoverTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs gap-1.5 border-dashed"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Tìm CTDT</span>
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                                <Command className="rounded-lg shadow-md" shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Nhập mã hoặc tên môn học..."
                                        value={searchTerm}
                                        onValueChange={setSearchTerm}
                                    />
                                    <CommandList>
                                        <CommandEmpty>Không tìm thấy môn học</CommandEmpty>
                                        <CommandGroup heading={`Tìm thấy ${searchTerm ? filteredCourses.length : 'tất cả'} môn`}>
                                            {filteredCourses.map((ref) => (
                                                <CommandItem
                                                    key={ref.code}
                                                    value={`${ref.code} ${ref.name}`}
                                                    onSelect={() => addCourseFromReference(ref)}
                                                    className="text-xs py-2.5 cursor-pointer"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-primary">{ref.code}</span>
                                                            <span className="font-semibold truncate">{ref.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">{ref.credits} tín chỉ</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Thêm thủ công */}
                        <Button
                            size="sm"
                            onClick={addEmptyCourse}
                            className="h-8 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Thêm
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {courses.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Calculator className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground mb-2">Chưa có môn học nào</p>
                            <p className="text-xs text-muted-foreground/60">
                                Bấm "Tìm từ CTDT" hoặc "Thêm" để bắt đầu
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Desktop Table Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-2">Mã môn</div>
                                <div className="col-span-5">Tên môn học</div>
                                <div className="col-span-1 text-center">TC</div>
                                <div className="col-span-2 text-center">Điểm</div>
                                <div className="col-span-1 text-center">Xếp loại</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Course Rows */}
                            {courses.map((course, idx) => {
                                const letterGrade = getLetterGrade(course.score);
                                const gpa4 = convertToGpa4(course.score);

                                return (
                                    <div
                                        key={course.id}
                                        className="group relative bg-muted/30 hover:bg-muted/50 rounded-xl p-3 transition-all border border-transparent hover:border-border/50"
                                    >
                                        {/* Desktop View */}
                                        <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-2">
                                                <Input
                                                    value={course.code}
                                                    onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                                                    className="h-8 text-xs font-mono font-bold bg-background"
                                                    placeholder="CO1005"
                                                />
                                            </div>
                                            <div className="col-span-5">
                                                <Input
                                                    value={course.name}
                                                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                                    className="h-8 text-xs bg-background"
                                                    placeholder="Tên môn học..."
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={course.credits}
                                                    onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                                                    className="h-8 text-xs text-center bg-background"
                                                    placeholder="3"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={course.score}
                                                    onChange={(e) => updateCourse(course.id, 'score', e.target.value)}
                                                    className="h-8 text-sm text-center font-bold bg-background"
                                                    placeholder="8.5"
                                                />
                                            </div>
                                            <div className="col-span-1 text-center">
                                                {letterGrade && (
                                                    <span className={`font-black text-sm ${getGradeColor(letterGrade)}`}>
                                                        {letterGrade}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeCourse(course.id)}
                                                    className="h-7 w-7 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="sm:hidden space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Input
                                                        value={course.code}
                                                        onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                                                        className="h-8 text-xs font-mono font-bold bg-background"
                                                        placeholder="Mã môn (VD: CO1005)"
                                                    />
                                                    <Input
                                                        value={course.name}
                                                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                                        className="h-8 text-xs bg-background"
                                                        placeholder="Tên môn học..."
                                                    />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeCourse(course.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-muted-foreground mb-1 block">Tín chỉ</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={course.credits}
                                                        onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                                                        className="h-9 text-sm text-center bg-background"
                                                        placeholder="3"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-muted-foreground mb-1 block">Điểm số</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={course.score}
                                                        onChange={(e) => updateCourse(course.id, 'score', e.target.value)}
                                                        className="h-9 text-sm text-center font-bold bg-background"
                                                        placeholder="8.5"
                                                    />
                                                </div>
                                                {letterGrade && (
                                                    <div className="text-center pt-4">
                                                        <span className={`font-black text-lg ${getGradeColor(letterGrade)}`}>
                                                            {letterGrade}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add More Button */}
                            <button
                                onClick={addEmptyCourse}
                                className="w-full py-3 border-2 border-dashed rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm môn học
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Hướng dẫn */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Công thức: GPA = Σ(Điểm × Tín chỉ) / Σ(Tín chỉ) • Hệ 4 theo chuẩn BK</span>
            </div>
        </div>
    );
}
