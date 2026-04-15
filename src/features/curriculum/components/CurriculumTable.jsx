import React, { useState } from "react";
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronRight,
    FileText,
    Loader2,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CurriculumTable({ data, loading, error }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [collapsedSections, setCollapsedSections] = useState(new Set());

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                <AlertCircle className="h-16 w-16 text-amber-500 mb-4 opacity-70" />
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">
                    Không thể tải dữ liệu
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-500 max-w-md">
                    {error}
                </p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
                <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    Không có dữ liệu
                </h3>
                <p className="text-sm text-muted-foreground">
                    Vui lòng chọn khoa, ngành và khóa học
                </p>
            </div>
        );
    }

    const rows = data.slice(1);
    const processedRows = rows.map((row, index) => {
        const [stt, maHP, tenHP, tinChi, tienQuyet, ghiChu] = row;
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(tenHP);
        const hasCredits = tinChi && tinChi.trim() !== "";
        const isStructureRow = (!stt || stt === "") && (!maHP || maHP === "");
        const prevRowRaw = rows[index - 1];
        const isPrevRowCourse = prevRowRaw && (prevRowRaw[0] !== "" || prevRowRaw[1] !== "");
        const semesterPattern = /^(Học\s*kỳ|HK)\s*/i;
        const isSemesterCase1 = stt && semesterPattern.test(stt) && (!maHP || maHP === "");
        const isSemesterCase2 = (!stt || stt === "") && (!maHP || maHP === "") && tenHP && semesterPattern.test(tenHP);
        const isSemester = isSemesterCase1 || isSemesterCase2;
        const semesterText = isSemesterCase1 ? stt : (isSemesterCase2 ? tenHP : "");

        let isSection = false;
        let isEnglishRow = false;

        if (isSemester) {
            isSection = false;
            isEnglishRow = false;
        } else if (isStructureRow) {
            if (isPrevRowCourse) {
                isEnglishRow = true;
            } else {
                isSection = true;
            }

            if (isEnglishRow && (hasVietnamese || hasCredits)) {
                isEnglishRow = false;
                isSection = true;
            }
        }

        return {
            index,
            stt,
            maHP,
            tenHP,
            tinChi,
            tienQuyet,
            ghiChu,
            isSection,
            isEnglishRow,
            isSemester,
            semesterText
        };
    });

    const filteredRows = searchTerm
        ? processedRows.filter((row) => (
            row.tenHP?.toLowerCase().includes(searchTerm.toLowerCase())
            || row.maHP?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
        : processedRows;

    const toggleSection = (sectionIndex) => {
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(sectionIndex)) {
            newCollapsed.delete(sectionIndex);
        } else {
            newCollapsed.add(sectionIndex);
        }
        setCollapsedSections(newCollapsed);
    };

    const rowsWithSection = filteredRows.reduce(
        (accumulator, row) => {
            const sectionIndex = row.isSection && !row.isEnglishRow
                ? row.index
                : accumulator.currentSectionIndex;

            return {
                currentSectionIndex: sectionIndex,
                rows: [...accumulator.rows, { ...row, sectionIndex }]
            };
        },
        { currentSectionIndex: -1, rows: [] }
    ).rows;

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Tìm kiếm môn học..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <colgroup className="hidden sm:table-column-group">
                            <col style={{ width: "45px" }} />
                            <col style={{ width: "80px" }} />
                            <col style={{ width: "auto" }} />
                            <col style={{ width: "45px" }} />
                            <col className="hidden md:table-column" style={{ width: "140px" }} />
                            <col className="hidden lg:table-column" style={{ width: "70px" }} />
                        </colgroup>
                        <thead className="bg-primary/5 border-b">
                            <tr>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider hidden sm:table-cell" style={{ width: "45px" }}>STT</th>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider w-[70px] sm:w-[80px]">Mã HP</th>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider">Tên học phần</th>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold text-xs uppercase tracking-wider w-[40px] sm:w-[45px]">TC</th>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ width: "140px" }}>Tiên quyết</th>
                                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ width: "70px" }}>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rowsWithSection.map((row, index) => {
                                if (!row.isSection && collapsedSections.has(row.sectionIndex)) {
                                    return null;
                                }

                                if (row.isSemester) {
                                    return (
                                        <tr
                                            key={index}
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600"
                                        >
                                            <td colSpan={6} className="px-3 sm:px-4 py-2 sm:py-3">
                                                <div className="flex items-center gap-2 sm:gap-3 font-bold text-white text-sm sm:text-base">
                                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    <span>{row.semesterText}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                if (row.isSection && !row.isEnglishRow) {
                                    return (
                                        <tr
                                            key={index}
                                            className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 cursor-pointer transition-colors"
                                            onClick={() => toggleSection(row.index)}
                                        >
                                            <td colSpan={6} className="px-2 sm:px-3 py-2 sm:py-3">
                                                <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-primary text-xs sm:text-sm">
                                                    {collapsedSections.has(row.index) ? (
                                                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                                    )}
                                                    <span className="line-clamp-2">{row.tenHP}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                if (row.isEnglishRow) {
                                    return (
                                        <tr key={index} className="bg-muted/20 hidden sm:table-row">
                                            <td className="px-2 sm:px-3 py-1"></td>
                                            <td className="px-2 sm:px-3 py-1"></td>
                                            <td className="px-2 sm:px-3 py-1 text-muted-foreground italic text-xs" colSpan={4}>
                                                {row.tenHP}
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-2 sm:px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell" style={{ width: "45px" }}>{row.stt}</td>
                                        <td className="px-2 sm:px-3 py-2 w-[70px] sm:w-[80px]">
                                            {row.maHP && (
                                                <Badge variant="outline" className="font-mono text-[10px] sm:text-xs px-1.5 sm:px-2">
                                                    {row.maHP}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm">
                                            <span className="line-clamp-2">{row.tenHP}</span>
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 text-center w-[40px] sm:w-[45px]">
                                            {row.tinChi && (
                                                <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 text-primary font-semibold text-[10px] sm:text-xs">
                                                    {row.tinChi}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">
                                            {row.tienQuyet && (
                                                <div className="flex flex-wrap gap-1">
                                                    {row.tienQuyet.split(" ").slice(0, 3).map((code, codeIndex) => (
                                                        <Badge key={codeIndex} variant="secondary" className="text-[10px] px-1.5">
                                                            {code}
                                                        </Badge>
                                                    ))}
                                                    {row.tienQuyet.split(" ").length > 3 && (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5">
                                                            +{row.tienQuyet.split(" ").length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 text-center hidden lg:table-cell">
                                            {(row.ghiChu === "X" || row.ghiChu === "x") && (
                                                <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-[10px]">
                                                    Cốt lõi
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span>Tổng: {rows.length} dòng</span>
                <span className="hidden sm:inline">•</span>
                <span>Môn học: {rows.filter((row) => row[1] && row[1].length > 0).length}</span>
            </div>
        </div>
    );
}
