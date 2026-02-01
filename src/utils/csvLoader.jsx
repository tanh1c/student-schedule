/**
 * Utility để load và parse file CSV
 */

/**
 * Load và parse file CSV từ public folder
 * @param {string} csvPath - Đường dẫn đến file CSV (từ public folder)
 * @returns {Promise<Array>} - Mảng các hàng dữ liệu
 */
export async function loadCSV(csvPath) {
  try {
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    
    const text = await response.text();
    // Nếu fetch nhầm index.html (do 404 fallback), ta báo lỗi rõ ràng
    const head = text.slice(0, 200).toLowerCase();
    if (head.includes('<!doctype html') || head.includes('<html')) {
      throw new Error(
        `Không tìm thấy file CSV (${csvPath}). Server trả về HTML (có thể do sai tên file).`
      );
    }
    return parseCSV(text);
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

/**
 * Parse CSV text thành mảng các hàng
 * @param {string} csvText - Nội dung CSV
 * @returns {Array<Array<string>>} - Mảng các hàng, mỗi hàng là mảng các cell
 */
export function parseCSV(csvText) {
  // Robust CSV parser: hỗ trợ dấu xuống dòng trong quoted field + BOM
  const text = csvText.replace(/^\uFEFF/, ''); // remove UTF-8 BOM if any
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF
      if (ch === '\r' && text[i + 1] === '\n') i++;
      // push last field + row
      const trimmedRow = [...row, field].map((v) => (v ?? '').toString().trimEnd());
      if (trimmedRow.some((v) => v.trim() !== '')) rows.push(trimmedRow);
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  // last row
  const lastRow = [...row, field].map((v) => (v ?? '').toString().trimEnd());
  if (lastRow.some((v) => v.trim() !== '')) rows.push(lastRow);
  return rows;
}

/**
 * Tạo tên file CSV từ thông tin khoa, ngành, loại, năm
 * @param {string} khoa - Tên khoa
 * @param {string} nganh - Tên ngành
 * @param {string} loai - Loại (CTDT hoặc KHGD)
 * @param {string} nam - Năm học
 * @returns {string} - Tên file CSV
 */
export function generateCSVFilename(khoa, nganh, loai, nam) {
  // Giữ Unicode (tiếng Việt), chỉ bỏ ký tự thật sự “nguy hiểm” cho filename
  // Python regex trước đó dùng \w (unicode), JS \w không unicode => phải dùng Unicode property escapes.
  const cleanup = (s) =>
    (s || '')
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}\s_-]/gu, '') // keep letters/numbers/space/_/-
      .trim()
      .replace(/\s+/g, '_');

  const safeKhoa = cleanup(khoa);
  const safeNganh = cleanup(nganh);
  const safeNam = cleanup(nam);
  return `${safeKhoa}_${safeNganh}_${loai}_${safeNam}.csv`;
}

/**
 * Tìm file CSV phù hợp từ danh sách các file có sẵn
 * @param {string} khoa - Tên khoa
 * @param {string} nganh - Tên ngành
 * @param {string} loai - Loại (CTDT hoặc KHGD)
 * @param {string} nam - Năm học
 * @param {Array} availableFiles - Danh sách tên file có sẵn
 * @returns {string|null} - Tên file phù hợp hoặc null
 */
export function findCSVFile(khoa, nganh, loai, nam, availableFiles) {
  const filename = generateCSVFilename(khoa, nganh, loai, nam);
  
  // Tìm exact match
  if (availableFiles.includes(filename)) {
    return filename;
  }
  
  // Tìm partial match (có thể có thêm suffix như _page1_table0)
  const pattern = new RegExp(
    `^${filename.replace(/\.csv$/, '')}(_page\\d+_table\\d+)?\\.csv$`
  );
  const match = availableFiles.find(file => pattern.test(file));
  
  if (match) {
    return match;
  }
  
  // Tìm file gần nhất (bỏ qua suffix)
  const basePattern = filename.replace(/\.csv$/, '').replace(/_[^_]+$/, '');
  const regex = new RegExp(`^${basePattern}.*\\.csv$`);
  const partialMatch = availableFiles.find(file => regex.test(file));
  
  return partialMatch || null;
}
