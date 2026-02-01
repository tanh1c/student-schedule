/**
 * Utility cho dữ liệu CTĐT/KHGD (CSV) + parse để hiển thị
 */

/**
 * Chuẩn hoá chuỗi theo đúng cách đặt tên file CSV (giữ Unicode tiếng Việt)
 */
export function normalizeForCsvFilename(input) {
  return (input || '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Tạo path CSV từ item trong ctdt_links.json
 * @param {{khoa:string,nganh:string,loai:'CTDT'|'KHGD',nam:string}} linkItem
 * @param {string} type - Loại (CTDT hoặc KHGD)
 * @returns {string|null} - Đường dẫn file CSV hoặc null
 */
export function getCSVPathFromLinkItem(linkItem) {
  if (!linkItem?.khoa || !linkItem?.nganh || !linkItem?.loai || !linkItem?.nam) return null;
  const safeKhoa = normalizeForCsvFilename(linkItem.khoa);
  const safeNganh = normalizeForCsvFilename(linkItem.nganh);
  const safeNam = normalizeForCsvFilename(linkItem.nam);
  const filename = `${safeKhoa}_${safeNganh}_${linkItem.loai}_${safeNam}.csv`;
  return `/CTDT/CSV_output/${filename}`;
}

/**
 * Xác định đâu là dòng header (có thể có nhiều dòng header)
 * @param {Array<Array<string>>} csvRows - Mảng các hàng CSV
 * @returns {number} - Index của dòng header cuối cùng
 */
function findHeaderRow(csvRows) {
  if (!csvRows || csvRows.length === 0) return 0;
  
  // Tìm dòng có chứa các từ khóa header phổ biến
  const headerKeywords = ['STT', 'Mã học phần', 'Course ID', 'Tên học phần', 'Course Title', 
                         'Tín chỉ', 'Credits', 'Prerequisites', 'Ghi chú', 'Notes'];
  
  let lastHeaderRow = 0;
  
  for (let i = 0; i < Math.min(3, csvRows.length); i++) {
    const row = csvRows[i];
    if (!row || row.length === 0) continue;
    
    // Kiểm tra xem dòng này có chứa từ khóa header không
    const rowText = row.join(' ').toLowerCase();
    const hasHeaderKeywords = headerKeywords.some(keyword => 
      rowText.includes(keyword.toLowerCase())
    );
    
    // Nếu có từ khóa header và không phải là dữ liệu (không có số ở cột đầu)
    if (hasHeaderKeywords) {
      // Kiểm tra xem có phải là dòng dữ liệu không (có số ở cột đầu)
      const firstCell = (row[0] || '').trim();
      const isDataRow = /^\d+[\.\)]?/.test(firstCell); // Bắt đầu bằng số
      
      if (!isDataRow) {
        lastHeaderRow = i;
      }
    }
  }
  
  return lastHeaderRow;
}

/**
 * Parse dữ liệu CSV thành cấu trúc dễ hiển thị
 * Đọc theo thứ tự cột (index-based) không phụ thuộc vào tên header
 * @param {Array<Array<string>>} csvRows - Mảng các hàng CSV
 * @returns {Object} - Dữ liệu đã được parse
 */
export function parseCurriculumData(csvRows) {
  if (!csvRows || csvRows.length === 0) {
    return { headers: [], rows: [], sections: [] };
  }
  
  // Tìm dòng header cuối cùng
  const headerRowIndex = findHeaderRow(csvRows);
  const headers = csvRows[headerRowIndex] || [];
  
  // Parse các hàng dữ liệu (bắt đầu từ sau dòng header)
  // Gộp tất cả dữ liệu vào một mảng rows duy nhất, bỏ qua dòng phân cách
  const rows = [];
  let lastRowData = null; // Để merge các dòng tiếp theo
  
  for (let i = headerRowIndex + 1; i < csvRows.length; i++) {
    const row = csvRows[i];
    if (!row || row.length === 0) continue;
    
    // Bỏ qua dòng phân cách bảng (--- Bảng X (Trang Y) ---)
    const firstCell = (row[0] || '').trim();
    if (firstCell.includes('--- Bảng')) {
      // Chỉ bỏ qua dòng này, không tạo section
      continue;
    }
    
    // Bỏ qua dòng trống
    if (row.every(cell => !cell || cell.trim() === '')) {
      continue;
    }
    
    // Bỏ qua các dòng header lặp lại (nếu có)
    const rowText = row.join(' ').toLowerCase();
    if (rowText.includes('stt') && rowText.includes('mã học phần') && 
        rowText.includes('tên học phần')) {
      continue; // Đây là dòng header lặp lại, bỏ qua
    }
    
    // Parse dữ liệu theo thứ tự cột cố định (index-based)
    const stt = (row[0] || '').trim();
    const maHocPhan = (row[1] || '').trim();
    const tenHocPhan = (row[2] || '').trim();
    const tinChi = (row[3] || '').trim();
    const tienQuyet = (row[4] || '').trim();
    const ghiChu = (row[5] || '').trim();
    
    // Kiểm tra xem đây có phải là dòng category/header không
    // (có text ở cột đầu nhưng không phải số, và có thể có số ở cột tín chỉ)
    const isCategoryRow = firstCell && 
                          !/^\d+[\.\)]?/.test(firstCell) && // Không bắt đầu bằng số
                          (firstCell.includes('.') || firstCell.includes('(') || firstCell.includes('[')) &&
                          !maHocPhan; // Không có mã học phần
    
    if (isCategoryRow) {
      // Đây là dòng category, tạo một row đặc biệt để hiển thị
      const categoryData = {
        stt: '',
        maHocPhan: '',
        tenHocPhan: firstCell,
        tinChi: tinChi || '',
        tienQuyet: '',
        ghiChu: '',
        isCategory: true,
        raw: row
      };
      
      rows.push(categoryData);
      lastRowData = null;
      continue;
    }
    
    // Kiểm tra xem đây có phải là dòng tiếp theo của dòng trước không
    // (STT và Mã học phần rỗng nhưng có Tên học phần)
    if (!stt && !maHocPhan && tenHocPhan && lastRowData) {
      // Merge vào dòng trước (thêm tên tiếng Anh)
      if (lastRowData.tenHocPhan) {
        lastRowData.tenHocPhan += '\n' + tenHocPhan;
      } else {
        lastRowData.tenHocPhan = tenHocPhan;
      }
      continue;
    }
    
    // Tạo row data mới
    const rowData = {
      stt,
      maHocPhan,
      tenHocPhan,
      tinChi,
      tienQuyet,
      ghiChu,
      isCategory: false,
      raw: row
    };
    
    // Chỉ thêm hàng có dữ liệu (ít nhất có STT hoặc Mã học phần hoặc Tên học phần)
    if (rowData.stt || rowData.maHocPhan || rowData.tenHocPhan) {
      rows.push(rowData);
      lastRowData = rowData; // Lưu lại để merge dòng tiếp theo nếu cần
    }
  }
  
  return {
    headers,
    rows: rows, // Trả về tất cả rows đã gộp
    sections: [] // Không dùng sections nữa
  };
}

