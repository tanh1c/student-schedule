import React from 'react';
import { BellRing, CalendarClock, ChevronRight, Shield } from 'lucide-react';
import { previewCourses, previewSignals } from './landingContent';

function HeroWorkspacePreview() {
    const [signal] = previewSignals;
    const [firstCourse, secondCourse] = previewCourses;

    return (
        <div className="relative mx-auto w-full max-w-[360px] lg:my-auto lg:max-w-[420px]">
            <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-sky-500/12 blur-3xl" />
            <div className="absolute bottom-0 right-6 h-28 w-28 rounded-full bg-violet-500/12 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-2.5 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.32)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-black/35 sm:p-3">
                <div className="rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.8))] p-3.5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.82))] sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="rounded-full border border-border/70 bg-background/85 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                            Hôm nay
                        </div>
                    </div>

                    <div className="grid gap-2.5">
                        <div className="rounded-[22px] border border-border/70 bg-background/85 p-3.5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Workspace
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                        Nhìn nhanh ngày học của bạn
                                    </h3>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <CalendarClock className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-3 grid gap-2">
                                {[firstCourse, secondCourse].filter(Boolean).map((course, index) => (
                                    <div
                                        key={course.code}
                                        className={`flex items-center gap-3 rounded-2xl bg-muted/55 px-3 py-2 ${index > 0 ? 'hidden sm:flex' : ''}`}
                                    >
                                        <div className={`h-2.5 w-2.5 rounded-full ${course.tone}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary">{course.code}</span>
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                    Lớp hôm nay
                                                </span>
                                            </div>
                                            <p className="line-clamp-1 text-sm font-medium text-foreground">{course.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-[1.06fr_0.94fr]">
                            <div className="rounded-[22px] border border-border/70 bg-background/82 p-3.5 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <BellRing className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Deadline</p>
                                            <p className="text-xs text-muted-foreground">LMS</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">{signal.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{signal.meta}</p>
                            </div>

                            <div className="rounded-[22px] border border-border/70 bg-background/82 p-3.5 shadow-sm">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                        <Shield className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Tin cậy</p>
                                        <p className="text-xs text-muted-foreground">Open source</p>
                                    </div>
                                </div>
                                <p className="text-lg font-semibold tracking-tight">Không lưu mật khẩu</p>
                                <p className="mt-1 text-xs text-muted-foreground">Minh bạch và dễ tự kiểm tra.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroWorkspacePreview;
