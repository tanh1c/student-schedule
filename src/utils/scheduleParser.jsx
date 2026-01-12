// Utility functions for parsing schedule data
// Converted from original script.js

// Hàm phân tích chuỗi tuần học (theo logic code cũ)
export const parseWeeks = (weeksStr) => {
  const weeks = [];
  const parts = weeksStr.split('|');

  parts.forEach(part => {
    if (part === '--') return;

    if (part.includes('-')) {
      const [start, end] = part.split('-').map(w => parseInt(w));
      for (let i = start; i <= end; i++) {
        weeks.push(i);
      }
    } else if (part) {
      weeks.push(parseInt(part));
    }
  });

  return weeks;
};

export const parseScheduleData = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const scheduleData = [];
  const lines = input.trim().split('\n');

  lines.forEach(line => {
    const columns = line.split('\t');
    if (columns.length >= 12) {
      const [_semester, code, name, credits, _feeCredits, group, day, periods, time, room, location, weeks] = columns;

      // Bỏ qua các môn không có thời gian học cụ thể (theo logic code cũ)
      if (day === '--' || periods === '--') {
        return;
      }

      // Xử lý thông tin tiết học
      const [startPeriod] = periods.split(' - ').map(p => parseInt(p));

      // Xử lý thời gian học
      const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const [_, startHour, startMin, endHour, endMin] = timeMatch;

        // Tính số tiết dựa trên thời gian thực tế (theo logic code cũ)
        const startMinutes = parseInt(startHour) * 60 + parseInt(startMin);
        const endMinutes = parseInt(endHour) * 60 + parseInt(endMin);
        const durationInMinutes = endMinutes - startMinutes;
        const numberOfPeriods = Math.ceil(durationInMinutes / 50); // Mỗi tiết 50 phút

        // Xử lý tuần học
        const weekList = parseWeeks(weeks);

        scheduleData.push({
          code: code,
          name: name,
          day: parseInt(day),
          startPeriod: startPeriod,
          endPeriod: startPeriod + numberOfPeriods - 2,
          room: room,
          credits: parseInt(credits) || 0,
          time: time,
          group: group,
          location: location,
          weeks: weekList,
          // Thêm schedule array để tương thích với component
          schedule: [{
            day: parseInt(day),
            periods: Array.from({ length: numberOfPeriods }, (_, i) => startPeriod + i),
            room: room,
            time: time,
            campus: location,
            weeks: weekList,
            group: group
          }]
        });
      }
    }
  });

  return scheduleData;
};

export const parseExamData = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const examData = [];
  const lines = input.trim().split('\n');

  lines.forEach(line => {
    const columns = line.split('\t');
    if (columns.length >= 11) {
      // Format: HỌC KỲ | MÔN HỌC | NHÓM | NGÀY THI | LOẠI THI | ĐỊA ĐIỂM | PHÒNG | THỨ | GIỜ | THỜI LƯỢNG | CẬP NHẬT
      const [semester, subject, group, examDate, examType, location, room, day, startTime, duration, _lastUpdate] = columns;

      // Tách mã môn và tên môn
      const subjectParts = subject.split(' - ');
      const code = subjectParts[0];
      const name = subjectParts.length > 1 ? subjectParts[1] : subject;

      // Định dạng lại thời gian (từ 07g00 thành 07:00)
      const formattedTime = startTime.replace('g', ':');

      // Chuyển đổi ngày thi sang đối tượng Date để sắp xếp
      const date = new Date(examDate);

      examData.push({
        code: code,
        name: name,
        group: group,
        rawDate: examDate, // Lưu ngày gốc để sắp xếp
        examDate: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        }),
        examType: examType, // Đây sẽ là CK, GK, TH, VĐ
        location: location,
        room: room,
        time: formattedTime,
        duration: duration + ' phút',
        subjectCode: code,
        subjectName: name,
        classGroup: group,
        semester: semester,
        day: day
      });
    }
  });

  // Sắp xếp theo ngày thi và thời gian (theo logic code cũ)
  examData.sort((a, b) => {
    // So sánh ngày trước
    const dateCompare = new Date(a.rawDate) - new Date(b.rawDate);
    if (dateCompare !== 0) return dateCompare;

    // Nếu cùng ngày, so sánh giờ
    return a.time.localeCompare(b.time);
  });

  return examData;
};

