// Xử lý chuyển tab
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Khởi tạo lưới thời khóa biểu
function initializeScheduleGrid() {
    const grid = document.querySelector('.schedule-grid');
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    
    // Tạo header cho các ngày
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'schedule-cell';
        dayHeader.textContent = day;
        dayHeader.style.backgroundColor = '#f8f9fa';
        dayHeader.style.fontWeight = 'bold';
        grid.appendChild(dayHeader);
    });

    // Tạo các ô trống cho thời khóa biểu (16 tiết * 6 ngày)
    for (let i = 0; i < 16 * 6; i++) {
        const cell = document.createElement('div');
        cell.className = 'schedule-cell';
        grid.appendChild(cell);
    }
}

// Xử lý dữ liệu thời khóa biểu
function parseScheduleData(input) {
    const scheduleData = [];
    const lines = input.trim().split('\n');
    
    lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length >= 12) {
            const [semester, code, name, credits, feeCredits, group, day, periods, time, room, location, weeks] = columns;
            
            // Bỏ qua các môn không có thời gian học cụ thể
            if (day === '--' || periods === '--') {
                return;
            }

            // Xử lý thông tin tiết học
            const [startPeriod, endPeriod] = periods.split(' - ').map(p => parseInt(p));
            
            // Xử lý thời gian học
            const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                const [_, startHour, startMin, endHour, endMin] = timeMatch;
                const startTime = `${startHour.padStart(2, '0')}:${startMin}`;
                const endTime = `${endHour.padStart(2, '0')}:${endMin}`;
                
                // Tính số tiết dựa trên thời gian thực tế
                const startMinutes = parseInt(startHour) * 60 + parseInt(startMin);
                const endMinutes = parseInt(endHour) * 60 + parseInt(endMin);
                const durationInMinutes = endMinutes - startMinutes;
                const numberOfPeriods = Math.ceil(durationInMinutes / 50); // Mỗi tiết 50 phút

                // Xử lý tuần học
                const weekList = parseWeeks(weeks);
                
                scheduleData.push({
                    code: code,
                    name: name,
                    day: parseInt(day),
                    startPeriod: startPeriod,
                    endPeriod: startPeriod + numberOfPeriods - 2,
                    room: room,
                    credits: parseInt(credits) || 0,
                    time: time,
                    group: group,
                    location: location,
                    weeks: weekList
                });
            }
        }
    });
    
    return scheduleData;
}

// Hàm phân tích chuỗi tuần học
function parseWeeks(weeksStr) {
    const weeks = [];
    const parts = weeksStr.split('|');
    
    parts.forEach(part => {
        if (part === '--') return;
        
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(w => parseInt(w));
            for (let i = start; i <= end; i++) {
                weeks.push(i);
            }
        } else if (part) {
            weeks.push(parseInt(part));
        }
    });
    
    return weeks;
}

// Map lưu trữ màu sắc cho mỗi mã môn học
const courseColors = new Map();

// Danh sách màu cố định cho các môn học
const predefinedColors = [
    'rgba(255, 99, 132, 0.2)',   // Hồng nhạt
    'rgba(54, 162, 235, 0.2)',   // Xanh dương nhạt
    'rgba(255, 206, 86, 0.2)',   // Vàng nhạt
    'rgba(75, 192, 192, 0.2)',   // Xanh lá nhạt
    'rgba(153, 102, 255, 0.2)',  // Tím nhạt
    'rgba(255, 159, 64, 0.2)',   // Cam nhạt
    'rgba(199, 199, 199, 0.2)',  // Xám nhạt
    'rgba(83, 102, 255, 0.2)',   // Xanh dương đậm nhạt
    'rgba(255, 99, 255, 0.2)',   // Hồng đậm nhạt
    'rgba(99, 255, 132, 0.2)'    // Xanh lá đậm nhạt
];

// Hàm lấy màu cho môn học
function getColorForCourse(courseCode) {
    if (!courseColors.has(courseCode)) {
        const colorIndex = courseColors.size % predefinedColors.length;
        courseColors.set(courseCode, predefinedColors[colorIndex]);
    }
    return courseColors.get(courseCode);
}

