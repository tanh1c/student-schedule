let courseData = [];
let selectedCourse = null;

// Hàm lấy thời gian bắt đầu của tiết học
function getStartTime(period) {
    const timeMap = {
        1: "06:00",
        2: "07:00",
        3: "08:00",
        4: "09:00",
        5: "10:00",
        6: "11:00",
        7: "12:00",
        8: "13:00",
        9: "14:00",
        10: "15:00",
        11: "16:00",
        12: "17:00",
        13: "18:00",
        14: "18:50",
        15: "19:40",
        16: "20:30"
    };
    return timeMap[period];
}

// Hàm lấy thời gian kết thúc của tiết học
function getEndTime(period) {
    const timeMap = {
        1: "06:50",
        2: "07:50",
        3: "08:50",
        4: "09:50",
        5: "10:50",
        6: "11:50",
        7: "12:50",
        8: "13:50",
        9: "14:50",
        10: "15:50",
        11: "16:50",
        12: "17:50",
        13: "18:50",
        14: "19:40",
        15: "20:30",
        16: "21:10"
    };
    return timeMap[period];
}

// Hàm chuyển đổi danh sách tiết học sang khoảng thời gian
function getTimeRanges(periods) {
    if (!periods || periods.length === 0) return [];
    
    // Sắp xếp các tiết theo thứ tự
    periods.sort((a, b) => a - b);
    
    const ranges = [];
    let start = periods[0];
    let prev = periods[0];
    
    for (let i = 1; i <= periods.length; i++) {
        if (i === periods.length || periods[i] !== prev + 1) {
            // Kết thúc một khoảng thời gian
            ranges.push(`${getStartTime(start)} - ${getEndTime(prev)}`);
            if (i < periods.length) {
                start = periods[i];
            }
        }
        if (i < periods.length) {
            prev = periods[i];
        }
    }
    
    return ranges;
}

// Hàm tải dữ liệu từ file JSON
async function loadCourseData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu môn học');
        }
        courseData = await response.json();
        console.log('Đã tải dữ liệu môn học thành công');
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu môn học. Vui lòng thử lại sau.');
    }
}

// Tải dữ liệu khi trang web được tải
document.addEventListener('DOMContentLoaded', loadCourseData);

// Chuyển đổi tab tìm kiếm
function switchTab(tabName) {
    // Cập nhật trạng thái active của các tab
    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.search-tab[onclick*="${tabName}"]`).classList.add('active');

    // Ẩn/hiện các section tương ứng
    document.querySelectorAll('.search-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}Search`).classList.add('active');

    // Reset các trường tìm kiếm
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('teacherSelect').innerHTML = '<option value="">Vui lòng chọn môn học trước</option>';
    document.getElementById('teacherSelect').disabled = true;
    document.getElementById('resultContainer').innerHTML = '';
    selectedCourse = null;
}

// Hàm tìm kiếm và hiển thị gợi ý môn học
function searchCourses(keyword) {
    if (!keyword) {
        document.getElementById('courseSuggestions').style.display = 'none';
        return;
    }

    keyword = keyword.toLowerCase();
    const suggestions = courseData.filter(course => 
        course.tenMonHoc.toLowerCase().includes(keyword) ||
        course.maMonHoc.toLowerCase().includes(keyword)
    );

    const suggestionsContainer = document.getElementById('courseSuggestions');
    
    if (suggestions.length > 0) {
        // Giới hạn số lượng gợi ý hiển thị để tránh quá tải
        const limitedSuggestions = suggestions.slice(0, 10);
        suggestionsContainer.innerHTML = limitedSuggestions.map(course => `
            <div class="suggestion-item" onclick="selectCourse('${course.maMonHoc}')">
                ${course.maMonHoc} - ${course.tenMonHoc}
            </div>
        `).join('');
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.innerHTML = '<div class="suggestion-item">Không tìm thấy môn học</div>';
        suggestionsContainer.style.display = 'block';
    }
}

