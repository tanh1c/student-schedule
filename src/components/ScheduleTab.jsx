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
  IconButton,
  Stack,
  Tabs,
  Tab,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Group as GroupIcon,
  ContentPasteGo as PasteIcon,
  Link as LinkIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import {
  parseScheduleData,
  getSubjectColor,
  getCurrentWeek
} from '../utils/scheduleParser';
import { useScheduleData } from '../hooks/useLocalStorage';
import MyBKLoginCard from './MyBKLoginCard';

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

function ScheduleTab() {
  const [scheduleInput, setScheduleInput] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(2); // Default to Monday (Thứ 2)
  const [showManualInput, setShowManualInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState(0); // 0 = MyBK sync, 1 = Manual

  const { scheduleData, setScheduleData, selectedWeek, setSelectedWeek } = useScheduleData();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setCurrentWeek(getCurrentWeek());
    // Set default day to current day
    const today = new Date().getDay();
    const dayId = today === 0 ? 2 : today + 1; // Convert to our day format (2-7)
    if (dayId >= 2 && dayId <= 7) {
      setSelectedDay(dayId);
    }
  }, []);

  const generateSchedule = (inputData = scheduleInput) => {
    try {
      const parsed = parseScheduleData(inputData);
      if (parsed && parsed.length > 0) {
        setScheduleData(parsed);
        // Reset input and collapse manual section if successful
        setScheduleInput('');
        setShowManualInput(false);
        // Optional: Show success toast/alert
      } else {
        alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng đảm bảo bạn đã copy đúng bảng thời khóa biểu từ MyBK.");
      }
    } catch (error) {
      console.error("Parse error:", error);
      alert("Đã xảy ra lỗi khi xử lý dữ liệu.");
    }
  };

  const handleOpenMyBK = () => {
    window.open('https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/tkb', '_blank');
  };

  const handleSmartPaste = async () => {
    setLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard trống! Vui lòng copy lịch từ MyBK trước.");
        setLoading(false);
        return;
      }

      // Auto process the text
      generateSchedule(text);

    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Fallback to manual input if clipboard access denied
      alert("Không thể truy cập Clipboard. Vui lòng sử dụng phương pháp nhập thủ công.");
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => setSelectedWeek(prev => Math.max(1, prev - 1));
  const goToNextWeek = () => setSelectedWeek(prev => Math.min(50, prev + 1));
  const goToCurrentWeek = () => setSelectedWeek(currentWeek);

  const getWeekLabel = (weekNum) => {
    return `Tuần ${String(weekNum).padStart(2, '0')}`;
  };

  // Get classes for a specific day
  const getClassesForDay = (dayId) => {
    return scheduleData.filter(course => {
      const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
      return course.day === dayId && isActiveInWeek;
    }).sort((a, b) => a.startPeriod - b.startPeriod);
  };

  // Mobile View - Card based per day
  const renderMobileSchedule = () => {
    const classesForDay = getClassesForDay(selectedDay);

    return (
      <Box>
        {/* Day Selector Tabs */}
        <Tabs
          value={selectedDay}
          onChange={(e, newValue) => setSelectedDay(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: 'primary.main',
            }
          }}
        >
          {daysOfWeek.map((day) => {
            const classCount = getClassesForDay(day.id).length;
            return (
              <Tab
                key={day.id}
                value={day.id}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>{day.short}</Typography>
                    {classCount > 0 && (
                      <Chip
                        label={classCount}
                        size="small"
                        color="primary"
                        sx={{ height: 18, fontSize: '0.7rem', mt: 0.5 }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        {/* Classes for selected day */}
        {classesForDay.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Không có lớp trong {daysOfWeek.find(d => d.id === selectedDay)?.label}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {classesForDay.map((course, index) => (
              <Card
                key={index}
                sx={{
                  borderLeft: 4,
                  borderColor: getSubjectColor(course.code),
                  '&:hover': { boxShadow: 3 },
                  transition: 'box-shadow 0.2s'
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="primary" noWrap>
                        {course.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {course.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Tiết ${course.startPeriod}-${course.endPeriod}`}
                      size="small"
                      sx={{
                        backgroundColor: getSubjectColor(course.code),
                        color: 'white',
                        fontWeight: 600,
                        ml: 1
                      }}
                    />
                  </Box>

                  {/* Details */}
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={500}>
                        {timeSlots[course.startPeriod - 1]?.time.split('-')[0]} - {timeSlots[course.endPeriod - 1]?.time.split('-')[1]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RoomIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={500}>
                        {course.room}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={500}>
                        Nhóm {course.group}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  // Desktop View - Table format with larger cells for readability
  const renderDesktopSchedule = () => (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: 1100 }}>
        {/* Header */}
        <Grid container sx={{ borderBottom: 2, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
          <Grid item sx={{ width: 120, p: 2, borderRight: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>Tiết</Typography>
          </Grid>
          {daysOfWeek.map((day) => (
            <Grid item xs key={day.id} sx={{ p: 2, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                {day.label}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Body */}
        {timeSlots.map((slot) => (
          <Grid
            container
            key={slot.id}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 90,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Grid item sx={{
              width: 120,
              p: 1.5,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body2" fontWeight={600} display="block">
                  {slot.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {slot.time}
                </Typography>
              </Box>
            </Grid>
            {daysOfWeek.map((day) => {
              const classesInSlot = scheduleData.filter(course => {
                const isActiveInWeek = course.weeks && course.weeks.includes(selectedWeek);
                const isInTimeSlot = course.day === day.id &&
                  slot.id >= course.startPeriod &&
                  slot.id <= course.endPeriod;
                return isActiveInWeek && isInTimeSlot && slot.id === course.startPeriod;
              });

              return (
                <Grid
                  item
                  xs
                  key={day.id}
                  sx={{
                    p: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    position: 'relative'
                  }}
                >
                  {classesInSlot.map((course, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        backgroundColor: getSubjectColor(course.code),
                        color: 'white',
                        p: 1.5,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: 3,
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                        {course.code}
                      </Typography>
                      <Typography variant="caption" sx={{
                        opacity: 0.95,
                        display: 'block',
                        fontSize: '0.75rem',
                        lineHeight: 1.3,
                        mb: 0.5
                      }}>
                        {course.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        <Typography variant="caption" sx={{
                          opacity: 0.95,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.5
                        }}>
                          📍 {course.room}
                        </Typography>
                        <Typography variant="caption" sx={{
                          opacity: 0.95,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.5
                        }}>
                          👥 Nhóm {course.group}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Input Section with Tabs */}
      <Card sx={{ mb: 2, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Tạo Thời Khóa Biểu
            </Typography>
          </Box>

          {/* Method Selection Tabs */}
          <Tabs
            value={inputMethod}
            onChange={(e, v) => setInputMethod(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label="🔄 Đồng bộ MyBK"
              sx={{ fontWeight: 600, textTransform: 'none' }}
            />
            <Tab
              label="📋 Nhập thủ công"
              sx={{ fontWeight: 600, textTransform: 'none' }}
            />
          </Tabs>

          {/* Tab 0: MyBK Sync */}
          {inputMethod === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Đăng nhập bằng tài khoản MyBK để tự động lấy thời khóa biểu
              </Typography>
              <MyBKLoginCard
                onScheduleFetched={(data) => {
                  setScheduleData(data);
                }}
                onError={(err) => console.error(err)}
              />
            </Box>
          )}

          {/* Tab 1: Manual Input */}
          {inputMethod === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Copy dữ liệu từ trang MyBK và dán vào đây
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                    }}
                    onClick={handleOpenMyBK}
                  >
                    <Box sx={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      1
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Mở MyBK & Copy</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nhấn Ctrl+A rồi Ctrl+C để copy toàn bộ trang
                      </Typography>
                    </Box>
                    <LinkIcon color="action" />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.02)', boxShadow: 2, bgcolor: 'primary.main' }
                    }}
                    onClick={handleSmartPaste}
                  >
                    <Box sx={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      color: 'primary.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      2
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'inherit' }}>
                        Tự động phân tích
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9 }}>
                        Nhấn vào đây để đọc dữ liệu từ Clipboard
                      </Typography>
                    </Box>
                    <PasteIcon sx={{ color: 'inherit' }} />
                  </Paper>
                </Grid>
              </Grid>

              {/* Expandable manual paste area */}
              <Button
                variant="text"
                size="small"
                onClick={() => setShowManualInput(!showManualInput)}
                endIcon={showManualInput ? <ArrowUpIcon /> : <ArrowDownIcon />}
                sx={{ color: 'text.secondary', mb: 1 }}
              >
                Dán thủ công
              </Button>

              {showManualInput && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={isMobile ? 3 : 5}
                    placeholder="Dán dữ liệu thời khóa biểu từ MyBK vào đây..."
                    value={scheduleInput}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    sx={{ mb: 2 }}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={() => generateSchedule(scheduleInput)}
                    disabled={!scheduleInput.trim()}
                    startIcon={<ScheduleIcon />}
                    fullWidth
                  >
                    Xử lý dữ liệu thủ công
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Schedule Section */}
      {scheduleData.length > 0 && (
        <>
          {/* Week Navigation - Compact for mobile */}
          <Paper sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            backgroundColor: 'primary.main',
            color: 'white'
          }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CalendarIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600 }}>
                  {getWeekLabel(selectedWeek)}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  onClick={goToPreviousWeek}
                  disabled={selectedWeek <= 1}
                  size="small"
                  sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={goToCurrentWeek}
                  startIcon={!isMobile && <TodayIcon />}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    minWidth: 'auto',
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  {isMobile ? 'Nay' : 'Hiện tại'}
                </Button>

                <IconButton
                  onClick={goToNextWeek}
                  disabled={selectedWeek >= 50}
                  size="small"
                  sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>

          {/* Schedule Stats - 2 columns on mobile */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Môn học
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.reduce((sum, course) => sum + (course.credits || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tín chỉ
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                  {scheduleData.filter(course => course.weeks && course.weeks.includes(selectedWeek)).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tuần này
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ fontWeight: 600 }}>
                  {currentWeek}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tuần hiện tại
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Schedule Display */}
          <Paper sx={{ overflow: 'hidden' }}>
            {isMobile ? renderMobileSchedule() : renderDesktopSchedule()}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default ScheduleTab;
