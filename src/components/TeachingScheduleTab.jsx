import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Search,
  Calendar,
  Mail,
  Phone,
  Users,
  MapPin,
  Clock,
  BookOpen,
  User,
  Loader2,
  Building2,
  RefreshCcw,
  ListFilter,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = '/api';

// Helper to convert day number to Vietnamese
// dayOfWeek: 0=CN, 1=Thứ 2, 2=Thứ 3, ..., 6=Thứ 7
const dayNames = {
  0: 'CN',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const dayShortNames = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7'
};

// Thứ tự hiển thị: Thứ 2 -> Thứ 7 -> CN
const dayOrder = [1, 2, 3, 4, 5, 6, 0];

// Mapping tiết học -> khung giờ (theo lịch BK chính thức)
const tietTimeMap = {
  1: { start: '06:00', end: '06:50' },
  2: { start: '07:00', end: '07:50' },
  3: { start: '08:00', end: '08:50' },
  4: { start: '09:00', end: '09:50' },
  5: { start: '10:00', end: '10:50' },
  6: { start: '11:00', end: '11:50' },
  7: { start: '12:00', end: '12:50' },
  8: { start: '13:00', end: '13:50' },
  9: { start: '14:00', end: '14:50' },
  10: { start: '15:00', end: '15:50' },
  11: { start: '16:00', end: '16:50' },
  12: { start: '17:00', end: '17:50' },
  13: { start: '18:00', end: '18:50' },
  14: { start: '18:50', end: '19:40' },
  15: { start: '19:40', end: '20:30' },
  16: { start: '20:30', end: '21:10' },
};

// Nhóm tiết theo buổi
const tietGroups = [
  { label: 'Sáng', tiets: [1, 2, 3, 4, 5, 6], timeRange: '06:00 - 11:50' },
  { label: 'Chiều', tiets: [7, 8, 9, 10, 11, 12], timeRange: '12:00 - 17:50' },
  { label: 'Tối', tiets: [13, 14, 15, 16], timeRange: '18:00 - 21:10' },
];

const allTietOptions = Array.from({ length: 16 }, (_, index) => index + 1);

const campusOptions = [
  { value: '', label: 'Tất cả cơ sở', helper: 'Không giới hạn tòa nhà' },
  { value: '1', label: 'CS1 (A, B, C)', helper: 'Tòa A1-A5, B1-B12, C1-C6' },
  { value: '2', label: 'CS2 (H)', helper: 'Tòa H1-H6' }
];

// Helper: Lấy khung giờ từ danh sách tiết
const getTietTimeRange = (tietArray) => {
  if (!tietArray || tietArray.length === 0) return '';
  const sortedTiets = [...tietArray].sort((a, b) => a - b);
  const firstTiet = sortedTiets[0];
  const lastTiet = sortedTiets[sortedTiets.length - 1];
  const startTime = tietTimeMap[firstTiet]?.start || '';
  const endTime = tietTimeMap[lastTiet]?.end || '';
  return startTime && endTime ? `${startTime}-${endTime}` : '';
};

// ===== Vietnamese Smart Search Helpers =====
/**
 * Remove Vietnamese diacritics for search matching
 * Hỗ trợ tìm kiếm: "nguyen" sẽ match "Nguyễn"
 */
const removeVietnameseAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

/**
 * Smart Vietnamese search - hỗ trợ:
 * 1. Tìm không dấu
 * 2. Tìm một phần tên (VD: "trung" match "Mai Đức Trung")
 * 3. Tìm viết tắt (VD: "mdt" match "Mai Đức Trung")
 * 4. Tìm phonetic (VD: "zuyen" match "Duyên", "k" match "c")
 */
