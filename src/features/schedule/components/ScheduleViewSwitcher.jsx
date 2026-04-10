import React from "react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { SCHEDULE_VIEW_MODES } from "../constants/scheduleConfig";

export default function ScheduleViewSwitcher({
  scheduleViewMode,
  onViewModeChange,
  className,
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-nowrap items-center justify-center gap-1 rounded-2xl border bg-card/80 p-1.5 shadow-sm backdrop-blur",
        className
      )}
    >
      {SCHEDULE_VIEW_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = scheduleViewMode === mode.id;

        return (
          <Button
            key={mode.id}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange(mode.id)}
            className={cn(
              "h-9 shrink-0 gap-1.5 rounded-xl px-2.5 lg:px-3",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{mode.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
