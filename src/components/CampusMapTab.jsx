import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Map as MapIcon,
  MyLocation as LocationIcon,
  School as SchoolIcon,
  DirectionsWalk as WalkIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HCMUT_COORDINATES = [10.7720, 106.6576]; // Coordinates for HCMUT

function CampusMapTab() {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        calculateDistance([latitude, longitude], HCMUT_COORDINATES);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Người dùng từ chối chia sẻ vị trí');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Không thể xác định vị trí');
            break;
          case error.TIMEOUT:
            setLocationError('Hết thời gian chờ định vị');
            break;
          default:
            setLocationError('Lỗi không xác định khi định vị');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const calculateDistance = (from, to) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (to[0] - from[0]) * Math.PI / 180;
    const dLon = (to[1] - from[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistance(distance.toFixed(2));
    // Estimate walking time (average walking speed: 5 km/h)
    const walkingTime = (distance / 5) * 60; // in minutes
    setEstimatedTime(Math.round(walkingTime));
  };

  const locateMe = () => {
    getCurrentLocation();
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 15);
    }
  };

  const locateSchool = () => {
    if (mapRef.current) {
      mapRef.current.setView(HCMUT_COORDINATES, 16);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          {locationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {locationError}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: { xs: '400px', md: '500px' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Bản Đồ Tương Tác
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LocationIcon />}
                  onClick={locateMe}
                  disabled={!userLocation}
                >
                  Vị Trí Của Tôi
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SchoolIcon />}
                  onClick={locateSchool}
                >
                  Vị Trí Trường
                </Button>
              </Box>
            </Box>

            <Box sx={{ height: 'calc(100% - 60px)', borderRadius: 1, overflow: 'hidden' }}>
              <MapContainer
                center={HCMUT_COORDINATES}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* School marker */}
                <Marker position={HCMUT_COORDINATES}>
                  <Popup>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Đại học Bách Khoa TP.HCM
                      </Typography>
                      <Typography variant="body2">
                        268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>

                {/* User location marker */}
                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>
                      <Typography variant="body2">
                        Vị trí của bạn
                      </Typography>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {distance && estimatedTime && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <WalkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Thông Tin Khoảng Cách
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Khoảng cách: <strong>{distance} km</strong>
                    </Typography>
                    <Typography variant="body1">
                      Thời gian ước tính (đi bộ): <strong>{estimatedTime} phút</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông Tin Liên Hệ
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Địa chỉ:</strong> 268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Điện thoại:</strong> (028) 3865 4647
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> dhbk@hcmut.edu.vn
                  </Typography>
                  <Typography variant="body2">
                    <strong>Website:</strong> www.hcmut.edu.vn
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hướng Dẫn Đi Lại
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Xe buýt:</strong> Tuyến 01, 03, 19, 36, 93
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Metro:</strong> Ga Bến Thành (đang xây dựng)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Xe máy/Ô tô:</strong> Có bãi đỗ xe trong khuôn viên trường
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bản Đồ Chi Tiết Trường
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: '800px',
                mx: 'auto',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <img
                src="/image/map/cs1.jpg"
                alt="Bản đồ chi tiết Đại học Bách Khoa TP.HCM"
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={(e) => {
                  // Fallback nếu không tìm thấy ảnh
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'action.hover',
                  border: '2px dashed',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy bản đồ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vui lòng đặt file ảnh tại: public/image/map/cs1.jpg
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CampusMapTab;