const smartVietnameseMatch = (text, query) => {
  if (!text || !query) return false;

  const textNorm = removeVietnameseAccents(text);
  const queryNorm = removeVietnameseAccents(query.trim());

  if (!queryNorm) return true;

  // 1. Direct substring match (không dấu)
  if (textNorm.includes(queryNorm)) return true;

  // 2. Match từ đầu mỗi từ (acronym search)
  // VD: "MDT" hoặc "mdt" match "Mai Đức Trung"
  const words = textNorm.split(/\s+/);
  const acronym = words.map(w => w[0]).join('');
  if (acronym.includes(queryNorm)) return true;

  // 3. Match từng từ riêng lẻ
  // VD: "trung" match "Mai Đức Trung" 
  const queryWords = queryNorm.split(/\s+/);
  const allWordsMatch = queryWords.every(qw =>
    words.some(w => w.startsWith(qw))
  );
  if (allWordsMatch && queryWords.length > 0) return true;

  // 4. Phonetic matching cho tiếng Việt
  // Xử lý các trường hợp hay bị nhầm
  const phoneticMap = {
    'z': 'd', 'gi': 'd', 'r': 'z',
    'k': 'c', 'q': 'k',
    'f': 'ph', 'ph': 'f',
    'kh': 'h',
  };

  let phoneticQuery = queryNorm;
  Object.entries(phoneticMap).forEach(([from, to]) => {
    phoneticQuery = phoneticQuery.replace(new RegExp(from, 'g'), to);
  });

  if (phoneticQuery !== queryNorm && textNorm.includes(phoneticQuery)) {
    return true;
  }

  return false;
};

const matchesResultsQuery = (fields, query) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  return fields.some((field) => {
    if (field === null || field === undefined) return false;

    const value = String(field).trim();
    if (!value) return false;

    return smartVietnameseMatch(value, trimmedQuery);
  });
};

