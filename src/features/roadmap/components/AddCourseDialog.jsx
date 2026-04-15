import React from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { STICKY_NOTE_COLORS } from "@/features/roadmap/constants/roadmapStyles";

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function AddCourseDialog({
    addCoursePopup,
    semesters,
    addCourseSearchOpen,
    setAddCourseSearchOpen,
    searchTerm,
    setSearchTerm,
    filteredCourses,
    updateNewCourseField,
    confirmAddCourse,
    setAddCoursePopup,
    onClose
}) {
    return (
        <Dialog open={!!addCoursePopup} onOpenChange={(open) => !open && onClose()}>
            {addCoursePopup && (() => {
                const semester = semesters.find((item) => item.id === addCoursePopup.semesterId);
                if (!semester) return null;

                const stickyColor = STICKY_NOTE_COLORS[Math.abs(String(addCoursePopup.semesterId).charCodeAt(0) || 0) % STICKY_NOTE_COLORS.length];

                return (
                    <DialogContent className={`max-w-md flex flex-col border-2 ${stickyColor.border} ${stickyColor.bg}`}>
                        <div
                            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-lg"
                            style={{ backgroundImage: PAPER_TEXTURE }}
                        />

                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 ${stickyColor.tape} rounded-sm opacity-90 z-10 shadow-sm`} />

                        <DialogHeader className="relative z-[1] pb-3 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-foreground" />
                                <DialogTitle className="text-base font-semibold text-foreground">Thêm môn học mới</DialogTitle>
                            </div>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Thêm vào: <span className="font-medium text-foreground">{semester.name || "Học kỳ"}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 relative z-[1]">
                            <Popover open={addCourseSearchOpen} onOpenChange={setAddCourseSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 justify-start gap-2 text-sm font-medium border-dashed"
                                    >
                                        <Search className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">Tìm môn từ CTDT...</span>
                                        <Sparkles className="h-3.5 w-3.5 text-amber-500 ml-auto" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="start">
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
                                                            setAddCoursePopup((previous) => ({
                                                                ...previous,
                                                                newCourse: {
                                                                    ...previous.newCourse,
                                                                    code: referenceCourse.code,
                                                                    name: referenceCourse.name,
                                                                    credits: referenceCourse.credits
                                                                }
                                                            }));
                                                            setAddCourseSearchOpen(false);
                                                        }}
                                                        className="text-xs py-2.5 cursor-pointer"
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-primary">{referenceCourse.code}</span>
                                                                <span className="font-semibold">{referenceCourse.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground">{referenceCourse.credits} tín chỉ</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase">
                                    <span className="px-2 text-muted-foreground bg-card dark:bg-card">hoặc nhập thủ công</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-28 shrink-0">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mã môn học</label>
                                    <Input
                                        value={addCoursePopup.newCourse.code}
                                        onChange={(event) => updateNewCourseField("code", event.target.value)}
                                        className="h-10 text-sm font-mono font-bold"
                                        placeholder="CO1005"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tên môn học</label>
                                    <Input
                                        value={addCoursePopup.newCourse.name}
                                        onChange={(event) => updateNewCourseField("name", event.target.value)}
                                        className="h-10 text-sm font-semibold"
                                        placeholder="Nhập tên môn học"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-28 shrink-0">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Số tín chỉ</label>
                                    <Input
                                        value={addCoursePopup.newCourse.credits}
                                        onChange={(event) => updateNewCourseField("credits", event.target.value)}
                                        className="h-10 text-sm text-center font-medium"
                                        placeholder="3"
                                        type="number"
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Điểm mục tiêu (hệ 10)</label>
                                    <Input
                                        value={addCoursePopup.newCourse.aim}
                                        onChange={(event) => updateNewCourseField("aim", event.target.value)}
                                        className="h-10 text-sm text-center font-medium"
                                        placeholder="8.5"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ghi chú (tùy chọn)</label>
                                <Textarea
                                    value={addCoursePopup.newCourse.note}
                                    onChange={(event) => updateNewCourseField("note", event.target.value)}
                                    className="min-h-[80px] text-sm resize-none"
                                    placeholder="Tài liệu tham khảo, thông tin giảng viên, lịch học..."
                                />
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/30 flex items-center justify-end gap-2 relative z-[1]">
                            <Button variant="outline" onClick={onClose} className="text-foreground border-border hover:bg-muted">
                                Hủy
                            </Button>
                            <Button
                                onClick={confirmAddCourse}
                                disabled={!addCoursePopup.newCourse.code && !addCoursePopup.newCourse.name}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Thêm môn
                            </Button>
                        </div>
                    </DialogContent>
                );
            })()}
        </Dialog>
    );
}
