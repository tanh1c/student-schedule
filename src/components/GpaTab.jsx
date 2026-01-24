import React, { useState, useEffect } from "react";
import {
  Calculator,
  RotateCcw,
  XCircle,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import mybkApi from "../services/mybkApi";

export default function GpaTab() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [error, setError] = useState(null);
  const [rawDetails, setRawDetails] = useState([]);
  const [predictedScores, setPredictedScores] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [preciseState, setPreciseState] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showNav, setShowNav] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSummary = localStorage.getItem("mybk_gpa_summary");
    const savedDetails = localStorage.getItem("mybk_gpa_details");

    if (savedSummary && savedDetails) {
      try {
        const parsedSummary = JSON.parse(savedSummary);
        const parsedDetails = JSON.parse(savedDetails);

        setSummary(parsedSummary);
        setRawDetails(parsedDetails);
        processDetails(parsedDetails);
      } catch (e) {
        console.error("Failed to load saved GPA data", e);
      }
    }
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const groups = Object.keys(groupedCourses);
      for (let i = groups.length - 1; i >= 0; i--) {
        const el = document.getElementById(`group-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveGroup(i);
            return;
          }
        }
      }
      setActiveGroup(0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groupedCourses]);

  const convertToGpa4 = (score10) => {
    const score = parseFloat(score10);
    if (score >= 8.5) return 4.0;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.5) return 2.5;
    if (score >= 5.5) return 2.0;
    if (score >= 5.0) return 1.5;
    if (score >= 4.0) return 1.0;
    return 0.0;
  };

  const getLetterGrade = (score10) => {
    const score = parseFloat(score10);
    if (score >= 9.5) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.5) return 'C+';
    if (score >= 5.5) return 'C';
    if (score >= 5.0) return 'D+';
    if (score >= 4.0) return 'D';
    return 'F';
  };

  const calculatePreciseCurrentGpa = () => {
    if (!rawDetails || rawDetails.length === 0) return null;

    let totalGpaCredits = 0;
    let totalScore10 = 0;
    let totalScore4 = 0;
    let totalAccumulatedCredits = 0;

    rawDetails.forEach(item => {
      const credits = parseFloat(item.sotc) || 0;
      if (!item.mamonhoc || credits === 0) return;

      if (item.diemso && item.diemso !== "--" && !isNaN(parseFloat(item.diemso))) {
        const score10 = parseFloat(item.diemso);

        if (score10 >= 4.0) {
          totalAccumulatedCredits += credits;
        }

        if (score10 >= 0 && score10 <= 10) {
          totalGpaCredits += credits;
          const score4 = convertToGpa4(score10);
          totalScore10 += score10 * credits;
          totalScore4 += score4 * credits;
        }
      }
    });

    if (totalGpaCredits === 0) return null;

    return {
      gpa10: totalScore10 / totalGpaCredits,
      gpa4: totalScore4 / totalGpaCredits,
      accumulatedCredits: totalAccumulatedCredits,
      baseGpaCredits: totalGpaCredits,
      baseScore10: totalScore10,
      baseScore4: totalScore4
    };
  };

  useEffect(() => {
    if (rawDetails.length > 0) {
      const calculated = calculatePreciseCurrentGpa();
      setPreciseState(calculated);
    }
  }, [rawDetails]);

  useEffect(() => {
    if (!preciseState) {
      setPrediction(null);
      return;
    }

    const { baseGpaCredits, baseScore10, baseScore4, accumulatedCredits } = preciseState;

    if (Object.keys(predictedScores).length === 0) {
      setPrediction(null);
      return;
    }

    let addedGpaCredits = 0;
    let addedAccumulatedCredits = 0;
    let addedScore10Sum = 0;
    let addedScore4Sum = 0;

    Object.entries(predictedScores).forEach(([subCode, val]) => {
      if (val === "" || val === null) return;
      const score10 = parseFloat(val);
      if (isNaN(score10)) return;

      const subject = rawDetails.find(s => s.mamonhoc === subCode);
      if (subject) {
        const creds = parseFloat(subject.sotc) || 0;
        if (creds > 0) {
          const score4 = convertToGpa4(score10);
          addedGpaCredits += creds;
          addedScore10Sum += score10 * creds;
          addedScore4Sum += score4 * creds;

          if (score10 >= 4.0) {
            addedAccumulatedCredits += creds;
          }
        }
      }
    });

    if (addedGpaCredits === 0) {
      setPrediction(null);
      return;
    }

    const newTotalGpaCredits = baseGpaCredits + addedGpaCredits;
    const newGpa10 = (baseScore10 + addedScore10Sum) / newTotalGpaCredits;
    const newGpa4 = (baseScore4 + addedScore4Sum) / newTotalGpaCredits;
    const newAccumulatedCredits = accumulatedCredits + addedAccumulatedCredits;

    setPrediction({
      gpa10: newGpa10,
      gpa4: newGpa4,
      totalCredits: newAccumulatedCredits,
      isModified: true
    });
  }, [preciseState, rawDetails, predictedScores]);

  const handleScoreChange = (subjectCode, value) => {
    setPredictedScores(prev => ({
      ...prev,
      [subjectCode]: value
    }));
  };

  const handleSyncMyBK = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const userInfo = mybkApi.getUserData();
      if (!userInfo || !userInfo.id) {
        const infoRes = await mybkApi.getStudentInfo();
        if (!infoRes.success) throw new Error("Vui lòng đăng nhập MyBK trước");
      }

      const studentId = mybkApi.getUserData()?.id;
      if (!studentId) throw new Error("Không tìm thấy MSSV");

      const summaryRes = await mybkApi.getGpaSummary(studentId);
      if (summaryRes.success) {
        setSummary(summaryRes.data);
        localStorage.setItem("mybk_gpa_summary", JSON.stringify(summaryRes.data));
      }

      const detailRes = await mybkApi.getGpaDetail(studentId);
      if (detailRes.success && Array.isArray(detailRes.data)) {
        setRawDetails(detailRes.data);
        localStorage.setItem("mybk_gpa_details", JSON.stringify(detailRes.data));
        processDetails(detailRes.data);
        setPredictedScores({});
      } else {
        setError("Không lấy được dữ liệu chi tiết");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSyncing(false);
    }
  };

  const processDetails = (data) => {
    const groups = {};

    data.forEach(item => {
      if (!item.mamonhoc) return;

      const kktName = item.tenkhoikienthuc || "Khác";

      if (!groups[kktName]) {
        groups[kktName] = {
          name: kktName,
          creditsRequired: item.tcyeucau || 0,
          creditsEarned: item.tcdat || 0,
          isCompleted: item.hoanthanh === "1",
          subjects: []
        };
      }

      const exists = groups[kktName].subjects.find(s => s.code === item.mamonhoc);
      if (!exists) {
        const isNoScore = !item.diemso || item.diemso === "--";

        groups[kktName].subjects.push({
          code: item.mamonhoc,
          name: item.tenmonhoc,
          credits: item.sotc,
          score: item.diemso,
          grade: item.diemchu,
          passed: item.diemdat === "1",
          isIncomplete: isNoScore
        });
      }
    });

    setGroupedCourses(groups);
    // Expand all groups by default
    const expanded = {};
    Object.keys(groups).forEach((k, i) => expanded[i] = true);
    setExpandedGroups(expanded);
  };

  const scrollToGroup = (index) => {
    const element = document.getElementById(`group-${index}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setShowNav(false);
    }
  };

  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const groupKeys = Object.keys(groupedCourses);

  return (
    <div className="relative min-h-screen">
      {/* Floating Navigation Button (Mobile) */}
      {groupKeys.length > 0 && (
        <button
          onClick={() => setShowNav(!showNav)}
          className="lg:hidden fixed bottom-24 right-3 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          {showNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Mobile Navigation Overlay */}
      {showNav && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowNav(false)}
        />
      )}

      {/* Floating Sidebar Navigation */}
      {groupKeys.length > 0 && (
        <div className={`
          fixed z-40 transition-all duration-300 ease-in-out
          lg:right-4 lg:top-1/2 lg:-translate-y-1/2 lg:opacity-100 lg:pointer-events-auto
          ${showNav
            ? 'right-3 bottom-36 opacity-100 pointer-events-auto'
            : 'right-3 bottom-36 opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'
          }
        `}>
          <div className="bg-background border rounded-2xl shadow-xl p-2 max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {groupKeys.map((kktKey, idx) => {
                const isActive = activeGroup === idx;
                const shortName = kktKey.length > 16 ? kktKey.substring(0, 14) + '...' : kktKey;

                return (
                  <button
                    key={idx}
                    onClick={() => scrollToGroup(idx)}
                    className={`
                      group flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted'
                      }
                    `}
                    title={kktKey}
                  >
                    <span className={`
                      w-2 h-2 rounded-full shrink-0 transition-all
                      ${isActive ? 'bg-primary-foreground' : 'bg-muted-foreground/50'}
                    `} />
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">{shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4 p-3 sm:p-6 pb-28 lg:pr-52">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Kết quả học tập
            </h2>
            <div className="flex gap-2">
              {Object.keys(predictedScores).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPredictedScores({})}
                  className="h-9"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Reset</span>
                </Button>
              )}
              <Button
                onClick={handleSyncMyBK}
                disabled={isSyncing}
                size="sm"
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="ml-2">{isSyncing ? "Đang sync..." : "Sync MyBK"}</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Tính toán GPA dự kiến (Aim GPA)</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="py-3 px-4">
              <p className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards - Mobile optimized */}
        {(summary || preciseState) && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <MobileSummaryCard
              title="Hệ 10"
              value={preciseState ? preciseState.gpa10 : summary?.tbtlhe10}
              predictedValue={prediction?.isModified ? prediction.gpa10 : null}
              color="blue"
            />
            <MobileSummaryCard
              title="Hệ 4"
              value={preciseState ? preciseState.gpa4 : summary?.tbtlhe4}
              predictedValue={prediction?.isModified ? prediction.gpa4 : null}
              color="green"
            />
            <MobileSummaryCard
              title="Tín chỉ"
              value={preciseState ? preciseState.accumulatedCredits : summary?.sotctl}
              predictedValue={prediction?.isModified ? prediction.totalCredits : null}
              color="orange"
              isCredits
            />
          </div>
        )}

        {/* Empty State */}
        {!summary && !isSyncing && groupKeys.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu điểm số</p>
            <Button variant="link" size="sm" onClick={handleSyncMyBK}>Nhấn để đồng bộ</Button>
          </div>
        )}

        {/* Subject Groups */}
        {groupKeys.map((kktKey, index) => (
          <div key={index} id={`group-${index}`} className="scroll-mt-20">
            {/* Group Header - Collapsible on Mobile */}
            <button
              onClick={() => toggleGroup(index)}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-t-xl border border-b-0 active:bg-muted transition-colors"
            >
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm sm:text-base text-primary line-clamp-1">
                  {groupedCourses[kktKey].name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {groupedCourses[kktKey].creditsEarned}/{groupedCourses[kktKey].creditsRequired} TC
                  {groupedCourses[kktKey].isCompleted && (
                    <span className="ml-2 text-green-600">✓ Hoàn thành</span>
                  )}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${expandedGroups[index] ? 'rotate-180' : ''}`} />
            </button>

            {/* Subjects List */}
            {expandedGroups[index] && (
              <div className="border rounded-b-xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[90px]">Mã MH</TableHead>
                        <TableHead>Tên môn học</TableHead>
                        <TableHead className="text-center w-[50px]">TC</TableHead>
                        <TableHead className="text-center w-[90px]">Điểm</TableHead>
                        <TableHead className="text-center w-[50px]">Mã</TableHead>
                        <TableHead className="text-center w-[70px]">TT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedCourses[kktKey].subjects.map((sub, idx) => (
                        <TableRow key={idx} className={predictedScores[sub.code] ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}>
                          <TableCell className="font-mono text-xs">{sub.code}</TableCell>
                          <TableCell className="text-sm">{sub.name}</TableCell>
                          <TableCell className="text-center">{sub.credits}</TableCell>
                          <TableCell className="text-center font-bold">
                            {sub.isIncomplete ? (
                              <input
                                type="number"
                                min="0" max="10" step="0.1"
                                className="w-16 h-8 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-primary font-bold text-sm"
                                placeholder="Aim"
                                value={predictedScores[sub.code] || ""}
                                onChange={(e) => handleScoreChange(sub.code, e.target.value)}
                              />
                            ) : (
                              <span>{sub.score}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {sub.isIncomplete && predictedScores[sub.code] ? (
                              <span className="text-blue-600 font-bold">
                                {getLetterGrade(parseFloat(predictedScores[sub.code]))}
                              </span>
                            ) : sub.grade}
                          </TableCell>
                          <TableCell className="text-center">
                            {sub.passed ? (
                              <span className="text-green-600 text-xs font-medium">Đạt</span>
                            ) : sub.isIncomplete ? (
                              predictedScores[sub.code] ? (
                                <span className="text-blue-600 text-xs font-medium">Aim</span>
                              ) : (
                                <span className="text-muted-foreground text-xs">--</span>
                              )
                            ) : (
                              <span className="text-red-600 text-xs font-medium">Rớt</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y">
                  {groupedCourses[kktKey].subjects.map((sub, idx) => (
                    <MobileSubjectCard
                      key={idx}
                      subject={sub}
                      predictedScore={predictedScores[sub.code]}
                      onScoreChange={(val) => handleScoreChange(sub.code, val)}
                      convertToGpa4={convertToGpa4}
                      getLetterGrade={getLetterGrade}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {rawDetails.length > 0 && (
          <p className="text-center text-[11px] text-muted-foreground py-4">
            GPA chính xác 3 số thập phân • Môn &gt; 10đ tính TC nhưng không tính GPA
          </p>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized Summary Card
function MobileSummaryCard({ title, value, predictedValue, color, isCredits = false }) {
  const formatValue = (val) => {
    if (val === null || val === undefined) return "--";
    if (isCredits) return Math.round(parseFloat(val));
    return parseFloat(val).toFixed(2);
  };

  const formatPrecise = (val) => {
    if (val === null || val === undefined) return null;
    if (isCredits) return Math.round(parseFloat(val));
    return parseFloat(val).toFixed(3);
  };

  const isImproved = predictedValue && parseFloat(predictedValue) > parseFloat(value || 0);
  const isDecreased = predictedValue && parseFloat(predictedValue) < parseFloat(value || 0);

  const palette = {
    blue: {
      card: 'border-blue-200/60 bg-gradient-to-br from-blue-100/80 to-white dark:from-blue-950/55 dark:to-card',
      title: 'text-blue-700/80 dark:text-blue-300/90',
      value: 'text-blue-900 dark:text-blue-50',
      subtle: 'text-blue-700/70 dark:text-blue-200/70',
      aimBadge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-900/50',
    },
    green: {
      card: 'border-green-200/60 bg-gradient-to-br from-green-100/80 to-white dark:from-green-950/55 dark:to-card',
      title: 'text-green-700/80 dark:text-green-300/90',
      value: 'text-green-900 dark:text-green-50',
      subtle: 'text-green-700/70 dark:text-green-200/70',
      aimBadge: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-900/50',
    },
    orange: {
      card: 'border-orange-200/60 bg-gradient-to-br from-orange-100/80 to-white dark:from-orange-950/55 dark:to-card',
      title: 'text-orange-700/80 dark:text-orange-300/90',
      value: 'text-orange-900 dark:text-orange-50',
      subtle: 'text-orange-700/70 dark:text-orange-200/70',
      aimBadge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-900/50',
    },
  };

  const p = palette[color] || palette.blue;

  return (
    <Card className={`relative overflow-hidden border ${p.card}`}>
      <CardContent className="p-2.5 sm:p-4">
        <p className={`text-[10px] sm:text-xs font-medium truncate ${p.title}`}>{title}</p>

        <div className="mt-1">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`text-lg sm:text-2xl font-bold leading-none ${p.value}`}>{formatPrecise(value) || formatValue(value)}</span>
            {predictedValue && (
              <div className="flex items-center gap-0.5">
                {isImproved ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : isDecreased ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : null}
                <span className={`text-sm sm:text-lg font-bold ${isImproved ? 'text-green-600' : isDecreased ? 'text-red-500' : 'text-blue-500'
                  }`}>
                  {formatPrecise(predictedValue) || formatValue(predictedValue)}
                </span>
              </div>
            )}
          </div>
          {!isCredits && (
            <p className={`text-[9px] mt-0.5 ${p.subtle}`}>
              ≈ {formatValue(predictedValue || value)}
            </p>
          )}
        </div>

        {predictedValue && (
          <Badge className={`absolute top-1 right-1 text-[8px] px-1.5 py-0 h-4 border ${p.aimBadge}`}>
            Aim
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Mobile Subject Card
function MobileSubjectCard({ subject, predictedScore, onScoreChange, convertToGpa4, getLetterGrade }) {
  const sub = subject;
  const hasPrediction = predictedScore && predictedScore !== "";

  return (
    <div className={`p-3 ${hasPrediction ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight line-clamp-2">{sub.name}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{sub.code}</span>
            <span>•</span>
            <span>{sub.credits} TC</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {sub.isIncomplete ? (
            <div className="flex flex-col items-end gap-1">
              <input
                type="number"
                inputMode="decimal"
                min="0" max="10" step="0.1"
                className="w-16 h-9 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-primary font-bold"
                placeholder="Aim"
                value={predictedScore || ""}
                onChange={(e) => onScoreChange(e.target.value)}
              />
              {hasPrediction && (
                <span className="text-[10px] text-blue-600 font-medium">
                  → {getLetterGrade(parseFloat(predictedScore))} ({convertToGpa4(parseFloat(predictedScore)).toFixed(1)})
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold">{sub.score}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">{sub.grade}</span>
                {sub.passed ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700">Đạt</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700">Rớt</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