// Hiển thị thời khóa biểu
function displaySchedule(scheduleData) {
    clearSchedule();
    const selectedWeek = parseInt(document.getElementById('week-select').value);
    
    scheduleData.forEach(course => {
        const dayIndex = course.day - 2; // Thứ 2 bắt đầu từ index 0
        const startIndex = course.startPeriod - 1;
        const duration = course.endPeriod - course.startPeriod + 1;
        
        // Tính toán vị trí cell trong grid
        const cellIndex = 6 + (startIndex * 6) + dayIndex + 1;
        const cell = document.querySelector(`.schedule-grid > div:nth-child(${cellIndex})`);
        
        if (cell) {
            const isActiveInWeek = course.weeks.includes(selectedWeek);
            
            if (!isActiveInWeek) {
                return; // Bỏ qua không hiển thị môn học không có trong tuần này
            }
            
            const color = getColorForCourse(course.code);
            cell.style.backgroundColor = color;
            cell.style.gridRow = `span ${duration}`;
            cell.style.borderBottom = '1px solid #e0e0e0';
            cell.style.position = 'relative';
            cell.style.zIndex = '1';
            
            // Thêm nội dung vào cell
            cell.innerHTML = `
                <div style="height: 100%; padding: 8px;">
                    <strong>${course.code}</strong><br>
                    ${course.name}<br>
                    Phòng: ${course.room}<br>
                    Thời gian: ${course.time}<br>
                    Nhóm: ${course.group}
                </div>
            `;

            // Xóa các cell bị che phủ
            for (let i = 1; i < duration; i++) {
                const nextCellIndex = cellIndex + (i * 6);
                const nextCell = document.querySelector(`.schedule-grid > div:nth-child(${nextCellIndex})`);
                if (nextCell) {
                    nextCell.style.display = 'none';
                }
            }
        }
    });
}

// Xóa thời khóa biểu hiện tại
function clearSchedule() {
    // Reset courseColors khi tạo thời khóa biểu mới
    if (document.getElementById('schedule-input').value.trim() === '') {
        courseColors.clear();
    }
    
    const cells = document.querySelectorAll('.schedule-grid > div');
    for (let i = 6; i < cells.length; i++) { // Bỏ qua header
        cells[i].innerHTML = '';
        cells[i].style.backgroundColor = '';
        cells[i].style.gridRow = '';
        cells[i].style.display = 'block';
        cells[i].style.position = '';
        cells[i].style.zIndex = '';
        cells[i].style.borderBottom = '1px solid #e0e0e0';
        cells[i].classList.remove('inactive');
    }
}

// Hiển thị chương trình đào tạo
function displayCurriculum() {
    const major = document.getElementById('major-select').value;
    const pdfViewer = document.getElementById('pdf-viewer');
    
    if (!major) {
        pdfViewer.src = '';
        return;
    }
    
    // Map các ngành học với ID file trên Google Drive
    const pdfLinks = {
        'KHMT': '1ebgPzwl88UWAzhI5Jg0O71JzlkhIKQyE',
        'KTMT': 'your_file_id_here',
        'KTPM': 'your_file_id_here',
        'HTTT': 'your_file_id_here'
    };
    
    const fileId = pdfLinks[major];
    if (fileId) {
        // Sử dụng Google Drive Viewer
        pdfViewer.src = `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
        pdfViewer.src = '';
        console.log('Không tìm thấy file PDF cho ngành này');
    }
}

// Xử lý dữ liệu lịch thi
function parseExamData(input) {
    const examData = [];
    const lines = input.trim().split('\n');
    
    lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length >= 11) {
            const [semester, subject, group, examDate, type, location, room, day, startTime, duration, lastUpdate] = columns;
            
            // Tách mã môn và tên môn
            const [code, name] = subject.split(' - ');
            
            // Định dạng lại thời gian
            const formattedTime = startTime.replace('g', ':');
            
            // Chuyển đổi ngày thi sang đối tượng Date để sắp xếp
            const date = new Date(examDate);
            
            examData.push({
                code: code,
                name: name,
                group: group,
                rawDate: examDate, // Lưu ngày gốc để sắp xếp
                date: date.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                }),
                type: type,
                location: location,
                room: room,
                time: formattedTime,
                duration: duration
            });
        }
    });
    
    // Sắp xếp theo ngày thi và thời gian
    examData.sort((a, b) => {
        // So sánh ngày trước
        const dateCompare = new Date(a.rawDate) - new Date(b.rawDate);
        if (dateCompare !== 0) return dateCompare;
        
        // Nếu cùng ngày, so sánh giờ
        return a.time.localeCompare(b.time);
    });
    
    // Nhóm các môn thi theo ngày
    const groupedExams = {};
    examData.forEach(exam => {
        if (!groupedExams[exam.rawDate]) {
            groupedExams[exam.rawDate] = [];
        }
        groupedExams[exam.rawDate].push(exam);
    });
    
    return groupedExams;
}

// Hiển thị lịch thi
function displayExam(groupedExams) {
    const examList = document.getElementById('exam-list');
    examList.innerHTML = '';
    
    // Lặp qua từng ngày thi
    Object.keys(groupedExams).sort().forEach(date => {
        const exams = groupedExams[date];
        const dateHeader = document.createElement('tr');
        dateHeader.className = 'date-header';
        dateHeader.innerHTML = `
            <td colspan="7" style="background-color: #f8f9fa; font-weight: bold; padding: 12px 15px;">
                ${new Date(date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                })}
            </td>
        `;
        examList.appendChild(dateHeader);
        
        // Hiển thị các môn thi trong ngày
        exams.forEach(exam => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${exam.code}</strong><br>
                    <span style="font-size: 0.9em">${exam.name}</span>
                </td>
                <td>${exam.group}</td>
                <td>${exam.time}</td>
                <td>
                    <span class="exam-type ${exam.type.toLowerCase()}">${exam.type}</span>
                </td>
                <td>${exam.room}</td>
                <td>${exam.location}</td>
                <td>${exam.duration} phút</td>
            `;
            examList.appendChild(row);
        });
    });
}

