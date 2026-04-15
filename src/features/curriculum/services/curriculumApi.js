import { parseCsv } from "@/features/curriculum/utils/parseCsv";
import { getCsvPath } from "@/features/curriculum/utils/linkPaths";

export async function fetchCurriculumLinks() {
  const response = await fetch("/ctdt_links.json");
  if (!response.ok) {
    throw new Error(`Không thể tải ctdt_links.json (HTTP ${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchCurriculumCsv(linkItem) {
  const csvPath = getCsvPath(linkItem);
  if (!csvPath) {
    throw new Error("Không tìm thấy file CSV");
  }

  const response = await fetch(csvPath);
  if (!response.ok) {
    throw new Error("File CSV không tồn tại trên server");
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}
