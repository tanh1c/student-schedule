import React, { useState, useRef, useEffect } from "react";
import {
    Download,
    Upload,
    RefreshCw,
    ShieldCheck,
    FileJson,
    QrCode,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Copy,
    ExternalLink,
    Share2,
    CopyCheck
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "./ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import LZString from "lz-string";

export default function DataManagement() {
    const [lastBackup, setLastBackup] = useState(localStorage.getItem("last_backup_time") || "Chưa có");
    const [isImporting, setIsImporting] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [syncLink, setSyncLink] = useState("");
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    // Lấy toàn bộ dữ liệu từ localStorage
    const getAllData = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Danh sách các key chính xác của ứng dụng
            const appKeys = [
                'scheduleData',
                'examData',
                'manual_gpa_courses',
                'mybk_gpa_details',
                'studyRoadmap',
                'kanbanTasks',
                'selectedWeek',
                'mybk_gpa_summary'
            ];
            if (appKeys.includes(key)) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        return data;
    };

    // Tạo link đồng bộ nén
    useEffect(() => {
        if (showQr) {
            const data = getAllData();
            const jsonStr = JSON.stringify(data);
            const compressed = LZString.compressToEncodedURIComponent(jsonStr);
            // Giới hạn độ dài URL (thường là 2000-8000 tùy trình duyệt)
            // Nếu quá dài, link sẽ không hoạt động tốt, nhưng tối ưu cho các data nhỏ
            const url = `${window.location.origin}${window.location.pathname}#sync=${compressed}`;
            setSyncLink(url);
        }
    }, [showQr]);

    // Check hash for sync data on mount
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#sync=')) {
            const compressed = hash.replace('#sync=', '');
            try {
                const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
                if (decompressed) {
                    const data = JSON.parse(decompressed);
                    if (window.confirm("Phát hiện dữ liệu đồng bộ từ liên kết! Bạn có muốn KHOI PHỤC dữ liệu này không? (Dữ liệu cũ sẽ bị ghi đè)")) {
                        localStorage.clear();
                        Object.keys(data).forEach(key => {
                            const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                            localStorage.setItem(key, value);
                        });
                        window.location.hash = ""; // Clear hash
                        window.location.reload();
                    }
                }
            } catch (err) {
                console.error("Lỗi giải nén dữ liệu sync:", err);
            }
        }
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(syncLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Export dữ liệu ra file JSON
    const handleExport = () => {
        const data = getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `tkb_smart_backup_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const now = new Date().toLocaleString("vi-VN");
        localStorage.setItem("last_backup_time", now);
        setLastBackup(now);
    };

    // Import dữ liệu từ file JSON
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.confirm("CÀNH BÁO: Việc import sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại của bạn. Bạn có chắc chắn muốn tiếp tục?")) {
                    localStorage.clear();
                    Object.keys(data).forEach(key => {
                        const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                        localStorage.setItem(key, value);
                    });
                    window.location.reload();
                }
            } catch (err) {
                alert("Lỗi: File JSON không hợp lệ hoặc bị hỏng.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const menuKeys = [
        { key: 'scheduleData', label: 'Thời khóa biểu' },
        { key: 'examData', label: 'Lịch thi' },
        { key: 'manual_gpa_courses', label: 'Điểm GPA thủ công' },
        { key: 'mybk_gpa_details', label: 'Điểm MyBK' },
        { key: 'studyRoadmap', label: 'Roadmap học tập' },
        { key: 'kanbanTasks', label: 'Ghi chú & Kế hoạch' }
    ];

    const dataStats = menuKeys.map(m => ({
        label: m.label,
        exists: localStorage.getItem(m.key) !== null
    }));

    return (
        <div className="space-y-4 p-1">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                        Sao lưu & Khôi phục
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Lưu dữ liệu của bạn để sử dụng trên thiết bị khác hoặc dự phòng.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                    {/* Status info box - Improved UI */}
                    <div className="bg-muted/40 rounded-2xl p-4 border border-border/40 backdrop-blur-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">
                                Trạng thái dữ liệu
                            </span>
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-background/50 border-none font-medium whitespace-nowrap">
                                Offline Storage
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {dataStats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 group">
                                    <div className={`h-1.5 w-1.5 rounded-full flex-none transition-transform group-hover:scale-125 ${stat.exists ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30'}`} />
                                    <span className={`text-[11px] font-medium truncate ${stat.exists ? 'text-foreground/90' : 'text-muted-foreground/60'}`}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                <RefreshCw className="h-3 w-3" />
                                Lần cuối: {lastBackup}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            onClick={handleExport}
                            className="w-full justify-start h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Xuất file dữ liệu (.json)
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current.click()}
                                className="w-full justify-start h-11 border-dashed border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl"
                            >
                                <Upload className="h-4 w-4 mr-2 text-indigo-600" />
                                Nhập từ file backup
                            </Button>
                        </div>

                        <Dialog open={showQr} onOpenChange={setShowQr}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-11 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Đồng bộ nhanh (QR / Link)
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5 text-indigo-600" />
                                        Đồng bộ tức thì
                                    </DialogTitle>
                                    <DialogDescription>
                                        Quét QR hoặc gửi link để chuyển toàn bộ dữ liệu sang máy khác ngay lập tức.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-dashed">
                                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
                                        {syncLink.length > 2000 ? (
                                            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200">
                                                <AlertCircle className="h-10 w-10 text-amber-600 mb-2" />
                                                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400">DỮ LIỆU QUÁ LỚN</p>
                                                <p className="text-[9px] text-amber-700/70 dark:text-amber-500/70 mt-1">
                                                    Mã QR không thể chứa hết dữ liệu hiện tại. Vui lòng sử dụng **Xuất file JSON**.
                                                </p>
                                            </div>
                                        ) : (
                                            <QRCodeCanvas
                                                value={syncLink || window.location.origin}
                                                size={200}
                                                level="L"
                                                includeMargin={false}
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground max-w-[280px] leading-relaxed">
                                        {syncLink.length > 2000
                                            ? "Liên kết đồng bộ có thể vẫn hoạt động, nhưng mã QR đã đạt giới hạn dung lượng."
                                            : "Mã QR chứa dữ liệu đã nén. Quét bằng thiết bị nhận để đồng bộ. Link đồng bộ cũng hoạt động tương tự."
                                        }
                                    </p>
                                </div>
                                <DialogFooter className="flex-col gap-2">
                                    <div className="flex gap-2 w-full">
                                        <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setShowQr(false)}>Đóng</Button>
                                        <Button
                                            className={`flex-1 rounded-xl h-11 transition-all ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                            onClick={copyToClipboard}
                                        >
                                            {copied ? <CopyCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                            {copied ? "Đã sao chép!" : "Sao chép Link"}
                                        </Button>
                                    </div>
                                    {syncLink.length > 2000 && (
                                        <p className="text-[10px] text-amber-600 text-center mt-1 font-medium">
                                            ⚠️ Dữ liệu quá lớn, hãy ưu tiên dùng file JSON.
                                        </p>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30 flex gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-normal">
                            <b>An toàn:</b> Dữ liệu đồng bộ trực tiếp giữa các thiết bị, không đi qua máy chủ trung gian.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
