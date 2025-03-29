// Xử lý menu tròn và thanh bên
document.addEventListener('DOMContentLoaded', function() {
    const toggleMenuButton = document.getElementById('toggle-menu');
    const sideMenu = document.querySelector('.side-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const container = document.querySelector('.container');
    const sideMenuItems = document.querySelectorAll('.side-menu-item');
    
    // Hàm để toggle menu
    function toggleMenu() {
        toggleMenuButton.classList.toggle('active');
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        container.classList.toggle('menu-open');
        
        // Hiệu ứng xoay nhẹ khi menu được mở
        if (toggleMenuButton.classList.contains('active')) {
            gsap.to(toggleMenuButton, {
                rotation: 180,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        } else {
            gsap.to(toggleMenuButton, {
                rotation: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        }
    }
    
    // Event listener cho nút menu
    toggleMenuButton.addEventListener('click', toggleMenu);
    
    // Đóng menu khi click vào overlay
    menuOverlay.addEventListener('click', toggleMenu);
    
    // Xử lý click vào các mục menu
    sideMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all menu items
            sideMenuItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the data-tab value
            const tabId = this.getAttribute('data-tab');
            
            // Show the corresponding tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabId).classList.add('active');
            
            // Luôn đóng menu sau khi chọn tab, không phụ thuộc kích thước màn hình
            toggleMenu();
            
            // Update the active state of tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.classList.remove('active');
                if (button.getAttribute('data-tab') === tabId) {
                    button.classList.add('active');
                }
            });
        });
    });
    
    // Xử lý click vào các nút tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the data-tab value
            const tabId = this.getAttribute('data-tab');
            
            // Show the corresponding tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabId).classList.add('active');
            
            // Update the active state of side menu items
            const sideMenuItems = document.querySelectorAll('.side-menu-item');
            sideMenuItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-tab') === tabId) {
                    item.classList.add('active');
                }
            });
        });
    });
    
    // Hiệu ứng khi di chuột qua các mục menu
    sideMenuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsap.to(this, {
                paddingLeft: '40px',
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                gsap.to(this, {
                    paddingLeft: '30px',
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    });
    
    // Thêm hiệu ứng xuất hiện cho các mục menu khi menu được mở
    function animateMenuItems() {
        if (sideMenu.classList.contains('active')) {
            gsap.fromTo('.side-menu-item', 
                {
                    opacity: 0,
                    x: -20
                },
                {
                    opacity: 1,
                    x: 0,
                    stagger: 0.05,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: 0.2
                }
            );
        }
    }
    
    // Thêm animation cho menu khi mở/đóng
    toggleMenuButton.addEventListener('click', function() {
        if (!sideMenu.classList.contains('active')) {
            // Delay để đợi side menu xuất hiện trước khi animate các menu items
            setTimeout(animateMenuItems, 100);
        }
    });
    
    // Animate menu ban đầu nếu menu active
    if (sideMenu.classList.contains('active')) {
        animateMenuItems();
    }
    
    // Animation cho menu overlay
    function animateOverlay() {
        if (menuOverlay.classList.contains('active')) {
            gsap.fromTo('.menu-overlay', 
                {
                    opacity: 0
                },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out"
                }
            );
        } else {
            gsap.to('.menu-overlay', 
                {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power1.in"
                }
            );
        }
    }
    
    // Thêm animation cho overlay
    toggleMenuButton.addEventListener('click', animateOverlay);
    menuOverlay.addEventListener('click', animateOverlay);
    
    // Thêm hiệu ứng ripple cho nút menu
    toggleMenuButton.addEventListener('click', function(e) {
        const x = e.clientX - this.getBoundingClientRect().left;
        const y = e.clientY - this.getBoundingClientRect().top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Xử lý chuyển tab
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        
        // Cập nhật menu bên tương ứng
        document.querySelectorAll('.side-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === button.dataset.tab) {
                item.classList.add('active');
            }
        });
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
    
    // Tạo hiệu ứng loading
    document.querySelector('.schedule-grid').style.opacity = '0.6';
    
    setTimeout(() => {
        scheduleData.forEach((course, index) => {
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
                
                // Thêm nội dung vào cell với hiệu ứng xuất hiện dần
                cell.innerHTML = `
                    <div style="height: 100%; opacity: 0; transform: translateY(10px); transition: all 0.3s ease ${index * 0.05}s;">
                        <strong>${course.code}</strong>
                        ${course.name}<br>
                        Phòng: ${course.room}<br>
                        Thời gian: ${course.time}<br>
                        Nhóm: ${course.group}
                    </div>
                `;
                
                // Hiệu ứng xuất hiện sau một khoảng thời gian ngắn
                setTimeout(() => {
                    const contentDiv = cell.querySelector('div');
                    if (contentDiv) {
                        contentDiv.style.opacity = '1';
                        contentDiv.style.transform = 'translateY(0)';
                    }
                }, 50);

                // Xóa các cell bị che phủ với hiệu ứng mờ dần
                for (let i = 1; i < duration; i++) {
                    const nextCellIndex = cellIndex + (i * 6);
                    const nextCell = document.querySelector(`.schedule-grid > div:nth-child(${nextCellIndex})`);
                    if (nextCell) {
                        nextCell.classList.add('hidden');
                        setTimeout(() => {
                            nextCell.style.display = 'none';
                        }, 300);
                    }
                }
            }
        });
        
        // Kết thúc hiệu ứng loading
        document.querySelector('.schedule-grid').style.opacity = '1';
        
        // Hiển thị thời khóa biểu cho mobile
        displayMobileSchedule(scheduleData);
    }, 300);
}

