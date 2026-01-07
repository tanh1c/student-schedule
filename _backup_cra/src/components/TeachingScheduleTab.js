import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Person as TeachingIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

function TeachingScheduleTab() {
  const [searchTab, setSearchTab] = useState(0);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [courseSuggestions] = useState([
    'Cấu trúc dữ liệu và giải thuật',
    'Lập trình hướng đối tượng',
    'Cơ sở dữ liệu',
    'Mạng máy tính',
    'Hệ điều hành',
    'Trí tuệ nhân tạo',
    'Học máy',
    'Xử lý ảnh số',
  ]);

  const handleSearchTabChange = (event, newValue) => {
    setSearchTab(newValue);
    // Reset form when switching tabs
    setCourseCode('');
    setCourseName('');
    setSelectedTeacher('');
    setTeachers([]);
    setSearchResults([]);
  };

  const searchByCode = async () => {
    if (!courseCode.trim()) return;
    
    // Simulate API call - replace with actual implementation
    const mockResults = [
      {
        courseCode: courseCode,
        courseName: 'Tên môn học mẫu',
        teacher: 'GS. Nguyễn Văn A',
        classGroup: 'L01',
        schedule: [
          { day: 'Thứ 2', periods: '1-3', room: 'H1-101' },
          { day: 'Thứ 5', periods: '7-9', room: 'H1-102' },
        ]
      }
    ];
    
    setSearchResults(mockResults);
  };

  const searchByName = async () => {
    if (!courseName.trim()) return;
    
    // Simulate API call - replace with actual implementation
    const mockTeachers = [
      'GS. Nguyễn Văn A',
      'PGS. Trần Thị B',
      'TS. Lê Văn C',
    ];
    
    setTeachers(mockTeachers);
  };

  const searchSchedule = async () => {
    if (!selectedTeacher) return;
    
    // Simulate API call - replace with actual implementation
    const mockResults = [
      {
        courseCode: 'CS101',
        courseName: courseName,
        teacher: selectedTeacher,
        classGroup: 'L01',
        schedule: [
          { day: 'Thứ 2', periods: '1-3', room: 'H1-101' },
          { day: 'Thứ 5', periods: '7-9', room: 'H1-102' },
        ]
      }
    ];
    
    setSearchResults(mockResults);
  };

  const renderSearchByCode = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Mã Môn Học"
          placeholder="Nhập mã môn học..."
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={searchByCode}
          sx={{ height: '56px' }}
        >
          Tìm Kiếm
        </Button>
      </Grid>
    </Grid>
  );

  const renderSearchByName = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Autocomplete
          options={courseSuggestions}
          value={courseName}
          onChange={(event, newValue) => setCourseName(newValue || '')}
          onInputChange={(event, newInputValue) => setCourseName(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tên Môn Học"
              placeholder="Nhập tên môn học..."
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <Button
          fullWidth
          variant="outlined"
          onClick={searchByName}
          sx={{ height: '56px' }}
        >
          Tìm Giảng Viên
        </Button>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth disabled={teachers.length === 0}>
          <InputLabel>Giảng Viên</InputLabel>
          <Select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            label="Giảng Viên"
          >
            {teachers.map((teacher, index) => (
              <MenuItem key={index} value={teacher}>
                {teacher}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={searchSchedule}
          disabled={!selectedTeacher}
          sx={{ height: '56px' }}
        >
          Tìm Lịch
        </Button>
      </Grid>
    </Grid>
  );

  const renderResults = () => {
    if (searchResults.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <ScheduleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">
            Chưa có kết quả tìm kiếm
          </Typography>
          <Typography variant="body2">
            Vui lòng nhập thông tin và tìm kiếm
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {searchResults.map((result, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {result.courseCode} - {result.courseName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giảng viên: {result.teacher}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhóm lớp: {result.classGroup}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Lịch học:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Thứ</TableCell>
                          <TableCell>Tiết</TableCell>
                          <TableCell>Phòng</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.schedule.map((schedule, scheduleIndex) => (
                          <TableRow key={scheduleIndex}>
                            <TableCell>{schedule.day}</TableCell>
                            <TableCell>
                              <Chip
                                label={schedule.periods}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>{schedule.room}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <TeachingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Tra Cứu Lịch Giảng Dạy
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tìm Kiếm Lịch Giảng Dạy
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={searchTab} onChange={handleSearchTabChange}>
                <Tab label="Tìm theo mã môn" />
                <Tab label="Tìm theo tên môn" />
              </Tabs>
            </Box>

            <Box sx={{ mb: 3 }}>
              {searchTab === 0 ? renderSearchByCode() : renderSearchByName()}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kết Quả Tìm Kiếm
            </Typography>
            {renderResults()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeachingScheduleTab;
