import { WORKSPACE_TAB_CHANGE_EVENT } from "@app/navigationEvents";

export function navigateToTab(tabId) {
  window.dispatchEvent(new CustomEvent(WORKSPACE_TAB_CHANGE_EVENT, { detail: { tabId } }));
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    const date = new Date(`${year}-${month}-${day}T00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDateTime(value) {
  const date = normalizeDate(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatTimeOnly(value) {
  const date = normalizeDate(value);
  if (!date) return "";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function formatCountdown(targetDate) {
  if (!targetDate) return "";

  const now = new Date();
  const today = new Date(now);
  const target = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "Hôm nay";
  return `Còn ${diffDays} ngày`;
}