// Xóa thời khóa biểu hiện tại
function clearSchedule() {
    // Reset courseColors khi tạo thời khóa biểu mới
    if (document.getElementById('schedule-input').value.trim() === '') {
        courseColors.clear();
    }
    
    // Thêm hiệu ứng fade out trước khi xóa
    const cells = document.querySelectorAll('.schedule-grid > div');
    for (let i = 6; i < cells.length; i++) { // Bỏ qua header
        cells[i].style.transition = 'all 0.3s ease';
        cells[i].style.opacity = '0';
        cells[i].style.transform = 'scale(0.95)';
    }
    
    // Đợi hiệu ứng hoàn thành trước khi reset
    setTimeout(() => {
        for (let i = 6; i < cells.length; i++) { // Bỏ qua header
            cells[i].innerHTML = '';
            cells[i].style.backgroundColor = '';
            cells[i].style.gridRow = '';
            cells[i].style.display = 'block';
            cells[i].style.position = '';
            cells[i].style.opacity = '1';
            cells[i].style.transform = 'none';
            cells[i].classList.remove('hidden');
        }
    }, 250);
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
    initializeMobileSchedule();
    loadDataFromLocalStorage();
    updateCurrentDateAndWeek();
    
    // Cập nhật ngày tháng ở góc phải ngay lập tức
    updateCornerDateTime();
    
    // Cập nhật mỗi giây
    setInterval(updateCornerDateTime, 1000);
    
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
    
    document.getElementById('week-select').addEventListener('change', function() {
        const scheduleInput = document.getElementById('schedule-input').value;
        if (scheduleInput.trim() === '') return;
        
        const scheduleData = parseScheduleData(scheduleInput);
        if (scheduleData.length === 0) return;
        
        // Cập nhật localStorage với tuần đã chọn
        saveDataToLocalStorage();
        
        // Hiển thị lại thời khóa biểu với tuần mới
        displaySchedule(scheduleData);
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
    
    // Kiểm tra deadline của các kế hoạch
    if (document.getElementById('deadline-notifications')) {
        checkAndDisplayDeadlineNotifications();
    }
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

// Tạo id duy nhất
function generateUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            const daysToAdd = (week - 1) * 7 + (course.day - 1);
            const eventDate = new Date(firstDayOfYear);
            // Thêm 1 ngày vào ngày sự kiện để bù trừ
            eventDate.setDate(firstDayOfYear.getDate() + daysToAdd - 1);

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

// Hàm lấy ngày bắt đầu của tuần học
function getStartDateOfWeek(weekNumber) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Xác định năm học dựa vào số tuần
    let year;
    if (weekNumber >= 1 && weekNumber <= 23) {
        // Học kỳ 2 (tuần 1-23) bắt đầu từ tháng 1 năm sau
        year = currentYear + 1;
    } else {
        // Học kỳ 1 (tuần 35-50) bắt đầu từ tháng 8 năm hiện tại
        year = currentYear;
    }

    // Tính ngày bắt đầu của tuần
    const firstDayOfYear = new Date(year, 0, 1);
    let daysToAdd;
    
    if (weekNumber >= 1 && weekNumber <= 23) {
        // Học kỳ 2: tính từ tuần 1 của năm mới
        daysToAdd = (weekNumber - 1) * 7;
    } else {
        // Học kỳ 1: tính từ tuần 35
        daysToAdd = (weekNumber - 35) * 7;
    }
    
    const startDate = new Date(firstDayOfYear);
    startDate.setDate(firstDayOfYear.getDate() + daysToAdd);
    
    return startDate;
}

// Hàm tạo sự kiện cho Google Calendar
function createCalendarEvent(subject, dayOfWeek, startTime, endTime, location, weekNumbers) {
    const events = [];
    
    weekNumbers.forEach(week => {
        // Lấy ngày bắt đầu của tuần
        const weekStartDate = getStartDateOfWeek(parseInt(week));
        
        // Tính ngày của sự kiện dựa vào thứ trong tuần
        const eventDate = new Date(weekStartDate);
        let targetDay = dayOfWeek - 2; // Chuyển đổi thứ 2-CN (2-8) sang 0-6
        if (targetDay < 0) targetDay = 6; // Chủ nhật
        eventDate.setDate(weekStartDate.getDate() + targetDay);
        
        // Tạo thời gian bắt đầu và kết thúc
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const start = new Date(eventDate);
        start.setHours(startHour, startMinute, 0);
        
        const end = new Date(eventDate);
        end.setHours(endHour, endMinute, 0);
        
        // Tạo sự kiện
        const event = {
            'summary': subject,
            'location': location,
            'start': {
                'dateTime': start.toISOString(),
                'timeZone': 'Asia/Ho_Chi_Minh'
            },
            'end': {
                'dateTime': end.toISOString(),
                'timeZone': 'Asia/Ho_Chi_Minh'
            },
            'recurrence': [],
            'reminders': {
                'useDefault': true
            }
        };
        
        events.push(event);
    });
    
    return events;
}

// Hàm xử lý xuất lịch sang Google Calendar
async function exportToGoogleCalendar() {
    // ... existing code ...
    
    scheduleData.forEach(subject => {
        subject.schedule.forEach(schedule => {
            const weekNumbers = schedule.weeks.map(week => week.toString());
            const [startTime, endTime] = schedule.time.split(' - ');
            
            const events = createCalendarEvent(
                subject.name,
                schedule.day,
                startTime,
                endTime,
                schedule.room,
                weekNumbers
            );
            
            allEvents.push(...events);
        });
    });
    
    // ... rest of the code ...
}

// ----- QUẢN LÝ GHI CHÚ VÀ KẾ HOẠCH -----

// Khởi tạo dữ liệu
let notes = [];
let plans = [];

// Biến toàn cục để lưu trữ các phần tử DOM
let notePlanElements;

// Lắng nghe sự kiện
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo DOM Elements khi tài liệu đã được tải xong
    notePlanElements = {
        addNoteBtn: document.getElementById('add-note-btn'),
        addPlanBtn: document.getElementById('add-plan-btn'),
        noteModal: document.getElementById('note-modal'),
        planModal: document.getElementById('plan-modal'),
        noteForm: document.getElementById('note-form'),
        planForm: document.getElementById('plan-form'),
        notesPlansItems: document.getElementById('notes-plans-items'),
        filterType: document.getElementById('filter-type'),
        deadlineNotifications: document.getElementById('deadline-notifications'),
        // Thêm các phần tử cho chế độ xem lịch
        listViewBtn: document.getElementById('list-view-btn'),
        calendarViewBtn: document.getElementById('calendar-view-btn'),
        listView: document.getElementById('list-view'),
        calendarView: document.getElementById('calendar-view'),
        calendarDays: document.getElementById('calendar-days'),
        calendarTitle: document.getElementById('calendar-title'),
        prevMonth: document.getElementById('prev-month'),
        nextMonth: document.getElementById('next-month')
    };
    
    // Khởi tạo dữ liệu từ localStorage
    loadNotesAndPlans();
    
    // Hiển thị dữ liệu ban đầu
    renderNotesAndPlans();
    
    // Kiểm tra và hiển thị thông báo deadline
    checkAndDisplayDeadlineNotifications();
    
    // Lắng nghe sự kiện cho các nút
    notePlanElements.addNoteBtn.addEventListener('click', showAddNoteModal);
    notePlanElements.addPlanBtn.addEventListener('click', showAddPlanModal);
    
    // Lắng nghe sự kiện đóng modal
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(el => {
        el.addEventListener('click', function() {
            notePlanElements.noteModal.style.display = 'none';
            notePlanElements.planModal.style.display = 'none';
        });
    });
    
    // Lắng nghe sự kiện submit form
    notePlanElements.noteForm.addEventListener('submit', handleNoteFormSubmit);
    notePlanElements.planForm.addEventListener('submit', handlePlanFormSubmit);
    
    // Lắng nghe sự kiện lọc
    notePlanElements.filterType.addEventListener('change', renderNotesAndPlans);
    
    // Khi người dùng click bên ngoài modal thì đóng modal
    window.addEventListener('click', function(event) {
        if (event.target === notePlanElements.noteModal) {
            notePlanElements.noteModal.style.display = 'none';
        }
        if (event.target === notePlanElements.planModal) {
            notePlanElements.planModal.style.display = 'none';
        }
    });
    
    // Thêm event listeners cho chế độ xem
    if (notePlanElements.listViewBtn && notePlanElements.calendarViewBtn) {
        notePlanElements.listViewBtn.addEventListener('click', () => {
            switchView('list');
        });
        
        notePlanElements.calendarViewBtn.addEventListener('click', () => {
            switchView('calendar');
        });
        
        notePlanElements.prevMonth.addEventListener('click', () => {
            changeMonth(-1);
        });
        
        notePlanElements.nextMonth.addEventListener('click', () => {
            changeMonth(1);
        });
    }
    
    // Khởi tạo lịch nếu ở tab Notes & Plans
    if (document.getElementById('calendar-days')) {
        initCalendar();
    }
});

// Biến lưu trữ tháng và năm hiện tại cho calendar
let currentCalendarDate = new Date();

// Hàm chuyển đổi giữa các chế độ xem
function switchView(viewType) {
    if (!notePlanElements) return;
    
    if (viewType === 'list') {
        notePlanElements.listViewBtn.classList.add('active');
        notePlanElements.calendarViewBtn.classList.remove('active');
        notePlanElements.listView.classList.add('active');
        notePlanElements.calendarView.classList.remove('active');
    } else if (viewType === 'calendar') {
        notePlanElements.listViewBtn.classList.remove('active');
        notePlanElements.calendarViewBtn.classList.add('active');
        notePlanElements.listView.classList.remove('active');
        notePlanElements.calendarView.classList.add('active');
        
        // Cập nhật lịch khi chuyển sang chế độ xem lịch
        renderCalendar();
    }
}

// Hàm chuyển tháng
function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

// Hàm khởi tạo lịch
function initCalendar() {
    currentCalendarDate = new Date(); // Đặt về tháng hiện tại
    renderCalendar();
}

