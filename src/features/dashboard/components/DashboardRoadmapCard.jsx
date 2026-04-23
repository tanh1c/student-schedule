import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@lib/utils";
import { DashboardCard } from "@/features/dashboard/components/DashboardShared";
import { navigateToTab } from "@/features/dashboard/components/DashboardHelpers";

function getRoadmapProgress(snapshot) {
  const totalSemesters = Math.max(snapshot.roadmap.semesterCount || 0, 1);
  const semesterProgress = Math.min(100, Math.round((snapshot.roadmap.semesterCount / 8) * 100));
  const courseProgress = Math.min(100, Math.round((snapshot.roadmap.totalCourses / 45) * 100));
  const creditProgress = Math.min(100, Math.round((snapshot.roadmap.totalCredits / 140) * 100));
  const gpaProgress = snapshot.roadmap.goal ? Math.min(100, Math.round((snapshot.roadmap.goal.gpa4 / 4) * 100)) : 0;

  return [
    { label: "Kế hoạch học kỳ", value: semesterProgress, tone: "bg-emerald-500" },
    { label: "Môn đã lên", value: courseProgress, tone: "bg-sky-500" },
    { label: "Tín chỉ", value: creditProgress, tone: "bg-amber-500" },
    { label: "Mục tiêu GPA", value: gpaProgress, tone: "bg-violet-500" },
  ].slice(0, totalSemesters > 0 ? 4 : 0);
}

export function DashboardRoadmapCard({ snapshot, compact = false }) {
  const progressItems = getRoadmapProgress(snapshot);

  return (
    <DashboardCard title="Roadmap học tập" className="h-full" contentClassName="h-full">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {snapshot.roadmap.goal?.semesterName || "Kế hoạch học kỳ hiện tại"}
      </p>

      <div className={compact ? "mt-4 flex-1 space-y-3" : "mt-5 flex-1 space-y-4"}>
        {progressItems.slice(0, compact ? 3 : progressItems.length).map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={cn("h-2 rounded-full", item.tone)} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={compact ? "mt-3 pt-3" : "mt-4 pt-4"}>
        <button
          type="button"
          onClick={() => navigateToTab("roadmap")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Xem roadmap
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardCard>
  );
}
