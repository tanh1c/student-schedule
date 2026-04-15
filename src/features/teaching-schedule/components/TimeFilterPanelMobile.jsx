import React from "react";
import { Clock, RefreshCcw, Sparkles } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { allTietOptions, campusOptions, dayOrder, dayShortNames, dayNames, tietTimeMap } from "../constants/searchConfig";
import { cn } from "@lib/utils";

export default function TimeFilterPanelMobile({
  selectedDay,
  onSelectDay,
  selectedTiet,
  onToggleTiet,
  selectedCampus,
  onSelectCampus,
  strictTietFilter,
  onStrictTietFilterChange,
  selectedTietSummary,
  onReset,
  onSearch,
  loading,
}) {
  return (
    <div className="sm:hidden">
      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Tìm theo thời gian</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn nhanh ngày, tiết và cơ sở.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            onClick={onReset}
          >
            <RefreshCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Ngày</div>
            <div className="mt-1 text-xs font-medium text-foreground">
              {selectedDay !== null ? dayShortNames[selectedDay] : "--"}
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiết</div>
            <div className="mt-1 text-xs font-medium text-foreground">
              {selectedTiet.length > 0 ? selectedTiet.length : "Tất cả"}
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Cơ sở</div>
            <div className="mt-1 truncate text-xs font-medium text-foreground">
              {selectedCampus || "Tất cả"}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ngày trong tuần
            </label>
            <div className="grid grid-cols-4 gap-2">
              {dayOrder.map((day) => (
                <button
                  key={day}
                  onClick={() => onSelectDay(day)}
                  title={dayNames[day]}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
                    selectedDay === day
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {dayShortNames[day]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cơ sở
            </label>
            <div className="grid grid-cols-3 gap-2">
              {campusOptions.map((campus) => (
                <button
                  key={campus.value}
                  onClick={() => onSelectCampus(campus.value)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all",
                    selectedCampus === campus.value
                      ? "border-primary bg-primary/8 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
                  )}
                >
                  {campus.value === "" ? "Tất cả" : campus.value === "1" ? "CS1" : "CS2"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chọn tiết
              </label>
              {selectedTiet.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {selectedTietSummary}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {allTietOptions.map((tiet) => (
                <button
                  key={tiet}
                  onClick={() => onToggleTiet(tiet)}
                  title={`${tietTimeMap[tiet].start} - ${tietTimeMap[tiet].end}`}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                    selectedTiet.includes(tiet)
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="font-bold">{tiet}</div>
                  <div className="mt-0.5 text-[10px] opacity-80">{tietTimeMap[tiet].start}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onStrictTietFilterChange(false)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                !strictTietFilter
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
              )}
            >
              Có overlap
            </button>
            <button
              onClick={() => onStrictTietFilterChange(true)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                strictTietFilter
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
              )}
            >
              Trong range
            </button>
          </div>

          <Button
            onClick={onSearch}
            disabled={loading || selectedDay === null}
            className="h-11 w-full"
          >
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Tìm lớp học
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
