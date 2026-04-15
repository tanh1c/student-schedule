export const COURSE_COLORS = [
    { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-400" },
    { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/50", text: "text-emerald-700 dark:text-emerald-400" },
    { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800/50", text: "text-violet-700 dark:text-violet-400" },
    { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/50", text: "text-rose-700 dark:text-rose-400" },
    { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-400" },
    { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800/50", text: "text-cyan-700 dark:text-cyan-400" },
    { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800/50", text: "text-pink-700 dark:text-pink-400" },
    { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800/50", text: "text-indigo-700 dark:text-indigo-400" },
];

export const STICKY_NOTE_COLORS = [
    {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200/60 dark:border-yellow-700/40",
        shadow: "shadow-yellow-200/50 dark:shadow-yellow-900/30",
        tape: "bg-yellow-300/70 dark:bg-yellow-600/50"
    },
    {
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "border-pink-200/60 dark:border-pink-700/40",
        shadow: "shadow-pink-200/50 dark:shadow-pink-900/30",
        tape: "bg-pink-300/70 dark:bg-pink-600/50"
    },
    {
        bg: "bg-sky-50 dark:bg-sky-900/20",
        border: "border-sky-200/60 dark:border-sky-700/40",
        shadow: "shadow-sky-200/50 dark:shadow-sky-900/30",
        tape: "bg-sky-300/70 dark:bg-sky-600/50"
    },
    {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200/60 dark:border-emerald-700/40",
        shadow: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
        tape: "bg-emerald-300/70 dark:bg-emerald-600/50"
    },
    {
        bg: "bg-violet-50 dark:bg-violet-900/20",
        border: "border-violet-200/60 dark:border-violet-700/40",
        shadow: "shadow-violet-200/50 dark:shadow-violet-900/30",
        tape: "bg-violet-300/70 dark:bg-violet-600/50"
    },
    {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200/60 dark:border-orange-700/40",
        shadow: "shadow-orange-200/50 dark:shadow-orange-900/30",
        tape: "bg-orange-300/70 dark:bg-orange-600/50"
    },
];

export function getStickyNoteStyle(index) {
    return {
        color: STICKY_NOTE_COLORS[index % STICKY_NOTE_COLORS.length]
    };
}

export function getCourseColor(code) {
    if (!code) return COURSE_COLORS[0];
    const hash = code.split("").reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0);
    return COURSE_COLORS[hash % COURSE_COLORS.length];
}
