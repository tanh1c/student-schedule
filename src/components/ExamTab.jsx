import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  RefreshCcw,
  AlertCircle,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import mybkApi from "../services/mybkApi";

export default function ExamTab() {
  // Load cached data from localStorage
  const [exams, setExams] = useState(() => {
    try {
      const cached = localStorage.getItem('examSchedule');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(() => {
    const cached = localStorage.getItem('examSelectedYear');
    return cached ? parseInt(cached) : new Date().getFullYear();
  });
  const [selectedSemester, setSelectedSemester] = useState(() => {
    const cached = localStorage.getItem('examSelectedSemester');
    return cached ? parseInt(cached) : 1;
  });
  const [studentId, setStudentId] = useState('');
  const [lastFetchKey, setLastFetchKey] = useState(() => {
    return localStorage.getItem('examLastFetchKey') || '';
  });

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  // Get student ID on mount
  useEffect(() => {
    const initStudentId = async () => {
      let userData = mybkApi.getUserData();
      console.log('[ExamTab] Initial userData:', userData);

      // Try to extract MSSV from various possible locations
      let mssv = extractMSSV(userData);

      // If no local data, try to fetch from API
      if (!mssv && mybkApi.isAuthenticated()) {
        console.log('[ExamTab] No MSSV found, fetching from API...');
        const infoRes = await mybkApi.getStudentInfo();
        console.log('[ExamTab] getStudentInfo result:', infoRes);

        if (infoRes.success && infoRes.data) {
          // Use the data directly from the response
          mssv = extractMSSV(infoRes.data);
        }
      }

      console.log('[ExamTab] Final MSSV:', mssv);
      setStudentId(mssv);
    };

    // Helper to extract MSSV from various data structures
    const extractMSSV = (data) => {
      if (!data) return '';
      // Try different field names and structures
      // API returns MSSV in 'code' field!
      return data.code ||
        data.MSSV ||
        data.mssv ||
        data.data?.code ||
        data.data?.MSSV ||
        data.studentId ||
        '';
    };

    initStudentId();
  }, []);

  // Save year/semester selection to localStorage
  useEffect(() => {
    localStorage.setItem('examSelectedYear', selectedYear.toString());
    localStorage.setItem('examSelectedSemester', selectedSemester.toString());
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    if (studentId) {
      // Create a key to check if we need to refetch
      const fetchKey = `${studentId}-${selectedYear}-${selectedSemester}`;

      // Only fetch if the key changed or we have no cached data
      if (fetchKey !== lastFetchKey || exams.length === 0) {
        fetchExamSchedule(fetchKey);
      }
    }
  }, [studentId, selectedYear, selectedSemester]);

  const fetchExamSchedule = async (fetchKey) => {
    if (!studentId) {
      setError('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mybkApi.getExamSchedule(studentId, selectedYear, selectedSemester);

      if (result.success) {
        // Sort exams by date
        const sortedExams = (result.data || []).sort((a, b) =>
          new Date(a.NGAYTHI) - new Date(b.NGAYTHI)
        );
        setExams(sortedExams);

        // Save to localStorage
        localStorage.setItem('examSchedule', JSON.stringify(sortedExams));
        if (fetchKey) {
          localStorage.setItem('examLastFetchKey', fetchKey);
          setLastFetchKey(fetchKey);
        }
      } else {
        setError(result.error || 'Không thể lấy lịch thi');
      }
    } catch (e) {
      console.error('Error fetching exam schedule:', e);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
    return { formatted: `${day}/${month}/${year}`, weekday };
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getExamStatus = (dateStr) => {
    const days = getDaysUntil(dateStr);
    if (days === null) return 'unknown';
    if (days < 0) return 'passed';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    if (days <= 7) return 'upcoming';
    return 'future';
  };

  const getStatusBadge = (status, days) => {
    switch (status) {
      case 'passed':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã thi
          </Badge>
        );
      case 'today':
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Hôm nay!
          </Badge>
        );
      case 'soon':
        return (
          <Badge className="bg-orange-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Còn {days} ngày
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-blue-500 text-white">
            <Calendar className="h-3 w-3 mr-1" />
            Còn {days} ngày
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Còn {days} ngày
          </Badge>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Lịch Thi
          </h2>
          {studentId && (
            <p className="text-muted-foreground text-sm mt-1">
              MSSV: {studentId}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Academic Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}-{String(year + 1).slice(-2)}
              </option>
            ))}
          </select>

          {/* Semester Selector */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
            <option value={3}>Học kỳ hè</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchExamSchedule(`${studentId}-${selectedYear}-${selectedSemester}`)}
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{exams.length}</div>
              <div className="text-xs text-muted-foreground">Tổng môn thi</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {exams.filter(e => getExamStatus(e.NGAYTHI) === 'soon').length}
              </div>
              <div className="text-xs text-muted-foreground">Sắp thi (3 ngày)</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {exams.filter(e => getExamStatus(e.NGAYTHI) === 'passed').length}
              </div>
              <div className="text-xs text-muted-foreground">Đã thi</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {exams.reduce((sum, e) => sum + (e.SOTC || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Tổng tín chỉ</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải lịch thi...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && exams.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Chưa có lịch thi</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Không tìm thấy lịch thi cho học kỳ {selectedSemester} năm {selectedYear}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exam List */}
      {!loading && exams.length > 0 && (
        <div className="space-y-3">
          {exams.map((exam, index) => {
            const { formatted, weekday } = formatDate(exam.NGAYTHI);
            const days = getDaysUntil(exam.NGAYTHI);
            const status = getExamStatus(exam.NGAYTHI);
            const isPassed = status === 'passed';

            return (
              <Card
                key={exam.ID || index}
                className={`transition-all hover:shadow-md ${isPassed ? 'opacity-60' : ''
                  } ${status === 'today' ? 'ring-2 ring-red-500' : ''} ${status === 'soon' ? 'ring-2 ring-orange-400' : ''
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Date Section */}
                    <div className={`flex-shrink-0 w-20 text-center p-3 rounded-lg ${isPassed ? 'bg-gray-100' :
                      status === 'today' ? 'bg-red-100' :
                        status === 'soon' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                      <div className={`text-xs font-medium ${isPassed ? 'text-gray-500' :
                        status === 'today' ? 'text-red-600' :
                          status === 'soon' ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                        {weekday}
                      </div>
                      <div className={`text-2xl font-bold ${isPassed ? 'text-gray-600' :
                        status === 'today' ? 'text-red-700' :
                          status === 'soon' ? 'text-orange-700' : 'text-blue-700'
                        }`}>
                        {formatted.split('/')[0]}
                      </div>
                      <div className={`text-xs ${isPassed ? 'text-gray-500' :
                        status === 'today' ? 'text-red-600' :
                          status === 'soon' ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                        Tháng {formatted.split('/')[1]}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-primary">
                              {exam.MAMONHOC}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {exam.SOTC} TC
                            </Badge>
                            {exam.LOAITHI && (
                              <Badge className={
                                exam.LOAITHI === 'CK'
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                              }>
                                {exam.LOAITHI === 'CK' ? 'Cuối kỳ' : exam.LOAITHI}
                              </Badge>
                            )}
                          </div>
                          <h3 className={`font-medium mt-1 ${isPassed ? 'line-through text-muted-foreground' : ''}`}>
                            {exam.TENMONHOC}
                          </h3>
                        </div>
                        {getStatusBadge(status, days)}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.GIOBD} ({exam.GIO_SOPHUT} phút)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {exam.MAPHONG} - {exam.MACOSO}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {exam.NHOMLOP}
                        </span>
                      </div>

                      {/* Seat number if available */}
                      {exam.NLMHSV_STT && (
                        <div className="mt-2 pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            Số báo danh: {exam.NLMHSV_STT}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
