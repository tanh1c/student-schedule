import React from "react";

export default function MessagesStatsCard({ icon: IconComponent, title, value, color, subtitle }) {
    const colorSchemes = {
        blue: {
            gradient: "from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/30 dark:via-indigo-950/25 dark:to-sky-950/30",
            border: "border-blue-200/60 dark:border-blue-800/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            text: "text-blue-700 dark:text-blue-400",
            value: "text-blue-900 dark:text-blue-200"
        },
        violet: {
            gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/25 dark:to-fuchsia-950/30",
            border: "border-violet-200/60 dark:border-violet-800/50",
            iconBg: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
            iconShadow: "shadow-violet-200/50 dark:shadow-violet-950/40",
            text: "text-violet-700 dark:text-violet-400",
            value: "text-violet-900 dark:text-violet-200"
        },
        emerald: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/25 dark:to-teal-950/30",
            border: "border-emerald-200/60 dark:border-emerald-800/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            text: "text-emerald-700 dark:text-emerald-400",
            value: "text-emerald-900 dark:text-emerald-200"
        },
        amber: {
            gradient: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/25 dark:to-yellow-950/30",
            border: "border-amber-200/60 dark:border-amber-800/50",
            iconBg: "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700",
            iconShadow: "shadow-amber-200/50 dark:shadow-amber-950/40",
            text: "text-amber-700 dark:text-amber-400",
            value: "text-amber-900 dark:text-amber-200"
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;
    const iconNode = React.createElement(IconComponent, {
        className: "h-3 w-3 sm:h-5 sm:w-5 text-white"
    });

    return (
        <div className={`relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-1.5 sm:p-4 shadow-sm w-full min-w-0`}>
            <div className="absolute -top-6 -right-6 h-16 w-16 bg-white/30 dark:bg-white/5 rounded-full blur-xl" />
            <div className="relative flex items-center gap-1 sm:gap-3">
                <div className={`h-7 w-7 sm:h-10 sm:w-10 rounded-md sm:rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg ${scheme.iconShadow} shrink-0`}>
                    {iconNode}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-base sm:text-2xl font-black ${scheme.value}`}>{value}</p>
                    <p className={`text-[8px] sm:text-xs font-medium ${scheme.text} truncate leading-tight`}>{title}</p>
                    {subtitle && (
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
