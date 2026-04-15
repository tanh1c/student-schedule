import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Calendar, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import mybkApi from "@/services/mybkApi";
import BetaWarningBanner from "@/features/registration/components/BetaWarningBanner";
import PeriodDetailsView from "@/features/registration/components/PeriodDetailsView";
import RegistrationPeriodCard from "@/features/registration/components/RegistrationPeriodCard";

export default function RegistrationTab() {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dkmhStatus, setDkmhStatus] = useState({ authenticated: false });
    const [filter, setFilter] = useState("all");
    const [showBetaWarning, setShowBetaWarning] = useState(() => (
        localStorage.getItem("hideBetaWarning_registration") !== "true"
    ));
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [periodDetails, setPeriodDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const dismissBetaWarning = () => {
        setShowBetaWarning(false);
        localStorage.setItem("hideBetaWarning_registration", "true");
    };

    const loadPeriods = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mybkApi.getRegistrationPeriods(forceRefresh);

            if (result.success && result.data) {
                setPeriods(result.data);
                localStorage.setItem("dkmh_periods", JSON.stringify(result.data));
            } else {
                setError(result.error || "Không thể tải danh sách đợt đăng ký");
            }
        } catch (currentError) {
            setError(currentError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAndLoadPeriods = useCallback(async () => {
        const status = await mybkApi.checkDkmhStatus();
        setDkmhStatus(status);

        if (status.authenticated || status.dkmhLoggedIn) {
            await loadPeriods();
        }
    }, [loadPeriods]);

    useEffect(() => {
        const cached = localStorage.getItem("dkmh_periods");
        if (cached) {
            try {
                setPeriods(JSON.parse(cached));
            } catch {
                // Ignore malformed cached registration data and continue with a fresh fetch.
            }
        }
        void checkAndLoadPeriods();
    }, [checkAndLoadPeriods]);

    const loadPeriodDetails = async (period) => {
        setSelectedPeriod(period);
        setLoadingDetails(true);
        setPeriodDetails(null);

        try {
            const result = await mybkApi.getPeriodDetails(period.id);

            if (result.success && result.data) {
                setPeriodDetails(result.data);
            } else {
                setError(result.error || "Không thể tải chi tiết đợt đăng ký");
            }
        } catch (currentError) {
            setError(currentError.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const goBack = () => {
        setSelectedPeriod(null);
        setPeriodDetails(null);
    };

    const filteredPeriods = periods.filter((period) => {
        if (filter === "all") return true;
        return period.status === filter;
    });

    const openCount = periods.filter((period) => period.status === "open").length;
    const upcomingCount = periods.filter((period) => period.status === "upcoming").length;

    if (selectedPeriod) {
        return (
            <PeriodDetailsView
                period={selectedPeriod}
                details={periodDetails}
                loading={loadingDetails}
                onBack={goBack}
            />
        );
    }

    return (
        <div className="space-y-4 px-3 pt-3 pb-24 sm:px-4 sm:pt-6">
            {showBetaWarning && (
                <BetaWarningBanner onDismiss={dismissBetaWarning} />
            )}

            <div className="flex flex-wrap items-center gap-3">
                {!dkmhStatus.authenticated && !dkmhStatus.dkmhLoggedIn && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">Đang chờ kết nối DKMH... Vui lòng đăng nhập MyBK trước.</span>
                        <span className="sm:hidden">Chờ đăng nhập MyBK</span>
                    </div>
                )}

                <div className="flex-1" />

                <Button
                    onClick={() => loadPeriods(true)}
                    disabled={loading}
                    size="sm"
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Đang tải..." : "Làm mới"}
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="py-3 px-4">
                        <p className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {periods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 dark:bg-muted/30 rounded-xl border">
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === "all"
                            ? "bg-background dark:bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                    >
                        <Calendar className="h-4 w-4" />
                        Tất cả ({periods.length})
                    </button>
                    <button
                        onClick={() => setFilter("open")}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === "open"
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-sm"
                            : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                            }`}
                    >
                        Đang mở ({openCount})
                    </button>
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === "upcoming"
                            ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                            }`}
                    >
                        Sắp mở ({upcomingCount})
                    </button>
                </div>
            )}

            {loading && periods.length === 0 && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải danh sách đợt đăng ký...</p>
                </div>
            )}

            <div className="space-y-3">
                {filteredPeriods.map((period, index) => (
                    <RegistrationPeriodCard
                        key={period.id || index}
                        period={period}
                        onClick={() => loadPeriodDetails(period)}
                    />
                ))}
            </div>

            {periods.length > 0 && (
                <p className="text-center text-xs text-muted-foreground pt-4">
                    Hiển thị {periods.length} đợt đăng ký gần nhất • {openCount} đang mở
                </p>
            )}
        </div>
    );
}
