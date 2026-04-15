import React from "react";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileText,
  Table,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurriculumPdfPanel from "@/features/curriculum/components/CurriculumPdfPanel";
import CurriculumTable from "@/features/curriculum/components/CurriculumTable";

export default function CurriculumContentCard({
  selectedKhoa,
  selectedNganh,
  selectedLoai,
  selectedYear,
  csvData,
  loading,
  error,
  yearOptions,
  forceShowCsv,
  pdfUrl,
  googleDriveLink,
  onShowCsv,
  onShowPdf,
}) {
  const isSelectionComplete = Boolean(selectedKhoa && selectedNganh);
  const isNewestYear = yearOptions.length <= 1 || selectedYear === yearOptions[0];
  const shouldShowPdfInstead =
    !forceShowCsv && yearOptions.length > 1 && !isNewestYear;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Table className="h-4 w-4" />
          <span className="truncate">
            {selectedLoai === "CTDT"
              ? "Chương trình đào tạo"
              : "Kế hoạch giảng dạy"}
          </span>

          {isSelectionComplete && (
            <Badge variant="outline" className="ml-auto shrink-0">
              {selectedNganh} - {selectedYear}
            </Badge>
          )}

          {csvData && (
            <div className="ml-auto flex gap-2">
              {pdfUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </a>
                </Button>
              )}
              {googleDriveLink && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Drive</span>
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isSelectionComplete ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Chưa chọn khoa/ngành
            </h3>
            <p className="text-sm text-muted-foreground">
              Vui lòng chọn khoa và ngành ở trên để xem dữ liệu
            </p>
          </div>
        ) : shouldShowPdfInstead ? (
          <CurriculumPdfPanel
            selectedLoai={selectedLoai}
            selectedNganh={selectedNganh}
            selectedYear={selectedYear}
            pdfUrl={pdfUrl}
            googleDriveLink={googleDriveLink}
            onShowCsv={onShowCsv}
          />
        ) : (
          <div className="space-y-4">
            {forceShowCsv && yearOptions.length > 1 && !isNewestYear && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20 sm:gap-3 sm:p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 sm:text-sm">
                      Đang xem dữ liệu khóa {selectedYear} (chưa được chuẩn hóa)
                    </p>
                    <p className="hidden text-xs text-amber-700 dark:text-amber-400 sm:block">
                      Dữ liệu bảng có thể hiển thị sai định dạng. Nếu gặp lỗi,
                      vui lòng xem bản PDF.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowPdf}
                    className="border-amber-300 bg-white text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 sm:text-sm"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                    Quay lại xem PDF
                  </Button>
                </div>
              </div>
            )}
            <CurriculumTable data={csvData} loading={loading} error={error} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
