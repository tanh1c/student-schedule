import React, { useMemo } from "react";
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CalendarClock,
    Clock,
    ExternalLink,
    FileText,
    Timer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function ComponentIcon({ component, className = "w-4 h-4" }) {
    switch (component) {
        case "mod_quiz":
            return <Timer className={className} />;
        case "mod_assign":
            return <FileText className={className} />;
        case "mod_forum":
            return <BookOpen className={className} />;
        default:
            return <CalendarClock className={className} />;
    }
}

function getComponentLabel(component) {
    switch (component) {
        case "mod_quiz":
            return "Quiz";
        case "mod_assign":
            return "Assignment";
        case "mod_forum":
            return "Forum";
        default:
            return "Sự kiện";
    }
}

function getEventTypeLabel(eventType) {
    switch (eventType) {
        case "close":
            return "Đóng";
        case "due":
            return "Hạn nộp";
        case "open":
            return "Mở";
        default:
            return eventType;
    }
}

export default function DeadlineEventCard({ event, type = "deadline", nowSeconds }) {
    const isDeadline = type === "deadline";

    const getCardStyle = () => {
        if (isDeadline) {
            return "from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/30 dark:via-red-950/25 dark:to-orange-950/30 border-rose-200/60 dark:border-rose-800/50";
        }
        return "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/25 dark:to-teal-950/30 border-emerald-200/60 dark:border-emerald-800/50";
    };

    const getIconBgStyle = () => {
        if (isDeadline) return "from-rose-400 to-red-500 dark:from-rose-600 dark:to-red-700";
        return "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700";
    };

    const getBadgeStyle = () => {
        switch (event.component) {
            case "mod_quiz":
                return "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700";
            case "mod_assign":
                return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
            case "mod_forum":
                return "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        } catch {
            return dateString;
        }
    };

    const isUrgent = useMemo(() => {
        if (!isDeadline || !event.dayTimestamp) return false;
        const diffDays = (event.dayTimestamp - nowSeconds) / (60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 3;
    }, [event.dayTimestamp, isDeadline, nowSeconds]);

    const isPast = useMemo(() => {
        if (!event.dayTimestamp) return false;
        return event.dayTimestamp < nowSeconds;
    }, [event.dayTimestamp, nowSeconds]);

    const timeInfo = useMemo(() => {
        if (!event.dayTimestamp) return null;
        const diff = event.dayTimestamp - nowSeconds;

        if (diff < 0) {
            const absDiff = Math.abs(diff);
            const days = Math.floor(absDiff / (60 * 60 * 24));
            const hours = Math.floor((absDiff % (60 * 60 * 24)) / (60 * 60));
            if (days > 30) return { text: `${Math.floor(days / 30)} tháng trước`, isPast: true, urgency: "past" };
            if (days > 0) return { text: `${days} ngày ${hours} giờ trước`, isPast: true, urgency: "past" };
            if (hours > 0) return { text: `${hours} giờ trước`, isPast: true, urgency: "past" };
            return { text: "Vừa qua", isPast: true, urgency: "past" };
        }

        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);

        let urgency = "normal";
        if (days <= 1) urgency = "critical";
        else if (days <= 3) urgency = "warning";

        if (days > 30) {
            const months = Math.floor(days / 30);
            const remainDays = days % 30;
            return {
                text: remainDays > 0 ? `${months} tháng ${remainDays} ngày` : `${months} tháng`,
                isPast: false,
                urgency
            };
        }
        if (days > 0) return { text: `${days} ngày ${hours} giờ ${minutes} phút`, isPast: false, urgency };
        if (hours > 0) return { text: `${hours} giờ ${minutes} phút`, isPast: false, urgency };
        if (minutes > 0) return { text: `${minutes} phút`, isPast: false, urgency: "critical" };
        return { text: "Sắp hết hạn!", isPast: false, urgency: "critical" };
    }, [event.dayTimestamp, nowSeconds]);

    const getCountdownStyle = () => {
        if (!timeInfo) return "";
        if (timeInfo.isPast) return "bg-slate-200/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400";
        switch (timeInfo.urgency) {
            case "critical":
                return "bg-rose-200/80 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 font-semibold";
            case "warning":
                return "bg-amber-200/80 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 font-semibold";
            default:
                return "bg-emerald-200/80 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300";
        }
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br transition-all duration-200 border text-left min-w-0
            ${getCardStyle()}
            hover:shadow-md hover:scale-[1.005] active:scale-[0.995]
            ${isPast ? "opacity-60" : ""}
        `}>
            {isUrgent && !isPast && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-rose-500 border-l-[28px] border-l-transparent">
                    <AlertTriangle className="absolute -top-[25px] right-[1px] w-3.5 h-3.5 text-white" />
                </div>
            )}

            <div className="absolute -top-8 -right-8 h-24 w-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-2.5 sm:p-4 flex items-start gap-2 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0 mt-0.5 ${getIconBgStyle()}`}>
                    <ComponentIcon component={event.component} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-wrap">
                            <Badge className={`text-[9px] sm:text-[10px] px-1.5 py-0 border ${getBadgeStyle()}`}>
                                {getComponentLabel(event.component)}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] sm:text-[10px] px-1.5 py-0 ${isDeadline
                                ? "text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700"
                                : "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                                }`}>
                                {getEventTypeLabel(event.eventType)}
                            </Badge>
                            {isPast && (
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 text-slate-500 border-slate-300 dark:border-slate-700">
                                    Đã qua
                                </Badge>
                            )}
                            {isUrgent && !isPast && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                        </div>
                        {event.url && (
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${isDeadline
                                    ? "hover:bg-rose-200/50 dark:hover:bg-rose-800/30 text-rose-500 dark:text-rose-400"
                                    : "hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30 text-emerald-500 dark:text-emerald-400"
                                    }`}
                                title="Mở trên LMS"
                                onClick={(currentEvent) => currentEvent.stopPropagation()}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>

                    <p className={`text-sm sm:text-base font-semibold leading-snug mb-1.5 ${isDeadline
                        ? "text-rose-900 dark:text-rose-100"
                        : "text-emerald-900 dark:text-emerald-100"
                        }`}>
                        {event.name || event.title || "Không có tên"}
                    </p>

                    {event.courseName && (
                        <p className={`text-[11px] sm:text-xs leading-snug mb-1.5 flex items-start gap-1 ${isDeadline ? "text-rose-700/70 dark:text-rose-300/70" : "text-emerald-700/70 dark:text-emerald-300/70"}`}>
                            <BookOpen className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{event.courseName}</span>
                        </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] sm:text-xs flex items-center gap-1 ${isDeadline ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                        </span>

                        {timeInfo && (
                            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getCountdownStyle()}`}>
                                <Clock className="w-3 h-3" />
                                {timeInfo.isPast ? timeInfo.text : `còn ${timeInfo.text}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
