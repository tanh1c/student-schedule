import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "lucide-react";
import { STICKY_NOTE_COLORS } from "@/features/roadmap/constants/roadmapStyles";

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function NoteDialog({
    notePopup,
    semesters,
    onClose,
    updateCourse,
    updateSemesterMeta
}) {
    return (
        <Dialog open={!!notePopup} onOpenChange={(open) => !open && onClose()}>
            {notePopup && (() => {
                const semester = semesters.find((item) => item.id === notePopup.semesterId);
                if (!semester) return null;

                const isCourseNote = notePopup.type === "course";
                const course = isCourseNote ? semester.courses.find((item) => item.id === notePopup.courseId) : null;
                const currentNote = isCourseNote ? (course?.note || "") : (semester.note || "");
                const title = isCourseNote
                    ? `Ghi chú: ${course?.name || course?.code || "Môn học"}`
                    : `Ghi chú: ${semester.name || "Học kỳ"}`;

                const semesterIdString = String(notePopup.semesterId);
                const stickyColor = STICKY_NOTE_COLORS[Math.abs(semesterIdString.charCodeAt(0) || 0) % STICKY_NOTE_COLORS.length];

                const handleNoteChange = (value) => {
                    if (isCourseNote && course) {
                        updateCourse(semester.id, course.id, "note", value);
                    } else {
                        updateSemesterMeta(semester.id, "note", value);
                    }
                };

                return (
                    <DialogContent className={`max-w-2xl max-h-[80vh] flex flex-col border-2 ${stickyColor.border} ${stickyColor.bg}`}>
                        <div
                            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-lg"
                            style={{ backgroundImage: PAPER_TEXTURE }}
                        />

                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 ${stickyColor.tape} rounded-sm opacity-90 z-10 shadow-sm`} />

                        <DialogHeader className="relative z-[1] pb-3 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <StickyNote className="h-5 w-5 text-muted-foreground" />
                                <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                            </div>
                            <DialogDescription className="sr-only">
                                Nhập ghi chú cho {isCourseNote ? "môn học" : "học kỳ"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 relative z-[1] py-4">
                            <Textarea
                                value={currentNote}
                                onChange={(event) => handleNoteChange(event.target.value)}
                                className="w-full h-full min-h-[300px] text-sm resize-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
                                placeholder={isCourseNote
                                    ? "Ghi chú về môn học: tài liệu tham khảo, lịch thi, nhóm học tập, thông tin giảng viên, deadline bài tập..."
                                    : "Ghi chú học kỳ: mục tiêu GPA, kế hoạch thực tập, sự kiện quan trọng, deadlines, lịch nghỉ..."
                                }
                                autoFocus
                            />
                        </div>

                        <div className="pt-3 border-t border-border/30 flex items-center justify-between relative z-[1]">
                            <p className="text-[10px] text-muted-foreground">
                                {currentNote.length} ký tự • Tự động lưu
                            </p>
                            <Button onClick={onClose} size="sm">
                                Xong
                            </Button>
                        </div>
                    </DialogContent>
                );
            })()}
        </Dialog>
    );
}
