import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Quiz as ExamIcon,
  Room as RoomIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  Groups as GroupIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { parseExamData } from '../utils/scheduleParser';
import { useExamData } from '../hooks/useLocalStorage';

function ExamTab() {
  const [examInput, setExamInput] = useState('');
  const { examData, setExamData } = useExamData();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const generateExamSchedule = () => {
    const parsed = parseExamData(examInput);
    console.log('Parsed exam data:', parsed); // Debug log
    setExamData(parsed);
  };

  const getExamTypeConfig = (type) => {
    const configs = {
      'CK': {
        color: '#e53e3e',
        bgColor: '#fed7d7',
        darkBgColor: '#742a2a',
        icon: '',
        label: 'CK'
      },
      'Cuối kỳ': {
        color: '#e53e3e',
        bgColor: '#fed7d7',
        darkBgColor: '#742a2a',
        icon: '',
        label: 'CK'
      },
      'GK': {
        color: '#dd6b20',
        bgColor: '#feebc8',
        darkBgColor: '#7c2d12',
        icon: '',
        label: 'GK'
      },
      'Giữa kỳ': {
        color: '#dd6b20',
        bgColor: '#feebc8',
        darkBgColor: '#7c2d12',
        icon: '',
        label: 'GK'
      },
      'TH': {
        color: '#38a169',
        bgColor: '#c6f6d5',
        darkBgColor: '#22543d',
        icon: '',
        label: 'TH'
      },
      'Thực hành': {
        color: '#38a169',
        bgColor: '#c6f6d5',
        darkBgColor: '#22543d',
        icon: '',
        label: 'TH'
      },
      'VĐ': {
        color: '#3182ce',
        bgColor: '#bee3f8',
        darkBgColor: '#2a4365',
        icon: '',
        label: 'VĐ'
      },
      'Vấn đáp': {
        color: '#3182ce',
        bgColor: '#bee3f8',
        darkBgColor: '#2a4365',
        icon: '',
        label: 'VĐ'
      },
    };
    return configs[type] || {
      color: '#718096',
      bgColor: '#e2e8f0',
      darkBgColor: '#4a5568',
      icon: '📋',
      label: type || 'KT'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const groupExamsByDate = () => {
    const grouped = {};
    examData.forEach(exam => {
      const date = exam.rawDate || exam.examDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(exam);
    });

    // Sort by date
    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        exams: grouped[date].sort((a, b) => a.time.localeCompare(b.time))
      }));
  };

  // Desktop Table View
  const renderDesktopView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Môn học</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Loại thi</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Ngày & Giờ</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Phòng thi</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Nhóm</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Thời lượng</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {examData.map((exam, index) => {
            const config = getExamTypeConfig(exam.examType);
            return (
              <TableRow
                key={index}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderLeft: 4,
                  borderColor: config.color
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: config.color,
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {exam.code?.substring(0, 2) || 'XX'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {exam.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exam.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{
                      backgroundColor: config.color,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Ngày: {formatDate(exam.rawDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Giờ: {exam.time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RoomIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="500">
                      {exam.room}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {exam.group}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={exam.duration}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Mobile Card View
  const renderMobileView = () => {
    const groupedExams = groupExamsByDate();

    return (
      <Stack spacing={2}>
        {groupedExams.map((group, groupIndex) => (
          <Paper key={groupIndex} elevation={2} sx={{ overflow: 'hidden' }}>
            <Box sx={{
              p: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CalendarIcon />
              <Typography variant="h6" fontWeight="600">
                {formatDate(group.date)}
              </Typography>
            </Box>

            <Box sx={{ p: 1 }}>
              <Grid container spacing={1}>
                {group.exams.map((exam, examIndex) => {
                  const config = getExamTypeConfig(exam.examType);
                  return (
                    <Grid item xs={12} sm={6} key={examIndex}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          borderLeft: 4,
                          borderColor: config.color,
                          '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight="600" color="primary">
                                {exam.code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                                {exam.name}
                              </Typography>
                            </Box>
                            <Chip
                              label={config.label}
                              size="small"
                              sx={{
                                backgroundColor: config.color,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          {/* Details */}
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ClockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" fontWeight="500">
                                {exam.time}
                              </Typography>
                              <Chip
                                label={exam.duration}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <RoomIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" fontWeight="500">
                                {exam.room}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">
                                Nhóm {exam.group}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        ))}
      </Stack>
    );
  };

  // Stats Cards
  const renderStats = () => {
    const stats = {
      total: examData.length,
      gk: examData.filter(e => e.examType === 'GK' || e.examType === 'Giữa kỳ').length,
      ck: examData.filter(e => e.examType === 'CK' || e.examType === 'Cuối kỳ').length,
      th: examData.filter(e => e.examType === 'TH' || e.examType === 'Thực hành').length,
    };

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
            <Typography variant="h4" fontWeight="600">
              {stats.total}
            </Typography>
            <Typography variant="body2">
              Tổng môn thi
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#dd6b20', color: 'white' }}>
            <Typography variant="h4" fontWeight="600">
              {stats.gk}
            </Typography>
            <Typography variant="body2">
              Giữa kỳ
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e53e3e', color: 'white' }}>
            <Typography variant="h4" fontWeight="600">
              {stats.ck}
            </Typography>
            <Typography variant="body2">
              Cuối kỳ
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#38a169', color: 'white' }}>
            <Typography variant="h4" fontWeight="600">
              {stats.th}
            </Typography>
            <Typography variant="body2">
              Thực hành
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            Tạo Lịch Thi
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Dán dữ liệu lịch thi từ MyBK vào đây..."
            value={examInput}
            onChange={(e) => setExamInput(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={generateExamSchedule}
            disabled={!examInput.trim()}
            startIcon={<ExamIcon />}
            size="large"
          >
            Tạo Lịch Thi
          </Button>
        </CardContent>
      </Card>

      {/* Exam Schedule */}
      {examData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ExamIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có lịch thi nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng nhập dữ liệu lịch thi để hiển thị
          </Typography>
        </Paper>
      ) : (
        <>
          {renderStats()}
          <Paper sx={{ overflow: 'hidden' }}>
            {isMobile ? renderMobileView() : renderDesktopView()}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default ExamTab;
