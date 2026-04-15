import React from "react";
import { Calendar, Search } from "lucide-react";
import { Button } from "@components/ui/button";

export default function TeachingResultEmptyState({
  variant,
  searchTab,
  onClearResultsQuery,
}) {
  if (variant === "filtered-empty") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 py-12 text-center">
        <Search className="mb-4 h-12 w-12 text-muted-foreground/60" />
        <h3 className="text-lg font-semibold text-foreground">Không có kết quả phù hợp bộ lọc hiển thị</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Thử từ khóa ngắn hơn hoặc tìm theo mã môn, tên môn, giảng viên, nhóm, phòng học và khung tiết.
        </p>
        <Button variant="ghost" className="mt-3" onClick={onClearResultsQuery}>
          Xóa bộ lọc hiển thị
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 py-12 text-center">
      <Calendar className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
      <h3 className="mb-1 text-lg font-semibold text-foreground">Chưa có kết quả tìm kiếm</h3>
      <p className="text-sm text-muted-foreground">
        {searchTab === "time"
          ? "Chọn ngày và tiết học để xem các lớp đang dạy"
          : "Nhập mã môn học hoặc tên giảng viên để tìm kiếm"}
      </p>
    </div>
  );
}
