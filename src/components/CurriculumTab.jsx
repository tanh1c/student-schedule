import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  FileText,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

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

  const handleMajorChange = (value) => {
    setSelectedMajor(value);
    setPdfError(false);
  };

  const selectedMajorInfo = majors.find(major => major.value === selectedMajor);

  const handlePdfError = () => {
    setPdfError(true);
  };

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Chương trình đào tạo</h2>
          <p className="text-sm text-muted-foreground">Tra cứu CTĐT theo ngành học</p>
        </div>
      </div>

      {/* Major Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Chọn ngành học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {majors.map((major) => (
              <button
                key={major.value}
                onClick={() => handleMajorChange(major.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedMajor === major.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={selectedMajor === major.value ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {major.value}
                  </Badge>
                </div>
                <p className={`text-sm font-medium ${selectedMajor === major.value ? 'text-primary' : 'text-foreground'
                  }`}>
                  {major.label}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tài liệu chương trình đào tạo
            {selectedMajorInfo && (
              <Badge variant="outline" className="ml-auto">
                {selectedMajorInfo.label}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMajorInfo ? (
            pdfError || selectedMajorInfo.fileId === 'your_file_id_here' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                <AlertCircle className="h-16 w-16 text-amber-500 mb-4 opacity-70" />
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  Chưa có tài liệu cho ngành {selectedMajorInfo.label}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-500 max-w-md">
                  Tài liệu chương trình đào tạo đang được cập nhật.
                  <br />
                  Vui lòng liên hệ phòng đào tạo để biết thêm chi tiết.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="https://pdt.hcmut.edu.vn" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Truy cập phòng đào tạo
                  </a>
                </Button>
              </div>
            ) : (
              <div className="w-full h-[600px] md:h-[800px] border rounded-lg overflow-hidden">
                <iframe
                  src={selectedMajorInfo.pdfUrl}
                  className="w-full h-full border-none"
                  title={`Chương trình đào tạo ${selectedMajorInfo.label}`}
                  allow="autoplay"
                  onError={handlePdfError}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Chưa chọn ngành học
              </h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn ngành học ở trên để xem chương trình đào tạo
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CurriculumTab;
