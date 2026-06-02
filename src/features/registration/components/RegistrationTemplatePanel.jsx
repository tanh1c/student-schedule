import React, { useState } from "react";
import { AlertTriangle, CalendarClock, Info, Loader2, Play, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findTemplateScheduleConflicts, templateChoiceHasConflict } from "@/features/registration/utils/scheduleConflicts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export default function RegistrationTemplatePanel({
    template,
    loading,
    saving,
    running,
    error,
    runResult,
    period,
    defaultRunAt,
    scheduledJobs = [],
    loadingScheduledJobs,
    schedulingJob,
    autoSchedulerEnabled,
    onRun,
    onDelete,
    onDeleteCourse,
    onCreateScheduledJob,
    onDeleteScheduledJob,
    onRunDueScheduledJobs
}) {
    const courses = template?.courses || [];
    const runLog = runResult?.runLog || [];
    const [customRunAt, setCustomRunAt] = useState("");
    const [retryCount, setRetryCount] = useState(3);
    const [retryDelaySeconds, setRetryDelaySeconds] = useState(10);
    const runAt = customRunAt || defaultRunAt || "";
    const scheduleConflicts = findTemplateScheduleConflicts(template);
    const hasScheduleConflicts = scheduleConflicts.length > 0;
    const exceedsOptionALimit = !autoSchedulerEnabled && courses.length > 10;

    const canSchedule = template?.id && courses.length > 0 && runAt && onCreateScheduledJob && !hasScheduleConflicts;

    return (
        <div className="rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-4 shadow-sm dark:border-cyan-900/50 dark:from-cyan-950/20 dark:via-sky-950/15 dark:to-blue-950/20">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-cyan-800 dark:text-cyan-300">Mẫu đăng ký</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-6 w-6 rounded-full p-0 text-cyan-700 dark:text-cyan-300">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Option A hoạt động như thế nào?</DialogTitle>
                                    <DialogDescription>
                                        Đây là chế độ chạy thủ công từ mẫu đã lưu, dùng session DKMH hiện tại của bạn.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-sm text-foreground/80">
                                    <div className="rounded-xl border bg-muted/40 p-3">
                                        <p className="font-semibold text-foreground">Flow Option A</p>
                                        <ol className="mt-2 list-decimal space-y-1 pl-5">
                                            <li>Bạn mở kỳ đăng ký và đăng nhập DKMH trong app.</li>
                                            <li>Bạn tìm môn, chọn nhóm/lớp rồi bấm “Mẫu” để lưu ưu tiên.</li>
                                            <li>Mẫu được lưu ở backend theo tài khoản, không mất khi refresh/đóng web.</li>
                                            <li>Tới giờ đăng ký, bạn mở app và bấm “Chạy mẫu”.</li>
                                            <li>App gửi từng `NLMHId` theo thứ tự ưu tiên, rồi đọc lại phiếu đăng ký để xác minh.</li>
                                            <li>Nếu một lựa chọn thành công thì dừng môn đó; nếu lỗi thì thử lựa chọn kế tiếp.</li>
                                        </ol>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300">
                                            <p className="font-semibold">Option A hiện tại</p>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                                                <li>Bạn phải mở app lúc chạy.</li>
                                                <li>Phải còn session DKMH hợp lệ.</li>
                                                <li>Không lưu mật khẩu/cookie dài hạn.</li>
                                                <li>An toàn hơn và dễ kiểm tra log.</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                                            <p className="font-semibold">Option B sau này</p>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                                                <li>Backend tự chạy đúng giờ.</li>
                                                <li>Cần scheduler/job log/retry.</li>
                                                <li>Cần chiến lược giữ hoặc tạo lại session DKMH.</li>
                                                <li>Rủi ro bảo mật cao hơn nên chưa bật trong bản này.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
                                        Với D1, nếu trường trả `NOTICE`, app hiển thị là nháp/tham khảo, không coi là đăng ký thật. Với D2, app xác minh bằng `getKetQuaDangKy.action` sau mỗi lần thử.
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <p className="text-xs text-cyan-700/70 dark:text-cyan-400/70">
                        Lưu lớp ưu tiên để tới giờ mở đăng ký bấm chạy nhanh trong session hiện tại.
                    </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    {autoSchedulerEnabled && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
                                    disabled={loading || courses.length === 0 || !template?.id}
                                >
                                    <CalendarClock className="mr-1 h-3 w-3" />
                                    Lên lịch tự chạy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Option B — tự chạy mẫu đúng giờ</DialogTitle>
                                    <DialogDescription>
                                        Backend sẽ lưu cookie DKMH đã mã hóa và tự chạy mẫu theo thời gian bạn chọn.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-sm">
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                                        Đây là best-effort trên Render/UptimeRobot: nếu server restart hoặc session DKMH hết hạn thì job sẽ thất bại và hiện log. App không lưu mật khẩu và không tự đăng nhập lại.
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="space-y-1 text-xs font-medium text-foreground/80">
                                            Thời điểm chạy
                                            <input
                                                type="datetime-local"
                                                value={runAt}
                                                onChange={(event) => setCustomRunAt(event.target.value)}
                                                className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-normal"
                                            />
                                        </label>
                                        <div className="space-y-1 text-xs font-medium text-foreground/80">
                                            Chọn nhanh
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 w-full justify-start text-xs"
                                                disabled={!defaultRunAt}
                                                onClick={() => setCustomRunAt("")}
                                            >
                                                Giờ mở đăng ký {period?.code ? `• ${period.code}` : ""}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="space-y-1 text-xs font-medium text-foreground/80">
                                            Số lần retry
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                value={retryCount}
                                                onChange={(event) => setRetryCount(event.target.value)}
                                                className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-normal"
                                            />
                                        </label>
                                        <label className="space-y-1 text-xs font-medium text-foreground/80">
                                            Cách nhau bao nhiêu giây
                                            <input
                                                type="number"
                                                min="5"
                                                max="60"
                                                value={retryDelaySeconds}
                                                onChange={(event) => setRetryDelaySeconds(event.target.value)}
                                                className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-normal"
                                            />
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            className="bg-amber-600 hover:bg-amber-700"
                                            disabled={!canSchedule || schedulingJob}
                                            onClick={() => onCreateScheduledJob({ runAt, retryCount, retryDelaySeconds })}
                                        >
                                            {schedulingJob ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-1 h-4 w-4" />}
                                            Lưu lịch tự chạy
                                        </Button>
                                        <Button variant="outline" disabled={schedulingJob || !onRunDueScheduledJobs} onClick={onRunDueScheduledJobs}>
                                            Chạy job đến hạn
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button
                        size="sm"
                        className="h-8 bg-cyan-600 hover:bg-cyan-700"
                        disabled={running || loading || courses.length === 0 || !template?.id || hasScheduleConflicts || exceedsOptionALimit}
                        onClick={onRun}
                    >
                        {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
                        Chạy mẫu
                    </Button>
                    {template?.id && (
                        <Button size="sm" variant="outline" className="h-8" disabled={running || saving} onClick={onDelete}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {loading && (
                <p className="mt-3 flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-300">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang tải mẫu đăng ký...
                </p>
            )}

            {saving && (
                <p className="mt-3 flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-300">
                    <Save className="h-3 w-3" /> Đang lưu mẫu...
                </p>
            )}

            {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}

            {exceedsOptionALimit && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" /> Option A chỉ cho chạy tối đa 10 môn
                    </div>
                    <p className="mt-1">
                        Mẫu hiện có {courses.length} môn. Giới hạn này giúp tránh lạm dụng đăng ký nhanh hàng loạt khi chưa bật chế độ nâng cao.
                    </p>
                </div>
            )}

            {hasScheduleConflicts && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" /> Mẫu đang trùng lịch học
                    </div>
                    <div className="mt-2 space-y-1">
                        {scheduleConflicts.map((conflict, index) => (
                            <div key={index}>
                                {conflict.first.courseCode} {conflict.first.groupCode} trùng {conflict.second.courseCode} {conflict.second.groupCode}
                                {conflict.day ? ` • ${conflict.day}` : ""}{conflict.timeSlots ? ` • tiết ${conflict.timeSlots}` : ""}
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-red-600/80 dark:text-red-300/80">
                        Đổi ưu tiên hoặc xóa một lớp bị trùng trước khi chạy/lên lịch tự chạy.
                    </p>
                </div>
            )}

            {!loading && courses.length === 0 && (
                <p className="mt-3 rounded-xl border border-dashed border-cyan-200 bg-white/50 p-3 text-xs text-cyan-700 dark:border-cyan-900 dark:bg-slate-950/20 dark:text-cyan-300">
                    Chưa có lớp nào trong mẫu. Tìm môn rồi bấm “Thêm vào mẫu” ở nhóm lớp mong muốn.
                </p>
            )}

            {courses.length > 0 && (
                <div className="mt-3 space-y-2">
                    {courses.map((course) => (
                        <div key={course.code || course.monHocId} className="rounded-xl bg-white/70 p-3 text-xs dark:bg-slate-950/30">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-cyan-900 dark:text-cyan-200">
                                    {course.code} {course.name ? `• ${course.name}` : ""}
                                </div>
                                {onDeleteCourse && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                        disabled={saving || running || schedulingJob}
                                        onClick={() => onDeleteCourse(course)}
                                        title="Xóa môn khỏi mẫu"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {(course.priority || []).map((item, index) => {
                                    const hasConflict = index === 0 && templateChoiceHasConflict(scheduleConflicts, course, item);
                                    return (
                                        <span
                                            key={`${item.nlmhId || item.groupCode}-${index}`}
                                            className={hasConflict
                                                ? "rounded-full bg-red-100 px-2 py-0.5 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900"
                                                : "rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"}
                                        >
                                            #{index + 1} {item.groupCode || item.ltGroup || "Nhóm"} • {item.nlmhId || "thiếu ID"}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {autoSchedulerEnabled && scheduledJobs.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-amber-900 dark:text-amber-200">Lịch tự chạy Option B</div>
                        {loadingScheduledJobs && <Loader2 className="h-3 w-3 animate-spin text-amber-700" />}
                    </div>
                    <div className="mt-2 space-y-2">
                        {scheduledJobs.map((job) => (
                            <div key={job.id} className="rounded-lg bg-white/70 p-2 dark:bg-slate-950/30">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium text-amber-900 dark:text-amber-200">
                                        {new Date(job.runAt).toLocaleString("vi-VN")} • {job.status}
                                    </span>
                                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={schedulingJob} onClick={() => onDeleteScheduledJob?.(job.id)}>
                                        Xóa
                                    </Button>
                                </div>
                                <div className="mt-1 text-amber-800/80 dark:text-amber-300/80">
                                    Retry {job.retryCount ?? 0} lần, mỗi {job.retryDelaySeconds ?? 10}s
                                    {job.summary && ` • ${job.summary.success || 0} thành công, ${job.summary.draft || 0} nháp, ${job.summary.failed || 0} thất bại`}
                                </div>
                                {job.lastError && <div className="mt-1 text-red-600 dark:text-red-400">{job.lastError}</div>}
                                {(job.runLog || []).slice(0, 3).map((entry, index) => (
                                    <div key={index} className={entry.status === "success" ? "mt-1 text-green-700" : entry.status === "draft" ? "mt-1 text-amber-700" : "mt-1 text-red-700"}>
                                        {entry.courseCode} {entry.groupCode ? `• ${entry.groupCode}` : ""} • {entry.status}: {entry.message}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {runResult?.summary && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs dark:bg-slate-950/30">
                    <div className="font-semibold text-cyan-900 dark:text-cyan-200">
                        Kết quả: {runResult.summary.success} thành công, {runResult.summary.draft} nháp, {runResult.summary.failed} thất bại
                    </div>
                    <div className="mt-2 space-y-1">
                        {runLog.map((entry, index) => (
                            <div key={index} className={entry.status === "success" ? "text-green-700" : entry.status === "draft" ? "text-amber-700" : "text-red-700"}>
                                {entry.courseCode} {entry.groupCode ? `• ${entry.groupCode}` : ""} • {entry.status}: {entry.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
