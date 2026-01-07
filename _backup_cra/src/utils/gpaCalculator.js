// GPA calculation utilities
// Converted from original script.js GPA calculation logic

export const convertGrade10To4 = (grade10) => {
  const numGrade = parseFloat(grade10);
  if (isNaN(numGrade)) return 0;
  
  if (numGrade >= 8.5) return 4.0;
  if (numGrade >= 8.0) return 3.5;
  if (numGrade >= 7.0) return 3.0;
  if (numGrade >= 6.5) return 2.5;
  if (numGrade >= 5.5) return 2.0;
  if (numGrade >= 5.0) return 1.5;
  if (numGrade >= 4.0) return 1.0;
  return 0.0;
};

export const getLetterGrade = (grade10) => {
  const numGrade = parseFloat(grade10);
  if (isNaN(numGrade)) return 'F';
  
  if (numGrade >= 8.5) return 'A';
  if (numGrade >= 8.0) return 'B+';
  if (numGrade >= 7.0) return 'B';
  if (numGrade >= 6.5) return 'C+';
  if (numGrade >= 5.5) return 'C';
  if (numGrade >= 5.0) return 'D+';
  if (numGrade >= 4.0) return 'D';
  return 'F';
};

export const getClassification = (gpa10) => {
  const numGpa = parseFloat(gpa10);
  if (isNaN(numGpa)) return 'Chưa xác định';
  
  if (numGpa >= 8.0) return 'Xuất sắc';
  if (numGpa >= 7.0) return 'Giỏi';
  if (numGpa >= 5.5) return 'Khá';
  if (numGpa >= 4.0) return 'Trung bình';
  return 'Yếu/Kém';
};

export const calculateGPA = (courses) => {
  if (!courses || courses.length === 0) {
    return {
      totalCredits: 0,
      gpa4: 0,
      gpa10: 0,
      classification: 'Chưa xác định'
    };
  }

  let totalCredits = 0;
  let totalPoints4 = 0;
  let totalPoints10 = 0;

  courses.forEach(course => {
    const credits = parseFloat(course.credits) || 0;
    const grade10 = parseFloat(course.grade10) || 0;
    const grade4 = convertGrade10To4(grade10);

    totalCredits += credits;
    totalPoints4 += credits * grade4;
    totalPoints10 += credits * grade10;
  });

  const gpa4 = totalCredits > 0 ? totalPoints4 / totalCredits : 0;
  const gpa10 = totalCredits > 0 ? totalPoints10 / totalCredits : 0;

  return {
    totalCredits,
    gpa4: Math.round(gpa4 * 100) / 100,
    gpa10: Math.round(gpa10 * 100) / 100,
    classification: getClassification(gpa10)
  };
};

export const gradeScale = [
  { range: '8.5 - 10.0', letter: 'A/A+', gpa: 4.0, classification: 'Xuất sắc' },
  { range: '8.0 - 8.4', letter: 'B+', gpa: 3.5, classification: 'Xuất sắc' },
  { range: '7.0 - 7.9', letter: 'B', gpa: 3.0, classification: 'Giỏi' },
  { range: '6.5 - 6.9', letter: 'C+', gpa: 2.5, classification: 'Khá' },
  { range: '5.5 - 6.4', letter: 'C', gpa: 2.0, classification: 'Khá' },
  { range: '5.0 - 5.4', letter: 'D+', gpa: 1.5, classification: 'Trung bình' },
  { range: '4.0 - 4.9', letter: 'D', gpa: 1.0, classification: 'Trung bình' },
  { range: '< 4.0', letter: 'F', gpa: 0.0, classification: 'Yếu/Kém' },
];

export const getClassificationColor = (classification) => {
  const colors = {
    'Xuất sắc': '#4caf50',
    'Giỏi': '#2196f3',
    'Khá': '#ff9800',
    'Trung bình': '#ff5722',
    'Yếu/Kém': '#f44336',
    'Chưa xác định': '#9e9e9e'
  };
  return colors[classification] || '#9e9e9e';
};

export const getPriorityColor = (priority) => {
  const colors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50',
  };
  return colors[priority] || '#9e9e9e';
};