export const parseRegistrationData = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const lines = input.split('\n').map(line => line.trim()).filter(line => line);
  const subjects = [];
  let currentSubject = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains subject code and name
    const subjectMatch = line.match(/^(\d+[A-Z]+\d+)\s*-\s*(.+?)(?:\s*-\s*(.+))?$/);
    if (subjectMatch) {
      if (currentSubject) {
        subjects.push(currentSubject);
      }

      currentSubject = {
        code: subjectMatch[1],
        name: subjectMatch[2],
        type: subjectMatch[3] || '',
        classes: [],
        schedule: []
      };
      continue;
    }

    // Parse schedule with "Chưa biết" or actual schedule
    if (line.includes('Chưa biết') || line.match(/^(Thứ\s+\d+)/)) {
      if (currentSubject) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          currentSubject.schedule.push({
            day: parts[0] === 'Chưa biết' ? 'TBA' : parts[0],
            periods: parts[1] === '--' ? 'TBA' : parts[1],
            room: parts[2] === '------' ? 'TBA' : parts[2],
            campus: parts[3] || '',
            type: parts[4] || '',
            weeks: parts[5] || ''
          });
        }
      }
    }

    // Parse class information
    const classMatch = line.match(/^([A-Z]{2}\d{2})\s+(\d+\/\d+)\s+([VE])\s+([A-Z]{2}\d{2})\s*(.*)$/);
    if (classMatch && currentSubject) {
      currentSubject.classes.push({
        group: classMatch[1],
        capacity: classMatch[2],
        language: classMatch[3],
        lectureGroup: classMatch[4],
        instructor: classMatch[5] || ''
      });
    }
  }

  // Add the last subject
  if (currentSubject) {
    subjects.push(currentSubject);
  }

  return subjects;
};

// Helper function to get current week number (semester week)
export const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  // Add 1 to match school's semester week numbering
  return Math.ceil(diff / oneWeek) + 1;
};

// Map lưu trữ màu sắc cho mỗi mã môn học (theo logic code cũ)
const courseColors = new Map();

// Danh sách màu cố định cho các môn học (tương thích dark mode)
const predefinedColors = [
  '#e91e63',   // Pink
  '#2196f3',   // Blue
  '#ff9800',   // Orange
  '#4caf50',   // Green
  '#9c27b0',   // Purple
  '#ff5722',   // Deep Orange
  '#607d8b',   // Blue Grey
  '#3f51b5',   // Indigo
  '#f44336',   // Red
  '#009688',   // Teal
  '#795548',   // Brown
  '#ffc107',   // Amber
];

// Hàm lấy màu cho môn học (theo logic code cũ)
export const getSubjectColor = (courseCode) => {
  if (!courseColors.has(courseCode)) {
    const colorIndex = courseColors.size % predefinedColors.length;
    courseColors.set(courseCode, predefinedColors[colorIndex]);
  }
  return courseColors.get(courseCode);
};

// Helper function to format time slots
export const formatTimeSlot = (period) => {
  const timeSlots = {
    1: '06:00 - 06:50',
    2: '07:00 - 07:50',
    3: '08:00 - 08:50',
    4: '09:00 - 09:50',
    5: '10:00 - 10:50',
    6: '11:00 - 11:50',
    7: '12:00 - 12:50',
    8: '13:00 - 13:50',
    9: '14:00 - 14:50',
    10: '15:00 - 15:50',
    11: '16:00 - 16:50',
    12: '17:00 - 17:50',
    13: '18:00 - 18:50',
    14: '18:50 - 19:40',
    15: '19:40 - 20:30',
    16: '20:30 - 21:10'
  };

  return timeSlots[period] || `Tiết ${period}`;
};
