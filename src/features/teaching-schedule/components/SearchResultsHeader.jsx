import React from "react";
import { Calendar, ListFilter, Search } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { CardDescription, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";

export default function SearchResultsHeader({
  searchTab,
  hasServerResults,
  visibleResultsCount,
  totalResultsCount,
  selectedDay,
  timeResults,
  selectedTiet,
  selectedTietSummary,
  selectedCampus,
  selectedCampusMeta,
  searchResults,
  resultsQuery,
  onResultsQueryChange,
  onClearResultsQuery,
  resultsFilterPlaceholder,
  dayNames,
  isResultsFilterPending,
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Kết quả tìm kiếm
          {hasServerResults && (
            <Badge variant="secondary" className="ml-1">
              {visibleResultsCount}/{totalResultsCount} {searchTab === "time" ? "lớp" : "môn"}
            </Badge>
          )}
        </CardTitle>

        {searchTab === "time" && selectedDay !== null && timeResults.length > 0 && (
          <CardDescription>
            Các lớp học vào {dayNames[selectedDay]}
            {selectedTiet.length > 0 && `, ${selectedTietSummary.toLowerCase()}`}
            {selectedCampus && `, ${selectedCampusMeta.label}`}
          </CardDescription>
        )}

        {searchTab !== "time" && searchResults.length > 0 && (
          <CardDescription>
            Lọc nhanh kết quả hiện tại theo mã môn, tên môn, giảng viên, nhóm học hoặc phòng học.
          </CardDescription>
        )}
      </div>

      {hasServerResults && (
        <div className="w-full min-w-0 lg:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={resultsQuery}
              onChange={(event) => onResultsQueryChange(event.target.value)}
              placeholder={resultsFilterPlaceholder}
              className="h-11 pl-9 pr-20"
            />
            {resultsQuery.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-8 -translate-y-1/2"
                onClick={onClearResultsQuery}
              >
                Xóa
              </Button>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <ListFilter className="h-3.5 w-3.5" />
            <span>Search này chỉ lọc trên kết quả đã tải, không gọi lại server.</span>
            {isResultsFilterPending && <span className="text-primary">Đang lọc...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
