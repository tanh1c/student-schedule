import { Calendar, CheckCircle2, ChevronRight, Clock, FileCheck, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRegistrationStatusBadge } from "@/features/registration/utils/statusBadge";

export default function RegistrationPeriodCard({ period, onClick }) {
    const isOpen = period.status === "open";
    const isUpcoming = period.status === "upcoming";
    const isClosed = period.status === "closed";
    const hasResult = period.hasResult;

    const colorScheme = {
        open: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
            border: "border-emerald-200/60 dark:border-emerald-900/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            decoration1: "bg-emerald-200/30 dark:bg-emerald-900/20",
            decoration2: "bg-green-200/30 dark:bg-green-900/20",
            codeColor: "text-emerald-700 dark:text-emerald-400/90",
            timeColor: "text-emerald-600 dark:text-emerald-500/80",
            arrowBg: "bg-emerald-100 dark:bg-emerald-950/60",
            arrowColor: "text-emerald-600 dark:text-emerald-500"
        },
        upcoming: {
            gradient: "from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20",
            border: "border-blue-200/60 dark:border-blue-900/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            decoration1: "bg-blue-200/30 dark:bg-blue-900/20",
            decoration2: "bg-indigo-200/30 dark:bg-indigo-900/20",
            codeColor: "text-blue-700 dark:text-blue-400/90",
            timeColor: "text-blue-600 dark:text-blue-500/80",
            arrowBg: "bg-blue-100 dark:bg-blue-950/60",
            arrowColor: "text-blue-600 dark:text-blue-500"
        },
        closed: {
            gradient: "from-zinc-50 via-gray-50 to-slate-50 dark:from-zinc-950/20 dark:via-gray-950/15 dark:to-slate-950/20",
            border: "border-zinc-200/60 dark:border-zinc-800/50",
            iconBg: "from-zinc-400 to-gray-500 dark:from-zinc-600 dark:to-gray-700",
            iconShadow: "shadow-zinc-200/50 dark:shadow-zinc-950/40",
            decoration1: "bg-zinc-200/20 dark:bg-zinc-900/15",
            decoration2: "bg-gray-200/20 dark:bg-gray-900/15",
            codeColor: "text-zinc-600 dark:text-zinc-500",
            timeColor: "text-zinc-500 dark:text-zinc-600",
            arrowBg: "bg-zinc-100 dark:bg-zinc-900/60",
            arrowColor: "text-zinc-500 dark:text-zinc-600"
        }
    };

    const colors = isOpen ? colorScheme.open : (isUpcoming ? colorScheme.upcoming : colorScheme.closed);
    const StatusIcon = isOpen ? CheckCircle2 : (isUpcoming ? Clock : Lock);

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                bg-gradient-to-r ${colors.gradient}
                border ${colors.border}
                p-4 sm:p-5 shadow-sm
                transition-all duration-300 cursor-pointer
                hover:shadow-lg hover:scale-[1.01]
                ${isClosed ? "opacity-75" : ""}
            `}
            onClick={onClick}
        >
            <div className={`absolute -top-10 -right-10 h-32 w-32 ${colors.decoration1} rounded-full blur-2xl`} />
            <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${colors.decoration2} rounded-full blur-2xl`} />

            <div className="relative flex items-start gap-4">
                <div className={`flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg ${colors.iconShadow}`}>
                    <StatusIcon className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`font-bold text-base sm:text-lg ${colors.codeColor}`}>
                            {period.code}
                        </span>
                        {getRegistrationStatusBadge(period.status)}
                        {hasResult && (
                            <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-none text-[10px] px-2 py-0.5 font-bold">
                                <FileCheck className="h-3 w-3 mr-1" />
                                Có kết quả
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-foreground/80 dark:text-foreground/70 leading-relaxed mb-3 line-clamp-2">
                        {period.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/5 ${colors.timeColor} font-medium`}>
                            <Calendar className="h-3 w-3" />
                            {period.startTime}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/5 ${colors.timeColor} font-medium`}>
                            <Clock className="h-3 w-3" />
                            {period.endTime}
                        </span>
                    </div>
                </div>

                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colors.arrowBg} flex items-center justify-center ${colors.arrowColor} transition-transform group-hover:translate-x-1`}>
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
