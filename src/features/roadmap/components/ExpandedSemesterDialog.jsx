import React from "react";
import {
    AlertTriangle,
    BookMarked,
    BookOpen,
    Expand,
    GraduationCap,
    MessageSquare,
    NotebookPen,
    Plus,
    Search,
    Sparkles,
    Sun,
    Target,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCourseColor, getStickyNoteStyle, STICKY_NOTE_COLORS } from "@/features/roadmap/constants/roadmapStyles";
import { calculateSemesterGpa, getLetterGrade } from "@/features/roadmap/utils/gpa";

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

function SemesterStats({ semester }) {
    const totalCredits = semester.courses.reduce((sum, course) => sum + (parseInt(course.credits, 10) || 0), 0);
    const isOverLimit = totalCredits > 18;
    const gpaStats = calculateSemesterGpa(semester.courses);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`rounded-xl p-4 border ${isOverLimit ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40" : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40"}`}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2">
                    <BookMarked className="h-3.5 w-3.5" />
                    Khối lượng
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Số môn</span>
                        <strong>{semester.courses.length}</strong>
                    </div>
                    <div className={`flex justify-between ${isOverLimit ? "text-red-600 dark:text-red-400" : ""}`}>
                        <span className="flex items-center gap-1">
                            {isOverLimit && <AlertTriangle className="h-4 w-4" />}
                            Tín chỉ
                        </span>
                        <strong>{totalCredits}/18</strong>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl p-4 border ${gpaStats ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40" : "bg-muted/50 border-border/50"}`}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2">
                    <Target className="h-3.5 w-3.5" />
                    GPA Mục tiêu
                </div>
                {gpaStats ? (
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-lg font-bold">{gpaStats.gpa10}</div>
                            <div className="text-[10px] text-muted-foreground">Hệ 10</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold">{gpaStats.gpa4}</div>
                            <div className="text-[10px] text-muted-foreground">Hệ 4</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Nhập điểm mục tiêu để xem GPA dự kiến.</p>
                )}
            </div>
        </div>
    );
}

