import React from 'react';
import {
    Shield,
    Lock,
    Eye,
    Server,
    Github,
    CalendarClock,
    GraduationCap,
    BadgePercent,
    Route,
    NotebookTabs,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    Code2,
    Heart,
    Sparkles,
    KeyRound,
    RefreshCw,
    Rocket,
    ChevronRight,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLogo from './AppLogo';

const features = [
    {
        icon: CalendarClock,
        title: 'Thời khóa biểu',
        description: 'Xem và quản lý lịch học theo tuần, hỗ trợ sync từ MyBK',
        color: 'bg-blue-500',
        iconColor: 'text-blue-500'
    },
    {
        icon: GraduationCap,
        title: 'Lịch thi & CTĐT',
        description: 'Tra cứu lịch thi và chương trình đào tạo dễ dàng',
        color: 'bg-emerald-500',
        iconColor: 'text-emerald-500'
    },
    {
        icon: BadgePercent,
        title: 'Tính GPA',
        description: 'Tính điểm trung bình tích lũy với giao diện trực quan',
        color: 'bg-violet-500',
        iconColor: 'text-violet-500'
    },
    {
        icon: NotebookTabs,
        title: 'Đăng ký môn học',
        description: 'Hỗ trợ đăng ký môn học với tính năng tìm kiếm nhanh',
        color: 'bg-amber-500',
        iconColor: 'text-amber-500'
    },
    {
        icon: Route,
        title: 'Roadmap học tập',
        description: 'Lên kế hoạch và theo dõi tiến trình học tập theo kỳ',
        color: 'bg-cyan-500',
        iconColor: 'text-cyan-500'
    },
    {
        icon: Users,
        title: 'Lịch giảng dạy',
        description: 'Tra cứu lịch dạy của giảng viên, tìm lớp theo thời gian',
        color: 'bg-rose-500',
        iconColor: 'text-rose-500'
    }
];

const securityPoints = [
    {
        icon: Lock,
        title: 'Không lưu mật khẩu',
        description: 'Mật khẩu của bạn chỉ được sử dụng để xác thực với SSO của trường và KHÔNG được lưu trữ trên server của chúng tôi.'
    },
    {
        icon: Eye,
        title: 'Không thu thập dữ liệu',
        description: 'Chúng tôi không lưu trữ thông tin cá nhân, điểm số, hay bất kỳ dữ liệu nào của bạn. Mọi thứ đều được xử lý real-time.'
    },
    {
        icon: Server,
        title: 'Session tạm thời',
        description: 'Session đăng nhập tự động hết hạn sau 1 giờ. Không có dữ liệu nào được lưu lại sau khi bạn đăng xuất.'
    },
    {
        icon: Shield,
        title: 'HTTPS + Mã hóa',
        description: 'Tất cả kết nối đều qua HTTPS với SSL/TLS encryption, đảm bảo an toàn khi truyền dữ liệu.'
    }
];

function LandingPage({ onEnterApp }) {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section - Full viewport with stunning design */}
            <div className="relative overflow-hidden min-h-screen flex flex-col">
                {/* Animated gradient background - Enhanced for both modes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Base gradient - More vibrant in light mode */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-violet-50 dark:from-transparent dark:via-transparent dark:to-transparent" />

                    {/* Primary gradient mesh - Stronger in light mode */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(0,0,0,0))]" />

                    {/* Secondary accent gradient - Bottom right */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(236,72,153,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(236,72,153,0.08),rgba(0,0,0,0))]" />

                    {/* Animated gradient orbs - More visible in light mode */}
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/40 via-indigo-400/30 to-violet-400/40 dark:from-primary/30 dark:via-blue-500/20 dark:to-violet-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/30 via-pink-400/25 to-rose-400/30 dark:from-indigo-500/20 dark:via-purple-500/15 dark:to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                    <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-cyan-400/30 via-teal-400/25 to-emerald-400/30 dark:from-cyan-500/20 dark:via-teal-500/15 dark:to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />

                    {/* Extra light mode accent - center glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/5 rounded-full blur-3xl" />

                    {/* Floating particles effect - More colorful */}
                    <div className="absolute inset-0">
                        {[
                            { color: 'bg-blue-400/40 dark:bg-primary/30', size: 'w-3 h-3' },
                            { color: 'bg-violet-400/40 dark:bg-violet-500/30', size: 'w-2 h-2' },
                            { color: 'bg-pink-400/40 dark:bg-pink-500/30', size: 'w-2.5 h-2.5' },
                            { color: 'bg-indigo-400/40 dark:bg-indigo-500/30', size: 'w-2 h-2' },
                            { color: 'bg-cyan-400/40 dark:bg-cyan-500/30', size: 'w-3 h-3' },
                            { color: 'bg-emerald-400/40 dark:bg-emerald-500/30', size: 'w-2 h-2' },
                        ].map((particle, i) => (
                            <div
                                key={i}
                                className={`absolute ${particle.size} ${particle.color} rounded-full animate-bounce`}
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: `${2 + i * 0.5}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
                        style={{
                            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                            backgroundSize: '80px 80px'
                        }}
                    />

                    {/* Radial fade to background - Softer in light mode */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'radial-gradient(circle at center, transparent 0%, hsl(var(--background)) 80%)' }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-10 sm:pb-12 flex-1 flex flex-col">
                    {/* Header with glassmorphism */}
                    <div className="flex items-center justify-between mb-8 sm:mb-12">
                        <div className="flex items-center gap-3">
                            <AppLogo size={44} className="shadow-xl shadow-primary/30 ring-2 ring-white/20 rounded-2xl" />
                            <div>
                                <span className="text-xl font-bold text-foreground">TKB Smart</span>
                                <span className="hidden sm:inline text-xs text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">v2.0</span>
                            </div>
                        </div>
                        <a
                            href="https://github.com/tanh1c/student-schedule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all px-4 py-2 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        >
                            <Github className="h-4 w-4" />
                            <span className="hidden sm:inline">Star on GitHub</span>
                        </a>
                    </div>

                    {/* Main Content - Centered */}
                    <div className="flex-1 flex flex-col justify-center">
                        {/* Hero Content */}
                        <div className="text-center max-w-5xl mx-auto mb-10 sm:mb-14">
                            {/* Animated Badge */}
                            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-gradient-to-r from-primary/10 via-primary/5 to-violet-500/10 border border-primary/20 rounded-full shadow-lg shadow-primary/10 animate-pulse">
                                <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                                    Miễn phí • Mã nguồn mở • Bảo mật
                                </span>
                            </div>

                            {/* Main Headline with enhanced typography */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
                                <span className="block">Quản lý lịch học</span>
                                <span className="relative inline-block mt-2">
                                    <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                        thông minh
                                    </span>
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
                                Công cụ <span className="text-foreground font-semibold">all-in-one</span> cho sinh viên
                                <span className="inline-flex items-center mx-2 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-base font-bold">
                                    ĐH Bách Khoa TPHCM
                                </span>
                            </p>

                            {/* CTA Buttons with enhanced styling */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                                <Button
                                    size="lg"
                                    onClick={onEnterApp}
                                    className="w-full sm:w-auto text-base px-10 py-7 shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-blue-600 border-0 rounded-2xl font-semibold"
                                >
                                    <Rocket className="mr-2 h-5 w-5" />
                                    Vào ứng dụng ngay
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <a
                                    href="https://github.com/tanh1c/student-schedule"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto text-base px-10 py-7 border-2 border-gray-300 dark:border-white/30 hover:border-primary/50 dark:hover:border-primary/70 bg-white/80 dark:bg-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white/20 rounded-2xl font-semibold text-foreground dark:text-white"
                                    >
                                        <Code2 className="mr-2 h-5 w-5" />
                                        Xem mã nguồn
                                    </Button>
                                </a>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-8">
                                {[
                                    { value: '1000+', label: 'Sinh viên', icon: Users },
                                    { value: '6+', label: 'Tính năng', icon: Sparkles },
                                    { value: '100%', label: 'Bảo mật', icon: Shield }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center group cursor-default">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <stat.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {stat.value}
                                            </span>
                                        </div>
                                        <span className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Trust Badges with enhanced styling */}
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium shadow-sm">
                                    <Shield className="h-3.5 w-3.5" />
                                    <span>Không lưu mật khẩu</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-medium shadow-sm">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>HTTPS mã hóa</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 text-xs sm:text-sm font-medium shadow-sm">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Không thu thập dữ liệu</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid with enhanced cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
                            {[
                                { icon: CalendarClock, label: 'Thời khóa biểu', desc: 'Xem theo tuần', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                                { icon: GraduationCap, label: 'Lịch thi', desc: 'Tra cứu nhanh', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                                { icon: BadgePercent, label: 'Tính GPA', desc: 'Tự động tính', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
                                { icon: NotebookTabs, label: 'Đăng ký môn', desc: 'Hỗ trợ ĐKMH', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                                { icon: Route, label: 'Roadmap', desc: 'Kế hoạch học', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
                                { icon: Users, label: 'Lịch giảng dạy', desc: 'Tra cứu GV', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`group relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl ${item.bg} backdrop-blur-xl border border-gray-200/80 dark:border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-default overflow-hidden shadow-sm`}
                                    >
                                        {/* Hover gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-300`} />

                                        <div className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <div className="relative text-center">
                                            <span className="block text-sm sm:text-base font-semibold text-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block mt-0.5">
                                                {item.desc}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="flex justify-center pb-4 sm:pb-6 pt-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                            <span className="text-xs hidden sm:block font-medium">Khám phá thêm</span>
                            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
                                <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Tính năng nổi bật</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Tất cả những gì bạn cần để quản lý việc học tập một cách hiệu quả
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={index}
                                className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden bg-card"
                            >
                                <CardContent className="p-6">
                                    <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-muted/30 border-y border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Bảo mật & Minh bạch
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                            Cam kết bảo mật của chúng tôi
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Chúng tôi hiểu việc đăng nhập tài khoản MyBK là một quyết định tin tưởng lớn.
                            Dưới đây là cách chúng tôi bảo vệ bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {securityPoints.map((point, index) => {
                            const Icon = point.icon;
                            return (
                                <Card key={index} className="border-emerald-500/20 bg-emerald-500/5">
                                    <CardContent className="p-6 flex gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1 text-foreground">{point.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Transparency proof */}
                    <Card className="mt-8 border-blue-500/20 bg-blue-500/5">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1 text-foreground">100% Mã nguồn mở</h3>
                                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                        Toàn bộ mã nguồn được công khai trên GitHub. Bạn có thể tự kiểm tra,
                                        review code, hoặc tự host phiên bản của riêng mình.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            href="https://github.com/tanh1c/student-schedule"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Github className="h-4 w-4" />
                                                Xem trên GitHub
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </a>
                                        <a
                                            href="https://github.com/tanh1c/student-schedule/blob/main/server/index.production.js"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                Xem code backend
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* How it works */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Cách hoạt động</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Đơn giản, nhanh chóng và an toàn
                    </p>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-start justify-between gap-4">
                    {[
                        {
                            step: '01',
                            title: 'Đăng nhập MyBK',
                            description: 'Sử dụng tài khoản SSO của trường để đăng nhập. Mật khẩu chỉ dùng để xác thực với server của BK.',
                            Icon: KeyRound,
                            color: 'text-blue-500'
                        },
                        {
                            step: '02',
                            title: 'Sync dữ liệu',
                            description: 'Dữ liệu TKB, lịch thi, điểm được lấy trực tiếp từ MyBK và hiển thị ngay lập tức.',
                            Icon: RefreshCw,
                            color: 'text-emerald-500'
                        },
                        {
                            step: '03',
                            title: 'Sử dụng & Đăng xuất',
                            description: 'Sử dụng các tính năng. Khi đăng xuất, mọi dữ liệu session đều bị xóa sạch.',
                            Icon: Rocket,
                            color: 'text-violet-500'
                        }
                    ].map((item, index) => {
                        const StepIcon = item.Icon;
                        return (
                            <React.Fragment key={index}>
                                <div className="flex-1 text-center max-w-xs">
                                    <div className="relative inline-block mb-4">
                                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/10">
                                            <StepIcon className={`h-9 w-9 ${item.color}`} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>

                                {/* Arrow between steps */}
                                {index < 2 && (
                                    <div className="flex-shrink-0 flex items-center pt-8">
                                        <ChevronRight className="h-8 w-8 text-primary/30" />
                                        <ChevronRight className="h-8 w-8 text-primary/30 -ml-4" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
                    {[
                        {
                            step: '01',
                            title: 'Đăng nhập MyBK',
                            description: 'Sử dụng tài khoản SSO của trường để đăng nhập.',
                            Icon: KeyRound,
                            color: 'text-blue-500'
                        },
                        {
                            step: '02',
                            title: 'Sync dữ liệu',
                            description: 'Dữ liệu được lấy trực tiếp từ MyBK và hiển thị ngay.',
                            Icon: RefreshCw,
                            color: 'text-emerald-500'
                        },
                        {
                            step: '03',
                            title: 'Sử dụng & Đăng xuất',
                            description: 'Khi đăng xuất, mọi dữ liệu session đều bị xóa.',
                            Icon: Rocket,
                            color: 'text-violet-500'
                        }
                    ].map((item, index) => {
                        const StepIcon = item.Icon;
                        return (
                            <React.Fragment key={index}>
                                <div className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border">
                                    <div className="relative shrink-0">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30">
                                            <StepIcon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                                            {item.step}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                                    </div>
                                    {index < 2 && (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0 rotate-90" />
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
                <Card className="bg-gradient-to-r from-primary to-blue-600 border-0 overflow-hidden shadow-xl shadow-primary/20">
                    <CardContent className="p-8 sm:p-12 text-center relative">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
                        </div>

                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
                                Sẵn sàng bắt đầu?
                            </h2>
                            <p className="text-white/80 mb-8 max-w-xl mx-auto">
                                Trải nghiệm ngay công cụ quản lý lịch học hiện đại nhất dành cho sinh viên BK
                            </p>
                            <Button
                                size="lg"
                                onClick={onEnterApp}
                                className="text-base px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
                            >
                                Vào ứng dụng ngay
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by{' '}
                            <a
                                href="https://github.com/tanh1c"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                                tanh1c
                            </a>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <a
                                href="https://github.com/tanh1c/student-schedule"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                                <Github className="h-4 w-4" />
                                GitHub
                            </a>
                            <span className="text-border">•</span>
                            <span>© 2024 TKB Smart</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
