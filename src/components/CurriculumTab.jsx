import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  School as CurriculumIcon,
  Description as PdfIcon,
} from '@mui/icons-material';

const majors = [
  {
    value: 'KHMT',
    label: 'Khoa học máy tính',
    fileId: '1ebgPzwl88UWAzhI5Jg0O71JzlkhIKQyE',
    pdfUrl: 'https://drive.google.com/file/d/1ebgPzwl88UWAzhI5Jg0O71JzlkhIKQyE/preview'
  },
  {
    value: 'KTMT',
    label: 'Kỹ thuật máy tính',
    fileId: 'your_file_id_here',
    pdfUrl: 'https://drive.google.com/file/d/your_file_id_here/preview'
  },
  {
    value: 'KTPM',
    label: 'Kỹ thuật phần mềm',
    fileId: 'your_file_id_here',
    pdfUrl: 'https://drive.google.com/file/d/your_file_id_here/preview'
  },
  {
    value: 'HTTT',
    label: 'Hệ thống thông tin',
    fileId: 'your_file_id_here',
    pdfUrl: 'https://drive.google.com/file/d/your_file_id_here/preview'
  },
];

function CurriculumTab() {
  const [selectedMajor, setSelectedMajor] = useState('');
  const [pdfError, setPdfError] = useState(false);

  const handleMajorChange = (event) => {
    setSelectedMajor(event.target.value);
    setPdfError(false); // Reset error when changing major
  };

  const selectedMajorInfo = majors.find(major => major.value === selectedMajor);

  const handlePdfError = () => {
    setPdfError(true);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tra Cứu Chương Trình Đào Tạo
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn ngành học</InputLabel>
                <Select
                  value={selectedMajor}
                  onChange={handleMajorChange}
                  label="Chọn ngành học"
                >
                  <MenuItem value="">
                    <em>Chọn ngành học</em>
                  </MenuItem>
                  {majors.map((major) => (
                    <MenuItem key={major.value} value={major.value}>
                      {major.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PdfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tài Liệu Chương Trình Đào Tạo
            </Typography>

            {selectedMajorInfo ? (
              pdfError || selectedMajorInfo.fileId === 'your_file_id_here' ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 8,
                    color: 'text.secondary',
                    backgroundColor: '#fff3cd',
                    borderRadius: 1,
                    border: '1px solid #ffeaa7',
                  }}
                >
                  <PdfIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5, color: '#f39c12' }} />
                  <Typography variant="h6" color="#856404">
                    Chưa có tài liệu cho ngành {selectedMajorInfo.label}
                  </Typography>
                  <Typography variant="body2" color="#856404" sx={{ textAlign: 'center', mt: 1 }}>
                    Tài liệu chương trình đào tạo đang được cập nhật.<br />
                    Vui lòng liên hệ phòng đào tạo để biết thêm chi tiết.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '800px',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                  }}
                >
                  <iframe
                    src={selectedMajorInfo.pdfUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title={`Chương trình đào tạo ${selectedMajorInfo.label}`}
                    allow="autoplay"
                    onError={handlePdfError}
                  />
                </Box>
              )
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 8,
                  color: 'text.secondary',
                }}
              >
                <PdfIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">
                  Chưa chọn ngành học
                </Typography>
                <Typography variant="body2">
                  Vui lòng chọn ngành học để xem chương trình đào tạo
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CurriculumTab;
