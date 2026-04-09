import React, { useState } from "react";
import { CheckCircle2, Loader2, Lock, MapPin, Trash2, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import mybkApi from "@/services/mybkApi";

export default function CourseCard({ course, index, periodId, onDeleted }) {
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
                setDeleteResult({ type: "success", message: `Đã hủy đăng ký ${course.code}` });
                setTimeout(() => {
                    if (onDeleted) onDeleted();
                }, 1500);
            } else {
                setDeleteResult({ type: "error", message: result.error || "Hủy đăng ký thất bại" });
            }
        } catch (error) {
            setDeleteResult({ type: "error", message: error.message });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <Card className={`${course.isLocked ? "opacity-70" : ""} ${deleteResult?.type === "success" ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
            {deleteResult && (
                <div className={`p-2 text-xs font-medium flex items-center gap-2 ${deleteResult.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {deleteResult.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {deleteResult.message}
                </div>
            )}

            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index}
                    </div>
                    <div className="flex-1 min-w-0">
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
                                        {course.language === "V" ? "Việt" : course.language === "E" ? "Anh" : course.language}
                                    </Badge>
                                )}
                                {course.lecturer && course.lecturer !== "Chưa phân công" && (
                                    <span className="text-muted-foreground">
                                        GV: {course.lecturer}
                                    </span>
                                )}
                            </div>
                        )}

                        {(course.day || course.room || course.schedules?.length > 0) && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                                {course.schedules?.length > 0 ? (
                                    <div className="space-y-1">
                                        {course.schedules.map((schedule, scheduleIndex) => (
                                            <div key={scheduleIndex} className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">{schedule.day}</span>
                                                <span>Tiết: {schedule.timeSlots}</span>
                                                {schedule.room && schedule.room !== "------" && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {schedule.room}
                                                    </span>
                                                )}
                                                {schedule.campus && <span>CS{schedule.campus}</span>}
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

                    {course.canDelete && !course.isLocked && deleteResult?.type !== "success" && (
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
                                        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Xác nhận"}
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
