import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Preview as PreviewIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const timeSlots = [
  '1 (06:00 - 06:50)',
  '2 (07:00 - 07:50)',
  '3 (08:00 - 08:50)',
  '4 (09:00 - 09:50)',
  '5 (10:00 - 10:50)',
  '6 (11:00 - 11:50)',
  '7 (12:00 - 12:50)',
  '8 (13:00 - 13:50)',
  '9 (14:00 - 14:50)',
  '10 (15:00 - 15:50)',
  '11 (16:00 - 16:50)',
  '12 (17:00 - 17:50)',
  '13 (18:00 - 18:50)',
  '14 (18:50 - 19:40)',
  '15 (19:40 - 20:30)',
  '16 (20:30 - 21:10)',
];

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function PreviewRegistrationTab() {
  const [registrationInput, setRegistrationInput] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [previewData, setPreviewData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Calculate current week based on current date
    const now = new Date();
    setCurrentDate(now);
    // This is a simplified calculation - you might want to implement proper week calculation
    const weekNumber = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    setCurrentWeek(weekNumber);
  }, []);

  const parseRegistrationInput = (input) => {
    // This is a simplified parser for registration preview
    // You'll need to implement the full parsing logic based on your original JavaScript code
    const lines = input.split('\n');
    const parsed = [];

    // Example parsing logic - replace with your actual implementation
    let currentSubject = null;

    lines.forEach(line => {
      line = line.trim();

      // Check if line contains subject code and name
      if (line.match(/^\d+[A-Z]+\d+/)) {
        const parts = line.split(' - ');
        if (parts.length >= 2) {
          currentSubject = {
            code: parts[0].trim(),
            name: parts[1].trim(),
            classes: []
          };
        }
      }

      // Check if line contains schedule information
      if (line.includes('Thứ') && currentSubject) {
        // Parse schedule line
        // This is a placeholder - implement actual parsing logic
        const scheduleInfo = {
          day: 2, // Monday
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

  const getSubjectColor = (subjectCode) => {
    // Generate consistent colors for subjects
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    let hash = 0;
    for (let i = 0; i < subjectCode.length; i++) {
      hash = subjectCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderDesktopSchedule = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiết</TableCell>
            {daysOfWeek.map((day) => (
              <TableCell key={day} align="center">
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((slot, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {slot}
              </TableCell>
              {daysOfWeek.map((day, dayIndex) => {
                // Find classes for this time slot and day
                const classesInSlot = previewData.filter(subject =>
                  subject.classes.some(cls =>
                    cls.day === dayIndex + 2 &&
                    cls.periods.includes(index + 1)
                  )
                );

                return (
                  <TableCell key={dayIndex} align="center">
                    {classesInSlot.map((subject, subjectIndex) => (
                      <Chip
                        key={subjectIndex}
                        label={`${subject.code} - ${subject.classes[0]?.room || 'TBA'}`}
                        sx={{
                          backgroundColor: getSubjectColor(subject.code),
                          color: 'white',
                          fontSize: '0.75rem',
                          mb: subjectIndex < classesInSlot.length - 1 ? 0.5 : 0,
                          display: 'block',
                        }}
                      />
                    ))}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileSchedule = () => (
    <Box sx={{ mt: 2 }}>
      <Tabs
        value={selectedDay}
        onChange={(e, newValue) => setSelectedDay(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {daysOfWeek.map((day, index) => (
          <Tab key={index} label={day} />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {timeSlots.map((slot, index) => {
          const classesInSlot = previewData.filter(subject =>
            subject.classes.some(cls =>
              cls.day === selectedDay + 2 &&
              cls.periods.includes(index + 1)
            )
          );

          return (
            <Card key={index} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {slot}
                </Typography>
                {classesInSlot.map((subject, subjectIndex) => (
                  <Chip
                    key={subjectIndex}
                    label={`${subject.code} - ${subject.classes[0]?.room || 'TBA'}`}
                    sx={{
                      backgroundColor: getSubjectColor(subject.code),
                      color: 'white',
                      mt: 1,
                      mr: subjectIndex < classesInSlot.length - 1 ? 1 : 0,
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thông tin hiện tại
              </Typography>
              <Typography variant="body1">
                Ngày hiện tại: {currentDate.toLocaleDateString('vi-VN')}
              </Typography>
              <Typography variant="body1">
                Tuần hiện tại: {currentWeek}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hướng dẫn sử dụng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dán nội dung đăng ký môn từ trang đăng ký môn học vào ô bên dưới để xem trước thời khóa biểu.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview Đăng Ký Môn
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder={`Dán nội dung đăng ký môn từ trang đăng ký môn học vào đây...

Ví dụ:
1CO3101 - Đồ án tổng hợp - ttnt1.0
Nhóm lớp	DK/ Sĩ số	Ngôn ngữ	Nhóm LT	Giảng viên	Nhóm BT	Giảng viên BT/TN	Sĩ số LT	#
CC01	58/60	V	CC01				60	
Thứ	Tiết	Phòng	CS	BT/TN	Tuần học
Chưa biết	--	------	1		12345678-0123456--------------`}
              value={registrationInput}
              onChange={(e) => setRegistrationInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={generatePreviewSchedule}
            >
              Tạo Preview Thời Khóa Biểu
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Preview Thời Khóa Biểu
            </Typography>

            {previewData.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 8,
                  color: 'text.secondary',
                }}
              >
                <PreviewIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">
                  Chưa có dữ liệu preview
                </Typography>
                <Typography variant="body2">
                  Vui lòng nhập dữ liệu đăng ký môn để xem preview thời khóa biểu
                </Typography>
              </Box>
            ) : (
              <>
                {/* Subject list */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Danh sách môn học đã đăng ký:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {previewData.map((subject, index) => (
                      <Chip
                        key={index}
                        label={`${subject.code} - ${subject.name}`}
                        sx={{
                          backgroundColor: getSubjectColor(subject.code),
                          color: 'white',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Schedule display */}
                {isMobile ? renderMobileSchedule() : renderDesktopSchedule()}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PreviewRegistrationTab;
