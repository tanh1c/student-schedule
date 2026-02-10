import React, { useState } from "react";
import {
    Shield,
    Lock,
    Eye,
    EyeOff,
    Server,
    Database,
    Clock,
    Trash2,
    CheckCircle2,
    XCircle,
    Code2,
    FileCode,
    ArrowRight,
    AlertTriangle,
    Heart,
    Github,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Info,
    KeyRound,
    Cookie,
    RefreshCw,
    Users,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

// API Endpoint Card Component
function ApiEndpointCard({ endpoint, method, description, dataFlow, security }) {
    const [expanded, setExpanded] = useState(false);

    const methodColors = {
        GET: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        POST: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
        DELETE: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/40 dark:via-gray-950/30 dark:to-zinc-950/40 border border-slate-200/60 dark:border-slate-800/50 transition-all hover:shadow-md">
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge className={`${methodColors[method]} font-mono text-xs px-2 py-0.5 shrink-0`}>
                            {method}
                        </Badge>
                        <code className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {endpoint}
                        </code>
                    </div>
                    <div className="shrink-0 text-slate-400">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{description}</p>
            </div>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            Luồng dữ liệu
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            {dataFlow.map((step, i) => (
                                <React.Fragment key={i}>
                                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {step}
                                    </span>
                                    {i < dataFlow.length - 1 && (
                                        <ArrowRight className="h-3 w-3 text-slate-400" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            Bảo mật
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                            {security.stored ? (
                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                    <Database className="h-3 w-3" />
                                    Lưu tạm trong RAM
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Không lưu Persistent DB
                                </span>
                            )}
                            {security.encrypted && (
                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Lock className="h-3 w-3" />
                                    HTTPS
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Security Feature Card
function SecurityFeatureCard({ icon: Icon, title, description, status, color }) {
    const colorSchemes = {
        green: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
            border: "border-emerald-200/60 dark:border-emerald-900/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            text: "text-emerald-700 dark:text-emerald-400"
        },
        blue: {
            gradient: "from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-sky-950/20",
            border: "border-blue-200/60 dark:border-blue-900/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            text: "text-blue-700 dark:text-blue-400"
        },
        amber: {
            gradient: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-yellow-950/20",
            border: "border-amber-200/60 dark:border-amber-900/50",
            iconBg: "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700",
            iconShadow: "shadow-amber-200/50 dark:shadow-amber-950/40",
            text: "text-amber-700 dark:text-amber-400"
        },
        violet: {
            gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/15 dark:to-fuchsia-950/20",
            border: "border-violet-200/60 dark:border-violet-900/50",
            iconBg: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
            iconShadow: "shadow-violet-200/50 dark:shadow-violet-950/40",
            text: "text-violet-700 dark:text-violet-400"
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.green;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-4 shadow-sm`}>
            <div className="absolute -top-8 -right-8 h-20 w-20 bg-white/20 dark:bg-white/5 rounded-full blur-xl" />
            <div className="relative flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg ${scheme.iconShadow} shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${scheme.text}`}>{title}</h3>
                        {status && (
                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-none text-[10px] px-1.5">
                                {status}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
                </div>
            </div>
        </div>
    );
}

export default function SecurityPage() {
    const [showAllEndpoints, setShowAllEndpoints] = useState(false);

    const apiEndpoints = [
        {
            endpoint: "/api/auth/login",
            method: "POST",
            description: "Đăng nhập SSO BK — chuyển tiếp credentials, trả session token + refresh token (nếu rememberMe)",
            dataFlow: ["Browser", "Server (Proxy)", "SSO BK", "MyBK API"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/auth/refresh",
            method: "POST",
            description: "Tự động đăng nhập lại bằng refresh token — decrypt credentials (AES-256) rồi re-authenticate với MyBK",
            dataFlow: ["Browser", "Server", "Redis (decrypt)", "SSO BK", "Trả session mới"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/auth/logout",
            method: "POST",
            description: "Đăng xuất - xóa session khỏi bộ nhớ server",
            dataFlow: ["Browser", "Server", "Xóa session"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/student/info",
            method: "GET",
            description: "Lấy thông tin sinh viên từ MyBK API (proxy)",
            dataFlow: ["Browser", "Server", "MyBK API", "Trả về browser"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/student/schedule",
            method: "GET",
            description: "Lấy thời khóa biểu từ MyBK API",
            dataFlow: ["Browser", "Server", "MyBK API", "Trả về browser"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/student/gpa/summary",
            method: "POST",
            description: "Lấy tổng quan GPA từ MyBK",
            dataFlow: ["Browser", "Server", "MyBK API", "Trả về browser"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/student/gpa/detail",
            method: "POST",
            description: "Lấy chi tiết điểm các môn từ MyBK",
            dataFlow: ["Browser", "Server", "MyBK API", "Trả về browser"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/dkmh/registration-periods",
            method: "GET",
            description: "Lấy danh sách đợt đăng ký môn học",
            dataFlow: ["Browser", "Server", "DKMH BK", "Trả về browser"],
            security: { stored: false, encrypted: true }
        },
        {
            endpoint: "/api/stats",
            method: "GET",
            description: "Thông tin server (redis, memory, active sessions) - chỉ số liệu thống kê",
            dataFlow: ["Browser", "Server"],
            security: { stored: false, encrypted: true }
        }
    ];

    const displayedEndpoints = showAllEndpoints ? apiEndpoints : apiEndpoints.slice(0, 4);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-950/40 mx-auto">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        Bảo mật & Minh bạch
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Chúng tôi cam kết <strong>không thu thập</strong>, <strong>không lưu trữ</strong> thông tin đăng nhập và dữ liệu cá nhân của bạn.
                        Trang này giải thích chi tiết cách hệ thống hoạt động.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-sm">
                        <Lock className="h-3.5 w-3.5 mr-1.5" />
                        HTTPS Encrypted
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 text-sm">
                        <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                        AES-256-GCM Encrypted
                    </Badge>
                    <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20 px-3 py-1.5 text-sm">
                        <Github className="h-3.5 w-3.5 mr-1.5" />
                        Open Source
                    </Badge>
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Redis Ephemeral Storage
                    </Badge>
                </div>

                {/* How It Works Section */}
                <Card className="border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-slate-200/50 dark:border-slate-800/50">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Hệ thống hoạt động như thế nào?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {/* Flow Diagram */}
                            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-sm">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bạn</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <Server className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Proxy Server</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400" />
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">MyBK/SSO BK</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">1</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Bạn nhập username/password</strong> - Thông tin được gửi tới server qua HTTPS (mã hóa TLS)
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 shrink-0">2</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Server chuyển tiếp</strong> tới SSO BK (sso.hcmut.edu.vn) để xác thực. Password <strong className="text-red-600 dark:text-red-400">KHÔNG được lưu plaintext</strong> ở bất kỳ đâu.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">3</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>MyBK trả về session cookie</strong> - Server lưu cookie này trong Redis (TTL 15 phút) để thay mặt bạn lấy dữ liệu
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">4</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Nếu bật "Ghi nhớ đăng nhập"</strong> - Credentials được mã hóa AES-256-GCM bằng server key và lưu trong Redis (TTL 7 ngày). Client chỉ giữ refresh token ngẫu nhiên.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 shrink-0">5</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <strong>Sau 15 phút không hoạt động</strong> - Session tự động xóa. Nếu có refresh token, hệ thống tự đăng nhập lại.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Features */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-600" />
                        Các tính năng bảo mật
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <SecurityFeatureCard
                            icon={KeyRound}
                            title="Full Redis Encryption"
                            description="TOÀN BỘ dữ liệu trong Redis (đều) được mã hóa AES-256-GCM trước khi lưu. Kể cả khi Redis bị truy cập trái phép, dữ liệu vẫn không đọc được."
                            status="v2.2"
                            color="green"
                        />
                        <SecurityFeatureCard
                            icon={Clock}
                            title="Session Auto-Expire"
                            description="Session tự động xóa sau 15 phút không hoạt động. Refresh token hết hạn sau 7 ngày."
                            status="15 min / 7d"
                            color="amber"
                        />
                        <SecurityFeatureCard
                            icon={Lock}
                            title="Cryptographic Tokens"
                            description="Session và refresh token được tạo bằng crypto.randomBytes(32) — không chứa MSSV hay thông tin cá nhân"
                            status="✓"
                            color="blue"
                        />
                        <SecurityFeatureCard
                            icon={EyeOff}
                            title="MSSV Masking & Log Privacy"
                            description="MSSV trong log luôn được ẩn (221***34). Password không bao giờ xuất hiện trong log files."
                            status="✓"
                            color="violet"
                        />
                    </div>
                </div>

                {/* What We DON'T Collect */}
                <Card className="border-red-200/50 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            Những gì chúng tôi KHÔNG thu thập
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                "Mật khẩu MyBK/SSO",
                                "Điểm số, GPA thực tế",
                                "Thông tin cá nhân (SĐT, email riêng)",
                                "Lịch sử truy cập",
                                "IP address để tracking",
                                "Cookies của bên thứ ba",
                                "Dữ liệu analytics",
                                "Thông tin thiết bị"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* What We DO Store */}
                <Card className="border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            Những gì được lưu TẠM THỜI (Redis Cache)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { item: "Session cookie từ MyBK", duration: "15 phút" },
                                { item: "JWT token (xác thực API)", duration: "15 phút" },
                                { item: "Username (để hiển thị)", duration: "15 phút" },
                                { item: "Cached API responses", duration: "4 giờ" },
                                { item: "Refresh token (encrypted credentials)", duration: "7 ngày", highlight: true },
                            ].map((data, i) => (
                                <div key={i} className={`flex items-center justify-between gap-2 text-sm rounded-lg px-3 py-2 ${data.highlight ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                                    <span className="text-slate-600 dark:text-slate-400">{data.item}</span>
                                    <Badge variant="outline" className={`text-xs ${data.highlight ? 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' : 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'}`}>
                                        {data.duration}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg p-3">
                            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>
                                <strong>3 tầng bảo vệ:</strong> (1) Dữ liệu được <strong>mã hóa AES-256-GCM</strong> trước khi lưu Redis,
                                (2) Redis Upstash có <strong>TLS encryption</strong> cho đường truyền,
                                (3) Tất cả dữ liệu đều có <strong>TTL tự động xóa</strong> (15 phút – 7 ngày).
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* API Endpoints */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-violet-600" />
                            API Endpoints
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllEndpoints(!showAllEndpoints)}
                            className="text-xs"
                        >
                            {showAllEndpoints ? "Thu gọn" : `Xem tất cả (${apiEndpoints.length})`}
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {displayedEndpoints.map((api, i) => (
                            <ApiEndpointCard key={i} {...api} />
                        ))}
                    </div>
                </div>

                {/* Open Source CTA */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 sm:p-8 text-white">
                    <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />

                    <div className="relative flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                            <Github className="h-8 w-8" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl font-bold mb-2">Mã nguồn mở 100%</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Không tin lời chúng tôi? Hãy tự kiểm tra mã nguồn! Mọi logic xử lý đều công khai trên GitHub.
                            </p>
                            <Button className="bg-white text-slate-900 hover:bg-slate-100">
                                <Github className="h-4 w-4 mr-2" />
                                Xem mã nguồn
                                <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
                    <p className="flex items-center justify-center gap-1">
                        Made with <Heart className="h-4 w-4 text-red-500" /> by sinh viên BK cho sinh viên BK
                    </p>
                    <p>
                        Nếu có bất kỳ thắc mắc về bảo mật, vui lòng liên hệ qua GitHub Issues hoặc Email của mình
                    </p>
                </div>

            </div>
        </div>
    );
}
