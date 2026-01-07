// Teaching schedule data and utilities
// Converted from original teaching-schedule.js

export const courseSuggestions = [
  'Cấu trúc dữ liệu và giải thuật',
  'Lập trình hướng đối tượng',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Hệ điều hành',
  'Trí tuệ nhân tạo',
  'Học máy',
  'Xử lý ảnh số',
  'Kỹ thuật phần mềm',
  'Phân tích và thiết kế hệ thống',
  'Lập trình web',
  'Lập trình di động',
  'An toàn thông tin',
  'Kiến trúc máy tính',
  'Đồ họa máy tính',
  'Xử lý ngôn ngữ tự nhiên',
  'Thị giác máy tính',
  'Blockchain và ứng dụng',
  'Internet of Things',
  'Cloud Computing'
];

// Mock data for teaching schedule - replace with actual API calls
export const mockTeachingData = {
  'CS101': {
    courseName: 'Cấu trúc dữ liệu và giải thuật',
    teachers: [
      {
        name: 'GS. Nguyễn Văn A',
        classes: [
          {
            classGroup: 'L01',
            schedule: [
              { day: 'Thứ 2', periods: '1-3', room: 'H1-101' },
              { day: 'Thứ 5', periods: '7-9', room: 'H1-102' }
            ]
          }
        ]
      },
      {
        name: 'PGS. Trần Thị B',
        classes: [
          {
            classGroup: 'L02',
            schedule: [
              { day: 'Thứ 3', periods: '1-3', room: 'H2-201' },
              { day: 'Thứ 6', periods: '7-9', room: 'H2-202' }
            ]
          }
        ]
      }
    ]
  },
  'CS102': {
    courseName: 'Lập trình hướng đối tượng',
    teachers: [
      {
        name: 'TS. Lê Văn C',
        classes: [
          {
            classGroup: 'L01',
            schedule: [
              { day: 'Thứ 2', periods: '4-6', room: 'H3-301' },
              { day: 'Thứ 4', periods: '1-3', room: 'H3-302' }
            ]
          }
        ]
      }
    ]
  }
};

export const searchByCode = async (courseCode) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const data = mockTeachingData[courseCode.toUpperCase()];
  if (data) {
    return [{
      courseCode: courseCode.toUpperCase(),
      courseName: data.courseName,
      teachers: data.teachers
    }];
  }
  
  return [];
};

export const searchByName = async (courseName) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const matchingCourses = Object.entries(mockTeachingData).filter(([code, data]) =>
    data.courseName.toLowerCase().includes(courseName.toLowerCase())
  );
  
  return matchingCourses.map(([code, data]) => ({
    courseCode: code,
    courseName: data.courseName,
    teachers: data.teachers.map(teacher => teacher.name)
  }));
};

export const getTeachersForCourse = (courseName) => {
  const courseEntry = Object.entries(mockTeachingData).find(([code, data]) =>
    data.courseName.toLowerCase() === courseName.toLowerCase()
  );
  
  if (courseEntry) {
    return courseEntry[1].teachers.map(teacher => teacher.name);
  }
  
  return [];
};

export const getScheduleForTeacher = (courseName, teacherName) => {
  const courseEntry = Object.entries(mockTeachingData).find(([code, data]) =>
    data.courseName.toLowerCase() === courseName.toLowerCase()
  );
  
  if (courseEntry) {
    const teacher = courseEntry[1].teachers.find(t => t.name === teacherName);
    if (teacher) {
      return {
        courseCode: courseEntry[0],
        courseName: courseEntry[1].courseName,
        teacher: teacherName,
        classes: teacher.classes
      };
    }
  }
  
  return null;
};
