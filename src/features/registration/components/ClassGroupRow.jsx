import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import mybkApi from "@/services/mybkApi";

export default function ClassGroupRow({ group, periodId, forceMode = false }) {
    const availableSlots = group.capacity - group.registered;
    const isFull = availableSlots <= 0;
    const [showSchedule, setShowSchedule] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [registerResult, setRegisterResult] = useState(null);

    const handleRegister = async (event) => {
        event.stopPropagation();
        if (!group.nlmhId || registering) return;

        setRegistering(true);
        setRegisterResult(null);

        if (forceMode) {
            console.log("🔓 Force Mode registration for NLMHId:", group.nlmhId);
        }

        try {
            const result = await mybkApi.registerCourse(periodId, group.nlmhId, group.monHocId, forceMode);

            if (result.success) {
                setRegisterResult({
                    type: "success",
                    message: forceMode
                        ? "🔓 Force ĐK thành công! (bypass validation)"
                        : (result.message || "Đã gửi đăng ký!")
                });
            } else {
                setRegisterResult({ type: "error", message: result.error || "Đăng ký thất bại" });
            }
        } catch (error) {
            setRegisterResult({ type: "error", message: error.message });
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className={`rounded-lg border-2 overflow-hidden ${isFull ? "bg-gray-50 dark:bg-gray-800/50 opacity-70 border-gray-200 dark:border-gray-700" : "bg-white dark:bg-card border-blue-100 dark:border-blue-900/40"}`}>
            {registerResult && (
                <div className={`p-2 text-xs font-medium flex items-center gap-2 ${registerResult.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {registerResult.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {registerResult.message}
                </div>
            )}

            <div
                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 ${isFull ? "" : "bg-blue-50/30 dark:bg-blue-900/10"}`}
                onClick={() => setShowSchedule(!showSchedule)}
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isFull ? "secondary" : "default"} className="text-xs font-bold">
                        {group.groupCode}
                    </Badge>
                    <span className={`text-xs font-medium ${isFull ? "text-red-500" : "text-green-600"}`}>
                        {group.registered}/{group.capacity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({group.language === "V" ? "Việt" : group.language === "E" ? "Anh" : group.language})
                    </span>
                    {group.lecturer && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            • GV: {group.lecturer}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {((group.canRegister && !isFull) || forceMode) && registerResult?.type !== "success" ? (
                        <Button
                            size="sm"
                            className={`h-6 text-xs ${forceMode ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}`}
                            onClick={handleRegister}
                            disabled={registering}
                        >
                            {registering ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            {forceMode && !registering && <span className="mr-1">🔓</span>}
                            {registering ? "Đang ĐK..." : (forceMode ? "Force ĐK" : "Đăng ký")}
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {isFull ? "Đã đầy" : ""}
                        </span>
                    )}
                    {showSchedule ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {showSchedule && group.schedules && group.schedules.length > 0 && (
                <div className="border-t bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="grid grid-cols-5 gap-1 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                        <span>Thứ</span>
                        <span>Tiết</span>
                        <span>Phòng</span>
                        <span>CS</span>
                        <span>Tuần học</span>
                    </div>
                    {group.schedules.map((schedule, index) => (
                        <div key={index} className="grid grid-cols-5 gap-1 px-2 py-1.5 text-xs border-b last:border-b-0">
                            <span className="font-medium">{schedule.day}</span>
                            <span className="text-primary">{schedule.timeSlots}</span>
                            <span>{schedule.room}</span>
                            <span>{schedule.campus}</span>
                            <span className="text-muted-foreground text-[10px] truncate" title={schedule.weeks}>
                                {schedule.weeks}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {showSchedule && (!group.schedules || group.schedules.length === 0) && (
                <div className="border-t p-2 text-xs text-muted-foreground text-center">
                    Chưa có thông tin lịch học
                </div>
            )}
        </div>
    );
}