// Hàm lưu dữ liệu vào localStorage
function saveDataToLocalStorage() {
    const scheduleInput = document.getElementById('schedule-input').value;
    const examInput = document.getElementById('exam-input').value;
    const selectedWeek = document.getElementById('week-select').value;
    
    const savedData = {
        schedule: scheduleInput,
        exam: examInput,
        week: selectedWeek,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('studentScheduleData', JSON.stringify(savedData));
}

// Hàm tải dữ liệu từ localStorage
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('studentScheduleData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Kiểm tra xem dữ liệu có quá cũ không (ví dụ: 6 tháng)
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
        
        if (now - lastUpdated > sixMonthsInMs) {
            // Dữ liệu quá cũ, xóa đi
            localStorage.removeItem('studentScheduleData');
            return;
        }
        
        // Khôi phục dữ liệu
        if (data.schedule) {
            document.getElementById('schedule-input').value = data.schedule;
            const scheduleData = parseScheduleData(data.schedule);
            displaySchedule(scheduleData);
        }
        
        if (data.exam) {
            document.getElementById('exam-input').value = data.exam;
            const examData = parseExamData(data.exam);
            displayExam(examData);
        }
        
        if (data.week) {
            document.getElementById('week-select').value = data.week;
        }
    }
}

// Cập nhật event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeScheduleGrid();
    
    // Tải dữ liệu đã lưu khi trang web được mở
    loadDataFromLocalStorage();
    
    document.getElementById('generate-schedule').addEventListener('click', () => {
        const input = document.getElementById('schedule-input').value;
        const scheduleData = parseScheduleData(input);
        displaySchedule(scheduleData);
        saveDataToLocalStorage(); // Lưu sau khi tạo thời khóa biểu
    });
    
    document.getElementById('generate-exam').addEventListener('click', () => {
        const input = document.getElementById('exam-input').value;
        const examData = parseExamData(input);
        displayExam(examData);
        saveDataToLocalStorage(); // Lưu sau khi tạo lịch thi
    });
    
    document.getElementById('week-select').addEventListener('change', () => {
        const input = document.getElementById('schedule-input').value;
        if (input) {
            const scheduleData = parseScheduleData(input);
            displaySchedule(scheduleData);
            saveDataToLocalStorage(); // Lưu khi thay đổi tuần
        }
    });
    
    document.getElementById('major-select').addEventListener('change', displayCurriculum);
    
    // Thêm nút xóa dữ liệu đã lưu
    const clearDataButton = document.createElement('button');
    clearDataButton.textContent = 'Xóa dữ liệu đã lưu';
    clearDataButton.style.marginLeft = '10px';
    clearDataButton.style.backgroundColor = '#e74c3c';
    clearDataButton.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã lưu?')) {
            localStorage.removeItem('studentScheduleData');
            location.reload(); // Tải lại trang
        }
    });
    
    // Thêm nút vào giao diện
    const header = document.querySelector('header');
    header.appendChild(clearDataButton);
    
    // Tự động lưu khi người dùng nhập dữ liệu
    ['schedule-input', 'exam-input'].forEach(id => {
        document.getElementById(id).addEventListener('input', debounce(saveDataToLocalStorage, 1000));
    });
    
    // Cập nhật ngày tháng và tuần hiện tại
    updateCurrentDateAndWeek();
    
    // Cập nhật mỗi phút
    setInterval(updateCurrentDateAndWeek, 60000);
});

