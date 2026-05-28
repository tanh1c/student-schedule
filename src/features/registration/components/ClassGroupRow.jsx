import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import mybkApi from "@/services/mybkApi";

export default function ClassGroupRow({ course, group, periodId, forceMode = false, registrationOpen = true, onAddToTemplate, onRegistrationResult }) {
    const availableSlots = group.capacity - group.registered;
    const isFull = availableSlots <= 0;
    const [showSchedule, setShowSchedule] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [manualNlmhId, setManualNlmhId] = useState("");
    const [registerResult, setRegisterResult] = useState(null);
    const [auditCourse, setAuditCourse] = useState(null);

    const findAuditCourse = (result) => {
        const courses = result.registrationResult?.courses || [];
        return courses.find((registeredCourse) => (
            registeredCourse.code === course?.code && (
                registeredCourse.group === group.groupCode ||
                registeredCourse.groupLT === group.ltGroup ||
                registeredCourse.groupBT === group.btGroup
            )
        ));
    };

    const getEvidenceSummary = (result) => {
        const courses = result.registrationResult?.courses || [];
        if (courses.length === 0) return "Không có môn nào trong phiếu đăng ký sau audit";

        return `Phiếu hiện có: ${courses.map((registeredCourse) => (
            `${registeredCourse.code || "?"}${registeredCourse.group ? `-${registeredCourse.group}` : ""}`
        )).join(", ")}`;
    };

    const handleRegister = async (event, nlmhId = group.nlmhId) => {
        event.stopPropagation();
        const targetNlmhId = String(nlmhId || "").trim();
        if (!targetNlmhId || registering) return;

        setRegistering(true);
        setRegisterResult(null);
        setAuditCourse(null);

        try {
            const result = await mybkApi.registerCourse(periodId, targetNlmhId, group.monHocId || course?.monHocId, forceMode);

            if (result.success) {
                onRegistrationResult?.(result.registrationResult);
                if (forceMode) {
                    const recordedCourse = findAuditCourse(result);
                    setAuditCourse(recordedCourse || null);
                    setRegisterResult({
                        type: recordedCourse ? "success" : "error",
                        message: recordedCourse
                            ? `BE trường đã ghi nhận ${recordedCourse.code}${recordedCourse.group ? ` - ${recordedCourse.group}` : ""}`
                            : `${result.code === "ERROR" ? `Trường từ chối: ${result.message || result.error || "Không rõ lý do"}. ` : ""}${getEvidenceSummary(result)}`
                    });
                } else {
                    setRegisterResult({
                        type: "success",
                        message: result.message || "Đã gửi đăng ký!"
                    });
                }
            } else {
                setRegisterResult({ type: "error", message: result.error || "Đăng ký thất bại" });
            }
        } catch (error) {
            setRegisterResult({ type: "error", message: error.message });
        } finally {
            setRegistering(false);
        }
    };

    const handleAuditCancel = async (event) => {
        event.stopPropagation();
        if (!auditCourse?.ketquaId || cancelling) return;

        setCancelling(true);
        try {
            const result = await mybkApi.cancelCourseRegistration(periodId, auditCourse.ketquaId, auditCourse.code);
            if (result.success) {
                setAuditCourse(null);
                setRegisterResult({ type: "success", message: result.message || "Đã hủy kết quả audit" });
            } else {
                setRegisterResult({ type: "error", message: result.error || "Hủy kết quả audit thất bại" });
            }
        } catch (error) {
            setRegisterResult({ type: "error", message: error.message });
        } finally {
            setCancelling(false);
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

            {auditCourse?.ketquaId && (
                <div className="p-2 text-xs bg-amber-50 text-amber-700 border-b flex flex-wrap items-center gap-2">
                    <span>
                        Mã kết quả: {auditCourse.ketquaId}
                        {auditCourse.code ? ` • ${auditCourse.code}` : ""}
                        {auditCourse.group ? ` • Nhóm ${auditCourse.group}` : ""}
                    </span>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 text-xs px-2"
                        onClick={handleAuditCancel}
                        disabled={cancelling}
                    >
                        {cancelling ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {cancelling ? "Đang hủy..." : "Hủy ngay"}
                    </Button>
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
                    {onAddToTemplate && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={(event) => {
                                event.stopPropagation();
                                onAddToTemplate(course, group, group.nlmhId || manualNlmhId);
                            }}
                            disabled={!group.nlmhId && !manualNlmhId.trim()}
                        >
                            <Save className="mr-1 h-3 w-3" />
                            Mẫu
                        </Button>
                    )}
                    {((group.canRegister && !isFull && registrationOpen) || forceMode) && registerResult?.type !== "success" ? (
                        group.nlmhId ? (
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
                            <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                                <input
                                    value={manualNlmhId}
                                    onChange={(event) => setManualNlmhId(event.target.value.replace(/\D/g, ""))}
                                    placeholder="NLMHId"
                                    className="h-6 w-20 rounded border border-input bg-background px-2 text-xs"
                                />
                                <Button
                                    size="sm"
                                    className="h-6 text-xs bg-purple-600 hover:bg-purple-700 px-2"
                                    onClick={(event) => handleRegister(event, manualNlmhId)}
                                    disabled={registering || !manualNlmhId.trim()}
                                >
                                    {registering ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                    {registering ? "Đang audit..." : "Audit ID"}
                                </Button>
                            </div>
                        )
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {isFull ? "Đã đầy" : (!registrationOpen && group.canRegister ? "Chưa tới giờ ĐK" : "")}
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
