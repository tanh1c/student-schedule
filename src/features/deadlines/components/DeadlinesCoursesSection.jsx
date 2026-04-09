import React from "react";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeadlinesCoursesSection({ courses }) {
  if (!courses || Object.keys(courses).length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
      </div>
      <div className="min-w-0 space-y-2 overflow-hidden sm:space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Khoá học có sự kiện
          </span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {Object.keys(courses).length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(courses).map(([id, name]) => (
            <div
              key={id}
              className="relative overflow-hidden truncate rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-2.5 text-xs text-slate-700 dark:border-slate-800/50 dark:from-slate-950/60 dark:via-gray-950/50 dark:to-zinc-950/60 dark:text-slate-300 sm:p-3 sm:text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
