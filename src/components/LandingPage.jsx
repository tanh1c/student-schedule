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
    Map,
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
        icon: Map,
        title: 'Bản đồ campus',
        description: 'Xem vị trí các tòa nhà trong khuôn viên trường',
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
            {/* Hero Section - Full viewport */}
            <div className="relative overflow-hidden min-h-screen flex flex-col">
                {/* Animated gradient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 dark:from-primary/10 dark:to-violet-500/10" />

                    {/* Animated orbs */}
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-cyan-500/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px'
                        }}
                    />

                    {/* Radial fade to background */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'radial-gradient(circle at center, transparent 0%, hsl(var(--background)) 70%)' }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-10 sm:pb-12 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                                <CalendarClock className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TKB Smart</span>
                        </div>
                        <a
                            href="https://github.com/tanh1c/student-schedule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            <span className="hidden sm:inline">Open Source</span>
                        </a>
                    </div>

                    {/* Main Content - Centered vertically */}
                    <div className="flex-1 flex flex-col justify-center">
                        {/* Hero Content */}
                        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-0">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Miễn phí & Mã nguồn mở
                            </Badge>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-5 text-foreground">
                                Quản lý lịch học
                                <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
                                    {' '}thông minh{' '}
                                </span>
                                cho sinh viên BK
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
                                Công cụ hỗ trợ sinh viên Đại học Bách Khoa TPHCM xem thời khóa biểu,
                                tính GPA, đăng ký môn học và nhiều tính năng hữu ích khác.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
                                <Button
                                    size="lg"
                                    onClick={onEnterApp}
                                    className="w-full sm:w-auto text-base px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                >
                                    Vào ứng dụng
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <a
                                    href="https://github.com/tanh1c/student-schedule"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto text-base px-8 py-6 border-2 border-foreground/20 hover:border-foreground/40 bg-background/50 backdrop-blur-sm hover:bg-background/80 dark:border-white/30 dark:hover:border-white/50"
                                    >
                                        <Code2 className="mr-2 h-5 w-5" />
                                        Xem mã nguồn
                                    </Button>
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    <span>Không lưu mật khẩu</span>
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-border" />
                                <div className="flex items-center gap-1.5">
                                    <Lock className="h-4 w-4 text-blue-500" />
                                    <span>HTTPS mã hóa</span>
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-border" />
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4 text-violet-500" />
                                    <span>Không thu thập dữ liệu</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid - 6 columns on desktop */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
                            {[
                                { icon: CalendarClock, label: 'Thời khóa biểu', desc: 'Xem theo tuần', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { icon: GraduationCap, label: 'Lịch thi', desc: 'Tra cứu nhanh', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { icon: BadgePercent, label: 'Tính GPA', desc: 'Tự động tính', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                { icon: NotebookTabs, label: 'Đăng ký môn', desc: 'Hỗ trợ ĐKMH', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { icon: Map, label: 'Bản đồ', desc: 'Campus BK', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                                { icon: Users, label: 'Lịch giảng dạy', desc: 'Tra cứu GV', color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all cursor-default group"
                                    >
                                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-foreground text-center">
                                            {item.label}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
                                            {item.desc}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="flex justify-center pb-4 sm:pb-6 pt-6">
                        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 animate-bounce">
                            <span className="text-xs hidden sm:block">Khám phá thêm</span>
                            <ChevronRight className="h-5 w-5 rotate-90" />
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