// Hàm debounce để tránh lưu quá nhiều lần
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hàm chuyển đổi điểm hệ 10 sang hệ 4
function convertTo4Scale(score) {
    if (score >= 8.5) return 4.0;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.5) return 2.5;
    if (score >= 5.5) return 2.0;
    if (score >= 5.0) return 1.5;
    if (score >= 4.0) return 1.0;
    return 0.0;
}

// Hàm xếp loại học lực
function getClassification(gpa4) {
    if (gpa4 >= 3.6) return "Xuất sắc";
    if (gpa4 >= 3.2) return "Giỏi";
    if (gpa4 >= 2.5) return "Khá";
    if (gpa4 >= 2.0) return "Trung bình";
    if (gpa4 >= 1.0) return "Yếu";
    return "Kém";
}

// Hàm tạo hàng mới trong bảng môn học
function createCourseRow() {
    const tbody = document.getElementById('courses-body');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td><input type="text" class="course-name" placeholder="Nhập tên môn"></td>
        <td><input type="number" class="course-credits" min="1" max="10" placeholder="Số TC"></td>
        <td><input type="number" class="course-score" min="0" max="10" step="0.1" placeholder="Điểm hệ 10"></td>
        <td><input type="number" class="course-score-4" readonly></td>
        <td><button class="delete-course">Xóa</button></td>
    `;
    
    // Thêm event listener cho điểm hệ 10
    const scoreInput = row.querySelector('.course-score');
    const score4Input = row.querySelector('.course-score-4');
    
    scoreInput.addEventListener('input', () => {
        const score10 = parseFloat(scoreInput.value);
        if (!isNaN(score10)) {
            score4Input.value = convertTo4Scale(score10).toFixed(1);
            calculateGPA();
        } else {
            score4Input.value = '';
        }
    });
    
    // Thêm event listener cho nút xóa
    const deleteButton = row.querySelector('.delete-course');
    deleteButton.addEventListener('click', () => {
        row.remove();
        calculateGPA();
    });
    
    tbody.appendChild(row);
}

// Hàm tính GPA
function calculateGPA() {
    let totalCredits = 0;
    let totalScore10 = 0;
    let totalScore4 = 0;
    
    document.querySelectorAll('#courses-body tr').forEach(row => {
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const score10 = parseFloat(row.querySelector('.course-score').value) || 0;
        const score4 = parseFloat(row.querySelector('.course-score-4').value) || 0;
        
        if (credits > 0 && score10 > 0) {
            totalCredits += credits;
            totalScore10 += score10 * credits;
            totalScore4 += score4 * credits;
        }
    });
    
    const gpa10 = totalCredits > 0 ? totalScore10 / totalCredits : 0;
    const gpa4 = totalCredits > 0 ? totalScore4 / totalCredits : 0;
    
    document.getElementById('total-credits').textContent = totalCredits;
    document.getElementById('gpa-10').textContent = gpa10.toFixed(2);
    document.getElementById('gpa-4').textContent = gpa4.toFixed(2);
    document.getElementById('grade-classification').textContent = getClassification(gpa4);
    
    // Lưu dữ liệu vào localStorage
    saveGPAData();
}

// Hàm lưu dữ liệu GPA
function saveGPAData() {
    const courses = [];
    document.querySelectorAll('#courses-body tr').forEach(row => {
        courses.push({
            name: row.querySelector('.course-name').value,
            credits: row.querySelector('.course-credits').value,
            score10: row.querySelector('.course-score').value,
            score4: row.querySelector('.course-score-4').value
        });
    });
    
    const gpaData = {
        courses: courses,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('studentGPAData', JSON.stringify(gpaData));
}

// Hàm tải dữ liệu GPA
function loadGPAData() {
    const savedData = localStorage.getItem('studentGPAData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Kiểm tra xem dữ liệu có quá cũ không (ví dụ: 6 tháng)
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
        
        if (now - lastUpdated > sixMonthsInMs) {
            localStorage.removeItem('studentGPAData');
            return;
        }
        
        // Khôi phục dữ liệu
        data.courses.forEach(course => {
            createCourseRow();
            const row = document.querySelector('#courses-body tr:last-child');
            row.querySelector('.course-name').value = course.name;
            row.querySelector('.course-credits').value = course.credits;
            row.querySelector('.course-score').value = course.score10;
            row.querySelector('.course-score-4').value = course.score4;
        });
        
        calculateGPA();
    }
}

// Cập nhật event listeners
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Thêm event listener cho nút thêm môn học
    document.getElementById('add-course').addEventListener('click', createCourseRow);
    
    // Tải dữ liệu GPA đã lưu
    loadGPAData();
    
    // Nếu chưa có môn học nào, tạo một hàng trống
    if (document.querySelectorAll('#courses-body tr').length === 0) {
        createCourseRow();
    }
});

// Hàm tính tuần trong năm
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// Hàm cập nhật ngày tháng và tuần hiện tại
function updateCurrentDateAndWeek() {
    const now = new Date();
    
    // Cập nhật ngày tháng
    const dateStr = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('current-date').textContent = dateStr;
    
    // Cập nhật tuần
    const weekNumber = getWeekNumber(now);
    document.getElementById('current-week').textContent = weekNumber;
    
    // Tự động chọn tuần hiện tại trong dropdown nếu nằm trong khoảng cho phép
    const weekSelect = document.getElementById('week-select');
    const weekOptions = Array.from(weekSelect.options).map(opt => parseInt(opt.value));
    if (weekOptions.includes(weekNumber)) {
        weekSelect.value = weekNumber;
        // Trigger change event để cập nhật thời khóa biểu
        const event = new Event('change');
        weekSelect.dispatchEvent(event);
    }
}

// Hàm tạo chuỗi ngẫu nhiên cho UID của sự kiện
function generateUID() {
    return 'event_' + Math.random().toString(36).substr(2, 9);
}

// Hàm định dạng ngày giờ theo định dạng iCalendar
function formatDateTime(date, time) {
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const newDate = new Date(date);
    
    // Đặt giờ và phút theo giờ Việt Nam
    newDate.setHours(hours, minutes, 0, 0);
    
    // Format ngày giờ theo định dạng YYYYMMDD'T'HHMMSS
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const hour = String(newDate.getHours()).padStart(2, '0');
    const minute = String(newDate.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}T${hour}${minute}00`;
}

