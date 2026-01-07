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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { parseScheduleData, getSubjectColor, getCurrentWeek } from '../utils/scheduleParser';
import { useScheduleData } from '../hooks/useLocalStorage';

const timeSlots = [
  '1 (06:00-06:50)', '2 (07:00-07:50)', '3 (08:00-08:50)', '4 (09:00-09:50)',
  '5 (10:00-10:50)', '6 (11:00-11:50)', '7 (12:00-12:50)', '8 (13:00-13:50)',
  '9 (14:00-14:50)', '10 (15:00-15:50)', '11 (16:00-16:50)', '12 (17:00-17:50)',
  '13 (18:00-18:50)', '14 (18:50-19:40)', '15 (19:40-20:30)', '16 (20:30-21:10)'
];

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function ScheduleTab() {
  const [scheduleInput, setScheduleInput] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const { scheduleData, setScheduleData, selectedWeek, setSelectedWeek } = useScheduleData();
  

  useEffect(() => {
    setCurrentWeek(getCurrentWeek());
  }, []);

  const generateSchedule = () => {
    const parsed = parseScheduleData(scheduleInput);
    setScheduleData(parsed);
  };

  const goToPreviousWeek = () => setSelectedWeek(prev => Math.max(1, prev - 1));
  const goToNextWeek = () => setSelectedWeek(prev => Math.min(50, prev + 1));
  const goToCurrentWeek = () => setSelectedWeek(currentWeek);

  const getWeekLabel = (weekNum) => {
    if (weekNum >= 35) return `Tuần ${weekNum}`;
    if (weekNum >= 24) return `Tuần ${weekNum}`;
    return `Tuần ${String(weekNum).padStart(2, '0')}`;
  };

  // Desktop Schedule Table
  const renderDesktopSchedule = () => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 100, fontWeight: 600, fontSize: '0.9rem' }}>
              Tiết
            </TableCell>
            {daysOfWeek.map((day) => (
              <TableCell 
                key={day} 
                align="center" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: 'primary.main',
                  minWidth: 180,
                  width: 180
                }}
              >
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((slot, index) => (
            <TableRow key={index} sx={{ height: 100 }}>
              <TableCell sx={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                backgroundColor: 'action.hover',
                borderRight: 1,
                borderColor: 'divider'
              }}>
                {slot}
              </TableCell>
              {daysOfWeek.map((day, dayIndex) => {
                const classesInSlot = scheduleData.filter(course => {
                  const dayIndex2 = course.day - 2;
                  const startIndex = course.startPeriod - 1;
                  const duration = course.endPeriod - course.startPeriod + 1;
                  const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
                  const isInTimeSlot = dayIndex === dayIndex2 && 
                    index >= startIndex && index < startIndex + duration;
                  return isActiveInWeek && isInTimeSlot;
                });
                
                return (
                  <TableCell 
                    key={dayIndex} 
                    sx={{ 
                      p: 0.5, 
                      verticalAlign: 'top',
                      borderRight: 1,
                      borderColor: 'divider',
                      position: 'relative'
                    }}
                  >
                    {classesInSlot.map((course, courseIndex) => (
                      <Box
                        key={courseIndex}
                        sx={{
                          backgroundColor: getSubjectColor(course.code),
                          color: 'white',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          mb: courseIndex < classesInSlot.length - 1 ? 0.5 : 0,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 2,
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>
                          {course.code}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          {course.name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', fontSize: '0.65rem' }}>
                          Phòng: {course.room}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', fontSize: '0.65rem' }}>
                          Nhóm: {course.group}
                        </Typography>
                      </Box>
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Thời Khóa Biểu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý và xem thời khóa biểu học tập của bạn
        </Typography>
      </Box>

      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Tạo Thời Khóa Biểu
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Dán dữ liệu thời khóa biểu từ MyBK vào đây..."
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={generateSchedule}
            disabled={!scheduleInput.trim()}
            startIcon={<ScheduleIcon />}
            size="large"
          >
            Tạo Thời Khóa Biểu
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      {scheduleData.length > 0 && (
        <>
          {/* Week Navigation */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {getWeekLabel(selectedWeek)}
                </Typography>
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  onClick={goToPreviousWeek}
                  disabled={selectedWeek <= 1}
                  sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={goToCurrentWeek}
                  startIcon={<TodayIcon />}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Hiện tại
                </Button>
                
                <IconButton
                  onClick={goToNextWeek}
                  disabled={selectedWeek >= 50}
                  sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>

          {/* Schedule Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Môn học
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.reduce((sum, course) => sum + (course.credits || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tín chỉ
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.filter(course => course.weeks && course.weeks.includes(selectedWeek)).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tuần này
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {currentWeek}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tuần hiện tại
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Schedule Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            {renderDesktopSchedule()}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default ScheduleTab;
