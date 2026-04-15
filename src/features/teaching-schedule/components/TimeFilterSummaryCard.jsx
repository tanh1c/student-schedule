import React from "react";
import { Building2, Calendar, Clock, GraduationCap, RefreshCcw } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";

export default function TimeFilterSummaryCard({
  selectedDay,
  dayNames,
  selectedTiet,
  selectedTietSummary,
  selectedCampusMeta,
  strictTietFilter,
  onReset,
}) {
  return (
    <div className="hidden w-full min-w-0 rounded-2xl border bg-muted/20 p-3 sm:block sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
              <GraduationCap className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Duyệt lớp đang giảng dạy theo thời gian
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Chọn ngày, khung tiết và cơ sở để tìm nhanh lớp học đang diễn ra hoặc sắp diễn ra trong khuôn viên trường.
              </p>
            </div>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-1">
              <Badge variant={selectedDay !== null ? "default" : "secondary"} className="gap-1">
                <Calendar className="h-3 w-3" />
                {selectedDay !== null ? dayNames[selectedDay] : "Chưa chọn ngày"}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {selectedTietSummary}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {selectedCampusMeta.label}
              </Badge>
              {selectedTiet.length > 0 && (
                <Badge variant="outline">
                  {strictTietFilter ? "Chỉ trong range" : "Có overlap"}
                </Badge>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="justify-start xl:justify-center"
          onClick={onReset}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
