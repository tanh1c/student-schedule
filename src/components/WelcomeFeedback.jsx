import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
    MessageSquareHeart,
    Github,
    Mail,
    Sparkles,
    Bug,
    Smile,
    Check,
    Copy,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";

export default function WelcomeFeedback() {
    const [isOpen, setIsOpen] = useState(false);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [showEmailDetails, setShowEmailDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    const emailAddress = "tanhbku@proton.me"; // Thay bằng Gmail của bạn

    useEffect(() => {
        // Kiểm tra xem user đã chọn ẩn popup vĩnh viễn chưa
        const hiddenForever = localStorage.getItem('hideWelcomeForever_v2');
        if (hiddenForever === 'true') return;

        // Nếu chưa ẩn, kiểm tra xem session này đã hiện chưa (tránh spam khi reload nhẹ)
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeSession');
        if (!hasSeenWelcome) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleCloseWelcome = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenWelcomeSession', 'true');
        if (dontShowAgain) {
            localStorage.setItem('hideWelcomeForever_v2', 'true');
        }
    };

    const handleOpenFeedback = () => {
        setShowFeedbackDialog(true);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(emailAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendEmail = () => {
        const subject = encodeURIComponent("Feedback TKB Smart App");
        const body = encodeURIComponent("Chào bạn,\n\nMình có góp ý cho ứng dụng TKB Smart như sau:\n\n...");
        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    };

    return (
        <>
            <button
                onClick={handleOpenFeedback}
                className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all hover:scale-110 active:scale-95 lg:bottom-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-background"
                title="Góp ý cho tác giả"
            >
                <MessageSquareHeart className="h-6 w-6" />
            </button>

            {/* 1. Popup Chào mừng - Mobile Optimized */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-[94%] sm:max-w-md border-none bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/10 dark:border-white/5 mx-auto">
                    <div className="relative p-6 sm:p-8 pt-10 sm:pt-12 text-center">
                        {/* Soft Gradients */}
                        <div className="absolute -top-24 -right-24 h-64 w-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="mx-auto mb-6 sm:mb-8 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl sm:rounded-[2rem] bg-indigo-50/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            <Smile className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        </div>

                        <DialogTitle className="text-2xl sm:text-4xl font-black tracking-tight mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300">
                            Chào các bạn <span className="inline-block text-foreground">👋</span>
                        </DialogTitle>

                        <div className="space-y-6 sm:space-y-8 text-muted-foreground dark:text-zinc-400 leading-relaxed max-w-[360px] mx-auto">
                            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 px-2">
                                Chào mừng bạn đã đến với <span className="text-indigo-600 dark:text-indigo-400">TKB Smart</span>
                            </p>

                            <div className="space-y-4 sm:space-y-5">
                                <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 transition-colors shadow-sm">
                                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-sm sm:text-base text-left leading-relaxed">
                                        Chiếc web này mình tự tay build với sự hỗ trợ của AI từ <span className="font-bold text-amber-900 dark:text-amber-300">hồi năm nhất</span>. Mình làm vì đam mê nên giao diện có thể hơi lỏ xíu.
                                    </p>
                                </div>

                                <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 transition-colors shadow-sm">
                                    <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-sm sm:text-base text-left leading-relaxed">
                                        Dù đã nâng cấp nhiều nhưng <span className="font-bold text-rose-900 dark:text-rose-300">vẫn có thể có bug</span>. Mong các bạn nhẹ tay và góp ý giúp mình nha! 🙏
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* "Don't show again" Option */}
                        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 py-2 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-muted/40 dark:bg-zinc-900/60 border border-border/40 w-fit mx-auto transition-all hover:bg-muted/60">
                            <label htmlFor="dont-show" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-500 cursor-pointer">
                                Đừng hiện lại
                            </label>
                            <Switch
                                id="dont-show"
                                checked={dontShowAgain}
                                onCheckedChange={setDontShowAgain}
                                className="scale-[0.8] sm:scale-90 data-[state=checked]:bg-indigo-600"
                            />
                        </div>

                        <div className="mt-8 sm:mt-10 flex flex-col gap-3 px-2 sm:px-4 pb-4">
                            <Button
                                onClick={handleCloseWelcome}
                                className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-base sm:text-xl shadow-[0_12px_24px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98]"
                            >
                                Trải nghiệm ngay ✨
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 2. Popup Feedback - Mobile Optimized */}
            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} >
                <DialogContent className="w-[94%] sm:max-w-md rounded-[2rem] p-6 sm:p-8 border-none shadow-2xl bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/10 mx-auto">
                    <DialogHeader className="mb-4 sm:mb-6 text-left">
                        <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                                <MessageSquareHeart className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <span>Góp ý chộ này!</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                            Bạn thấy app có lỗi hay muốn thêm tính năng gì cứ ib mình nha! 💌
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowEmailDetails(!showEmailDetails)}
                                className={`flex w-full items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-[1.5rem] transition-all hover:scale-[1.01] border ${showEmailDetails ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/40' : 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20'} group`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white dark:bg-blue-500/20 flex items-center justify-center shadow-sm border border-blue-50 dark:border-blue-400/20">
                                        <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-base sm:text-lg text-blue-900 dark:text-blue-100 leading-none mb-1">Gmail</p>
                                        <p className="text-[10px] sm:text-xs text-blue-600/70 dark:text-blue-400/80 font-medium whitespace-nowrap">Cứ gửi mail đi mình sẽ rep hết :)</p>
                                    </div>
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">
                                    {showEmailDetails ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </div>
                            </button>

                            {showEmailDetails && (
                                <div className="animate-in slide-in-from-top-2 fade-in duration-200 p-4 rounded-2xl bg-white dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 space-y-3">
                                    <div className="flex items-center justify-between gap-2 px-1">
                                        <span className="text-[10px] sm:text-xs font-mono font-medium text-blue-800 dark:text-blue-300 truncate">
                                            {emailAddress}
                                        </span>
                                        <Badge variant="secondary" className="bg-blue-100 text-[9px] sm:text-[10px] text-blue-600 border-none px-1.5 h-5">
                                            Official
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyEmail}
                                            className="h-8 sm:h-9 rounded-xl border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-xs"
                                        >
                                            {copied ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" /> : <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />}
                                            {copied ? "Đã chép" : "Sao chép"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={sendEmail}
                                            className="h-8 sm:h-9 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs"
                                        >
                                            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                                            Gửi mail
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <a
                            href="https://github.com/tanh1c/student-schedule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50 transition-all hover:scale-[1.02] hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white dark:bg-zinc-700/50 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-600/30">
                                    <Github className="h-6 w-6 sm:h-7 sm:w-7 text-zinc-900 dark:text-zinc-50" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-none mb-1">GitHub</p>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">Bạn nào muốn đóng góp code thì vào đây</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="mt-4 sm:mt-6">
                        <Button
                            variant="ghost"
                            className="w-full h-10 sm:h-12 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50 text-sm"
                            onClick={() => setShowFeedbackDialog(false)}
                        >
                            Để sau nha
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    );
}