// Hàm vẽ lịch
function renderCalendar() {
    if (!notePlanElements || !notePlanElements.calendarDays || !notePlanElements.calendarTitle) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Cập nhật tiêu đề lịch
    notePlanElements.calendarTitle.textContent = new Date(year, month, 1).toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric'
    });
    
    // Xóa tất cả các ngày hiện tại với hiệu ứng fade out
    const existingDays = notePlanElements.calendarDays.querySelectorAll('.calendar-day');
    if (existingDays.length > 0) {
        // Thêm class để tạo hiệu ứng fade-out
        existingDays.forEach(day => {
            day.style.opacity = '0';
            day.style.transform = 'scale(0.95)';
        });
        
        // Đợi hiệu ứng hoàn thành trước khi vẽ lại lịch
        setTimeout(() => {
            notePlanElements.calendarDays.innerHTML = '';
            drawCalendarDays(year, month);
        }, 200);
    } else {
        notePlanElements.calendarDays.innerHTML = '';
        drawCalendarDays(year, month);
    }
}

// Hàm vẽ các ngày trong lịch
function drawCalendarDays(year, month) {
    // Lấy ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1);
    // Lấy ngày cuối cùng của tháng
    const lastDay = new Date(year, month + 1, 0);
    
    // Lấy ngày trong tuần của ngày đầu tiên (0 = CN, 1 = T2, ..., 6 = T7)
    const firstDayIndex = firstDay.getDay();
    // Số ngày trong tháng
    const daysInMonth = lastDay.getDate();
    
    // Lấy ngày cuối cùng của tháng trước
    const prevLastDay = new Date(year, month, 0);
    const prevDaysInMonth = prevLastDay.getDate();
    
    // Số ô trống cần thêm vào cuối lịch
    const nextDays = 7 - ((firstDayIndex + daysInMonth) % 7 || 7);
    
    // Ngày hiện tại
    const today = new Date();
    
    // Render các ngày của tháng trước
    for (let i = firstDayIndex; i > 0; i--) {
        const dayElement = createCalendarDay(prevDaysInMonth - i + 1, 'other-month', new Date(year, month - 1, prevDaysInMonth - i + 1));
        
        // Thêm hiệu ứng animation
        setTimeout(() => {
            dayElement.style.opacity = '1';
            dayElement.style.transform = 'translateY(0)';
        }, 50 * (firstDayIndex - i));
        
        notePlanElements.calendarDays.appendChild(dayElement);
    }
    
    // Render các ngày của tháng hiện tại
    for (let i = 1; i <= daysInMonth; i++) {
        let className = '';
        if (i === today.getDate() && 
            today.getMonth() === month && 
            today.getFullYear() === year) {
            className = 'today';
        }
        
        const dayElement = createCalendarDay(i, className, new Date(year, month, i));
        
        // Thêm hiệu ứng animation
        setTimeout(() => {
            dayElement.style.opacity = '1';
            dayElement.style.transform = 'translateY(0)';
        }, 50 * (i + firstDayIndex));
        
        notePlanElements.calendarDays.appendChild(dayElement);
    }
    
    // Render các ngày của tháng sau
    for (let i = 1; i <= nextDays; i++) {
        const dayElement = createCalendarDay(i, 'other-month', new Date(year, month + 1, i));
        
        // Thêm hiệu ứng animation
        setTimeout(() => {
            dayElement.style.opacity = '1';
            dayElement.style.transform = 'translateY(0)';
        }, 50 * (i + firstDayIndex + daysInMonth));
        
        notePlanElements.calendarDays.appendChild(dayElement);
    }
    
    // Hiển thị các kế hoạch lên lịch sau khi tất cả các ngày đã được tạo
    setTimeout(() => {
        renderPlansOnCalendar();
    }, 50 * (firstDayIndex + daysInMonth + nextDays) + 100);
}

// Hàm tạo phần tử ngày cho lịch
function createCalendarDay(dayNumber, className, date) {
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${className || ''}`;
    
    // Thêm styles cho hiệu ứng
    dayElement.style.opacity = '0';
    dayElement.style.transform = 'translateY(20px)';
    dayElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Hiển thị ngày của tuần
    const dayOfWeek = date.getDay();
    let dayName = '';
    
    if (className !== 'other-month') {
        switch(dayOfWeek) {
            case 0: dayName = 'CN'; break;
            case 1: dayName = 'T2'; break;
            case 2: dayName = 'T3'; break;
            case 3: dayName = 'T4'; break;
            case 4: dayName = 'T5'; break;
            case 5: dayName = 'T6'; break;
            case 6: dayName = 'T7'; break;
        }
    }
    
    // Kiểm tra xem ngày này có phải cuối tuần không
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    // Thêm class cho ngày cuối tuần
    if (isWeekend) {
        dayElement.classList.add('weekend');
    }
    
    // Format hiển thị ngày
    dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        ${dayName ? `<div class="day-name">${dayName}</div>` : ''}
        <div class="day-events"></div>
    `;
    
    // Lưu trữ ngày dưới dạng data attribute
    dayElement.dataset.date = date.toISOString().split('T')[0];
    
    return dayElement;
}

// Hàm hiển thị các kế hoạch lên lịch
function renderPlansOnCalendar() {
    if (!notePlanElements || !notePlanElements.calendarDays) return;
    
    // Xóa tất cả các sự kiện hiện tại
    document.querySelectorAll('.day-events').forEach(el => {
        el.innerHTML = '';
    });
    
    // Duyệt qua tất cả các kế hoạch
    plans.forEach(plan => {
        const deadlineDate = new Date(plan.deadline);
        
        // Lùi ngày hiển thị lại 1 ngày
        const displayDate = new Date(deadlineDate);
        displayDate.setDate(displayDate.getDate() - 1);
        
        const dateString = displayDate.toISOString().split('T')[0];
        
        // Tìm ô ngày tương ứng
        const dayElement = document.querySelector(`.calendar-day[data-date="${dateString}"]`);
        if (dayElement) {
            const dayEvents = dayElement.querySelector('.day-events');
            if (dayEvents) {
                const eventElement = document.createElement('div');
                eventElement.className = `day-event ${plan.priority}`;
                eventElement.textContent = plan.title;
                eventElement.dataset.planId = plan.id;
                
                // Thêm tooltip khi hover
                eventElement.addEventListener('click', event => {
                    showEventTooltip(event, plan);
                });
                
                dayEvents.appendChild(eventElement);
            }
        }
    });
}

