import React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deadlineFilterTabs,
  deadlineMonthOptions,
} from "@/features/deadlines/constants/filters";

export default function DeadlinesToolbar({
  activeFilter,
  showPast,
  monthRange,
  isLoading,
  onFilterChange,
  onToggleShowPast,
  onMonthRangeChange,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1 sm:gap-1.5">
        {deadlineFilterTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeFilter === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(tab.id)}
            className={`h-8 gap-1 text-xs sm:text-sm ${
              activeFilter === tab.id
                ? "border-0 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-200/50 hover:from-rose-600 hover:to-red-700 dark:shadow-rose-900/30"
                : ""
            }`}
          >
            <tab.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}

        <Button
          variant={showPast ? "default" : "outline"}
          size="sm"
          onClick={onToggleShowPast}
          className={`h-8 gap-1 text-xs sm:text-sm ${
            showPast
              ? "border-0 bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
              : ""
          }`}
        >
          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Đã qua</span>
        </Button>
      </div>

      <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <Calendar className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
        {deadlineMonthOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onMonthRangeChange(option.value)}
            disabled={isLoading}
            className={`px-2 py-1.5 text-[10px] font-semibold transition-all sm:text-xs ${
              monthRange === option.value
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-750"
            } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
