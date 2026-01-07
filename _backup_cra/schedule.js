let courseData = [];
let selectedCourse = null;

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

// Lắng nghe sự kiện nhập mã môn học
document.getElementById('courseCode').addEventListener('input', function(e) {
    const courseCode = e.target.value.trim().toUpperCase();
    selectedCourse = courseData.find(c => c.maMonHoc === courseCode);
    
    if (selectedCourse) {
        updateTeacherSelect(selectedCourse);
    } else {
        document.getElementById('teacherSelect').innerHTML = '<option value="">Vui lòng chọn môn học trước</option>';
        document.getElementById('teacherSelect').disabled = true;
    }
});

// Lắng nghe sự kiện nhập tên môn học
document.getElementById('courseName').addEventListener('input', function(e) {
    searchCourses(e.target.value.trim());
});

// Click bên ngoài để ẩn gợi ý
document.addEventListener('click', function(e) {
    if (!e.target.closest('#nameSearch')) {
        document.getElementById('courseSuggestions').style.display = 'none';
    }
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
                html += `<p><strong>Thời gian:</strong> ${getDayName(info.dayOfWeek)}, Tiết ${info.tietHoc.join(', ')}</p>`;
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