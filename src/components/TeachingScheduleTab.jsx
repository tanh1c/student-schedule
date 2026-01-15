import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  GraduationCap,
  Search,
  Calendar,
  Mail,
  Phone,
  Users,
  MapPin,
  Clock,
  BookOpen,
  User,
  Loader2
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Lịch giảng dạy</h2>
          <p className="text-sm text-muted-foreground">Tra cứu lịch dạy theo môn học hoặc giảng viên</p>
        </div>
      </div>

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTabChange('code')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                searchTab === 'code'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Theo mã môn
            </button>
            <button
              onClick={() => handleTabChange('lecturer')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                searchTab === 'lecturer'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <User className="h-4 w-4 inline mr-2" />
              Theo giảng viên
            </button>
            <button
              onClick={() => handleTabChange('time')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                searchTab === 'time'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Theo thời gian
            </button>
          </div>

          {/* Search Input - For code and lecturer tabs */}
          {(searchTab === 'code' || searchTab === 'lecturer') && (
            <div className="flex gap-3">
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
                className="h-11 px-6"
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
            <div className="space-y-4">
              {/* Day Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Chọn ngày trong tuần:</label>
                <div className="flex flex-wrap gap-2">
                  {dayOrder.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[70px]",
                        selectedDay === day
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {dayNames[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiết Selection với khung giờ */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chọn tiết học (có thể chọn nhiều, hoặc bỏ trống để xem tất cả):
                </label>

                {/* Nhóm theo buổi */}
                <div className="space-y-3">
                  {tietGroups.map((group) => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {group.label}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          ({group.timeRange})
                        </span>
                        <button
                          onClick={() => {
                            // Toggle all tiets in this group
                            const allSelected = group.tiets.every(t => selectedTiet.includes(t));
                            if (allSelected) {
                              setSelectedTiet(prev => prev.filter(t => !group.tiets.includes(t)));
                            } else {
                              setSelectedTiet(prev => [...new Set([...prev, ...group.tiets])].sort((a, b) => a - b));
                            }
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {group.tiets.every(t => selectedTiet.includes(t)) ? 'Bỏ chọn' : 'Chọn tất cả'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.tiets.map((tiet) => (
                          <button
                            key={tiet}
                            onClick={() => toggleTiet(tiet)}
                            title={`${tietTimeMap[tiet].start} - ${tietTimeMap[tiet].end}`}
                            className={cn(
                              "flex flex-col items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[52px]",
                              selectedTiet.includes(tiet)
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            )}
                          >
                            <span className="font-bold">Tiết {tiet}</span>
                            <span className="text-[10px] opacity-80">
                              {tietTimeMap[tiet].start}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTiet.length > 0 && (
                  <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                    <p className="text-xs font-medium text-primary">
                      Đã chọn: Tiết {selectedTiet.join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Từ {tietTimeMap[selectedTiet[0]]?.start} đến {tietTimeMap[selectedTiet[selectedTiet.length - 1]]?.end}
                    </p>
                  </div>
                )}
              </div>

              {/* Campus Selection - Based on building names */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Cơ sở (lọc theo tòa nhà):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '', label: 'Tất cả' },
                    { value: '1', label: 'CS1 (A, B, C)' },
                    { value: '2', label: 'CS2 (H)' }
                  ].map((campus) => (
                    <button
                      key={campus.value}
                      onClick={() => setSelectedCampus(campus.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        selectedCampus === campus.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {campus.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CS1: Tòa A1-A5, B1-B12, C1-C6 | CS2: Tòa H1-H6
                </p>
              </div>

              {/* Filter Mode - Chỉ hiện khi đã chọn tiết */}
              {selectedTiet.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Chế độ lọc tiết:</label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {strictTietFilter
                          ? 'Chỉ hiện lớp có tất cả tiết nằm trong range đã chọn'
                          : 'Hiện lớp có bất kỳ tiết nào trong range đã chọn'
                        }
                      </p>
                    </div>
                    <div className="flex gap-1 bg-background rounded-lg p-1">
                      <button
                        onClick={() => setStrictTietFilter(false)}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-medium transition-all",
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
                          "px-3 py-1.5 rounded text-xs font-medium transition-all",
                          strictTietFilter
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent"
                        )}
                      >
                        Chỉ trong range
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    💡 VD: Chọn tiết 7-9, mode "{strictTietFilter ? 'Chỉ trong range' : 'Có overlap'}":
                    {strictTietFilter
                      ? ' Lớp 7-8 ✓, Lớp 7-11 ✗'
                      : ' Lớp 7-8 ✓, Lớp 7-11 ✓'
                    }
                  </p>
                </div>
              )}

              {/* Search Button */}
              <Button
                onClick={searchByTime}
                disabled={loading || selectedDay === null}
                className="w-full h-11"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Tìm lớp học
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kết quả tìm kiếm
            {searchTab === 'time' && timeResults.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {timeResults.length} lớp
              </Badge>
            )}
            {searchTab !== 'time' && searchResults.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {searchResults.length} môn
              </Badge>
            )}
          </CardTitle>
          {searchTab === 'time' && selectedDay !== null && timeResults.length > 0 && (
            <CardDescription>
              Các lớp học vào {dayNames[selectedDay]}
              {selectedTiet.length > 0 && `, tiết ${selectedTiet.join(', ')}`}
              {selectedCampus && ` tại CS${selectedCampus}`}
            </CardDescription>
          )}
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

          {/* Time Results - Compact list */}
          {!loading && searchTab === 'time' && timeResults.length > 0 && (
            <div className="space-y-2">
              {timeResults.map((item, index) => (
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
          {!loading && searchTab !== 'time' && searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
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
