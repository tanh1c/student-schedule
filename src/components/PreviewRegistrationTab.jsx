import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  Eye,
  Info,
  MapPin,
  BookOpen
} from 'lucide-react';
import { getSubjectColor } from '../utils/scheduleParser';
import { cn } from '@/lib/utils';

const timeSlots = [
  { id: 1, label: 'Tiết 1', time: '06:00-06:50' },
  { id: 2, label: 'Tiết 2', time: '07:00-07:50' },
  { id: 3, label: 'Tiết 3', time: '08:00-08:50' },
  { id: 4, label: 'Tiết 4', time: '09:00-09:50' },
  { id: 5, label: 'Tiết 5', time: '10:00-10:50' },
  { id: 6, label: 'Tiết 6', time: '11:00-11:50' },
  { id: 7, label: 'Tiết 7', time: '12:00-12:50' },
  { id: 8, label: 'Tiết 8', time: '13:00-13:50' },
  { id: 9, label: 'Tiết 9', time: '14:00-14:50' },
  { id: 10, label: 'Tiết 10', time: '15:00-15:50' },
  { id: 11, label: 'Tiết 11', time: '16:00-16:50' },
  { id: 12, label: 'Tiết 12', time: '17:00-17:50' },
  { id: 13, label: 'Tiết 13', time: '18:00-18:50' },
  { id: 14, label: 'Tiết 14', time: '18:50-19:40' },
  { id: 15, label: 'Tiết 15', time: '19:40-20:30' },
  { id: 16, label: 'Tiết 16', time: '20:30-21:10' },
];

const daysOfWeek = [
  { id: 2, label: 'Thứ 2', short: 'T2' },
  { id: 3, label: 'Thứ 3', short: 'T3' },
  { id: 4, label: 'Thứ 4', short: 'T4' },
  { id: 5, label: 'Thứ 5', short: 'T5' },
  { id: 6, label: 'Thứ 6', short: 'T6' },
  { id: 7, label: 'Thứ 7', short: 'T7' },
];

function PreviewRegistrationTab() {
  const [registrationInput, setRegistrationInput] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [previewData, setPreviewData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(2);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    const weekNumber = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    setCurrentWeek(weekNumber);
  }, []);

  const parseRegistrationInput = (input) => {
    const lines = input.split('\n');
    const parsed = [];
    let currentSubject = null;

    lines.forEach(line => {
      line = line.trim();

      if (line.match(/^[A-Z]{2}\d+/)) {
        const parts = line.split(' - ');
        if (parts.length >= 2) {
          currentSubject = {
            code: parts[0].trim(),
            name: parts[1].trim(),
            classes: []
          };
        }
      }

      if (line.includes('Thứ') && currentSubject) {
        const scheduleInfo = {
          day: 2,
          periods: [1, 2, 3],
          room: 'H1-101',
          weeks: '1-16'
        };
        currentSubject.classes.push(scheduleInfo);
        parsed.push(currentSubject);
      }
    });

    return parsed;
  };

  const generatePreviewSchedule = () => {
    const parsed = parseRegistrationInput(registrationInput);
    setPreviewData(parsed);
  };

  // Desktop Schedule View
  const renderDesktopSchedule = () => {
    const ROW_HEIGHT = 60;

    const getCoursesForDay = (dayId) => {
      return previewData.filter(subject =>
        subject.classes.some(cls => cls.day === dayId)
      );
    };

    return (
      <div className="hidden md:block border rounded-xl overflow-hidden bg-background shadow-sm">
        <ScrollArea className="w-full">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-[70px_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/40 font-medium">
              <div className="p-2 border-r text-center text-sm font-bold">Tiết</div>
              {daysOfWeek.map((day) => (
                <div key={day.id} className="p-2 border-r last:border-r-0 text-center text-sm font-bold text-primary">
                  {day.label}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="relative">
              {timeSlots.slice(0, 12).map((slot) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-[70px_1fr_1fr_1fr_1fr_1fr_1fr] border-b last:border-b-0"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  <div className="p-1 border-r bg-muted/10 text-center flex flex-col justify-center items-center">
                    <span className="font-bold text-xs">{slot.label}</span>
                    <span className="text-[9px] text-muted-foreground">{slot.time}</span>
                  </div>
                  {daysOfWeek.map((day) => {
                    const coursesInSlot = previewData.filter(subject =>
                      subject.classes.some(cls =>
                        cls.day === day.id && cls.periods.includes(slot.id)
                      )
                    );

                    return (
                      <div key={day.id} className="border-r last:border-r-0 p-0.5">
                        {coursesInSlot.map((subject, idx) => (
                          <div
                            key={idx}
                            className="h-full rounded text-white text-[10px] p-1 flex flex-col justify-center"
                            style={{ backgroundColor: getSubjectColor(subject.code) }}
                          >
                            <span className="font-bold">{subject.code}</span>
                            <span className="opacity-80 truncate">{subject.classes[0]?.room}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  // Mobile Schedule View
  const renderMobileSchedule = () => {
    const coursesForDay = previewData.filter(subject =>
      subject.classes.some(cls => cls.day === selectedDay)
    );

    return (
      <div className="md:hidden">
        {/* Day Selector */}
        <ScrollArea className="w-full mb-4">
          <div className="flex gap-2 pb-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                  selectedDay === day.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {day.short}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        {/* Courses */}
        {coursesForDay.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Không có môn học trong ngày này</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coursesForDay.map((subject, idx) => (
              <Card key={idx} className="overflow-hidden">
                <div className="flex">
                  <div
                    className="w-2 shrink-0"
                    style={{ backgroundColor: getSubjectColor(subject.code) }}
                  />
                  <CardContent className="p-3 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm">{subject.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {subject.code}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {subject.classes[0]?.room || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Tiết {subject.classes[0]?.periods?.join('-')}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p>Ngày: <span className="font-medium">{currentDate.toLocaleDateString('vi-VN')}</span></p>
              <p>Tuần: <span className="font-medium">{currentWeek}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Hướng dẫn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dán nội dung từ trang đăng ký môn học vào ô bên dưới để xem trước thời khóa biểu.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Nhập dữ liệu đăng ký
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={`Dán nội dung đăng ký môn từ trang ĐKMH vào đây...

Ví dụ:
CO3101 - Đồ án tổng hợp
Nhóm: CC01 | Phòng: H1-101
Thứ 2, Tiết 1-3, Tuần 1-16`}
            rows={6}
            value={registrationInput}
            onChange={(e) => setRegistrationInput(e.target.value)}
            className="mb-3 font-mono text-sm"
          />
          <Button onClick={generatePreviewSchedule} disabled={!registrationInput.trim()}>
            <Eye className="h-4 w-4 mr-2" />
            Tạo Preview Thời Khóa Biểu
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Preview Thời Khóa Biểu
            {previewData.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {previewData.length} môn
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <Eye className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa có dữ liệu preview
              </h3>
              <p className="text-sm text-muted-foreground">
                Nhập và nhấn "Tạo Preview" để xem thời khóa biểu
              </p>
            </div>
          ) : (
            <>
              {/* Subject list */}
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm font-medium mb-2">Danh sách môn đã đăng ký:</p>
                <div className="flex flex-wrap gap-2">
                  {previewData.map((subject, idx) => (
                    <Badge
                      key={idx}
                      className="text-white"
                      style={{ backgroundColor: getSubjectColor(subject.code) }}
                    >
                      {subject.code} - {subject.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              {renderDesktopSchedule()}
              {renderMobileSchedule()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PreviewRegistrationTab;
