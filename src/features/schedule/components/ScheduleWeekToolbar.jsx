import React from "react";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@components/ui/button";

export default function ScheduleWeekToolbar({
  weekLabel,
  selectedWeek,
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onExportCalendar,
}) {
  return (
    <div className="sticky top-[60px] z-20 mb-3 flex w-full min-w-0 items-center justify-between overflow-hidden rounded-lg bg-primary p-1.5 text-primary-foreground shadow-md box-border sm:mb-4 sm:rounded-xl sm:p-3 md:static">
      <div className="flex min-w-0 w-0 flex-1 items-center gap-1 sm:gap-2">
        <CalendarDays className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        <h3 className="truncate text-sm font-bold sm:text-lg md:text-xl">{weekLabel}</h3>
      </div>

      <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white"
          onClick={onPreviousWeek}
          disabled={selectedWeek <= 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-white md:flex"
          onClick={onCurrentWeek}
          disabled={selectedWeek === currentWeek}
        >
          Hiện tại
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white"
          onClick={onNextWeek}
          disabled={selectedWeek >= 50}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="mx-1 hidden h-5 w-px bg-primary-foreground/30 md:block" />

        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-white md:flex"
          onClick={onExportCalendar}
          title="Xuất lịch sang Google Calendar"
        >
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden lg:inline">Google Calendar</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white md:hidden"
          onClick={onExportCalendar}
          title="Xuất lịch"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
