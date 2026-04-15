import { useCallback, useEffect, useState } from "react";
import { DEFAULT_MONTH_RANGE } from "@/features/deadlines/constants/calendar";
import { getDeadlines, initLmsSession } from "@/services/lmsApi";

export function useDeadlinesData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deadlinesData, setDeadlinesData] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginJustCompleted, setLoginJustCompleted] = useState(false);
  const [monthRange, setMonthRange] = useState(DEFAULT_MONTH_RANGE);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const initSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await initLmsSession();
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return false;
    }

    setIsInitialized(true);
    return true;
  }, []);

  const loadDeadlines = useCallback(async (months = DEFAULT_MONTH_RANGE, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    const result = await getDeadlines({ months, forceRefresh });
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return result;
    }

    setDeadlinesData(result.data);
    setIsLoading(false);
    return result;
  }, []);

  useEffect(() => {
    const init = async () => {
      const success = await initSession();
      if (success) {
        await loadDeadlines(DEFAULT_MONTH_RANGE);
        setIsOfflineMode(false);
        return;
      }

      const cachedResult = await getDeadlines({
        months: DEFAULT_MONTH_RANGE,
        forceRefresh: false,
      });

      if (cachedResult.success && cachedResult.data) {
        setDeadlinesData(cachedResult.data);
        setIsLoading(false);
        setIsOfflineMode(true);
        setError(null);
      }
    };

    void init();
  }, [initSession, loadDeadlines]);

  const handleMonthRangeChange = useCallback(
    async (newMonths) => {
      setMonthRange(newMonths);
      if (isInitialized) {
        await loadDeadlines(newMonths, true);
      }
    },
    [isInitialized, loadDeadlines]
  );

  const handleRefresh = useCallback(async () => {
    setIsOfflineMode(false);

    if (!isInitialized) {
      const success = await initSession();
      if (success) {
        await loadDeadlines(monthRange, true);
      }
      return;
    }

    await loadDeadlines(monthRange, true);
  }, [initSession, isInitialized, loadDeadlines, monthRange]);

  const handleReloadDeadlines = useCallback(async () => {
    setShowLoginForm(false);
    setLoginJustCompleted(false);
    setError(null);
    setIsLoading(true);

    const success = await initSession();
    if (success) {
      await loadDeadlines(monthRange);
    }
  }, [initSession, loadDeadlines, monthRange]);

  return {
    isLoading,
    error,
    deadlinesData,
    showLoginForm,
    loginJustCompleted,
    monthRange,
    isOfflineMode,
    setShowLoginForm,
    setLoginJustCompleted,
    handleMonthRangeChange,
    handleRefresh,
    handleReloadDeadlines,
  };
}