// Hàm chọn môn học từ gợi ý
function selectCourse(courseCode) {
    selectedCourse = courseData.find(c => c.maMonHoc === courseCode);
    if (selectedCourse) {
        document.getElementById('courseName').value = `${selectedCourse.maMonHoc} - ${selectedCourse.tenMonHoc}`;
        updateTeacherSelect(selectedCourse);
    }
    document.getElementById('courseSuggestions').style.display = 'none';
}

// Hàm cập nhật danh sách giảng viên
function updateTeacherSelect(course) {
    const teacherSelect = document.getElementById('teacherSelect');
    const teachers = [...new Set(course.lichHoc.map(lh => lh.giangVien))];
    
    teacherSelect.innerHTML = '<option value="">Chọn giảng viên</option>' +
        teachers.map(teacher => `<option value="${teacher}">${teacher}</option>`).join('');
    teacherSelect.disabled = false;
}

// Khởi tạo các event listener khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Lắng nghe sự kiện nhập mã môn học
    const courseCodeInput = document.getElementById('courseCode');
    if (courseCodeInput) {
        courseCodeInput.addEventListener('input', function(e) {
            const courseCode = e.target.value.trim().toUpperCase();
            selectedCourse = courseData.find(c => c.maMonHoc === courseCode);
            
            if (selectedCourse) {
                updateTeacherSelect(selectedCourse);
            } else {
                document.getElementById('teacherSelect').innerHTML = '<option value="">Vui lòng chọn môn học trước</option>';
                document.getElementById('teacherSelect').disabled = true;
            }
        });
    }

    // Lắng nghe sự kiện nhập tên môn học
    const courseNameInput = document.getElementById('courseName');
    if (courseNameInput) {
        courseNameInput.addEventListener('input', function(e) {
            searchCourses(e.target.value.trim());
        });
    }

    // Click bên ngoài để ẩn gợi ý
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#nameSearch')) {
            const suggestions = document.getElementById('courseSuggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        }
    });
});

// Hàm chuyển đổi số thứ tự ngày trong tuần sang tên ngày
function getDayName(dayNumber) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayNumber % 7];
}

// Hàm tìm kiếm lịch giảng dạy
function searchSchedule() {
    const selectedTeacher = document.getElementById('teacherSelect').value;
    const resultContainer = document.getElementById('resultContainer');
    
    if (!selectedCourse || !selectedTeacher) {
        alert('Vui lòng chọn môn học và giảng viên');
        return;
    }
    
    // Lọc các lớp học của giảng viên
    const teacherClasses = selectedCourse.lichHoc.filter(lh => lh.giangVien === selectedTeacher);
    
    if (teacherClasses.length === 0) {
        resultContainer.innerHTML = '<p>Không tìm thấy lịch giảng dạy cho giảng viên này</p>';
        return;
    }
    
    // Hiển thị kết quả
    let html = `<h2>Lịch giảng dạy môn ${selectedCourse.tenMonHoc} (${selectedCourse.maMonHoc})</h2>`;
    html += `<h3>Giảng viên: ${selectedTeacher}</h3>`;
    
    teacherClasses.forEach(classInfo => {
        html += '<div class="schedule-item">';
        html += `<p><strong>Nhóm:</strong> ${classInfo.group}</p>`;
        html += `<p><strong>Sĩ số:</strong> ${classInfo.siso}</p>`;
        
        if (classInfo.classInfo && classInfo.classInfo.length > 0) {
            classInfo.classInfo.forEach(info => {
                // Chuyển đổi các tiết học sang khoảng thời gian
                const timeRanges = getTimeRanges(info.tietHoc);
                html += `<p><strong>Thời gian:</strong> ${getDayName(info.dayOfWeek)}, ${timeRanges.join(' và ')}</p>`;
                html += `<p><strong>Phòng:</strong> ${info.phong}</p>`;
                html += `<p><strong>Cơ sở:</strong> ${info.coSo.trim()}</p>`;
                html += `<p><strong>Các tuần học:</strong> ${info.week.join(', ')}</p>`;
            });
        } else {
            html += '<p><em>Không có thông tin lịch học cụ thể</em></p>';
        }
        
        html += '</div>';
    });
    
    resultContainer.innerHTML = html;
} 