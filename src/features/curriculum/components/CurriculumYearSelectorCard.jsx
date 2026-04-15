import React from "react";
import { Calendar, FileText, Table } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CurriculumYearSelectorCard({
  selectedKhoa,
  selectedNganh,
  yearOptions,
  selectedYear,
  onYearChange,
}) {
  if (!selectedKhoa || !selectedNganh) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Chọn khóa học
          {yearOptions.length > 1 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Khóa mới nhất hiển thị dạng bảng, khóa cũ hiển thị PDF)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {yearOptions.map((year, index) => {
            const newest = yearOptions.length <= 1 || index === 0;

            return (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  selectedYear === year
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {year}
                {newest ? (
                  <Table
                    className="h-3.5 w-3.5 opacity-70"
                    title="Hiển thị dạng bảng"
                  />
                ) : (
                  <FileText
                    className="h-3.5 w-3.5 opacity-70"
                    title="Hiển thị PDF"
                  />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
