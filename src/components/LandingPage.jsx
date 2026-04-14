import React from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Code2,
    ExternalLink,
    Github,
    Heart,
    Lock,
    MessageSquare,
    Route,
    Shield,
    TimerReset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLogo from '@shared/components/AppLogo';
import SectionHeading from './landing/SectionHeading';
import {
    footerYear,
    heroTitleLines,
    productHighlights,
    securityPoints,
    trustChips,
} from './landing/landingContent';

function LandingPage({ onEnterApp }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(56,189,248,0.08),transparent_30%)]" />
                    <div className="absolute left-[-6rem] top-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/12" />
                    <div className="absolute right-[-6rem] top-0 h-72 w-72 rounded-full bg-violet-500/14 blur-3xl dark:bg-violet-500/12" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_20%,transparent_80%,rgba(255,255,255,0.45))] dark:bg-[linear-gradient(to_bottom,rgba(2,6,23,0.08),transparent_25%,transparent_80%,rgba(2,6,23,0.25))]" />
                </div>

                <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8 lg:pb-10">
                    <header className="mb-3 flex items-center justify-between gap-3 rounded-[26px] border border-white/70 bg-white/80 px-4 py-3.5 shadow-lg shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:mb-4 sm:rounded-[24px] sm:px-4 sm:py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <AppLogo size={56} className="rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-white/10 sm:h-auto sm:w-auto" />
                            <div className="min-w-0">
                                <p className="truncate text-2xl font-semibold tracking-tight sm:text-lg">StuSpace</p>
                                <p className="truncate text-[15px] leading-6 text-muted-foreground sm:text-xs sm:leading-normal">
                                    Workspace học tập cho sinh viên Bách Khoa
                                </p>
                            </div>
                        </div>

                        <a
                            href="https://github.com/tanh1c/student-schedule"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="h-12 min-w-[3.25rem] rounded-full border-border/70 bg-background/80 px-4 text-base shadow-sm sm:h-10 sm:text-sm">
                                <Github className="mr-0 h-5 w-5 sm:mr-2 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">GitHub</span>
                            </Button>
                        </a>
                    </header>

                    <div className="flex flex-1 justify-center pt-4 sm:items-center sm:pt-0">
                        <div className="mx-auto max-w-[24.5rem] text-center sm:max-w-4xl">
                            <Badge className="mb-4 rounded-full border-primary/15 bg-white/80 px-5 py-2.5 text-[13px] font-medium text-foreground shadow-sm dark:bg-slate-950/60 sm:mb-3 sm:px-3 sm:py-1.5 sm:text-[11px]">
                                Dành cho sinh viên Đại học Bách Khoa TP.HCM
                            </Badge>

                            <h1 className="pb-[0.11em] text-[3.85rem] font-semibold leading-[0.91] tracking-[-0.095em] text-foreground sm:text-[4rem] lg:text-[5rem] xl:text-[5.9rem]">
                                {heroTitleLines[0]}
                                <span className="mt-1.5 block pb-[0.1em] bg-gradient-to-r from-slate-900 via-slate-700 to-primary bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-blue-300 sm:mt-2">
                                    {heroTitleLines[1]}
                                </span>
                            </h1>

                            <p className="mx-auto mt-5 max-w-[22rem] text-[1.15rem] leading-8 text-muted-foreground sm:mt-5 sm:max-w-3xl sm:text-xl sm:leading-8">
                                Thời khóa biểu, lịch thi, GPA, LMS và kế hoạch học tập trong một nơi đủ nhanh để dùng mỗi ngày.
                            </p>

                            <div className="mt-8 flex flex-col items-center gap-3.5 sm:mt-7 sm:flex-row sm:justify-center sm:gap-4">
                                <Button
                                    size="lg"
                                    onClick={onEnterApp}
                                    className="h-16 w-full max-w-md rounded-full bg-slate-950 px-8 text-[1.28rem] font-semibold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:h-14 sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
                                >
                                    Vào ứng dụng
                                    <ArrowRight className="ml-2.5 h-5.5 w-5.5 sm:h-5 sm:w-5" />
                                </Button>
                                <a
                                    href="https://github.com/tanh1c/student-schedule"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full max-w-sm sm:w-auto sm:max-w-none"
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-16 w-full rounded-full border-border/70 bg-white/80 px-8 text-[1.22rem] font-medium shadow-sm dark:bg-slate-950/55 sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
                                    >
                                        <Code2 className="mr-2.5 h-5.5 w-5.5 sm:h-5 sm:w-5" />
                                        Xem mã nguồn
                                    </Button>
                                </a>
                            </div>

                            <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-6">
                                {trustChips.map((item, index) => (
                                    <div
                                        key={item}
                                        className={`inline-flex min-h-[3.5rem] w-full max-w-[18rem] items-center justify-center gap-2.5 rounded-full border border-border/70 bg-white/80 px-5 py-3 text-base text-muted-foreground shadow-sm dark:bg-slate-950/50 sm:min-h-0 sm:w-auto sm:max-w-none sm:px-3.5 sm:py-1.5 sm:text-sm ${index > 1 ? 'hidden sm:inline-flex' : ''}`}
                                    >
                                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 sm:h-3.5 sm:w-3.5" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <SectionHeading
                    badge="Tại sao dùng StuSpace"
                    title="Mọi thứ quan trọng cho việc học, ở cùng một nơi"
                    description="Ít tab hơn. Ít phải chuyển ngữ cảnh hơn."
                />

                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(180px,auto)]">
                    <Card className="overflow-hidden rounded-[30px] border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-sm dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.88),rgba(15,23,42,0.82))] md:col-span-2 lg:col-span-2">
                        <CardContent className="p-7 sm:p-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
                                StuSpace
                            </p>
                            <h3 className="mt-3 text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-3xl">
                                Một workspace đủ gọn để mở ra mỗi ngày
                            </h3>
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                {trustChips.map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-full border border-border/70 bg-background/75 px-4 py-2.5 text-[15px] text-muted-foreground sm:px-3.5 sm:py-2 sm:text-sm"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {productHighlights.slice(0, 2).map((item, index) => {
                        const HighlightIcon = item.icon;
                        const extraIcon = index === 0 ? <Route className="h-4 w-4 text-muted-foreground" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />;

                        return (
                            <Card
                                key={item.title}
                                className="relative overflow-hidden rounded-[30px] border-border/70 bg-card shadow-sm"
                            >
                                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.glow}`} />
                                <CardContent className="relative p-7 sm:p-6">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.7rem] bg-gradient-to-br ${item.iconGradient} text-white shadow-md sm:h-12 sm:w-12 sm:rounded-3xl`}>
                                            <HighlightIcon className="h-7 w-7 sm:h-6 sm:w-6" />
                                        </div>
                                        {extraIcon}
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">{item.eyebrow}</p>
                                    <h3 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-xl">{item.title}</h3>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Card className="relative overflow-hidden rounded-[30px] border-border/70 bg-card shadow-sm md:col-span-2 lg:col-span-2">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent" />
                        <CardContent className="relative p-7 sm:p-7">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md sm:h-12 sm:w-12 sm:rounded-3xl">
                                    <Route className="h-7 w-7 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">Tối ưu lâu dài</p>
                                    <h3 className="text-[2.05rem] font-semibold leading-[1.08] tracking-tight sm:text-2xl">GPA, roadmap và kế hoạch học tập</h3>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    'Theo dõi mục tiêu GPA',
                                    'Lập kế hoạch từng học kỳ',
                                    'Giữ góc nhìn dài hạn',
                                ].map((item) => (
                                    <div key={item} className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 text-[15px] leading-7 text-muted-foreground sm:py-3 sm:text-sm sm:leading-6">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-border/70 bg-card shadow-sm">
                        <CardContent className="p-7 sm:p-6">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.7rem] bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-3xl">
                                <TimerReset className="h-7 w-7 sm:h-6 sm:w-6" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">Điều hướng</p>
                            <h3 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-xl">Nhanh, gọn, hợp mobile</h3>
                        </CardContent>
                    </Card>

                    {securityPoints.slice(0, 3).map((item, index) => {
                        const SecurityIcon = item.icon;

                        return (
                            <Card
                                key={item.title}
                                className={`rounded-[30px] border-border/70 bg-card shadow-sm ${index === 2 ? 'lg:col-span-1' : ''}`}
                            >
                                <CardContent className="p-7 sm:p-6">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.7rem] bg-slate-950/10 text-slate-900 dark:bg-white/10 dark:text-white sm:h-12 sm:w-12 sm:rounded-3xl">
                                        <SecurityIcon className="h-6.5 w-6.5 sm:h-5.5 sm:w-5.5" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">Tin cậy</p>
                                    <h3 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-xl">{item.title}</h3>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Card className="overflow-hidden rounded-[30px] border-border/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-white shadow-sm md:col-span-2 lg:col-span-2 lg:row-span-2">
                        <CardContent className="flex h-full flex-col justify-between p-6 sm:p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]">Bắt đầu</p>
                                <h3 className="mt-3 text-[2.25rem] font-semibold leading-[1.05] tracking-tight sm:text-2xl">Vào StuSpace</h3>
                                <p className="mt-4 max-w-xl text-[1.02rem] leading-7 text-white/72 sm:text-base">
                                    Mở một nơi duy nhất để theo dõi lịch học, LMS và kế hoạch học tập mà không phải chuyển qua lại quá nhiều tab.
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {[
                                        { title: 'Thời khóa biểu', meta: 'Theo tuần, theo ngày' },
                                        { title: 'LMS', meta: 'Tin nhắn và deadline' },
                                        { title: 'GPA & roadmap', meta: 'Theo sát cả học kỳ' },
                                    ].map((item) => (
                                        <div
                                            key={item.title}
                                            className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3.5 backdrop-blur"
                                        >
                                            <p className="text-[15px] font-medium text-white sm:text-sm">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-white/70 sm:text-xs">{item.meta}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2.5">
                                    {['Không lưu mật khẩu', 'Mã nguồn mở', 'Thiết kế cho mobile'].map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-[14px] text-white/78 sm:py-1.5 sm:text-xs"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    onClick={onEnterApp}
                                    className="h-15 rounded-full bg-white text-[1.1rem] font-semibold text-slate-950 hover:bg-white/90 sm:h-14 sm:text-base"
                                >
                                    Vào ứng dụng
                                    <ArrowRight className="ml-2 h-5 w-5 sm:h-4.5 sm:w-4.5" />
                                </Button>
                                <a
                                    href="https://github.com/tanh1c/student-schedule"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-15 w-full rounded-full border-white/20 bg-white/10 text-[1.1rem] text-white hover:bg-white/15 sm:h-14 sm:text-base"
                                    >
                                        Xem repo
                                        <ExternalLink className="ml-2 h-4.5 w-4.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-border/70 bg-card shadow-sm md:col-span-2 lg:col-span-2">
                        <CardContent className="p-7 sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.7rem] bg-slate-950/10 text-slate-900 dark:bg-white/10 dark:text-white sm:h-12 sm:w-12 sm:rounded-3xl">
                                    <Lock className="h-7 w-7 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">Tin cậy</p>
                                    <h3 className="text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-2xl">{securityPoints[3].title}</h3>
                                </div>
                            </div>
                            <p className="max-w-xl text-[1.02rem] leading-8 text-muted-foreground sm:text-sm sm:leading-6">{securityPoints[3].description}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <footer className="border-t border-border bg-muted/20">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by{' '}
                        <a
                            href="https://github.com/tanh1c"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                            tanh1c
                        </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <a
                            href="https://github.com/tanh1c/student-schedule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                            <Github className="h-4 w-4" />
                            GitHub
                        </a>
                        <span className="hidden text-border sm:inline">•</span>
                        <span>© {footerYear} StuSpace</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