// Hiển thị tooltip khi hover trên sự kiện
function showEventTooltip(event, plan) {
    // Xóa tooltip cũ nếu có
    const oldTooltip = document.querySelector('.event-tooltip');
    if (oldTooltip) {
        oldTooltip.remove();
    }
    
    // Tạo tooltip mới
    const tooltip = document.createElement('div');
    tooltip.className = 'event-tooltip';
    
    // Định dạng ngày giờ deadline
    const deadlineDate = new Date(plan.deadline);
    const formattedDeadline = formatDeadlineDate(plan.deadline);
    const now = new Date();
    const isOverdue = deadlineDate < now;
    
    // Tính toán thời gian còn lại hoặc quá hạn
    let timeStatus = '';
    if (isOverdue) {
        const diffTime = Math.abs(now - deadlineDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
            timeStatus = `Đã quá hạn ${diffDays} ngày ${diffHours} giờ`;
        } else {
            timeStatus = `Đã quá hạn ${diffHours} giờ`;
        }
    } else {
        const diffTime = Math.abs(deadlineDate - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
            timeStatus = `Còn ${diffDays} ngày ${diffHours} giờ`;
        } else {
            timeStatus = `Còn ${diffHours} giờ`;
        }
    }
    
    // Icon cho từng mức độ ưu tiên
    let priorityIcon = '';
    let priorityText = '';
    
    switch(plan.priority) {
        case 'high':
            priorityIcon = '&#9888;'; // Biểu tượng cảnh báo
            priorityText = 'Cao';
            break;
        case 'medium':
            priorityIcon = '&#8252;'; // Biểu tượng chấm than
            priorityText = 'Trung bình';
            break;
        case 'low':
            priorityIcon = '&#8505;'; // Biểu tượng thông tin
            priorityText = 'Thấp';
            break;
    }
    
    tooltip.innerHTML = `
        <h4>${plan.title}</h4>
        <div class="priority-badge ${plan.priority}">
            <span class="priority-icon">${priorityIcon}</span>
            <span>Mức độ ưu tiên: ${priorityText}</span>
        </div>
        <p>${plan.content}</p>
        <p class="deadline ${isOverdue ? 'overdue' : ''}">
            ${isOverdue ? 'Đã quá hạn' : 'Hạn chót'}: ${formattedDeadline}
            <br><span class="time-remaining">${timeStatus}</span>
        </p>
        <div class="actions">
            <button class="edit-btn" data-id="${plan.id}">&#9998; Sửa</button>
            <button class="delete-btn" data-id="${plan.id}">&#128465; Xóa</button>
        </div>
    `;
    
    // Vị trí tooltip - đảm bảo hiển thị trong khung nhìn
    const eventRect = event.target.getBoundingClientRect();
    const tooltipTop = eventRect.bottom + window.scrollY + 5;
    let tooltipLeft = eventRect.left + window.scrollX;
    
    // Kiểm tra không gian bên phải
    const viewportWidth = window.innerWidth;
    if (tooltipLeft + 300 > viewportWidth) {
        tooltipLeft = viewportWidth - 320; // 300px tooltip width + 20px margin
    }
    
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
    
    // Thêm tooltip vào trang
    document.body.appendChild(tooltip);
    
    // Animation hiển thị
    setTimeout(() => {
        tooltip.style.display = 'block';
    }, 10);
    
    // Thêm event listener cho các nút
    tooltip.querySelector('.edit-btn').addEventListener('click', () => {
        showEditPlanModal(plan.id);
        tooltip.remove();
    });
    
    tooltip.querySelector('.delete-btn').addEventListener('click', () => {
        deletePlan(plan.id);
        tooltip.remove();
    });
    
    // Đóng tooltip khi click ra ngoài
    document.addEventListener('click', function closeTooltip(e) {
        if (!tooltip.contains(e.target) && e.target !== event.target) {
            tooltip.remove();
            document.removeEventListener('click', closeTooltip);
        }
    });
}

// Kiểm tra và hiển thị thông báo deadline mỗi khi load trang
function checkAndDisplayDeadlineNotifications() {
    if (!notePlanElements || !notePlanElements.deadlineNotifications) return;
    
    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 ngày tính bằng milliseconds
    
    // Lọc các kế hoạch có deadline trong vòng 3 ngày tới hoặc đã quá hạn
    const upcomingPlans = plans.filter(plan => {
        const deadline = new Date(plan.deadline);
        return deadline - now <= threeDaysInMs && deadline >= now;
    });
    
    const overduePlans = plans.filter(plan => {
        const deadline = new Date(plan.deadline);
        return deadline < now;
    });
    
    // Xóa tất cả thông báo hiện tại
    notePlanElements.deadlineNotifications.innerHTML = '';
    
    // Hiển thị thông báo cho kế hoạch quá hạn
    overduePlans.forEach(plan => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-item high`;
        notificationEl.innerHTML = `
            <div>
                <strong>QUÁ HẠN:</strong> ${plan.title} 
                (Hạn chót: ${formatDeadlineDate(plan.deadline)})
            </div>
            <span class="close-notification" data-id="${plan.id}">&times;</span>
        `;
        notePlanElements.deadlineNotifications.appendChild(notificationEl);
    });
    
    // Hiển thị thông báo cho kế hoạch sắp đến hạn
    upcomingPlans.forEach(plan => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-item ${plan.priority}`;
        notificationEl.innerHTML = `
            <div>
                <strong>SẮP ĐẾN HẠN:</strong> ${plan.title} 
                (Hạn chót: ${formatDeadlineDate(plan.deadline)})
            </div>
            <span class="close-notification" data-id="${plan.id}">&times;</span>
        `;
        notePlanElements.deadlineNotifications.appendChild(notificationEl);
    });
    
    // Thêm event listener cho nút đóng thông báo
    document.querySelectorAll('.close-notification').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            e.target.parentElement.remove();
        });
    });
    
    // Nếu không có thông báo nào, hiển thị thông báo rỗng
    if (upcomingPlans.length === 0 && overduePlans.length === 0) {
        notePlanElements.deadlineNotifications.innerHTML = '<p>Không có deadline nào sắp đến hạn.</p>';
    }
}

// Hiển thị modal thêm ghi chú
function showAddNoteModal() {
    if (!notePlanElements || !notePlanElements.noteModal) return;
    
    document.getElementById('note-modal-title').textContent = 'Thêm Ghi Chú Mới';
    document.getElementById('note-id').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    notePlanElements.noteModal.style.display = 'block';
}

// Hiển thị modal thêm kế hoạch
function showAddPlanModal() {
    if (!notePlanElements || !notePlanElements.planModal) return;
    
    document.getElementById('plan-modal-title').textContent = 'Thêm Kế Hoạch Mới';
    document.getElementById('plan-id').value = '';
    document.getElementById('plan-title').value = '';
    document.getElementById('plan-content').value = '';
    
    // Thiết lập ngày giờ mặc định là hiện tại + 1 ngày
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('plan-deadline').value = formatDateTimeForInput(tomorrow);
    
    document.getElementById('plan-priority').value = 'medium';
    notePlanElements.planModal.style.display = 'block';
}

// Hiển thị modal chỉnh sửa ghi chú
function showEditNoteModal(noteId) {
    if (!notePlanElements || !notePlanElements.noteModal) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    document.getElementById('note-modal-title').textContent = 'Chỉnh Sửa Ghi Chú';
    document.getElementById('note-id').value = note.id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    notePlanElements.noteModal.style.display = 'block';
}

// Hiển thị modal chỉnh sửa kế hoạch
function showEditPlanModal(planId) {
    if (!notePlanElements || !notePlanElements.planModal) return;
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    document.getElementById('plan-modal-title').textContent = 'Chỉnh Sửa Kế Hoạch';
    document.getElementById('plan-id').value = plan.id;
    document.getElementById('plan-title').value = plan.title;
    document.getElementById('plan-content').value = plan.content;
    document.getElementById('plan-deadline').value = formatDateTimeForInput(new Date(plan.deadline));
    document.getElementById('plan-priority').value = plan.priority;
    notePlanElements.planModal.style.display = 'block';
}

// Xử lý form ghi chú
function handleNoteFormSubmit(e) {
    e.preventDefault();
    
    const noteId = document.getElementById('note-id').value;
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) return;
    
    if (noteId) {
        // Cập nhật ghi chú hiện có
        const index = notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].content = content;
            notes[index].updatedAt = new Date().toISOString();
        }
    } else {
        // Thêm ghi chú mới
        const newNote = {
            id: generateUID(),
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
    }
    
    // Lưu và hiển thị lại
    saveNotesAndPlans();
    renderNotesAndPlans();
    notePlanElements.noteModal.style.display = 'none';
}

