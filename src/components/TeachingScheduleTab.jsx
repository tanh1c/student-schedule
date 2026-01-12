import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as TeachingIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const API_BASE = '/api';

// Helper to convert day number to Vietnamese
const dayNames = ['', 'CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function TeachingScheduleTab() {
  const [searchTab, setSearchTab] = useState(0);
  const [courseCode, setCourseCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For autocomplete
  const [allSubjects, setAllSubjects] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load subjects and lecturers on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Load subjects
        const subjectsRes = await fetch(`${API_BASE}/lecturer/subjects`);
        if (subjectsRes.ok) {
          const subjects = await subjectsRes.json();
          setAllSubjects(subjects);
        }

        // Load lecturers
        const lecturersRes = await fetch(`${API_BASE}/lecturer/list`);
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

  const handleSearchTabChange = (event, newValue) => {
    setSearchTab(newValue);
    setCourseCode('');
    setLecturerName('');
    setSearchResults([]);
    setError(null);
  };

  const searchByCode = async () => {
    if (!courseCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Extract just the course ID if user selected from autocomplete
      // Input might be "CO3001 - Công nghệ phần mềm", we only want "CO3001"
      let searchId = courseCode.trim();
      if (searchId.includes(' - ')) {
        searchId = searchId.split(' - ')[0].trim();
      }

      console.log('[TeachingSchedule] Searching for:', searchId);
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

  const handleKeyPress = (e, searchFn) => {
    if (e.key === 'Enter') {
      searchFn();
    }
  };

  const renderSearchByCode = () => (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={8}>
        <Autocomplete
          freeSolo
          options={allSubjects}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : `${option.id} - ${option.name}`
          }
          inputValue={courseCode}
          onInputChange={(event, newValue) => setCourseCode(newValue)}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue === 'object') {
              setCourseCode(newValue.id);
            }
          }}
          loading={loadingData}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Mã Môn Học"
              placeholder="Nhập mã môn học (VD: CO3001)..."
              onKeyPress={(e) => handleKeyPress(e, searchByCode)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={searchByCode}
          sx={{ height: '56px' }}
          disabled={loading || !courseCode.trim()}
        >
          Tìm Kiếm
        </Button>
      </Grid>
    </Grid>
  );

  const renderSearchByLecturer = () => (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={8}>
        <Autocomplete
          freeSolo
          options={allLecturers.map(l => l.name)}
          inputValue={lecturerName}
          onInputChange={(event, newValue) => setLecturerName(newValue)}
          loading={loadingData}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tên Giảng Viên"
              placeholder="Nhập tên giảng viên..."
              onKeyPress={(e) => handleKeyPress(e, searchByLecturer)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={searchByLecturer}
          sx={{ height: '56px' }}
          disabled={loading || !lecturerName.trim()}
        >
          Tìm Kiếm
        </Button>
      </Grid>
    </Grid>
  );

  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

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
              <Typography variant="h6" gutterBottom color="primary">
                {result.maMonHoc} - {result.tenMonHoc}
              </Typography>
              {result.soTinChi > 0 && (
                <Chip
                  label={`${result.soTinChi} TC`}
                  size="small"
                  color="secondary"
                  sx={{ mb: 2 }}
                />
              )}

              {result.lichHoc.map((lh, lhIndex) => (
                <Card key={lhIndex} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Nhóm: {lh.group}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sĩ số: {lh.siso} | Ngôn ngữ: {lh.ngonNgu}
                        </Typography>

                        {/* Lecturer Info */}
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Giảng viên LT:</strong> {lh.giangVien || 'Chưa phân công'}
                          </Typography>
                          {lh.email && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon fontSize="small" color="action" />
                              {lh.email}
                            </Typography>
                          )}
                          {lh.phone && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              {lh.phone}
                            </Typography>
                          )}
                        </Box>

                        {lh.giangVienBT && lh.giangVienBT !== lh.giangVien && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Giảng viên BT:</strong> {lh.giangVienBT}
                            </Typography>
                            {lh.emailBT && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EmailIcon fontSize="small" color="action" />
                                {lh.emailBT}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Lịch học:
                        </Typography>
                        {lh.classInfo && lh.classInfo.length > 0 ? (
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Thứ</TableCell>
                                  <TableCell>Tiết</TableCell>
                                  <TableCell>Phòng</TableCell>
                                  <TableCell>CS</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {lh.classInfo.map((ci, ciIndex) => (
                                  <TableRow key={ciIndex}>
                                    <TableCell>
                                      {dayNames[ci.dayOfWeek] || ci.dayOfWeek}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={ci.tietHoc.join('-')}
                                        size="small"
                                        color="primary"
                                      />
                                    </TableCell>
                                    <TableCell>{ci.phong}</TableCell>
                                    <TableCell>{ci.coSo?.trim()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có lịch học
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tìm Kiếm Lịch Giảng Dạy
            </Typography>

            {loadingData && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Đang tải dữ liệu môn học và giảng viên...
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={searchTab} onChange={handleSearchTabChange}>
                <Tab label="Tìm theo mã môn" />
                <Tab label="Tìm theo giảng viên" />
              </Tabs>
            </Box>

            <Box sx={{ mb: 3 }}>
              {searchTab === 0 ? renderSearchByCode() : renderSearchByLecturer()}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kết Quả Tìm Kiếm ({searchResults.length} môn học)
            </Typography>
            {renderResults()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeachingScheduleTab;
