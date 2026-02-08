import React, { useState } from "react";
import {
    History,
    Bug,
    Sparkles,
    Zap,
    Tag,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Calendar,
    Rocket,
    Heart,
    ArrowRight,
    Code2,
    RefreshCw,
    Wrench,
    Github,
    Mail,
    ExternalLink,
    Copy,
    Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

// Changelog data - Add new entries at the top
const changelogData = [
    {
        version: "2.1.0",
        date: "2026-02-09",
        title: "LMS Messaging & Schedule UX Upgrade ✨",
        isLatest: true,
        changes: [
            {
                type: "feature",
                title: "Hệ thống Tin nhắn LMS (Mới) 💬",
                description: "Chính thức ra mắt tính năng nhắn tin tích hợp LMS. Kết nối trực tiếp với BK E-Learning để gửi/nhận tin nhắn, quản lý hội thoại và cập nhật thông báo từ giảng viên ngay trên ứng dụng."
            },
            {
                type: "feature",
                title: "Chế độ Offline & Cache thông minh",
                description: "Công nghệ lưu trữ cục bộ cho phép xem lại toàn bộ tin nhắn và hội thoại cũ (lên đến 7 ngày) ngay cả khi mất kết nối mạng hoặc server LMS bảo trì."
            },
            {
                type: "improvement",
                title: "Schedule Detail Popup (Desktop)",
                description: "Trải nghiệm xem thời khóa biểu tốt hơn: Di chuột hoặc click vào môn học để xem ngay thông tin chi tiết (Phòng, Giờ, Tuần học, Ghi chú...) mà không cần mở tab khác."
            },
            {
                type: "feature",
                title: "Pinned Messages Dashboard",
                description: "Tổng hợp tất cả tin nhắn quan trọng (đã ghim từ các cuộc trò chuyện) và hiển thị ngay trên trang chủ tin nhắn để truy cập nhanh."
            }
        ]
    },
    {
        version: "2.0.0",
        date: "2026-02-08",
        title: "Major Backend Overhaul & Performance Boost 🚀",
        isLatest: false,
        changes: [
            {
                type: "feature",
                title: "Kiến trúc Modular Backend",
                description: "Tái cấu trúc toàn bộ Server sang mô hình Controller-Service-Route chuyên nghiệp, dễ bảo trì và mở rộng."
            },
            {
                type: "feature",
                title: "Redis Caching & Session",
                description: "Tích hợp Redis với chiến lược SWR (Stale-While-Revalidate), tăng tốc độ API lên gấp 10-100 lần và quản lý session an toàn."
            },
            {
                type: "improvement",
                title: "Hệ thống Logging nâng cao",
                description: "Sử dụng Winston Logger với tính năng xoay vòng file log (log rotation) và tự động ẩn thông tin nhạy cảm."
            },
            {
                type: "improvement",
                title: "Docker Support",
                description: "Hỗ trợ triển khai nhanh chóng với Dockerfile và docker-compose."
            },
            {
                type: "fix",
                title: "Sửa lỗi GPA Sync",
                description: "Cập nhật endpoint API MyBK mới nhất để sửa lỗi không hiện bảng điểm và tối ưu hóa logic đồng bộ."
            }
        ]
    },
    {
        version: "1.2.0",
        date: "2026-02-02",
        title: "GPA Calculation Fix & Changelog",
        isLatest: false,
        changes: [
            {
                type: "fix",
                title: "Sửa lỗi logic tính GPA khi Aim môn đã có điểm",
                description: "Trước đây hệ thống sử dụng cách tính cộng dồn (additive), khiến môn đã có điểm bị tính 2 lần khi đặt Aim. Giờ đã đổi sang re-calculation, điểm Aim thay thế hoàn toàn điểm gốc."
            },
            {
                type: "fix",
                title: "Sửa lỗi tín chỉ tích lũy giảm sai khi Aim",
                description: "Môn có điểm > 10 (điểm đặc biệt) không được tính vào GPA nhưng vẫn tính vào tín chỉ tích lũy. Logic cũ thiếu việc xử lý trường hợp này."
            },
            {
                type: "feature",
                title: "Thêm trang Changelog",
                description: "Hiển thị lịch sử các thay đổi, bug fixes và tính năng mới của ứng dụng."
            }
        ]
    },
    {
        version: "1.1.0",
        date: "2026-01-31",
        title: "Privacy & Security Improvements",
        changes: [
            {
                type: "improvement",
                title: "Cải thiện bảo mật logs",
                description: "Ẩn thông tin nhạy cảm trong logs backend như session cookies, MSSV, và các tham số URL nhạy cảm."
            },
            {
                type: "improvement",
                title: "Tắt lưu file debug HTML",
                description: "Không còn lưu file HTML debug trong môi trường production để bảo vệ quyền riêng tư."
            }
        ]
    },
    {
        version: "1.0.0",
        date: "2026-01-28",
        title: "Initial Release 🎉",
        changes: [
            {
                type: "feature",
                title: "Ra mắt phiên bản đầu tiên",
                description: "Dashboard sinh viên BK với đầy đủ tính năng: Thời khóa biểu, Lịch thi, CTĐT, Tính GPA, Lịch giảng dạy, Ghi chú, Roadmap, ĐKMH."
            },
            {
                type: "improvement",
                title: "Tối ưu giao diện mobile",
                description: "Cải thiện PDF viewer và CSV table view cho responsive trên thiết bị di động."
            }
        ]
    }
];

// Type configuration
const getTypeConfig = (type) => {
    switch (type) {
        case "feature":
            return {
                icon: Sparkles,
                label: "Tính năng mới",
                color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
            };
        case "fix":
            return {
                icon: Bug,
                label: "Sửa lỗi",
                color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
            };
        case "improvement":
            return {
                icon: Zap,
                label: "Cải thiện",
                color: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
            };
        case "breaking":
            return {
                icon: Wrench,
                label: "Breaking",
                color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
            };
        default:
            return {
                icon: RefreshCw,
                label: "Thay đổi",
                color: "bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30"
            };
    }
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Release Card Component - Similar to ApiEndpointCard
function ReleaseCard({ version, date, title, changes, isLatest }) {
    const [expanded, setExpanded] = useState(isLatest || false);

    return (
        <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/40 dark:via-gray-950/30 dark:to-zinc-950/40 border transition-all hover:shadow-md ${isLatest ? 'border-violet-300 dark:border-violet-700 ring-2 ring-violet-200/50 dark:ring-violet-900/30' : 'border-slate-200/60 dark:border-slate-800/50'}`}>
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isLatest
                            ? 'bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700'
                            : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                            <Tag className={`h-5 w-5 ${isLatest ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v{version}</span>
                                {isLatest && (
                                    <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30 text-[10px] px-1.5">
                                        MỚI NHẤT
                                    </Badge>
                                )}
                                <span className="text-xs text-slate-500 dark:text-slate-400">• {formatDate(date)}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{title}</p>
                        </div>
                    </div>
                    <div className="shrink-0 text-slate-400">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                    {changes.map((change, idx) => {
                        const config = getTypeConfig(change.type);
                        const Icon = config.icon;

                        return (
                            <div key={idx} className="space-y-1.5">
                                <Badge className={`${config.color} font-medium text-xs px-2 py-0.5`}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {config.label}
                                </Badge>
                                <div>
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{change.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{change.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Stats Feature Card - Similar to SecurityFeatureCard
function StatsFeatureCard({ icon: Icon, title, value, color }) {
    const colorSchemes = {
        green: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
            border: "border-emerald-200/60 dark:border-emerald-900/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            text: "text-emerald-700 dark:text-emerald-400",
            value: "text-emerald-900 dark:text-emerald-300"
        },
        red: {
            gradient: "from-red-50 via-rose-50 to-pink-50 dark:from-red-950/20 dark:via-rose-950/15 dark:to-pink-950/20",
            border: "border-red-200/60 dark:border-red-900/50",
            iconBg: "from-red-400 to-rose-500 dark:from-red-600 dark:to-rose-700",
            iconShadow: "shadow-red-200/50 dark:shadow-red-950/40",
            text: "text-red-700 dark:text-red-400",
            value: "text-red-900 dark:text-red-300"
        },
        blue: {
            gradient: "from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-sky-950/20",
            border: "border-blue-200/60 dark:border-blue-900/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            text: "text-blue-700 dark:text-blue-400",
            value: "text-blue-900 dark:text-blue-300"
        },
        violet: {
            gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/15 dark:to-fuchsia-950/20",
            border: "border-violet-200/60 dark:border-violet-900/50",
            iconBg: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
            iconShadow: "shadow-violet-200/50 dark:shadow-violet-950/40",
            text: "text-violet-700 dark:text-violet-400",
            value: "text-violet-900 dark:text-violet-300"
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-4 shadow-sm`}>
            <div className="absolute -top-8 -right-8 h-20 w-20 bg-white/20 dark:bg-white/5 rounded-full blur-xl" />
            <div className="relative flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg ${scheme.iconShadow} shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-2xl font-black ${scheme.value}`}>{value}</p>
                    <p className={`text-xs font-medium ${scheme.text}`}>{title}</p>
                </div>
            </div>
        </div>
    );
}

// Feedback Section Component with Dialog
function FeedbackSection() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("bug"); // "bug" or "feature"
    const [copied, setCopied] = useState(false);

    const email = "tanhbku@proton.me";
    const githubIssues = "https://github.com/tanh1c/student-schedule/issues";

    const handleOpenDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
        setCopied(false);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDialogContent = () => {
        if (dialogType === "bug") {
            return {
                title: "Báo lỗi",
                description: "Chọn cách bạn muốn báo lỗi cho chúng tôi",
                icon: Bug,
                emailSubject: "[Bug Report] Báo lỗi TKB Smart",
                githubLabel: "Tạo Bug Report trên GitHub"
            };
        }
        return {
            title: "Đề xuất tính năng",
            description: "Chia sẻ ý tưởng của bạn với chúng tôi",
            icon: Sparkles,
            emailSubject: "[Feature Request] Đề xuất tính năng",
            githubLabel: "Tạo Feature Request trên GitHub"
        };
    };

    const content = getDialogContent();
    const DialogIcon = content.icon;

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 sm:p-8 text-white">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                        <Bug className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-bold mb-2">Phát hiện lỗi?</h3>
                        <p className="text-slate-300 text-sm mb-4">
                            Nếu bạn gặp bất kỳ lỗi nào hoặc có ý tưởng cải thiện, hãy báo cho chúng tôi biết!
                            Mọi đóng góp đều được ghi nhận và trân trọng.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            <button
                                onClick={() => handleOpenDialog("bug")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 transition-colors"
                            >
                                <Bug className="h-4 w-4" />
                                Báo lỗi
                            </button>
                            <button
                                onClick={() => handleOpenDialog("feature")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-medium text-sm border border-white/30 hover:bg-white/20 transition-colors"
                            >
                                <Sparkles className="h-4 w-4" />
                                Đề xuất tính năng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${dialogType === "bug"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-emerald-100 dark:bg-emerald-900/30"
                                }`}>
                                <DialogIcon className={`h-4 w-4 ${dialogType === "bug"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                    }`} />
                            </div>
                            {content.title}
                        </DialogTitle>
                        <DialogDescription>
                            {content.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                        {/* Email Option */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Gửi Email</p>
                                    <p className="text-xs text-muted-foreground">Liên hệ trực tiếp qua email</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2">
                                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">{email}</code>
                                <button
                                    onClick={handleCopyEmail}
                                    className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    title="Copy email"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-slate-500" />
                                    )}
                                </button>
                            </div>
                            <a
                                href={`mailto:${email}?subject=${encodeURIComponent(content.emailSubject)}`}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                                <Mail className="h-4 w-4" />
                                Mở ứng dụng Email
                            </a>
                        </div>

                        {/* GitHub Option */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Github className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">GitHub Issues</p>
                                    <p className="text-xs text-muted-foreground">Tạo issue trên repository</p>
                                </div>
                            </div>
                            <a
                                href={githubIssues}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Github className="h-4 w-4" />
                                {content.githubLabel}
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ChangelogPage() {
    const [showAllReleases, setShowAllReleases] = useState(false);

    // Calculate stats
    const stats = {
        features: changelogData.reduce((acc, v) => acc + v.changes.filter(c => c.type === "feature").length, 0),
        fixes: changelogData.reduce((acc, v) => acc + v.changes.filter(c => c.type === "fix").length, 0),
        improvements: changelogData.reduce((acc, v) => acc + v.changes.filter(c => c.type === "improvement").length, 0),
        versions: changelogData.length
    };

    const latestVersion = changelogData[0];
    const displayedReleases = showAllReleases ? changelogData : changelogData.slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-200/50 dark:shadow-violet-950/40 mx-auto">
                        <History className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        Changelog
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Theo dõi các <strong>bản cập nhật</strong>, <strong>tính năng mới</strong> và <strong>sửa lỗi</strong> của TKB Smart.
                        Chúng tôi liên tục cải thiện để mang lại trải nghiệm tốt nhất cho bạn.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-3">
                    <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20 px-3 py-1.5 text-sm">
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        v{latestVersion.version}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(latestVersion.date)}
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 text-sm">
                        <Rocket className="h-3.5 w-3.5 mr-1.5" />
                        {stats.versions} phiên bản
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatsFeatureCard
                        icon={Sparkles}
                        title="Tính năng mới"
                        value={stats.features}
                        color="green"
                    />
                    <StatsFeatureCard
                        icon={Bug}
                        title="Sửa lỗi"
                        value={stats.fixes}
                        color="red"
                    />
                    <StatsFeatureCard
                        icon={Zap}
                        title="Cải thiện"
                        value={stats.improvements}
                        color="blue"
                    />
                    <StatsFeatureCard
                        icon={Tag}
                        title="Phiên bản"
                        value={stats.versions}
                        color="violet"
                    />
                </div>

                {/* Latest Release Highlight */}
                <Card className="border-violet-200/50 dark:border-violet-900/30 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-slate-900 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-violet-100/50 to-purple-100/50 dark:from-violet-950/50 dark:to-purple-950/50 border-b border-violet-200/50 dark:border-violet-800/50">
                        <CardTitle className="flex items-center gap-2 text-violet-900 dark:text-violet-100">
                            <Rocket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            Phiên bản mới nhất: v{latestVersion.version}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {latestVersion.title}
                            </p>
                            <div className="space-y-3">
                                {latestVersion.changes.map((change, idx) => {
                                    const config = getTypeConfig(change.type);
                                    const Icon = config.icon;

                                    return (
                                        <div key={idx} className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                                            <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${change.type === 'feature' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                                                change.type === 'fix' ? 'bg-red-100 dark:bg-red-900/50' :
                                                    'bg-blue-100 dark:bg-blue-900/50'
                                                }`}>
                                                <Icon className={`h-3.5 w-3.5 ${change.type === 'feature' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    change.type === 'fix' ? 'text-red-600 dark:text-red-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{change.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{change.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* All Releases */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-violet-600" />
                            Lịch sử phiên bản
                        </h2>
                        {changelogData.length > 3 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllReleases(!showAllReleases)}
                                className="text-xs"
                            >
                                {showAllReleases ? "Thu gọn" : `Xem tất cả (${changelogData.length})`}
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {displayedReleases.map((release, idx) => (
                            <ReleaseCard
                                key={release.version}
                                {...release}
                            />
                        ))}
                    </div>
                </div>

                {/* Contribute CTA */}
                <FeedbackSection />

                {/* Footer */}
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
                    <p className="flex items-center justify-center gap-1">
                        Made with <Heart className="h-4 w-4 text-red-500" /> by sinh viên BK cho sinh viên BK
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Tổng cộng {stats.features + stats.fixes + stats.improvements} thay đổi trong {stats.versions} phiên bản
                    </p>
                </div>

            </div>
        </div>
    );
}
