import React from "react";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CurriculumPdfPanel({
  selectedLoai,
  selectedNganh,
  selectedYear,
  pdfUrl,
  googleDriveLink,
  onShowCsv,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20 sm:gap-3 sm:p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 sm:text-sm">
              Khóa {selectedYear} chưa được cập nhật định dạng chuẩn
            </p>
            <p className="hidden text-xs text-amber-700 dark:text-amber-400 sm:block">
              Các khóa cũ chưa được chuyển đổi sang định dạng CSV chuẩn. Hiển
              thị bản PDF gốc để đảm bảo dữ liệu chính xác.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowCsv}
            className="border-amber-300 bg-white text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 sm:text-sm"
          >
            <Table className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              Xem dạng bảng (có thể lỗi định dạng)
            </span>
            <span className="sm:hidden">Xem dạng bảng</span>
          </Button>
        </div>
      </div>

      {pdfUrl ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:hidden">
            <Button variant="default" size="default" asChild className="flex-1">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Mở PDF trong tab mới
              </a>
            </Button>
            <Button variant="outline" size="default" asChild className="flex-1">
              <a href={pdfUrl} download>
                <Download className="mr-2 h-4 w-4" />
                Tải PDF về máy
              </a>
            </Button>
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-muted/30 sm:block">
            <iframe
              src={pdfUrl}
              title={`${selectedLoai} - ${selectedNganh} - ${selectedYear}`}
              className="w-full"
              style={{
                border: "none",
                height: "calc(100vh - 300px)",
                minHeight: "500px",
              }}
            />
          </div>

          <div className="space-y-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center sm:hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {selectedLoai === "CTDT"
                  ? "Chương trình đào tạo"
                  : "Kế hoạch giảng dạy"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedNganh} - Khóa {selectedYear}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Nhấn nút ở trên để xem hoặc tải file PDF
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 py-12 text-center sm:py-16">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground opacity-50 sm:h-16 sm:w-16" />
          <h3 className="mb-1 text-base font-semibold text-foreground sm:text-lg">
            Không tìm thấy file PDF
          </h3>
          <p className="px-4 text-xs text-muted-foreground sm:text-sm">
            Vui lòng thử lại hoặc liên hệ hỗ trợ
          </p>
          {googleDriveLink && (
            <Button variant="outline" size="sm" asChild className="mt-4">
              <a href={googleDriveLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Xem trên Google Drive
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
