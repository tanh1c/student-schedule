import React, { useState, useMemo } from "react";
import {
    HardDrive,
    Database,
    FileJson,
    AlertCircle,
    Trash2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Search
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

/**
 * LocalStorageViewer - Component to view and manage localStorage data
 * Shows all stored items with their sizes, allows searching and clearing individual items
 */
export default function LocalStorageViewer() {
    const [showDetails, setShowDetails] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Calculate storage statistics for ALL localStorage items
    const storageStats = useMemo(() => {
        const items = [];
        let totalBytes = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const sizeBytes = new Blob([key + value]).size;
            totalBytes += sizeBytes;

            // Categorize items
            let category = "Khác";
            if (key.startsWith("lms_")) category = "LMS Messages";
            else if (key.startsWith("mybk_")) category = "MyBK";
            else if (key.includes("schedule") || key.includes("Schedule")) category = "Thời khóa biểu";
            else if (key.includes("exam") || key.includes("Exam")) category = "Lịch thi";
            else if (key.includes("gpa") || key.includes("GPA")) category = "GPA";
            else if (key.includes("roadmap") || key.includes("Roadmap")) category = "Roadmap";
            else if (key.includes("kanban") || key.includes("notes")) category = "Ghi chú";

            items.push({
                key,
                sizeBytes,
                sizeFormatted: formatBytes(sizeBytes),
                category,
                preview: value?.substring(0, 100) + (value?.length > 100 ? "..." : "")
            });
        }

        // Sort by size descending
        items.sort((a, b) => b.sizeBytes - a.sizeBytes);

        return {
            items,
            totalBytes,
            totalFormatted: formatBytes(totalBytes),
            itemCount: items.length
        };
    }, [refreshKey]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return storageStats.items;
        const query = searchQuery.toLowerCase();
        return storageStats.items.filter(
            item => item.key.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
        );
    }, [storageStats.items, searchQuery]);

    // Format bytes to human readable
    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }

    // Delete a single item
    const handleDeleteItem = (key) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${key}"?\n\nHành động này không thể hoàn tác.`)) {
            localStorage.removeItem(key);
            setRefreshKey(k => k + 1);
        }
    };

    // Clear all localStorage
    const handleClearAll = () => {
        if (window.confirm("⚠️ CẢNH BÁO: Bạn sắp xóa TẤT CẢ dữ liệu!\n\nĐiều này sẽ xóa:\n- Thời khóa biểu\n- Lịch thi\n- Điểm GPA\n- Tin nhắn LMS\n- Tất cả cài đặt\n\nBạn có chắc chắn?")) {
            localStorage.clear();
            setRefreshKey(k => k + 1);
            window.location.reload();
        }
    };

    // Get color based on size
    const getSizeColor = (bytes) => {
        if (bytes > 100 * 1024) return "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300";
        if (bytes > 10 * 1024) return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300";
        return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
    };

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            "LMS Messages": "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
            "MyBK": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
            "Thời khóa biểu": "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300",
            "Lịch thi": "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
            "GPA": "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
            "Roadmap": "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",
            "Ghi chú": "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
        };
        return colors[category] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    };

    // Estimated storage limit (5MB for most browsers)
    const STORAGE_LIMIT = 5 * 1024 * 1024;
    const usagePercent = Math.min((storageStats.totalBytes / STORAGE_LIMIT) * 100, 100);

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <ScrollArea className="flex-1 p-3 sm:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                                    Bộ nhớ cục bộ
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Quản lý dữ liệu LocalStorage trên thiết bị
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setRefreshKey(k => k + 1)}
                            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Storage Usage Card */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-emerald-600" />
                                    <CardTitle className="text-base">Dung lượng sử dụng</CardTitle>
                                </div>
                                <Badge className={getSizeColor(storageStats.totalBytes)}>
                                    {storageStats.totalFormatted}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{storageStats.itemCount} mục được lưu trữ</span>
                                    <span>~5 MB giới hạn</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-gradient-to-r from-rose-400 to-red-500' :
                                            usagePercent > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                                'bg-gradient-to-r from-emerald-400 to-teal-500'
                                            }`}
                                        style={{ width: `${Math.max(usagePercent, 1)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground">
                                    {usagePercent.toFixed(1)}% dung lượng đã sử dụng
                                </p>
                            </div>

                            {/* Category Breakdown - Horizontal */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(
                                    storageStats.items.reduce((acc, item) => {
                                        acc[item.category] = (acc[item.category] || 0) + item.sizeBytes;
                                        return acc;
                                    }, {})
                                ).sort((a, b) => b[1] - a[1]).map(([category, bytes]) => (
                                    <Badge
                                        key={category}
                                        variant="secondary"
                                        className={`text-[10px] ${getCategoryColor(category)}`}
                                    >
                                        {category}: {formatBytes(bytes)}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search and Actions */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex-1 h-11 gap-2"
                            >
                                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                <span className="hidden xs:inline">{showDetails ? "Ẩn" : "Hiện"}</span> chi tiết
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleClearAll}
                                className="h-11 gap-2 px-3 sm:px-4"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Xóa tất cả</span>
                            </Button>
                        </div>
                    </div>

                    {/* Items List */}
                    {showDetails && (
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <FileJson className="w-4 h-4" />
                                        Chi tiết các mục ({filteredItems.length})
                                    </CardTitle>
                                    <span className="text-[10px] text-muted-foreground">
                                        Sắp xếp theo dung lượng
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
                                    {filteredItems.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">Không tìm thấy dữ liệu</p>
                                            <p className="text-xs mt-1">
                                                {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "LocalStorage đang trống"}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredItems.map((item, index) => (
                                            <div
                                                key={item.key}
                                                className={`flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-accent/50 transition-colors ${index !== filteredItems.length - 1 ? 'border-b border-border/30' : ''
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <p className="text-xs font-mono font-medium truncate text-foreground/90 max-w-[200px] sm:max-w-none">
                                                            {item.key}
                                                        </p>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-[9px] flex-shrink-0 ${getCategoryColor(item.category)}`}
                                                        >
                                                            {item.category}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate font-mono hidden sm:block">
                                                        {item.preview}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] ${getSizeColor(item.sizeBytes)}`}
                                                    >
                                                        {item.sizeFormatted}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteItem(item.key)}
                                                        className="h-8 w-8 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Info Note */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                Lưu ý về LocalStorage
                            </p>
                            <ul className="text-[11px] text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                                <li>Dữ liệu chỉ được lưu trên thiết bị này và trình duyệt này</li>
                                <li>Xóa cache trình duyệt sẽ mất tất cả dữ liệu</li>
                                <li>Sử dụng <b>Sao lưu & Khôi phục</b> để chuyển dữ liệu sang thiết bị khác</li>
                                <li>Giới hạn ~5-10MB tùy trình duyệt</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