function TeachingScheduleTab() {
  const [searchTab, setSearchTab] = useState('code'); // 'code' | 'lecturer' | 'time'
  const [courseCode, setCourseCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For time-based search
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTiet, setSelectedTiet] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [timeResults, setTimeResults] = useState([]);
  const [strictTietFilter, setStrictTietFilter] = useState(false); // true = chỉ lớp trong range, false = có overlap
  const [resultsQuery, setResultsQuery] = useState('');

  // For autocomplete
  const [allSubjects, setAllSubjects] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load subjects and lecturers on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [subjectsRes, lecturersRes] = await Promise.all([
          fetch(`${API_BASE}/lecturer/subjects`),
          fetch(`${API_BASE}/lecturer/list`)
        ]);

        if (subjectsRes.ok) {
          const subjects = await subjectsRes.json();
          setAllSubjects(subjects);
        }

        if (lecturersRes.ok) {
          const lecturers = await lecturersRes.json();
          setAllLecturers(lecturers);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (tab) => {
    setSearchTab(tab);
    // Chỉ reset error và suggestions, giữ nguyên các input và kết quả
    setError(null);
    setShowSuggestions(false);
    setResultsQuery('');
  };

  const searchByCode = async () => {
    if (!courseCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let searchId = courseCode.trim();
      if (searchId.includes(' - ')) {
        searchId = searchId.split(' - ')[0].trim();
      }

      const res = await fetch(`${API_BASE}/lecturer/search?id=${encodeURIComponent(searchId)}`);
      const data = await res.json();

      if (data.length === 0) {
        setError('Không tìm thấy môn học');
      }
      setSearchResults(data);
      setResultsQuery('');
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const searchByLecturer = async () => {
    if (!lecturerName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/lecturer/search?gv=${encodeURIComponent(lecturerName)}`);
      const data = await res.json();

      if (data.length === 0) {
        setError('Không tìm thấy giảng viên');
      }
      setSearchResults(data);
      setResultsQuery('');
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (searchTab === 'code') searchByCode();
      else if (searchTab === 'lecturer') searchByLecturer();
    }
  };

  // Search by time
  const searchByTime = async () => {
    if (selectedDay === null) return;

    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE}/lecturer/browse-schedule?day=${selectedDay}`;
      if (selectedTiet.length > 0) {
        url += `&tiet=${selectedTiet.join(',')}`;
      }
      if (selectedCampus) {
        url += `&campus=${encodeURIComponent(selectedCampus)}`;
      }
      if (strictTietFilter) {
        url += `&strict=true`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.length === 0) {
        setError('Không tìm thấy lớp học nào trong thời gian đã chọn');
      }
      setTimeResults(data);
      setResultsQuery('');
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Toggle tiết selection
  const toggleTiet = (tiet) => {
    setSelectedTiet(prev =>
      prev.includes(tiet)
        ? prev.filter(t => t !== tiet)
        : [...prev, tiet].sort((a, b) => a - b)
    );
  };

  const resetTimeFilters = () => {
    setSelectedDay(null);
    setSelectedTiet([]);
    setSelectedCampus('');
    setStrictTietFilter(false);
  };

  // Filter suggestions with smart Vietnamese search
  const filteredSubjects = allSubjects.filter(s => {
    const query = courseCode.trim();
    if (!query) return false;

    // Match by ID (exact or partial)
    if (s.id.toLowerCase().includes(query.toLowerCase())) return true;

    // Smart match by name
    if (smartVietnameseMatch(s.name, query)) return true;

    return false;
  }).slice(0, 10);

  const filteredLecturers = allLecturers.filter(l => {
    const query = lecturerName.trim();
    if (!query) return false;
    return smartVietnameseMatch(l.name, query);
  }).slice(0, 10);

  const selectedCampusMeta = campusOptions.find((campus) => campus.value === selectedCampus) ?? campusOptions[0];
  const selectedTietSummary = selectedTiet.length > 0
    ? `Tiết ${selectedTiet.join(', ')}`
    : 'Tất cả tiết';
  const selectedTietRange = selectedTiet.length > 0
    ? `${tietTimeMap[selectedTiet[0]]?.start} - ${tietTimeMap[selectedTiet[selectedTiet.length - 1]]?.end}`
    : 'Không giới hạn khung giờ';

  const filteredTimeResults = timeResults.filter((item) => matchesResultsQuery([
    item.maMonHoc,
    item.tenMonHoc,
    item.group,
    item.giangVien,
    item.email,
    item.siso,
    ...(item.classInfo ?? []).flatMap((ci) => [
      ci.phong,
      `Tiết ${ci.tietHoc?.join('-')}`,
      getTietTimeRange(ci.tietHoc)
    ])
  ], resultsQuery));

  const filteredSearchResults = searchResults.filter((result) => matchesResultsQuery([
    result.maMonHoc,
    result.tenMonHoc,
    result.soTinChi,
    ...(result.lichHoc ?? []).flatMap((lh) => [
      lh.group,
      lh.giangVien,
      lh.email,
      lh.phone,
      lh.giangVienBT,
      lh.emailBT,
      lh.siso,
      lh.ngonNgu,
      ...(lh.classInfo ?? []).flatMap((ci) => [
        dayNames[ci.dayOfWeek] || ci.dayOfWeek,
        `Tiết ${ci.tietHoc?.join('-')}`,
        getTietTimeRange(ci.tietHoc),
        ci.phong,
        ci.coSo
      ])
    ])
  ], resultsQuery));

  const totalResultsCount = searchTab === 'time' ? timeResults.length : searchResults.length;
  const visibleResultsCount = searchTab === 'time' ? filteredTimeResults.length : filteredSearchResults.length;
  const hasServerResults = totalResultsCount > 0;
  const hasFilteredResults = visibleResultsCount > 0;
  const resultsFilterPlaceholder = searchTab === 'time'
    ? 'Lọc theo môn, giảng viên, phòng, nhóm hoặc tiết...'
    : 'Lọc theo mã môn, tên môn, giảng viên, nhóm hoặc phòng...';

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 overflow-x-hidden p-3 md:p-6 md:space-y-6">
      {/* Data loading alert */}
      {loadingData && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800 dark:text-blue-400">
            Đang tải dữ liệu môn học và giảng viên...
          </AlertDescription>
        </Alert>
      )}

      {/* Search Card */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 space-y-4 overflow-x-hidden">
          {/* Search Tabs */}
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => handleTabChange('code')}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:w-auto sm:justify-center sm:rounded-lg sm:px-4 sm:py-2",
                searchTab === 'code'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Theo mã môn</span>
            </button>
            <button
              onClick={() => handleTabChange('lecturer')}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:w-auto sm:justify-center sm:rounded-lg sm:px-4 sm:py-2",
                searchTab === 'lecturer'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Theo giảng viên</span>
            </button>
            <button
              onClick={() => handleTabChange('time')}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:w-auto sm:justify-center sm:rounded-lg sm:px-4 sm:py-2",
                searchTab === 'time'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span>Theo thời gian</span>
            </button>
          </div>

          {/* Search Input - For code and lecturer tabs */}
          {(searchTab === 'code' || searchTab === 'lecturer') && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 relative">
                <Input
                  placeholder={searchTab === 'code'
                    ? "Nhập mã môn học (VD: CO3001)..."
                    : "Nhập tên giảng viên..."
                  }
                  value={searchTab === 'code' ? courseCode : lecturerName}
                  onChange={(e) => {
                    if (searchTab === 'code') {
                      setCourseCode(e.target.value);
                    } else {
                      setLecturerName(e.target.value);
                    }
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="h-11"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-64 overflow-auto">
                    {searchTab === 'code' && filteredSubjects.length > 0 && (
                      filteredSubjects.map((s, i) => (
                        <button
                          key={i}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            setCourseCode(s.id);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="font-medium text-primary">{s.id}</span>
                          <span className="text-muted-foreground"> - {s.name}</span>
                        </button>
                      ))
                    )}
                    {searchTab === 'lecturer' && filteredLecturers.length > 0 && (
                      filteredLecturers.map((l, i) => (
                        <button
                          key={i}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            setLecturerName(l.name);
                            setShowSuggestions(false);
                          }}
                        >
                          <User className="h-3 w-3 inline mr-2 text-muted-foreground" />
                          {l.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={searchTab === 'code' ? searchByCode : searchByLecturer}
                disabled={loading || (searchTab === 'code' ? !courseCode.trim() : !lecturerName.trim())}
                className="h-11 w-full px-6 sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Tìm kiếm
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Time Search UI */}
          {searchTab === 'time' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="sm:hidden">
                <div className="rounded-2xl border bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">Tìm theo thời gian</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Chọn nhanh ngày, tiết và cơ sở.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 px-2"
                      onClick={resetTimeFilters}
                    >
                      <RefreshCcw className="mr-1 h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Ngày</div>
                      <div className="mt-1 text-xs font-medium text-foreground">
                        {selectedDay !== null ? dayShortNames[selectedDay] : '--'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Tiết</div>
                      <div className="mt-1 text-xs font-medium text-foreground">
                        {selectedTiet.length > 0 ? selectedTiet.length : 'Tất cả'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/40 px-2 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Cơ sở</div>
                      <div className="mt-1 truncate text-xs font-medium text-foreground">
                        {selectedCampus || 'Tất cả'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Ngày trong tuần
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {dayOrder.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            title={dayNames[day]}
                            className={cn(
                              "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
                              selectedDay === day
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {dayShortNames[day]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Cơ sở
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {campusOptions.map((campus) => (
                          <button
                            key={campus.value}
                            onClick={() => setSelectedCampus(campus.value)}
                            className={cn(
                              "rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all",
                              selectedCampus === campus.value
                                ? "border-primary bg-primary/8 text-primary shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
                            )}
                          >
                            {campus.value === '' ? 'Tất cả' : campus.value === '1' ? 'CS1' : 'CS2'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Chọn tiết
                        </label>
                        {selectedTiet.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {selectedTietSummary}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {allTietOptions.map((tiet) => (
                          <button
                            key={tiet}
                            onClick={() => toggleTiet(tiet)}
                            title={`${tietTimeMap[tiet].start} - ${tietTimeMap[tiet].end}`}
                            className={cn(
                              "rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                              selectedTiet.includes(tiet)
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <div className="font-bold">{tiet}</div>
                            <div className="mt-0.5 text-[10px] opacity-80">{tietTimeMap[tiet].start}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStrictTietFilter(false)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                          !strictTietFilter
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
                        )}
                      >
                        Có overlap
                      </button>
                      <button
                        onClick={() => setStrictTietFilter(true)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                          strictTietFilter
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent"
                        )}
                      >
                        Trong range
                      </button>
                    </div>

                    <Button
                      onClick={searchByTime}
                      disabled={loading || selectedDay === null}
                      className="h-11 w-full"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Tìm lớp học
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden w-full min-w-0 rounded-2xl border bg-muted/20 p-3 sm:block sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                        <GraduationCap className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Duyệt lớp đang giảng dạy theo thời gian
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          Chọn ngày, khung tiết và cơ sở để tìm nhanh lớp học đang diễn ra hoặc sắp diễn ra trong khuôn viên trường.
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-2 pb-1">
                        <Badge variant={selectedDay !== null ? "default" : "secondary"} className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {selectedDay !== null ? dayNames[selectedDay] : 'Chưa chọn ngày'}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedTietSummary}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {selectedCampusMeta.label}
                        </Badge>
                        {selectedTiet.length > 0 && (
                          <Badge variant="outline">
                            {strictTietFilter ? 'Chỉ trong range' : 'Có overlap'}
                          </Badge>
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-start xl:justify-center"
                    onClick={resetTimeFilters}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </div>

              <div className="hidden w-full min-w-0 gap-3 sm:grid sm:gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-foreground">Bước 1. Chọn ngày và cơ sở</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ngày là bắt buộc. Cơ sở là tuỳ chọn nếu bạn muốn thu hẹp kết quả theo khu vực học.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Ngày trong tuần</label>
                      <div className="grid grid-cols-4 gap-2 sm:hidden">
                        {dayOrder.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            title={dayNames[day]}
                            className={cn(
                              "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
                              selectedDay === day
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {dayShortNames[day]}
                          </button>
                        ))}
                      </div>
                      <ScrollArea className="hidden w-full whitespace-nowrap sm:block">
                        <div className="flex gap-2 pb-1">
                          {dayOrder.map((day) => (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              title={dayNames[day]}
                              className={cn(
                                "min-w-[68px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-all sm:min-w-[78px] sm:px-4",
                                selectedDay === day
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <span>{dayNames[day]}</span>
                            </button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Cơ sở</label>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {campusOptions.map((campus) => (
                          <button
                            key={campus.value}
                            onClick={() => setSelectedCampus(campus.value)}
                            className={cn(
                              "rounded-xl border p-3 text-left transition-all",
                              selectedCampus === campus.value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border bg-background hover:border-primary/30 hover:bg-accent/40"
                            )}
                          >
                            <div className="text-sm font-medium text-foreground">{campus.label}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{campus.helper}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Bước 2. Chọn khung tiết</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Có thể bỏ trống để xem toàn bộ lớp trong ngày, hoặc chọn nhiều tiết để thu hẹp phạm vi.
                      </p>
                    </div>
                    {selectedTiet.length > 0 && (
                      <Badge variant="secondary">{selectedTiet.length} tiết</Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {tietGroups.map((group) => {
                      const allGroupSelected = group.tiets.every((t) => selectedTiet.includes(t));

                      return (
                        <div key={group.label} className="rounded-xl border bg-muted/15 p-2.5 sm:p-3">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-sm font-medium text-foreground">{group.label}</div>
                              <div className="text-xs text-muted-foreground">{group.timeRange}</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="justify-start sm:justify-center"
                              onClick={() => {
                                if (allGroupSelected) {
                                  setSelectedTiet((prev) => prev.filter((t) => !group.tiets.includes(t)));
                                } else {
                                  setSelectedTiet((prev) => [...new Set([...prev, ...group.tiets])].sort((a, b) => a - b));
                                }
                              }}
                            >
                              {allGroupSelected ? 'Bỏ chọn buổi' : 'Chọn cả buổi'}
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:overflow-visible sm:pb-0">
                            {group.tiets.map((tiet) => (
                              <button
                                key={tiet}
                                onClick={() => toggleTiet(tiet)}
                                title={`${tietTimeMap[tiet].start} - ${tietTimeMap[tiet].end}`}
                                className={cn(
                                  "min-w-0 rounded-xl border px-2 py-2 text-xs font-medium transition-all sm:min-w-[64px] sm:shrink-0",
                                  selectedTiet.includes(tiet)
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <div className="font-bold">Tiết {tiet}</div>
                                <div className="mt-0.5 text-[10px] opacity-80">{tietTimeMap[tiet].start}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl border bg-primary/5 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">Chế độ lọc khung tiết</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedTiet.length > 0
                            ? `${selectedTietSummary} • ${selectedTietRange}`
                            : 'Chưa chọn tiết, hệ thống sẽ lấy toàn bộ lớp trong ngày.'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 rounded-xl bg-background p-1 sm:flex sm:gap-1">
                        <button
                          onClick={() => setStrictTietFilter(false)}
                          className={cn(
                            "w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            !strictTietFilter
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent"
                          )}
                        >
                          Có overlap
                        </button>
                        <button
                          onClick={() => setStrictTietFilter(true)}
                          className={cn(
                            "w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            strictTietFilter
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent"
                          )}
                        >
                          Chỉ trong range
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      VD nếu chọn tiết 7-9: chế độ "Có overlap" vẫn giữ lớp 7-11, còn "Chỉ trong range" thì chỉ lấy lớp nằm hoàn toàn trong 7-9.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden flex-col gap-3 rounded-2xl border bg-background p-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">Sẵn sàng tìm lớp học</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedDay === null
                      ? 'Hãy chọn ít nhất một ngày để bắt đầu duyệt lịch giảng dạy.'
                      : `Bạn đang duyệt ${dayNames[selectedDay]} • ${selectedTietSummary} • ${selectedCampusMeta.label}.`}
                  </p>
                </div>
                <Button
                  onClick={searchByTime}
                  disabled={loading || selectedDay === null}
                  className="h-11 w-full sm:min-w-[180px] sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Tìm lớp học
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader className="space-y-4 pb-3">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Kết quả tìm kiếm
                {hasServerResults && (
                  <Badge variant="secondary" className="ml-1">
                    {visibleResultsCount}/{totalResultsCount} {searchTab === 'time' ? 'lớp' : 'môn'}
                  </Badge>
                )}
              </CardTitle>
              {searchTab === 'time' && selectedDay !== null && timeResults.length > 0 && (
                <CardDescription>
                  Các lớp học vào {dayNames[selectedDay]}
                  {selectedTiet.length > 0 && `, ${selectedTietSummary.toLowerCase()}`}
                  {selectedCampus && `, ${selectedCampusMeta.label}`}
                </CardDescription>
              )}
              {searchTab !== 'time' && searchResults.length > 0 && (
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
                    onChange={(e) => setResultsQuery(e.target.value)}
                    placeholder={resultsFilterPlaceholder}
                    className="h-11 pl-9 pr-20"
                  />
                  {resultsQuery.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 h-8 -translate-y-1/2"
                      onClick={() => setResultsQuery('')}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <ListFilter className="h-3.5 w-3.5" />
                  Search này chỉ lọc trên kết quả đã tải, không gọi lại server.
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30">
              <AlertDescription className="text-amber-800 dark:text-amber-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && searchResults.length === 0 && timeResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa có kết quả tìm kiếm
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTab === 'time'
                  ? 'Chọn ngày và tiết học để xem các lớp đang dạy'
                  : 'Nhập mã môn học hoặc tên giảng viên để tìm kiếm'
                }
              </p>
            </div>
          )}

          {!loading && !error && hasServerResults && !hasFilteredResults && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">Không có kết quả phù hợp bộ lọc hiển thị</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Thử từ khóa ngắn hơn hoặc tìm theo mã môn, tên môn, giảng viên, nhóm, phòng học và khung tiết.
              </p>
              <Button variant="ghost" className="mt-3" onClick={() => setResultsQuery('')}>
                Xóa bộ lọc hiển thị
              </Button>
            </div>
          )}

          {/* Time Results - Compact list */}
          {!loading && searchTab === 'time' && filteredTimeResults.length > 0 && (
            <div className="space-y-2">
              {filteredTimeResults.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <Badge variant="default" className="font-mono">
                      {item.maMonHoc}
                    </Badge>
                    <Badge variant="outline">
                      Nhóm {item.group}
                    </Badge>
                    {item.classInfo.map((ci, ciIdx) => (
                      <Badge key={ciIdx} variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Tiết {ci.tietHoc.join('-')}
                        <span className="text-primary font-medium ml-1">
                          ({getTietTimeRange(ci.tietHoc)})
                        </span>
                        <span className="mx-1">•</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        {ci.phong}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{item.tenMonHoc}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span>
                      <User className="h-3 w-3 inline mr-1" />
                      GV: {item.giangVien}
                    </span>
                    {item.email && (
                      <a href={`mailto:${item.email}`} className="hover:text-primary">
                        <Mail className="h-3 w-3 inline mr-1" />
                        {item.email}
                      </a>
                    )}
                    <span>
                      <Users className="h-3 w-3 inline mr-1" />
                      {item.siso}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular Results */}
          {!loading && searchTab !== 'time' && filteredSearchResults.length > 0 && (
            <div className="space-y-4">
              {filteredSearchResults.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-2 bg-primary shrink-0" />
                    <div className="flex-1 p-4">
                      {/* Course Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-bold text-base text-primary">
                            {result.maMonHoc}
                          </h4>
                          <p className="text-sm text-foreground">{result.tenMonHoc}</p>
                        </div>
                        {result.soTinChi > 0 && (
                          <Badge variant="secondary">{result.soTinChi} TC</Badge>
                        )}
                      </div>

                      {/* Class Groups */}
                      <div className="space-y-3">
                        {result.lichHoc.map((lh, lhIndex) => (
                          <div
                            key={lhIndex}
                            className="border rounded-lg p-3 bg-muted/20"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Group Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-bold">
                                    Nhóm {lh.group}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {lh.siso} SV
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {lh.ngonNgu}
                                  </span>
                                </div>

                                {/* Lecturer LT */}
                                <div className="text-sm">
                                  <span className="font-medium">GV Lý thuyết: </span>
                                  <span>{lh.giangVien || 'Chưa phân công'}</span>
                                </div>
                                {lh.email && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${lh.email}`} className="hover:text-primary">
                                      {lh.email}
                                    </a>
                                  </div>
                                )}
                                {lh.phone && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {lh.phone}
                                  </div>
                                )}

                                {/* Lecturer BT */}
                                {lh.giangVienBT && lh.giangVienBT !== lh.giangVien && (
                                  <div className="pt-2 border-t">
                                    <div className="text-sm">
                                      <span className="font-medium">GV Bài tập: </span>
                                      <span>{lh.giangVienBT}</span>
                                    </div>
                                    {lh.emailBT && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <a href={`mailto:${lh.emailBT}`} className="hover:text-primary">
                                          {lh.emailBT}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Right: Schedule */}
                              <div>
                                <p className="text-sm font-medium mb-2">Lịch học:</p>
                                {lh.classInfo && lh.classInfo.length > 0 ? (
                                  <div className="space-y-1">
                                    {lh.classInfo.map((ci, ciIndex) => (
                                      <div
                                        key={ciIndex}
                                        className="flex flex-wrap items-center gap-2 text-sm bg-background rounded px-2 py-1.5"
                                      >
                                        <Badge variant="default" className="text-xs">
                                          {dayNames[ci.dayOfWeek] || ci.dayOfWeek}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          Tiết {ci.tietHoc.join('-')}
                                          <span className="text-primary font-medium">
                                            ({getTietTimeRange(ci.tietHoc)})
                                          </span>
                                        </span>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          {ci.phong} ({ci.coSo?.trim()})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Chưa có lịch học
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TeachingScheduleTab;