// Hàm tạo nội dung file ICS
function generateICS(scheduleData) {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Student Schedule Manager//VN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();
    
    // Tạo sự kiện cho mỗi môn học trong tất cả các tuần
    scheduleData.forEach(course => {
        course.weeks.forEach(week => {
            // Tính ngày của tuần này
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const daysToAdd = (week - 1) * 7 + (course.day - 2);
            const eventDate = new Date(firstDayOfYear);
            eventDate.setDate(firstDayOfYear.getDate() + daysToAdd); // Thêm 1 ngày để bù đắp

            // Lấy thời gian bắt đầu và kết thúc
            const timeMatch = course.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
            if (!timeMatch) return;

            const [_, startHour, startMin, endHour, endMin] = timeMatch;
            const startTime = `${startHour.padStart(2, '0')}:${startMin}`;
            const endTime = `${endHour.padStart(2, '0')}:${endMin}`;

            // Tạo sự kiện
            const event = [
                'BEGIN:VEVENT',
                `UID:${generateUID()}`,
                `DTSTAMP:${formatDateTime(new Date(), '00:00')}`,
                `DTSTART:${formatDateTime(eventDate, startTime)}`,
                `DTEND:${formatDateTime(eventDate, endTime)}`,
                `SUMMARY:${course.name}`,
                `DESCRIPTION:Mã môn: ${course.code}\\nNhóm: ${course.group}\\nPhòng: ${course.room}\\nCơ sở: ${course.location}`,
                `LOCATION:${course.room} - ${course.location}`,
                'END:VEVENT'
            ];

            icsContent = icsContent.concat(event);
        });
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
}

// Hàm tải xuống file ICS
function downloadICS(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Cập nhật event listeners
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Thêm event listener cho nút xuất lịch
    document.getElementById('export-calendar').addEventListener('click', () => {
        const input = document.getElementById('schedule-input').value;
        if (!input) {
            alert('Vui lòng nhập dữ liệu thời khóa biểu trước khi xuất lịch!');
            return;
        }
        
        const scheduleData = parseScheduleData(input);
        const icsContent = generateICS(scheduleData);
        downloadICS(icsContent, 'thoikhoabieu.ics');
    });
    
    // ... rest of the existing code ...
}); 