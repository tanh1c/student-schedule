import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import {
    MessageSquareHeart,
    Github,
    Mail,
    Check,
    Copy,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Badge } from "@components/ui/badge";

export default function WelcomeFeedback({ hideOnMobile = false }) {
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [showEmailDetails, setShowEmailDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    const emailAddress = "tanhbku@proton.me"; // Thay bằng Gmail của bạn

    const handleOpenFeedback = () => {
        setShowFeedbackDialog(true);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(emailAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendEmail = () => {
        const subject = encodeURIComponent("Feedback StuSpace App");
        const body = encodeURIComponent("Chào bạn,\n\nMình có góp ý cho ứng dụng StuSpace như sau:\n\n...");
        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    };

    return (
        <>
            <button
                onClick={handleOpenFeedback}
                className={`fixed bottom-28 right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all hover:scale-110 active:scale-95 lg:bottom-6 lg:right-4 lg:h-12 lg:w-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-background ${hideOnMobile ? 'hidden lg:flex' : ''}`}
                title="Góp ý cho tác giả"
            >
                <MessageSquareHeart className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>

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