// Xử lý form kế hoạch
function handlePlanFormSubmit(e) {
    e.preventDefault();
    
    const planId = document.getElementById('plan-id').value;
    const title = document.getElementById('plan-title').value.trim();
    const content = document.getElementById('plan-content').value.trim();
    const deadline = document.getElementById('plan-deadline').value;
    const priority = document.getElementById('plan-priority').value;
    
    if (!title || !content || !deadline) return;
    
    if (planId) {
        // Cập nhật kế hoạch hiện có
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
            plans[index].title = title;
            plans[index].content = content;
            plans[index].deadline = deadline;
            plans[index].priority = priority;
            plans[index].updatedAt = new Date().toISOString();
        }
    } else {
        // Thêm kế hoạch mới
        const newPlan = {
            id: generateUID(),
            title: title,
            content: content,
            deadline: deadline,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        plans.push(newPlan);
    }
    
    // Lưu và hiển thị lại
    saveNotesAndPlans();
    renderNotesAndPlans();
    checkAndDisplayDeadlineNotifications();
    
    // Cập nhật lịch nếu đang ở chế độ xem lịch
    if (notePlanElements && notePlanElements.calendarView && 
        notePlanElements.calendarView.classList.contains('active')) {
        renderPlansOnCalendar();
    }
    
    notePlanElements.planModal.style.display = 'none';
}

// Xóa ghi chú
function deleteNote(noteId) {
    if (confirm('Bạn có chắc muốn xóa ghi chú này?')) {
        notes = notes.filter(note => note.id !== noteId);
        saveNotesAndPlans();
        renderNotesAndPlans();
    }
}

// Xóa kế hoạch
function deletePlan(planId) {
    if (confirm('Bạn có chắc muốn xóa kế hoạch này?')) {
        plans = plans.filter(plan => plan.id !== planId);
        saveNotesAndPlans();
        renderNotesAndPlans();
        checkAndDisplayDeadlineNotifications();
        
        // Cập nhật lịch nếu đang ở chế độ xem lịch
        if (notePlanElements && notePlanElements.calendarView && 
            notePlanElements.calendarView.classList.contains('active')) {
            renderPlansOnCalendar();
        }
    }
}

// Hiển thị danh sách ghi chú và kế hoạch
function renderNotesAndPlans() {
    if (!notePlanElements || !notePlanElements.notesPlansItems || !notePlanElements.filterType) return;
    
    notePlanElements.notesPlansItems.innerHTML = '';
    
    const filterValue = notePlanElements.filterType.value;
    
    // Sắp xếp: kế hoạch theo deadline (gần nhất lên đầu), ghi chú theo ngày tạo (mới nhất lên đầu)
    const sortedPlans = [...plans].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Lọc và hiển thị theo điều kiện
    if (filterValue === 'all' || filterValue === 'plans') {
        sortedPlans.forEach(plan => renderPlanItem(plan));
    }
    
    if (filterValue === 'all' || filterValue === 'notes') {
        sortedNotes.forEach(note => renderNoteItem(note));
    }
    
    // Nếu không có item nào, hiển thị thông báo
    if (notePlanElements.notesPlansItems.children.length === 0) {
        notePlanElements.notesPlansItems.innerHTML = '<p>Không có ghi chú hoặc kế hoạch nào.</p>';
    }
}

// Hiển thị một ghi chú
function renderNoteItem(note) {
    if (!notePlanElements || !notePlanElements.notesPlansItems) return;
    
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item';
    noteEl.innerHTML = `
        <div class="item-title">${note.title}</div>
        <div class="item-content">${note.content}</div>
        <div class="item-date">
            Tạo lúc: ${formatDate(note.createdAt)}
            ${note.updatedAt !== note.createdAt ? `<br>Cập nhật: ${formatDate(note.updatedAt)}` : ''}
        </div>
        <div class="item-actions">
            <span class="edit-item" data-id="${note.id}">&#9998; Sửa</span>
            <span class="delete-item" data-id="${note.id}">&#128465; Xóa</span>
        </div>
    `;
    
    // Thêm event listeners
    noteEl.querySelector('.edit-item').addEventListener('click', () => showEditNoteModal(note.id));
    noteEl.querySelector('.delete-item').addEventListener('click', () => deleteNote(note.id));
    
    notePlanElements.notesPlansItems.appendChild(noteEl);
}

// Hiển thị một kế hoạch
function renderPlanItem(plan) {
    if (!notePlanElements || !notePlanElements.notesPlansItems) return;
    
    const planEl = document.createElement('div');
    planEl.className = `plan-item ${plan.priority}`;
    
    const deadlineDate = new Date(plan.deadline);
    const now = new Date();
    const isOverdue = deadlineDate < now;
    
    planEl.innerHTML = `
        <div class="item-title">${plan.title}</div>
        <div class="item-content">${plan.content}</div>
        <div class="plan-deadline ${isOverdue ? 'overdue' : ''}">
            Hạn chót: ${formatDeadlineDate(plan.deadline)}
        </div>
        <div class="item-date">
            Tạo lúc: ${formatDate(plan.createdAt)}
            ${plan.updatedAt !== plan.createdAt ? `<br>Cập nhật: ${formatDate(plan.updatedAt)}` : ''}
        </div>
        <div class="item-actions">
            <span class="edit-item" data-id="${plan.id}">&#9998; Sửa</span>
            <span class="delete-item" data-id="${plan.id}">&#128465; Xóa</span>
        </div>
    `;
    
    // Thêm event listeners
    planEl.querySelector('.edit-item').addEventListener('click', () => showEditPlanModal(plan.id));
    planEl.querySelector('.delete-item').addEventListener('click', () => deletePlan(plan.id));
    
    notePlanElements.notesPlansItems.appendChild(planEl);
}

// Lưu dữ liệu vào localStorage
function saveNotesAndPlans() {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('plans', JSON.stringify(plans));
}

// Tải dữ liệu từ localStorage
function loadNotesAndPlans() {
    const savedNotes = localStorage.getItem('notes');
    const savedPlans = localStorage.getItem('plans');
    
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            notes = [];
            console.error('Lỗi khi đọc dữ liệu ghi chú:', e);
        }
    }
    
    if (savedPlans) {
        try {
            plans = JSON.parse(savedPlans);
        } catch (e) {
            plans = [];
            console.error('Lỗi khi đọc dữ liệu kế hoạch:', e);
        }
    }
}

// Hàm hỗ trợ định dạng ngày giờ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDeadlineDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Hàm tạo thời khóa biểu mobile
function initializeMobileSchedule() {
    const daysContainer = document.querySelectorAll('.mobile-day');
    daysContainer.forEach(dayContainer => {
        const timeSlotsContainer = dayContainer.querySelector('.mobile-time-slots');
        timeSlotsContainer.innerHTML = ''; // Xóa nội dung cũ
        
        // Tạo time slots
        for (let i = 1; i <= 16; i++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'mobile-time-slot';
            timeSlot.dataset.period = i;
            
            let timeText = '';
            switch(i) {
                case 1: timeText = '1 (06:00 - 06:50)'; break;
                case 2: timeText = '2 (07:00 - 07:50)'; break;
                case 3: timeText = '3 (08:00 - 08:50)'; break;
                case 4: timeText = '4 (09:00 - 09:50)'; break;
                case 5: timeText = '5 (10:00 - 10:50)'; break;
                case 6: timeText = '6 (11:00 - 11:50)'; break;
                case 7: timeText = '7 (12:00 - 12:50)'; break;
                case 8: timeText = '8 (13:00 - 13:50)'; break;
                case 9: timeText = '9 (14:00 - 14:50)'; break;
                case 10: timeText = '10 (15:00 - 15:50)'; break;
                case 11: timeText = '11 (16:00 - 16:50)'; break;
                case 12: timeText = '12 (17:00 - 17:50)'; break;
                case 13: timeText = '13 (18:00 - 18:50)'; break;
                case 14: timeText = '14 (18:50 - 19:40)'; break;
                case 15: timeText = '15 (19:40 - 20:30)'; break;
                case 16: timeText = '16 (20:30 - 21:10)'; break;
            }
            
            timeSlot.innerHTML = `
                <div class="time">${timeText}</div>
                <div class="content"></div>
            `;
            
            timeSlotsContainer.appendChild(timeSlot);
        }
    });
    
    // Xử lý sự kiện khi nhấp vào các nút ngày
    const dayButtons = document.querySelectorAll('.day-selector button');
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa trạng thái active từ tất cả các nút
            dayButtons.forEach(btn => btn.classList.remove('active'));
            // Thêm trạng thái active cho nút được nhấp
            this.classList.add('active');
            
            // Lấy ngày được chọn
            const selectedDay = this.dataset.day;
            
            // Ẩn tất cả các ngày và hiển thị ngày được chọn
            const dayContainers = document.querySelectorAll('.mobile-day');
            dayContainers.forEach(container => {
                container.classList.remove('active');
                if (container.dataset.day === selectedDay) {
                    container.classList.add('active');
                }
            });
        });
    });
}

