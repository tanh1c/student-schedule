import React, { useCallback, useEffect, useState } from "react";
import { Calculator, Plus, Trash2, Award } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

const gradeScale = [
  { range: "8.5 - 10.0", letter: "A/A+", gpa: 4.0, classification: "Xuất sắc" },
  { range: "8.0 - 8.4", letter: "B+", gpa: 3.5, classification: "Xuất sắc" },
  { range: "7.0 - 7.9", letter: "B", gpa: 3.0, classification: "Giỏi" },
  { range: "6.5 - 6.9", letter: "C+", gpa: 2.5, classification: "Khá" },
  { range: "5.5 - 6.4", letter: "C", gpa: 2.0, classification: "Khá" },
  { range: "5.0 - 5.4", letter: "D+", gpa: 1.5, classification: "Trung bình" },
  { range: "4.0 - 4.9", letter: "D", gpa: 1.0, classification: "Trung bình" },
  { range: "< 4.0", letter: "F", gpa: 0.0, classification: "Yếu/Kém" }
];

function GpaTab() {
  const [courses, setCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [gpa4, setGpa4] = useState(0);
  const [gpa10, setGpa10] = useState(0);
  const [classification, setClassification] = useState('-');

  const calculateGPA = useCallback(() => {
    if (courses.length === 0) {
      setTotalCredits(0);
      setGpa4(0);
      setGpa10(0);
      setClassification('-');
      return;
    }

    let totalCreds = 0;
    let totalPoints4 = 0;
    let totalPoints10 = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits) || 0;
      const grade10 = parseFloat(course.grade10) || 0;
      const grade4 = convertGrade(grade10);

      totalCreds += credits;
      totalPoints4 += credits * grade4;
      totalPoints10 += credits * grade10;
    });

    const calculatedGpa4 = totalCreds > 0 ? totalPoints4 / totalCreds : 0;
    const calculatedGpa10 = totalCreds > 0 ? totalPoints10 / totalCreds : 0;

    setTotalCredits(totalCreds);
    setGpa4(calculatedGpa4);
    setGpa10(calculatedGpa10);
    setClassification(getClassification(calculatedGpa10));
  }, [courses]);

  useEffect(() => {
    calculateGPA();
  }, [calculateGPA]);

  const convertGrade = (grade10) => {
    const numGrade = parseFloat(grade10);
    if (numGrade >= 8.5) return 4.0;
    if (numGrade >= 8.0) return 3.5;
    if (numGrade >= 7.0) return 3.0;
    if (numGrade >= 6.5) return 2.5;
    if (numGrade >= 5.5) return 2.0;
    if (numGrade >= 5.0) return 1.5;
    if (numGrade >= 4.0) return 1.0;
    return 0.0;
  };

  const getClassification = (gpa10) => {
    if (gpa10 >= 8.0) return 'Xuất sắc';
    if (gpa10 >= 7.0) return 'Giỏi';
    if (gpa10 >= 5.5) return 'Khá';
    if (gpa10 >= 4.0) return 'Trung bình';
    return 'Yếu/Kém';
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now(),
        name: '',
        credits: '',
        grade10: '',
        grade4: '',
      },
    ]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        const updated = { ...course, [field]: value };
        if (field === 'grade10') {
          updated.grade4 = convertGrade(value).toFixed(1);
        }
        return updated;
      }
      return course;
    }));
  };

  const getClassificationColor = (classification) => {
    const colors = {
      'Xuất sắc': 'bg-emerald-500',
      'Giỏi': 'bg-sky-500',
      'Khá': 'bg-amber-500',
      'Trung bình': 'bg-orange-500',
      'Yếu/Kém': 'bg-rose-500',
    };
    return colors[classification] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Tính GPA
          </p>
          <p className="text-sm text-muted-foreground">
            Nhập điểm, tín chỉ để tính GPA hệ 4 và hệ 10.
          </p>
        </div>
        <Button onClick={addCourse} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm môn học
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Bảng quy đổi điểm</CardTitle>
            <CardDescription>Thang 10 sang thang 4 và xếp loại</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-xl border">
            <div className="scroll-area max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Thang 10</th>
                    <th className="px-4 py-3">Thang chữ</th>
                    <th className="px-4 py-3">Thang 4</th>
                    <th className="px-4 py-3">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {gradeScale.map((grade, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{grade.range}</td>
                      <td className="px-4 py-3">{grade.letter}</td>
                      <td className="px-4 py-3">{grade.gpa}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${getClassificationColor(grade.classification)} text-white`}>
                          {grade.classification}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Kết quả tính toán</CardTitle>
                <CardDescription>Cập nhật tự động khi chỉnh điểm</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">Tổng số tín chỉ</p>
              <p className="text-2xl font-semibold">{totalCredits}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">GPA hệ 4</p>
              <p className="text-2xl font-semibold">{gpa4.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">GPA hệ 10</p>
              <p className="text-2xl font-semibold">{gpa10.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">Xếp loại</p>
              <Badge className={`${getClassificationColor(classification)} text-white text-base px-3 py-1`}>
                {classification}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Danh sách môn học</CardTitle>
          <CardDescription>Điền thông tin từng môn để tính GPA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border">
              <div className="scroll-area max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Tên môn học</th>
                      <th className="px-4 py-3">Tín chỉ</th>
                      <th className="px-4 py-3">Điểm hệ 10</th>
                      <th className="px-4 py-3">Điểm hệ 4</th>
                      <th className="px-4 py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Input
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                            placeholder="Tên môn học"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                            placeholder="Tín chỉ"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={course.grade10}
                            onChange={(e) => updateCourse(course.id, 'grade10', e.target.value)}
                            placeholder="Điểm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input value={course.grade4} disabled />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile / tablet cards */}
          <div className="grid gap-3 lg:hidden">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border bg-card/70 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                      placeholder="Tên môn học"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                        placeholder="Tín chỉ"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={course.grade10}
                        onChange={(e) => updateCourse(course.id, 'grade10', e.target.value)}
                        placeholder="Điểm"
                      />
                    </div>
                    <Input value={course.grade4} disabled />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeCourse(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center">
              <Award className="h-10 w-10 text-muted-foreground" />
              <p className="text-base font-semibold">Chưa có môn học nào</p>
              <p className="text-sm text-muted-foreground">
                Nhấn “Thêm môn học” để bắt đầu tính GPA.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GpaTab;
