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
const dayNames = ['', 'CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function TeachingScheduleTab() {
  const [searchTab, setSearchTab] = useState('code'); // 'code' | 'lecturer'
  const [courseCode, setCourseCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setCourseCode('');
    setLecturerName('');
    setSearchResults([]);
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
      searchTab === 'code' ? searchByCode() : searchByLecturer();
    }
  };

  // Filter suggestions
  const filteredSubjects = allSubjects.filter(s =>
    s.id.toLowerCase().includes(courseCode.toLowerCase()) ||
    s.name.toLowerCase().includes(courseCode.toLowerCase())
  ).slice(0, 8);

  const filteredLecturers = allLecturers.filter(l =>
    l.name.toLowerCase().includes(lecturerName.toLowerCase())
  ).slice(0, 8);

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
          <div className="flex gap-2">
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
          </div>

          {/* Search Input */}
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
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kết quả tìm kiếm
            {searchResults.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {searchResults.length} môn
              </Badge>
            )}
          </CardTitle>
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
          {!loading && !error && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa có kết quả tìm kiếm
              </h3>
              <p className="text-sm text-muted-foreground">
                Nhập mã môn học hoặc tên giảng viên để tìm kiếm
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && searchResults.length > 0 && (
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
                                        className="flex items-center gap-2 text-sm bg-background rounded px-2 py-1.5"
                                      >
                                        <Badge variant="default" className="text-xs">
                                          {dayNames[ci.dayOfWeek] || ci.dayOfWeek}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          Tiết {ci.tietHoc.join('-')}
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