export default function ExpandedSemesterDialog({
    expandedSemester,
    semesters,
    onClose,
    updateSemesterMeta,
    setNotePopup,
    searchTerm,
    setSearchTerm,
    filteredCourses,
    setSemesters,
    openAddCoursePopup,
    removeCourse,
    updateCourse
}) {
    return (
        <Dialog open={!!expandedSemester} onOpenChange={(open) => !open && onClose()}>
            {expandedSemester && (() => {
                const { globalIndex, isSummer } = expandedSemester;
                const semester = semesters.find((item) => item.id === expandedSemester.semester.id);
                if (!semester) return null;

                const stickyStyle = isSummer
                    ? { color: STICKY_NOTE_COLORS[5] }
                    : getStickyNoteStyle(globalIndex);

                return (
                    <DialogContent className={`max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col border-2 ${stickyStyle.color.border} ${stickyStyle.color.bg}`}>
                        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none rounded-lg" style={{ backgroundImage: PAPER_TEXTURE }} />
                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 ${stickyStyle.color.tape} rounded-sm opacity-90 z-10 shadow-sm`} />

                        <DialogHeader className="pb-4 border-b relative z-[1]">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 ${isSummer ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200" : "bg-primary/10 text-primary"}`}>
                                    {isSummer ? (
                                        <><Sun className="h-3.5 w-3.5" /> HỌC KỲ HÈ</>
                                    ) : (
                                        <><GraduationCap className="h-3.5 w-3.5" /> HỌC KỲ {(globalIndex % 3) + 1}</>
                                    )}
                                </Badge>
                                <DialogTitle className="text-lg font-bold">
                                    {semester.name || `Học kỳ ${globalIndex + 1}`}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="sr-only">
                                Chi tiết và danh sách môn học của {semester.name || `Học kỳ ${globalIndex + 1}`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 relative z-[1]">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 rounded-xl border border-border/50 bg-white/50 dark:bg-white/5 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        <NotebookPen className="h-3.5 w-3.5" />
                                        Thông tin học kỳ
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                                        <div>
                                            <label className="text-[10px] text-muted-foreground mb-1 block">Tên học kỳ</label>
                                            <Input
                                                value={semester.name}
                                                onChange={(event) => updateSemesterMeta(semester.id, "name", event.target.value)}
                                                className="h-9 text-sm font-medium"
                                                placeholder="VD: HK1 Năm nhất"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground mb-1 block">Niên khóa</label>
                                            <Input
                                                value={semester.year}
                                                onChange={(event) => updateSemesterMeta(semester.id, "year", event.target.value)}
                                                className="h-9 text-sm font-bold"
                                                placeholder={`K${25 + globalIndex}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[10px] text-muted-foreground">Ghi chú</label>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary"
                                                onClick={() => setNotePopup({ semesterId: semester.id, type: "semester" })}
                                            >
                                                <Expand className="h-3 w-3 mr-1" />
                                                Mở rộng
                                            </Button>
                                        </div>
                                        <div
                                            className="min-h-[56px] text-xs bg-muted/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                                            onClick={() => setNotePopup({ semesterId: semester.id, type: "semester" })}
                                        >
                                            {semester.note ? (
                                                <p className="text-foreground/80 line-clamp-3">{semester.note}</p>
                                            ) : (
                                                <p className="text-muted-foreground/50 italic">Click để thêm ghi chú...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <SemesterStats semester={semester} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        Danh sách môn học ({semester.courses.length})
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size="sm" variant="outline" className="h-8 text-xs border-dashed gap-1.5">
                                                    <Search className="h-3 w-3" />
                                                    Tìm từ CTDT
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
                                                        <CommandGroup heading={`Tìm thấy ${searchTerm ? filteredCourses.length : "tất cả"} môn học`}>
                                                            {filteredCourses.map((referenceCourse) => (
                                                                <CommandItem
                                                                    key={referenceCourse.code}
                                                                    value={`${referenceCourse.code} ${referenceCourse.name}`}
                                                                    onSelect={() => {
                                                                        setSemesters((previous) => previous.map((item) => (
                                                                            item.id === semester.id
                                                                                ? {
                                                                                    ...item,
                                                                                    courses: [
                                                                                        ...item.courses,
                                                                                        {
                                                                                            id: Date.now(),
                                                                                            code: referenceCourse.code,
                                                                                            name: referenceCourse.name,
                                                                                            credits: referenceCourse.credits,
                                                                                            aim: "",
                                                                                            note: ""
                                                                                        }
                                                                                    ]
                                                                                }
                                                                                : item
                                                                        )));
                                                                    }}
                                                                    className="text-xs py-2.5 cursor-pointer"
                                                                >
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono font-bold text-primary">{referenceCourse.code}</span>
                                                                            <span className="font-semibold">{referenceCourse.name}</span>
                                                                        </div>
                                                                        <span className="text-[10px] text-muted-foreground">{referenceCourse.credits} tín chỉ • Click để thêm</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>

                                        <Button size="sm" variant="outline" onClick={() => openAddCoursePopup(semester.id)} className="h-8 text-xs">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Thêm môn
                                        </Button>
                                    </div>
                                </div>

                                {semester.courses.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="p-6 text-center">
                                            <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Chưa có môn học nào</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">Nhấn "Thêm môn" để bắt đầu</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {semester.courses.map((course) => {
                                            const colorScheme = getCourseColor(course.code);

                                            return (
                                                <Card key={course.id} className={`${colorScheme.border} ${colorScheme.bg} relative group`}>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute -top-1 -right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full bg-background shadow-sm"
                                                        onClick={() => removeCourse(semester.id, course.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>

                                                    <CardContent className="p-3 space-y-2">
                                                        <div className="grid grid-cols-[96px_1fr] gap-2">
                                                            <div>
                                                                <label className="text-[10px] text-muted-foreground mb-0.5 block">Mã MH</label>
                                                                <Input
                                                                    value={course.code}
                                                                    onChange={(event) => updateCourse(semester.id, course.id, "code", event.target.value)}
                                                                    className="h-8 text-xs font-mono font-bold"
                                                                    placeholder="CO1005"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-muted-foreground mb-0.5 block">Tên môn học</label>
                                                                <Input
                                                                    value={course.name}
                                                                    onChange={(event) => updateCourse(semester.id, course.id, "name", event.target.value)}
                                                                    className="h-8 text-xs font-semibold"
                                                                    placeholder="Nhập tên môn"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 items-end">
                                                            <div className="w-16">
                                                                <label className="text-[10px] text-muted-foreground mb-0.5 block">TC</label>
                                                                <Input
                                                                    value={course.credits}
                                                                    onChange={(event) => updateCourse(semester.id, course.id, "credits", event.target.value)}
                                                                    className="h-8 text-xs text-center font-medium"
                                                                    placeholder="3"
                                                                />
                                                            </div>
                                                            <div className="w-20">
                                                                <label className="text-[10px] text-muted-foreground mb-0.5 block">Mục tiêu</label>
                                                                <Input
                                                                    value={course.aim || ""}
                                                                    onChange={(event) => updateCourse(semester.id, course.id, "aim", event.target.value)}
                                                                    className="h-8 text-xs text-center font-medium"
                                                                    placeholder="8.5"
                                                                />
                                                            </div>
                                                            {course.aim && (
                                                                <Badge variant="outline" className="h-8 text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0">
                                                                    <Target className="h-2.5 w-2.5 mr-1" />
                                                                    {getLetterGrade(course.aim)}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div
                                                            className="flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors group/note"
                                                            onClick={() => setNotePopup({ semesterId: semester.id, type: "course", courseId: course.id })}
                                                        >
                                                            <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            {course.note ? (
                                                                <p className="text-[11px] text-foreground/70 line-clamp-2 flex-1">{course.note}</p>
                                                            ) : (
                                                                <p className="text-[11px] text-muted-foreground/50 italic flex-1">Thêm ghi chú...</p>
                                                            )}
                                                            <Expand className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button onClick={onClose}>Đóng</Button>
                        </div>
                    </DialogContent>
                );
            })()}
        </Dialog>
    );
}
