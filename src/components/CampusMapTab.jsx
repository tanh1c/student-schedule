import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip
} from '@/components/ui/map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Navigation,
  School,
  Clock,
  Phone,
  Mail,
  Globe,
  Bus,
  Car,
  AlertCircle,
  Building2
} from 'lucide-react';

// Coordinates for HCMUT (MapLibre uses [lng, lat] format)
const HCMUT_LNG = 106.6576;
const HCMUT_LAT = 10.7720;

// Campus buildings/locations
const campusLocations = [
  { id: 'main', name: 'Cổng chính', lng: 106.6588, lat: 10.7728, type: 'entrance' },
  { id: 'a1', name: 'Tòa A1 - Văn phòng', lng: 106.6580, lat: 10.7722, type: 'building' },
  { id: 'b1', name: 'Tòa B1 - Giảng đường', lng: 106.6570, lat: 10.7718, type: 'building' },
  { id: 'b4', name: 'Tòa B4 - Khoa KHMT', lng: 106.6565, lat: 10.7715, type: 'building' },
  { id: 'c', name: 'Khu C - Thư viện', lng: 106.6572, lat: 10.7710, type: 'library' },
];

function CampusMapTab() {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        calculateDistance({ lat: latitude, lng: longitude }, { lat: HCMUT_LAT, lng: HCMUT_LNG });
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
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setDistance(dist.toFixed(2));
    // Estimate walking time (average walking speed: 5 km/h)
    const walkingTime = (dist / 5) * 60; // in minutes
    setEstimatedTime(Math.round(walkingTime));
  };

  const handleLocate = useCallback((coords) => {
    setUserLocation({ lat: coords.latitude, lng: coords.longitude });
    calculateDistance(
      { lat: coords.latitude, lng: coords.longitude },
      { lat: HCMUT_LAT, lng: HCMUT_LNG }
    );
  }, []);

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Bản đồ trường</h2>
            <p className="text-sm text-muted-foreground">ĐHBK TP.HCM - Cơ sở Lý Thường Kiệt</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {locationError && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800 dark:text-orange-400">
            {locationError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Bản Đồ Tương Tác
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] md:h-[500px] w-full">
                <Map
                  ref={mapRef}
                  center={[HCMUT_LNG, HCMUT_LAT]}
                  zoom={16}
                >
                  <MapControls
                    showZoom={true}
                    showLocate={true}
                    showFullscreen={true}
                    onLocate={handleLocate}
                  />

                  {/* HCMUT Main Marker */}
                  <MapMarker
                    longitude={HCMUT_LNG}
                    latitude={HCMUT_LAT}
                    onClick={() => setSelectedLocation('main')}
                  >
                    <MarkerContent>
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center">
                          <School className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary" />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>
                      <span className="font-semibold">Đại học Bách Khoa TP.HCM</span>
                    </MarkerTooltip>
                    <MarkerPopup closeButton>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-base mb-1">Đại học Bách Khoa TP.HCM</h3>
                        <p className="text-sm text-muted-foreground">
                          268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            Cơ sở 1
                          </Badge>
                        </div>
                      </div>
                    </MarkerPopup>
                  </MapMarker>

                  {/* Campus Buildings */}
                  {campusLocations.map((loc) => (
                    <MapMarker
                      key={loc.id}
                      longitude={loc.lng}
                      latitude={loc.lat}
                    >
                      <MarkerContent>
                        <div className="h-5 w-5 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-white" />
                        </div>
                      </MarkerContent>
                      <MarkerTooltip>{loc.name}</MarkerTooltip>
                    </MapMarker>
                  ))}

                  {/* User Location Marker */}
                  {userLocation && (
                    <MapMarker
                      longitude={userLocation.lng}
                      latitude={userLocation.lat}
                    >
                      <MarkerContent>
                        <div className="relative">
                          <div className="h-6 w-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        </div>
                      </MarkerContent>
                      <MarkerTooltip>Vị trí của bạn</MarkerTooltip>
                    </MapMarker>
                  )}
                </Map>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          {/* Distance Card */}
          {distance && estimatedTime && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Khoảng cách
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Khoảng cách</span>
                    <span className="font-bold text-lg">{distance} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Đi bộ (ước tính)</span>
                    <span className="font-bold text-lg">{estimatedTime} phút</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>268 Lý Thường Kiệt, P.14, Q.10, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>(028) 3865 4647</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>dhbk@hcmut.edu.vn</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href="https://hcmut.edu.vn" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.hcmut.edu.vn
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Transportation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bus className="h-4 w-4" />
                Hướng dẫn đi lại
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Bus className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium">Xe buýt:</span>
                  <span className="ml-1">Tuyến 01, 03, 19, 36, 93</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Navigation className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium">Metro:</span>
                  <span className="ml-1">Ga Bến Thành (đang xây dựng)</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Car className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium">Xe máy/Ô tô:</span>
                  <span className="ml-1">Có bãi đỗ xe trong khuôn viên trường</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${HCMUT_LAT},${HCMUT_LNG}`, '_blank');
                }}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Chỉ đường bằng Google Maps
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campus Map Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sơ đồ chi tiết khuôn viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl mx-auto">
            <img
              src="/image/map/cs1.jpg"
              alt="Bản đồ chi tiết Đại học Bách Khoa TP.HCM"
              className="w-full rounded-lg shadow-md border"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="hidden items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed"
            >
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Không tìm thấy bản đồ</p>
                <p className="text-sm">Vui lòng đặt file ảnh tại: public/image/map/cs1.jpg</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CampusMapTab;
