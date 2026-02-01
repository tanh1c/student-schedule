import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  FileText,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Loader2,
  Calendar,
  School,
  Layers,
  Download,
  Table,
  Search,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';

// Utility để parse CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length === 0) return [];

  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const row = [];
    let current = '';
    let inQuotes = false;
    const line = lines[i];

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }

  return result;
}

// Component hiển thị bảng CTDT/KHGD
function CurriculumTable({ data, loading, error }) {
  const [searchTerm, setSearchTerm] = useState('');
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

  // Bỏ header row (dòng đầu tiên)
  const rows = data.slice(1);

  // Phân loại dòng: Section header vs Course row
  const processedRows = rows.map((row, index) => {
    const [stt, maHP, tenHP, tinChi, tienQuyet, ghiChu] = row;

    // Regex kiểm tra tiếng Việt (để phân biệt Section Header tiếng Việt vs English Row)
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(tenHP);
    const hasCredits = tinChi && tinChi.trim() !== '';

    // Logic nhận diện mới cải tiến (Check Previous Row):
    const isStructureRow = (!stt || stt === '') && (!maHP || maHP === '');

    const prevRow = null;

    // Kiểm tra hàng trước đó có phải là môn học không (Có STT hoặc Mã HP)

    const prevRowRaw = rows[index - 1];
    const isPrevRowCourse = prevRowRaw && (prevRowRaw[0] !== '' || prevRowRaw[1] !== '');

    // Nhận diện dòng "Học kỳ X" hoặc "HK X" (KHGD) - 2 cases:
    // Case 1 (file 2024): STT chứa "Học kỳ" hoặc "HK" và các cột khác rỗng
    // Case 2 (file 2021-2023): STT rỗng, Mã HP rỗng, Tên HP chứa "Học kỳ" hoặc "HK"
    const semesterPattern = /^(Học\s*kỳ|HK)\s*/i;
    const isSemesterCase1 = stt && semesterPattern.test(stt) && (!maHP || maHP === '');
    const isSemesterCase2 = (!stt || stt === '') && (!maHP || maHP === '') && tenHP && semesterPattern.test(tenHP);
    const isSemester = isSemesterCase1 || isSemesterCase2;

    // Lấy text hiển thị cho semester
    const semesterText = isSemesterCase1 ? stt : (isSemesterCase2 ? tenHP : '');

    let isSection = false;
    let isEnglishRow = false;

    if (isSemester) {
      // Đây là dòng học kỳ, không phải Section hay English row
      isSection = false;
      isEnglishRow = false;
    } else if (isStructureRow) {
      if (isPrevRowCourse) {
        // Nếu hàng trước là môn học -> Hàng này 99% là tên tiếng Anh
        isEnglishRow = true;
      } else {
        // Nếu hàng trước KHÔNG phải môn học (là Section hoặc English row khác)
        // -> Hàng này chắc chắn là Section mới
        isSection = true;
      }

      // Fallback: Nếu logic trên chưa bao quát (ví dụ Section ngay sau Course - hiếm), check nội dung
      if (isEnglishRow && (hasVietnamese || hasCredits)) {
        // Có tiếng Việt hoặc tín chỉ -> Chắc chắn là Section, không phải tên Anh
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
      semesterText,
      raw: row
    };
  });

  // Lọc theo search term
  const filteredRows = searchTerm
    ? processedRows.filter(row =>
      row.tenHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.maHP?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : processedRows;

  // Toggle section collapse
  const toggleSection = (sectionIndex) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionIndex)) {
      newCollapsed.delete(sectionIndex);
    } else {
      newCollapsed.add(sectionIndex);
    }
    setCollapsedSections(newCollapsed);
  };

  // Tìm section index cho mỗi row
  let currentSectionIndex = -1;
  const rowsWithSection = filteredRows.map(row => {
    if (row.isSection && !row.isEnglishRow) {
      currentSectionIndex = row.index;
    }
    return { ...row, sectionIndex: currentSectionIndex };
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            {/* Desktop: fixed layout, Mobile: auto layout to fill width */}
            <colgroup className="hidden sm:table-column-group">
              <col style={{ width: '45px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '45px' }} />
              <col className="hidden md:table-column" style={{ width: '140px' }} />
              <col className="hidden lg:table-column" style={{ width: '70px' }} />
            </colgroup>
            <thead className="bg-primary/5 border-b">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider hidden sm:table-cell" style={{ width: '45px' }}>STT</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider w-[70px] sm:w-[80px]">Mã HP</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider">Tên học phần</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold text-xs uppercase tracking-wider w-[40px] sm:w-[45px]">TC</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ width: '140px' }}>Tiên quyết</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ width: '70px' }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rowsWithSection.map((row, idx) => {
                // Ẩn các row con nếu section bị collapse
                if (!row.isSection && collapsedSections.has(row.sectionIndex)) {
                  return null;
                }

                // Semester header (Học kỳ X) - Style nổi bật
                if (row.isSemester) {
                  return (
                    <tr
                      key={idx}
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

                // Section header
                if (row.isSection && !row.isEnglishRow) {
                  return (
                    <tr
                      key={idx}
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

                // English row (sub-row) - Hide on mobile
                if (row.isEnglishRow) {
                  return (
                    <tr key={idx} className="bg-muted/20 hidden sm:table-row">
                      <td className="px-2 sm:px-3 py-1"></td>
                      <td className="px-2 sm:px-3 py-1"></td>
                      <td className="px-2 sm:px-3 py-1 text-muted-foreground italic text-xs" colSpan={4}>
                        {row.tenHP}
                      </td>
                    </tr>
                  );
                }

                // Normal course row
                return (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="px-2 sm:px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell" style={{ width: '45px' }}>{row.stt}</td>
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
                          {row.tienQuyet.split(' ').slice(0, 3).map((code, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5">
                              {code}
                            </Badge>
                          ))}
                          {row.tienQuyet.split(' ').length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5">
                              +{row.tienQuyet.split(' ').length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-center hidden lg:table-cell">
                      {(row.ghiChu === 'X' || row.ghiChu === 'x') && (
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

      {/* Stats */}
      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <span>Tổng: {rows.length} dòng</span>
        <span className="hidden sm:inline">•</span>
        <span>Môn học: {rows.filter(r => r[1] && r[1].length > 0).length}</span>
      </div>
    </div>
  );
}

function CurriculumTab() {
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState(null);

  const [selectedKhoa, setSelectedKhoa] = useState('');
  const [selectedNganh, setSelectedNganh] = useState('');
  const [selectedLoai, setSelectedLoai] = useState('CTDT'); // CTDT | KHGD
  const [selectedYear, setSelectedYear] = useState('2023');

  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forceShowCsv, setForceShowCsv] = useState(false); // Cho phép xem CSV cho khóa cũ

  // Load ctdt_links.json để có đầy đủ khoa/ngành/khóa
  useEffect(() => {
    const loadLinks = async () => {
      setLinksLoading(true);
      setLinksError(null);
      try {
        const res = await fetch('/ctdt_links.json');
        if (!res.ok) throw new Error(`Không thể tải ctdt_links.json (HTTP ${res.status})`);
        const data = await res.json();
        setLinks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error loading ctdt_links.json:', e);
        setLinksError(e?.message || 'Không thể tải danh sách CTĐT');
        setLinks([]);
      } finally {
        setLinksLoading(false);
      }
    };
    loadLinks();
  }, []);

  // Derive options từ links
  const khoaOptions = Array.from(new Set(links.map((x) => x.khoa))).sort((a, b) => a.localeCompare(b, 'vi'));
  const nganhOptions = Array.from(
    new Set(links.filter((x) => x.khoa === selectedKhoa).map((x) => x.nganh))
  ).sort((a, b) => a.localeCompare(b, 'vi'));
  const yearOptions = Array.from(
    new Set(
      links
        .filter((x) => x.khoa === selectedKhoa && x.nganh === selectedNganh && x.loai === selectedLoai)
        .map((x) => x.nam)
    )
  ).sort((a, b) => {
    // "Từ 2024" đứng trước, còn lại sort giảm dần theo số
    if (a.includes('Từ')) return -1;
    if (b.includes('Từ')) return 1;
    return (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0);
  });

  // Khi đổi khoa/ngành/loại thì reset year hợp lệ
  useEffect(() => {
    if (!selectedKhoa) return;
    if (!selectedNganh && nganhOptions.length > 0) setSelectedNganh(nganhOptions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKhoa]);

  useEffect(() => {
    if (!selectedKhoa || !selectedNganh) return;
    if (yearOptions.length > 0 && !yearOptions.includes(selectedYear)) {
      setSelectedYear(yearOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKhoa, selectedNganh, selectedLoai, links]);

  const handleKhoaChange = (value) => {
    setSelectedKhoa(value);
    setSelectedNganh('');
    setError(null);
    setCsvData(null);
  };

  const handleNganhChange = (value) => {
    setSelectedNganh(value);
    setError(null);
    setCsvData(null);
  };

  const handleLoaiChange = (value) => {
    setSelectedLoai(value);
    setError(null);
    setCsvData(null);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setError(null);
    setCsvData(null);
    setForceShowCsv(false); // Reset toggle khi đổi khóa
  };

  // Tạo CSV path từ link item
  const getCSVPath = (linkItem) => {
    if (!linkItem) return null;

    const normalizeName = (text) =>
      text
        .trim()
        .replace(/[():]/g, '')
        .replace(/,/g, '')
        .replace(/\s+/g, '_');

    // Xóa dấu ngoặc () và dấu : khỏi tên folder (folder thực tế không có dấu ngoặc/colon)
    const normalizeFolderName = (text) =>
      text
        .trim()
        .replace(/[():]/g, '')
        .replace(/,/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const safeKhoa = normalizeName(linkItem.khoa);
    const safeNganh = normalizeName(linkItem.nganh);
    const safeNam = normalizeName(linkItem.nam);

    const csvFilename = `${safeKhoa}_${safeNganh}_${linkItem.loai}_${safeNam}_${linkItem.file_id}.csv`;

    // Folder path tương ứng - xóa dấu ngoặc
    const folderType = linkItem.loai === 'CTDT' ? 'Organized_CTDT' : 'Organized_KHGD';
    const khoaFolder = normalizeFolderName(linkItem.khoa);
    const nganhFolder = normalizeFolderName(linkItem.nganh);

    return `/CTDT/${folderType}/${encodeURIComponent(khoaFolder)}/${encodeURIComponent(nganhFolder)}/${encodeURIComponent(csvFilename)}`;
  };

  // Load CSV khi chọn ngành và năm
  useEffect(() => {
    if (!selectedKhoa || !selectedNganh || !selectedLoai || !selectedYear) return;

    const loadCSV = async () => {
      setLoading(true);
      setError(null);

      try {
        const linkItem = links.find(
          (x) =>
            x.khoa === selectedKhoa &&
            x.nganh === selectedNganh &&
            x.loai === selectedLoai &&
            x.nam === selectedYear
        );
        if (!linkItem) throw new Error('Không tìm thấy bản ghi trong ctdt_links.json');

        const csvPath = getCSVPath(linkItem);
        if (!csvPath) {
          throw new Error('Không tìm thấy file CSV');
        }

        const res = await fetch(csvPath);
        if (!res.ok) {
          throw new Error('File CSV không tồn tại trên server');
        }

        const csvText = await res.text();
        const parsedData = parseCSV(csvText);
        setCsvData(parsedData);
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError(err.message || 'Không thể tải file CSV');
        setCsvData(null);
      } finally {
        setLoading(false);
      }
    };

    loadCSV();
  }, [selectedKhoa, selectedNganh, selectedLoai, selectedYear, links]);

  // Google Drive link từ link item
  const googleDriveLink = useMemo(() => {
    const linkItem = links.find(
      (x) =>
        x.khoa === selectedKhoa &&
        x.nganh === selectedNganh &&
        x.loai === selectedLoai &&
        x.nam === selectedYear
    );
    return linkItem?.link || null;
  }, [links, selectedKhoa, selectedNganh, selectedLoai, selectedYear]);

  // PDF URL cho download
  const pdfUrl = useMemo(() => {
    const linkItem = links.find(
      (x) =>
        x.khoa === selectedKhoa &&
        x.nganh === selectedNganh &&
        x.loai === selectedLoai &&
        x.nam === selectedYear
    );
    if (!linkItem) return null;

    const normalizeName = (text) =>
      text
        .trim()
        .replace(/[()]/g, '')
        .replace(/,/g, '')
        .replace(/\s+/g, '_');

    const safeKhoa = normalizeName(linkItem.khoa);
    const safeNganh = normalizeName(linkItem.nganh);
    const safeNam = normalizeName(linkItem.nam);

    return `/CTDT/PDFs/${safeKhoa}_${safeNganh}_${linkItem.loai}_${safeNam}_${linkItem.file_id}.pdf`;
  }, [links, selectedKhoa, selectedNganh, selectedLoai, selectedYear]);

  // Xác định xem khóa được chọn có phải là khóa mới nhất không
  // Logic: Nếu chỉ có 1 khóa → hiển thị CSV, nếu nhiều khóa → chỉ khóa mới nhất hiển thị CSV
  const isNewestYear = useMemo(() => {
    if (yearOptions.length <= 1) return true; // Chỉ có 1 khóa thì hiển thị CSV

    // Khóa đầu tiên trong yearOptions đã được sort là khóa mới nhất (Từ 2024 > 2023 > 2022...)
    return selectedYear === yearOptions[0];
  }, [yearOptions, selectedYear]);

  // Có phải khóa cũ và có nhiều khóa để chọn không? (Trừ khi user bật forceShowCsv)
  const shouldShowPdfInstead = useMemo(() => {
    if (forceShowCsv) return false; // User muốn xem CSV
    return yearOptions.length > 1 && !isNewestYear;
  }, [yearOptions, isNewestYear, forceShowCsv]);

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Khoa / Nganh Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Chọn khoa & ngành
            {links.length > 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <School className="h-4 w-4" /> Khoa
                </div>
                <select
                  value={selectedKhoa}
                  onChange={(e) => handleKhoaChange(e.target.value)}
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
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Ngành
                </div>
                <select
                  value={selectedNganh}
                  onChange={(e) => handleNganhChange(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  disabled={!selectedKhoa}
                >
                  <option value="">{selectedKhoa ? '-- Chọn ngành --' : 'Chọn khoa trước'}</option>
                  {nganhOptions.map((nganh) => (
                    <option key={nganh} value={nganh}>
                      {nganh}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Loại
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoaiChange('CTDT')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${selectedLoai === 'CTDT'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    disabled={!selectedKhoa || !selectedNganh}
                  >
                    CTĐT
                  </button>
                  <button
                    onClick={() => handleLoaiChange('KHGD')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${selectedLoai === 'KHGD'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    disabled={!selectedKhoa || !selectedNganh}
                  >
                    KHGD
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year Selection */}
      {selectedKhoa && selectedNganh && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Chọn khóa học
              {yearOptions.length > 1 && (
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (Khóa mới nhất hiển thị dạng bảng, khóa cũ hiển thị PDF)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {yearOptions.map((year, index) => {
                const isNewest = yearOptions.length <= 1 || index === 0;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${selectedYear === year
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border hover:border-primary/50 bg-background'
                      }`}
                  >
                    {year}
                    {isNewest ? (
                      <Table className="h-3.5 w-3.5 opacity-70" title="Hiển thị dạng bảng" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 opacity-70" title="Hiển thị PDF" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            <Table className="h-4 w-4" />
            <span className="truncate">
              {selectedLoai === 'CTDT' ? 'Chương trình đào tạo' : 'Kế hoạch giảng dạy'}
            </span>
            {selectedKhoa && selectedNganh && (
              <Badge variant="outline" className="ml-auto shrink-0">
                {selectedNganh} - {selectedYear}
              </Badge>
            )}

            {/* Actions */}
            {csvData && (
              <div className="flex gap-2 ml-auto">
                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">PDF</span>
                    </a>
                  </Button>
                )}
                {googleDriveLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={googleDriveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Drive</span>
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedKhoa || !selectedNganh ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa chọn khoa/ngành
              </h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn khoa và ngành ở trên để xem dữ liệu
              </p>
            </div>
          ) : shouldShowPdfInstead ? (
            /* Hiển thị PDF cho các khóa cũ */
            <div className="space-y-4">
              {/* Warning banner */}
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                      Khóa {selectedYear} chưa được cập nhật định dạng chuẩn
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 hidden sm:block">
                      Các khóa cũ chưa được chuyển đổi sang định dạng CSV chuẩn. Hiển thị bản PDF gốc để đảm bảo dữ liệu chính xác.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForceShowCsv(true)}
                    className="bg-white dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs sm:text-sm"
                  >
                    <Table className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Xem dạng bảng (có thể lỗi định dạng)</span>
                    <span className="sm:hidden">Xem dạng bảng</span>
                  </Button>
                </div>
              </div>

              {/* PDF Viewer */}
              {pdfUrl ? (
                <div className="space-y-3">
                  {/* Mobile: Prominent download/open buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:hidden">
                    <Button
                      variant="default"
                      size="default"
                      asChild
                      className="flex-1"
                    >
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Mở PDF trong tab mới
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      asChild
                      className="flex-1"
                    >
                      <a href={pdfUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Tải PDF về máy
                      </a>
                    </Button>
                  </div>

                  {/* Desktop: Show iframe */}
                  <div className="rounded-lg border overflow-hidden bg-muted/30 hidden sm:block">
                    <iframe
                      src={pdfUrl}
                      title={`${selectedLoai} - ${selectedNganh} - ${selectedYear}`}
                      className="w-full"
                      style={{
                        border: 'none',
                        height: 'calc(100vh - 300px)',
                        minHeight: '500px'
                      }}
                    />
                  </div>

                  {/* Mobile: Show PDF info card instead of iframe */}
                  <div className="sm:hidden rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">
                        {selectedLoai === 'CTDT' ? 'Chương trình đào tạo' : 'Kế hoạch giảng dạy'}
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
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Không tìm thấy file PDF
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-4">
                    Vui lòng thử lại hoặc liên hệ hỗ trợ
                  </p>
                  {googleDriveLink && (
                    <Button variant="outline" size="sm" asChild className="mt-4">
                      <a href={googleDriveLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Xem trên Google Drive
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Warning banner khi đang xem CSV khóa cũ */}
              {forceShowCsv && yearOptions.length > 1 && !isNewestYear && (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
                        Đang xem dữ liệu khóa {selectedYear} (chưa được chuẩn hóa)
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 hidden sm:block">
                        Dữ liệu bảng có thể hiển thị sai định dạng. Nếu gặp lỗi, vui lòng xem bản PDF.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForceShowCsv(false)}
                      className="bg-white dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs sm:text-sm"
                    >
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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
    </div>
  );
}

export default CurriculumTab;

