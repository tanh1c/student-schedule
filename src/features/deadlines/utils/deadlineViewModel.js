import { MONTH_NAMES } from "@/features/deadlines/constants/calendar";

export function buildDeadlinesViewModel(deadlinesData, nowSeconds, showPast) {
  if (!deadlinesData) {
    return {
      calendarInfo: "",
      filteredDeadlines: [],
      filteredUpcoming: [],
      stats: { total: 0, deadlines: 0, upcoming: 0, urgent: 0 },
    };
  }

  const allDeadlines = deadlinesData.deadlines || [];
  const allUpcoming = deadlinesData.upcoming || [];

  const futureDeadlines = allDeadlines.filter(
    (event) => !event.dayTimestamp || event.dayTimestamp >= nowSeconds
  );
  const pastDeadlines = allDeadlines.filter(
    (event) => event.dayTimestamp && event.dayTimestamp < nowSeconds
  );
  const futureUpcoming = allUpcoming.filter(
    (event) => !event.dayTimestamp || event.dayTimestamp >= nowSeconds
  );

  const urgentCount = futureDeadlines.filter((event) => {
    if (!event.dayTimestamp) return false;
    const diffDays = (event.dayTimestamp - nowSeconds) / (60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  const filteredDeadlines = showPast
    ? [...futureDeadlines, ...pastDeadlines]
    : futureDeadlines;
  const filteredUpcoming = [...futureUpcoming];

  filteredDeadlines.sort(
    (left, right) => (left.dayTimestamp || 0) - (right.dayTimestamp || 0)
  );
  filteredUpcoming.sort(
    (left, right) => (left.dayTimestamp || 0) - (right.dayTimestamp || 0)
  );

  return {
    calendarInfo: getCalendarInfo(deadlinesData),
    filteredDeadlines,
    filteredUpcoming,
    stats: {
      total: deadlinesData.totalEvents || 0,
      deadlines: futureDeadlines.length,
      upcoming: futureUpcoming.length,
      urgent: urgentCount,
    },
  };
}

function getCalendarInfo(deadlinesData) {
  const fetched = deadlinesData.fetchedMonths;
  if (fetched?.length > 0) {
    const first = fetched[0];
    const last = fetched[fetched.length - 1];

    if (first.month === last.month && first.year === last.year) {
      return `${MONTH_NAMES[first.month]} ${first.year}`;
    }

    return `${MONTH_NAMES[first.month]} → ${MONTH_NAMES[last.month]} ${last.year}`;
  }

  if (deadlinesData.calendarMonth && deadlinesData.calendarYear) {
    return `${MONTH_NAMES[deadlinesData.calendarMonth]} ${deadlinesData.calendarYear}`;
  }

  return "";
}