// Thêm lịch học vào giao diện mobile
function displayMobileSchedule(scheduleData) {
    // Xóa tất cả các lớp học hiện tại
    document.querySelectorAll('.mobile-time-slot .content').forEach(content => {
        content.innerHTML = '';
        content.className = 'content';
    });
    
    const selectedWeek = parseInt(document.getElementById('week-select').value);
    
    // Nhóm các môn học theo ngày
    const scheduledByDay = {};
    scheduleData.forEach(course => {
        const day = course.day;
        if (!scheduledByDay[day]) {
            scheduledByDay[day] = [];
        }
        scheduledByDay[day].push(course);
    });
    
    // Hiển thị môn học theo ngày và tiết học
    for (const day in scheduledByDay) {
        const dayContainer = document.querySelector(`.mobile-day[data-day="${day}"]`);
        if (!dayContainer) continue;
        
        scheduledByDay[day].forEach((course, index) => {
            // Kiểm tra xem môn học có trong tuần được chọn không
            const isActiveInWeek = course.weeks.includes(selectedWeek);
            if (!isActiveInWeek) return;
            
            // Lấy tiết bắt đầu và kết thúc
            const startPeriod = course.startPeriod;
            const endPeriod = course.endPeriod;
            
            // Thêm thông tin môn học vào tiết bắt đầu
            const timeSlot = dayContainer.querySelector(`.mobile-time-slot[data-period="${startPeriod}"]`);
            if (timeSlot) {
                const content = timeSlot.querySelector('.content');
                content.classList.add('has-class');
                
                // Thêm màu tương ứng cho môn học
                const colorIndex = (index % 7) + 1;
                content.classList.add(`color${colorIndex}`);
                timeSlot.classList.add(`color${colorIndex}`);
                
                content.innerHTML = `
                    <div class="subject-code">${course.code}</div>
                    <div class="subject-name">${course.name}</div>
                    <div class="room">Phòng: ${course.room}</div>
                    <div class="time">Thời gian: ${course.time}</div>
                    <div class="group">Nhóm: ${course.group}</div>
                `;
                
                // Áp dụng hiệu ứng xuất hiện dần
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    content.style.transition = `all 0.3s ease ${index * 0.05}s`;
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 50);
            }
        });
    }
}

// Cập nhật hàm xử lý tạo thời khóa biểu
document.getElementById('generate-schedule').addEventListener('click', function() {
    const scheduleInput = document.getElementById('schedule-input').value;
    
    if (scheduleInput.trim() === '') {
        alert('Vui lòng nhập dữ liệu thời khóa biểu!');
        return;
    }
    
    const scheduleData = parseScheduleData(scheduleInput);
    
    if (scheduleData.length === 0) {
        alert('Không thể phân tích dữ liệu! Vui lòng kiểm tra lại định dạng.');
        return;
    }
    
    // Lưu dữ liệu vào localStorage
    saveDataToLocalStorage({
        schedule: scheduleInput,
        week: document.getElementById('week-select').value
    });
    
    // Initialize mobile schedule layout before displaying data
    initializeMobileSchedule();
    
    // Display schedule data
    displaySchedule(scheduleData);
});

// Xóa thời khóa biểu hiện tại
function clearSchedule() {
    // Reset courseColors khi tạo thời khóa biểu mới
    if (document.getElementById('schedule-input').value.trim() === '') {
        courseColors.clear();
    }
    
    // Thêm hiệu ứng fade out trước khi xóa
    const cells = document.querySelectorAll('.schedule-grid > div');
    for (let i = 6; i < cells.length; i++) { // Bỏ qua header
        cells[i].style.transition = 'all 0.3s ease';
        cells[i].style.opacity = '0';
        cells[i].style.transform = 'scale(0.95)';
    }
    
    // Đợi hiệu ứng hoàn thành trước khi reset
    setTimeout(() => {
        for (let i = 6; i < cells.length; i++) { // Bỏ qua header
            cells[i].innerHTML = '';
            cells[i].style.backgroundColor = '';
            cells[i].style.gridRow = '';
            cells[i].style.display = 'block';
            cells[i].style.position = '';
            cells[i].style.opacity = '1';
            cells[i].style.transform = 'none';
            cells[i].classList.remove('hidden');
        }
    }, 250);
}

// Hiển thị thời khóa biểu
function displaySchedule(scheduleData) {
    clearSchedule();
    const selectedWeek = parseInt(document.getElementById('week-select').value);
    
    // Tạo hiệu ứng loading
    document.querySelector('.schedule-grid').style.opacity = '0.6';
    
    setTimeout(() => {
        scheduleData.forEach((course, index) => {
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
                
                // Thêm nội dung vào cell với hiệu ứng xuất hiện dần
                cell.innerHTML = `
                    <div style="height: 100%; opacity: 0; transform: translateY(10px); transition: all 0.3s ease ${index * 0.05}s;">
                        <strong>${course.code}</strong>
                        ${course.name}<br>
                        Phòng: ${course.room}<br>
                        Thời gian: ${course.time}<br>
                        Nhóm: ${course.group}
                    </div>
                `;
                
                // Hiệu ứng xuất hiện sau một khoảng thời gian ngắn
                setTimeout(() => {
                    const contentDiv = cell.querySelector('div');
                    if (contentDiv) {
                        contentDiv.style.opacity = '1';
                        contentDiv.style.transform = 'translateY(0)';
                    }
                }, 50);

                // Xóa các cell bị che phủ với hiệu ứng mờ dần
                for (let i = 1; i < duration; i++) {
                    const nextCellIndex = cellIndex + (i * 6);
                    const nextCell = document.querySelector(`.schedule-grid > div:nth-child(${nextCellIndex})`);
                    if (nextCell) {
                        nextCell.classList.add('hidden');
                        setTimeout(() => {
                            nextCell.style.display = 'none';
                        }, 300);
                    }
                }
            }
        });
        
        // Kết thúc hiệu ứng loading
        document.querySelector('.schedule-grid').style.opacity = '1';
        
        // Hiển thị thời khóa biểu cho mobile
        displayMobileSchedule(scheduleData);
    }, 300);
}

// Hàm cập nhật ngày tháng ở góc phải màn hình
function updateCornerDateTime() {
    const now = new Date();
    const cornerDate = document.querySelector('.corner-date');
    const cornerTime = document.querySelector('.corner-time');
    
    // Lấy thứ trong tuần
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayOfWeek = days[now.getDay()];
    
    // Định dạng ngày tháng năm
    const dateStr = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Định dạng giờ phút giây
    const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Cập nhật nội dung
    cornerDate.textContent = `${dayOfWeek}, ${dateStr}`;
    cornerTime.textContent = timeStr;
}

// Khởi tạo và quản lý bản đồ Leaflet
let campusMap;
let userLocationMarker;
let schoolLocationMarker;
let routeLayer;
let userLocation;

// Tọa độ trung tâm Đại học Bách Khoa TP.HCM
const SCHOOL_COORDS = [10.7722, 106.6578];

