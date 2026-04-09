import React from "react";
import { BookOpen, Layers, Loader2, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CurriculumFiltersCard({
  linksLoading,
  linksError,
  khoaOptions,
  nganhOptions,
  linksCount,
  selectedKhoa,
  selectedNganh,
  selectedLoai,
  onKhoaChange,
  onNganhChange,
  onLoaiChange,
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          Chọn khoa & ngành
          {linksCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {khoaOptions.length} khoa
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linksLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách khoa/ngành...
          </div>
        ) : linksError ? (
          <div className="text-sm text-amber-700 dark:text-amber-500">
            {linksError}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <School className="h-4 w-4" /> Khoa
              </div>
              <select
                value={selectedKhoa}
                onChange={(event) => onKhoaChange(event.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Chọn khoa --</option>
                {khoaOptions.map((khoa) => (
                  <option key={khoa} value={khoa}>
                    {khoa}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Ngành
              </div>
              <select
                value={selectedNganh}
                onChange={(event) => onNganhChange(event.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                disabled={!selectedKhoa}
              >
                <option value="">
                  {selectedKhoa ? "-- Chọn ngành --" : "Chọn khoa trước"}
                </option>
                {nganhOptions.map((nganh) => (
                  <option key={nganh} value={nganh}>
                    {nganh}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Layers className="h-4 w-4" /> Loại
              </div>
              <div className="flex gap-2">
                {["CTDT", "KHGD"].map((type) => (
                  <button
                    key={type}
                    onClick={() => onLoaiChange(type)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                      selectedLoai === type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                    disabled={!selectedKhoa || !selectedNganh}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
