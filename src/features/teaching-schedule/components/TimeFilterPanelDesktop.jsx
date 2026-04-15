import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import { campusOptions, dayNames, dayOrder, tietGroups, tietTimeMap } from "../constants/searchConfig";
import { cn } from "@lib/utils";

export default function TimeFilterPanelDesktop({
  selectedDay,
  onSelectDay,
  selectedTiet,
  onToggleTiet,
  selectedCampus,
  onSelectCampus,
  strictTietFilter,
  onStrictTietFilterChange,
  selectedTietSummary,
  selectedTietRange,
  onSetSelectedTiet,
  onSearch,
  loading,
  selectedCampusMeta,
}) {
  return (
    <>
      <div className="hidden w-full min-w-0 gap-3 sm:grid sm:gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">Bước 1. Chọn ngày và cơ sở</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ngày là bắt buộc. Cơ sở là tuỳ chọn nếu bạn muốn thu hẹp kết quả theo khu vực học.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Ngày trong tuần</label>
              <ScrollArea className="hidden w-full whitespace-nowrap sm:block">
                <div className="flex gap-2 pb-1">
                  {dayOrder.map((day) => (
                    <button
                      key={day}
                      onClick={() => onSelectDay(day)}
                      title={dayNames[day]}
                      className={cn(
                        "min-w-[68px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-all sm:min-w-[78px] sm:px-4",
                        selectedDay === day
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span>{dayNames[day]}</span>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Cơ sở</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {campusOptions.map((campus) => (
                  <button
                    key={campus.value}
                    onClick={() => onSelectCampus(campus.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      selectedCampus === campus.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/30 hover:bg-accent/40"
                    )}
                  >
                    <div className="text-sm font-medium text-foreground">{campus.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{campus.helper}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Bước 2. Chọn khung tiết</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Có thể bỏ trống để xem toàn bộ lớp trong ngày, hoặc chọn nhiều tiết để thu hẹp phạm vi.
              </p>
            </div>
            {selectedTiet.length > 0 && <Badge variant="secondary">{selectedTiet.length} tiết</Badge>}
          </div>

          <div className="space-y-3">
            {tietGroups.map((group) => {
              const allGroupSelected = group.tiets.every((tiet) => selectedTiet.includes(tiet));

              return (
                <div key={group.label} className="rounded-xl border bg-muted/15 p-2.5 sm:p-3">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{group.label}</div>
                      <div className="text-xs text-muted-foreground">{group.timeRange}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start sm:justify-center"
                      onClick={() => {
                        if (allGroupSelected) {
                          onSetSelectedTiet((previousTiet) =>
                            previousTiet.filter((tiet) => !group.tiets.includes(tiet))
                          );
                          return;
                        }

                        onSetSelectedTiet((previousTiet) =>
                          [...new Set([...previousTiet, ...group.tiets])].sort((a, b) => a - b)
                        );
                      }}
                    >
                      {allGroupSelected ? "Bỏ chọn buổi" : "Chọn cả buổi"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:overflow-visible sm:pb-0">
                    {group.tiets.map((tiet) => (
                      <button
                        key={tiet}
                        onClick={() => onToggleTiet(tiet)}
                        title={`${tietTimeMap[tiet].start} - ${tietTimeMap[tiet].end}`}
                        className={cn(
                          "min-w-0 rounded-xl border px-2 py-2 text-xs font-medium transition-all sm:min-w-[64px] sm:shrink-0",
                          selectedTiet.includes(tiet)
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <div className="font-bold">Tiết {tiet}</div>
                        <div className="mt-0.5 text-[10px] opacity-80">{tietTimeMap[tiet].start}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border bg-primary/5 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Chế độ lọc khung tiết</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedTiet.length > 0
                    ? `${selectedTietSummary} • ${selectedTietRange}`
                    : "Chưa chọn tiết, hệ thống sẽ lấy toàn bộ lớp trong ngày."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-background p-1 sm:flex sm:gap-1">
                <button
                  onClick={() => onStrictTietFilterChange(false)}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    !strictTietFilter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  Có overlap
                </button>
                <button
                  onClick={() => onStrictTietFilterChange(true)}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    strictTietFilter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  Chỉ trong range
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              VD nếu chọn tiết 7-9: chế độ "Có overlap" vẫn giữ lớp 7-11, còn "Chỉ trong range" thì chỉ lấy lớp nằm hoàn toàn trong 7-9.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-3 rounded-2xl border bg-background p-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Sẵn sàng tìm lớp học</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedDay === null
              ? "Hãy chọn ít nhất một ngày để bắt đầu duyệt lịch giảng dạy."
              : `Bạn đang duyệt ${dayNames[selectedDay]} • ${selectedTietSummary} • ${selectedCampusMeta.label}.`}
          </p>
        </div>
        <Button
          onClick={onSearch}
          disabled={loading || selectedDay === null}
          className="h-11 w-full sm:min-w-[180px] sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Tìm lớp học
            </>
          )}
        </Button>
      </div>
    </>
  );
}