// Hàm khởi tạo bản đồ
function initCampusMap() {
    // Kiểm tra xem bản đồ đã được khởi tạo chưa
    if (campusMap) return;
    
    // Tọa độ trung tâm Đại học Bách Khoa TP.HCM
    const bkCoords = [10.7722, 106.6578];
    
    // Tạo bản đồ
    campusMap = L.map('campus-map').setView(bkCoords, 17);
    
    // Thêm layer bản đồ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 22
    }).addTo(campusMap);
    
    // Thêm marker vị trí trường
    addSchoolMarker();
    
    // Khởi tạo layer cho đường đi
    routeLayer = L.layerGroup().addTo(campusMap);
    
    // Thêm event listener cho nút định vị
    document.getElementById('locate-me').addEventListener('click', locateUser);
    
    // Thêm event listener cho nút vị trí trường
    document.getElementById('locate-school').addEventListener('click', locateSchool);
}

// Thêm marker vị trí trường
function addSchoolMarker() {
    // Tạo icon cho vị trí trường
    const schoolIcon = L.divIcon({
        className: 'map-marker school-location',
        html: '<span style="width:14px;height:14px;background:#FF5722;border-radius:50%;border:2px solid white;display:block;"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    // Thêm marker cho vị trí trường
    schoolLocationMarker = L.marker(SCHOOL_COORDS, {
        icon: schoolIcon,
        title: 'Đại Học Bách Khoa TP.HCM'
    }).addTo(campusMap);
    
    // Thêm popup cho vị trí trường
    schoolLocationMarker.bindPopup(`
        <div class="building-popup">
            <h3>Đại Học Bách Khoa TP.HCM</h3>
            <p>268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM</p>
        </div>
    `);
}

// Đi đến vị trí trường
function locateSchool() {
    if (!campusMap) return;
    
    // Xóa đường đi cũ nếu có
    if (routeLayer) {
        routeLayer.clearLayers();
    }
    
    // Ẩn thông tin khoảng cách nếu không có vị trí người dùng
    if (!userLocation) {
        document.getElementById('distance-info').style.display = 'none';
    }
    
    // Di chuyển bản đồ đến vị trí trường
    campusMap.setView(SCHOOL_COORDS, 17);
    
    // Hiển thị popup
    schoolLocationMarker.openPopup();
    
    // Nếu đã có vị trí người dùng, tính lại đường đi
    if (userLocation) {
        calculateRoute(userLocation, SCHOOL_COORDS);
    }
}

// Xác định vị trí người dùng
function locateUser() {
    if (!campusMap) return;
    
    if (navigator.geolocation) {
        // Bắt đầu hiệu ứng loading
        document.getElementById('locate-me').textContent = 'Đang xác định...';
        document.getElementById('locate-me').disabled = true;
        
        // Thông báo về việc cải thiện độ chính xác
        const accuracyInfo = document.createElement('div');
        accuracyInfo.id = 'accuracy-info';
        accuracyInfo.innerHTML = `
            <div class="accuracy-notice" style="position: absolute; bottom: 50px; left: 10px; right: 10px; 
                background: rgba(37, 117, 252, 0.9); color: white; padding: 10px; border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1000; font-size: 14px; text-align: center;">
                Đang tìm vị trí chính xác của bạn... Quá trình này có thể mất từ 5-15 giây.
                <button id="cancel-location" style="background: #fff; color: #2575fc; border: none; 
                    padding: 5px 10px; border-radius: 4px; margin-top: 8px; font-weight: bold; cursor: pointer;">
                    Hủy
                </button>
            </div>
        `;
        document.getElementById('campus-map').appendChild(accuracyInfo);
        
        // Thêm sự kiện hủy tìm vị trí
        document.getElementById('cancel-location').addEventListener('click', function() {
            if (locationWatchId) {
                navigator.geolocation.clearWatch(locationWatchId);
                locationWatchId = null;
            }
            document.getElementById('accuracy-info').remove();
            document.getElementById('locate-me').textContent = 'Vị Trí Của Tôi';
            document.getElementById('locate-me').disabled = false;
        });
        
        // Biến để lưu ID của quá trình theo dõi vị trí
        let locationWatchId = null;
        
        // Biến lưu vị trí có độ chính xác tốt nhất
        let bestLocation = null;
        let bestAccuracy = Infinity;
        
        // Thời gian tối đa cho quá trình tìm vị trí (15 giây)
        const MAX_LOCATION_TIME = 15000;
        
        // Độ chính xác mục tiêu (15m)
        const TARGET_ACCURACY = 15;
        
        // Thời gian bắt đầu
        const startTime = Date.now();
        
        // Sử dụng watchPosition thay vì getCurrentPosition để liên tục cải thiện độ chính xác
        locationWatchId = navigator.geolocation.watchPosition(
            // Callback khi có vị trí mới
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                const elapsedTime = Date.now() - startTime;
                
                // Cập nhật notice với độ chính xác hiện tại
                if (document.getElementById('accuracy-info')) {
                    document.getElementById('accuracy-info').querySelector('.accuracy-notice').innerHTML = `
                        Đang tìm vị trí của bạn... (Độ chính xác hiện tại: ${Math.round(accuracy)}m)
                        <button id="cancel-location" style="background: #fff; color: #2575fc; border: none; 
                            padding: 5px 10px; border-radius: 4px; margin-top: 8px; font-weight: bold; cursor: pointer;">
                            Hủy
                        </button>
                    `;
                    document.getElementById('cancel-location').addEventListener('click', function() {
                        if (locationWatchId) {
                            navigator.geolocation.clearWatch(locationWatchId);
                            locationWatchId = null;
                        }
                        document.getElementById('accuracy-info').remove();
                        document.getElementById('locate-me').textContent = 'Vị Trí Của Tôi';
                        document.getElementById('locate-me').disabled = false;
                    });
                }
                
                // Lưu vị trí tốt nhất
                if (accuracy < bestAccuracy) {
                    bestAccuracy = accuracy;
                    bestLocation = {
                        lat: lat,
                        lng: lng,
                        accuracy: accuracy
                    };
                }
                
                // Kiểm tra nếu đạt được độ chính xác mong muốn hoặc hết thời gian
                if (accuracy <= TARGET_ACCURACY || elapsedTime >= MAX_LOCATION_TIME) {
                    // Dừng theo dõi vị trí
                    navigator.geolocation.clearWatch(locationWatchId);
                    locationWatchId = null;
                    
                    // Xóa thông báo
                    if (document.getElementById('accuracy-info')) {
                        document.getElementById('accuracy-info').remove();
                    }
                    
                    // Lưu vị trí người dùng
                    userLocation = [lat, lng];
                    
                    // Xóa marker cũ nếu có
                    if (userLocationMarker) {
                        campusMap.removeLayer(userLocationMarker);
                    }
                    
                    // Xóa đường đi cũ nếu có
                    if (routeLayer) {
                        routeLayer.clearLayers();
                    }
                    
                    // Tạo icon cho vị trí người dùng
                    const userIcon = L.divIcon({
                        className: 'map-marker user-location',
                        html: '<span style="width:12px;height:12px;background:white;border-radius:50%;display:block;"></span>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    
                    // Thêm marker cho vị trí người dùng
                    userLocationMarker = L.marker([lat, lng], {
                        icon: userIcon,
                        title: 'Vị trí của bạn'
                    }).addTo(campusMap);
                    
                    // Thêm circle hiển thị độ chính xác
                    L.circle([lat, lng], {
                        radius: accuracy,
                        color: '#2575fc',
                        fillColor: '#2575fc',
                        fillOpacity: 0.15
                    }).addTo(campusMap);
                    
                    // Di chuyển bản đồ đến vị trí người dùng
                    campusMap.setView([lat, lng], 18);
                    
                    // Thêm popup cho vị trí người dùng
                    userLocationMarker.bindPopup(`
                        <div>
                            <strong>Vị trí của bạn</strong><br>
                            Độ chính xác: ${Math.round(accuracy)} mét
                        </div>
                    `).openPopup();
                    
                    // Kiểm tra xem người dùng có nằm trong khuôn viên trường không
                    const bkBounds = L.latLngBounds(
                        [10.7698, 106.6550], // southwest bound
                        [10.7746, 106.6606]  // northeast bound
                    );
                    
                    if (!bkBounds.contains([lat, lng])) {
                        // Tính khoảng cách và hiển thị đường đi đến trường
                        calculateRoute([lat, lng], SCHOOL_COORDS);
                    } else {
                        // Ẩn thông tin khoảng cách nếu ở trong trường
                        document.getElementById('distance-info').style.display = 'none';
                    }
                    
                    // Kết thúc hiệu ứng loading
                    document.getElementById('locate-me').textContent = 'Vị Trí Của Tôi';
                    document.getElementById('locate-me').disabled = false;
                }
            },
            // Callback khi có lỗi
            (error) => {
                // Xóa thông báo
                if (document.getElementById('accuracy-info')) {
                    document.getElementById('accuracy-info').remove();
                }
                
                console.error('Lỗi xác định vị trí:', error);
                
                let errorMessage = 'Không thể xác định vị trí của bạn.';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Vui lòng cho phép truy cập vị trí để sử dụng tính năng này.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Hết thời gian yêu cầu vị trí.';
                        break;
                }
                
                // Sử dụng vị trí tốt nhất đã tìm được (nếu có)
                if (bestLocation) {
                    // Sử dụng vị trí tốt nhất đã lưu trước đó
                    userLocation = [bestLocation.lat, bestLocation.lng];
                    displayUserLocation(bestLocation.lat, bestLocation.lng, bestLocation.accuracy);
                } else {
                    alert(errorMessage);
                }
                
                // Kết thúc hiệu ứng loading
                document.getElementById('locate-me').textContent = 'Vị Trí Của Tôi';
                document.getElementById('locate-me').disabled = false;
                
                // Dừng theo dõi vị trí
                if (locationWatchId) {
                    navigator.geolocation.clearWatch(locationWatchId);
                    locationWatchId = null;
                }
            },
            // Options
            {
                enableHighAccuracy: true,  // Bật độ chính xác cao
                timeout: MAX_LOCATION_TIME, // Thời gian tối đa 15 giây
                maximumAge: 0  // Không sử dụng dữ liệu cache
            }
        );
    } else {
        alert('Trình duyệt của bạn không hỗ trợ định vị.');
    }
}

// Hàm hiển thị vị trí người dùng trên bản đồ
function displayUserLocation(lat, lng, accuracy) {
    // Xóa marker cũ nếu có
    if (userLocationMarker) {
        campusMap.removeLayer(userLocationMarker);
    }
    
    // Tạo icon cho vị trí người dùng
    const userIcon = L.divIcon({
        className: 'map-marker user-location',
        html: '<span style="width:12px;height:12px;background:white;border-radius:50%;display:block;"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    // Thêm marker cho vị trí người dùng
    userLocationMarker = L.marker([lat, lng], {
        icon: userIcon,
        title: 'Vị trí của bạn'
    }).addTo(campusMap);
    
    // Thêm circle hiển thị độ chính xác
    L.circle([lat, lng], {
        radius: accuracy,
        color: '#2575fc',
        fillColor: '#2575fc',
        fillOpacity: 0.15
    }).addTo(campusMap);
    
    // Di chuyển bản đồ đến vị trí người dùng
    campusMap.setView([lat, lng], 18);
    
    // Thêm popup cho vị trí người dùng
    userLocationMarker.bindPopup(`
        <div>
            <strong>Vị trí của bạn</strong><br>
            Độ chính xác: ${Math.round(accuracy)} mét
        </div>
    `).openPopup();
    
    // Kiểm tra xem người dùng có nằm trong khuôn viên trường không
    const bkBounds = L.latLngBounds(
        [10.7698, 106.6550], // southwest bound
        [10.7746, 106.6606]  // northeast bound
    );
    
    if (!bkBounds.contains([lat, lng])) {
        // Tính khoảng cách và hiển thị đường đi đến trường
        calculateRoute([lat, lng], SCHOOL_COORDS);
    } else {
        // Ẩn thông tin khoảng cách nếu ở trong trường
        document.getElementById('distance-info').style.display = 'none';
    }
}

// Tính khoảng cách giữa hai tọa độ (theo công thức Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Khoảng cách (km)
    return distance;
}

// Tính thời gian di chuyển ước tính
function calculateTime(distance) {
    // Giả sử tốc độ trung bình là 5 km/h (đi bộ)
    const walkingSpeed = 5; // km/h
    const timeInHours = distance / walkingSpeed;
    return timeInHours * 60; // Chuyển sang phút
}

// Tìm đường và tính khoảng cách giữa hai điểm
function calculateRoute(start, end) {
    // Xóa đường đi cũ
    routeLayer.clearLayers();
    
    // Hiển thị trạng thái đang tải
    document.getElementById('distance-value').textContent = "Đang tính...";
    document.getElementById('time-value').textContent = "Đang tính...";
    document.getElementById('distance-info').style.display = 'block';
    
    // Sử dụng OSRM để tính toán đường đi thực tế
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeGeometry = route.geometry;
                
                // Thêm tuyến đường vào bản đồ
                L.geoJSON(routeGeometry, {
                    style: {
                        color: '#FF5722',
                        weight: 5,
                        opacity: 0.7,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }
                }).addTo(routeLayer);
                
                // Cập nhật thông tin khoảng cách và thời gian
                const distanceInKm = route.distance / 1000;
                // Tính thời gian đi xe máy (ước tính 30km/h)
                const timeInMinutes = (route.distance / 1000) / 30 * 60;
                
                document.getElementById('distance-value').textContent = distanceInKm.toFixed(2);
                document.getElementById('time-value').textContent = Math.round(timeInMinutes);
                
                // Điều chỉnh view để có thể nhìn thấy cả route
                const bounds = L.geoJSON(routeGeometry).getBounds();
                campusMap.fitBounds(bounds, {
                    padding: [50, 50]
                });
            } else {
                // Nếu không lấy được route, hiển thị thông báo lỗi
                document.getElementById('distance-value').textContent = "Không thể tính";
                document.getElementById('time-value').textContent = "Không thể tính";
                
                // Vẽ một đường thẳng đơn giản nối hai điểm
                const routeLine = L.polyline([start, end], {
                    color: '#FF5722',
                    weight: 3,
                    opacity: 0.5,
                    dashArray: '10, 10',
                    lineJoin: 'round'
                }).addTo(routeLayer);
                
                // Điều chỉnh view
                const bounds = L.latLngBounds([start, end]);
                campusMap.fitBounds(bounds, {
                    padding: [50, 50]
                });
            }
        })
        .catch(error => {
            console.error('Lỗi khi tính toán đường đi:', error);
            document.getElementById('distance-value').textContent = "Lỗi kết nối";
            document.getElementById('time-value').textContent = "Lỗi kết nối";
            
            // Vẽ một đường thẳng đơn giản nếu có lỗi
            const routeLine = L.polyline([start, end], {
                color: '#FF5722',
                weight: 3,
                opacity: 0.5,
                dashArray: '10, 10',
                lineJoin: 'round'
            }).addTo(routeLayer);
            
            // Điều chỉnh view
            const bounds = L.latLngBounds([start, end]);
            campusMap.fitBounds(bounds, {
                padding: [50, 50]
            });
        });
}

// Thêm event listener để khởi tạo bản đồ khi chọn tab
document.addEventListener('DOMContentLoaded', function() {
    // Các tab buttons
    const tabButtons = document.querySelectorAll('.tab-button, .tab-btn, .side-menu-item');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.getAttribute('data-tab') === 'campus-map-tab') {
                // Khởi tạo bản đồ khi tab được chọn
                setTimeout(initCampusMap, 100);
            }
        });
    });
    
    // Khởi tạo bản đồ nếu tab bản đồ là tab mặc định
    if (document.getElementById('campus-map-tab').classList.contains('active')) {
        setTimeout(initCampusMap, 100);
    }
});