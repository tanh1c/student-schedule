import React from "react";
import { ChevronRight, Pin, User } from "lucide-react";
import { formatMessageDate, parseMessageText } from "@/services/lmsApi";

export default function ConversationCard({ conv, onClick, isUnread, isPinned, onPin }) {
    const sender = conv.members?.[0];
    const lastMessage = conv.messages?.[0];

    const handlePin = (event) => {
        event.stopPropagation();
        onPin?.(conv.id);
    };

    const getCardStyle = () => {
        if (isPinned) {
            return "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/25 dark:to-yellow-950/30 border-amber-300/70 dark:border-amber-700/50";
        }
        if (isUnread) {
            return "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/25 dark:to-fuchsia-950/30 border-violet-200/60 dark:border-violet-800/50";
        }
        return "from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/40 dark:via-gray-950/30 dark:to-zinc-950/40 border-slate-200/60 dark:border-slate-800/50";
    };

    const getAvatarStyle = () => {
        if (isPinned) {
            return "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700";
        }
        if (isUnread) {
            return "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700";
        }
        return "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700";
    };

    return (
        <div className="flex items-stretch gap-1.5 sm:gap-3 group min-w-0 w-full overflow-hidden">
            <button
                onClick={handlePin}
                className={`flex-shrink-0 w-6 sm:w-7 flex items-center justify-center transition-all duration-200 ${isPinned ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                title={isPinned ? "Bỏ ghim" : "Ghim tin nhắn quan trọng"}
            >
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${isPinned
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500"
                    }`}>
                    {isPinned && (
                        <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-in zoom-in-50 duration-200" />
                    )}
                </div>
            </button>

            <button
                onClick={onClick}
                className={`flex-1 min-w-0 w-0 relative overflow-hidden rounded-xl sm:rounded-xl bg-gradient-to-br transition-all duration-200 border text-left ${getCardStyle()} hover:shadow-md hover:scale-[1.005] active:scale-[0.995]`}
            >
                <div className="absolute -top-8 -right-8 h-24 w-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-md ${getAvatarStyle()}`}>
                            {sender?.profileimageurl ? (
                                <img
                                    src={sender.profileimageurl}
                                    alt={sender.fullname}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            )}
                        </div>
                        {sender?.isonline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 w-0">
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-0.5">
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                {isPinned && (
                                    <Pin className="w-3 h-3 sm:w-3 sm:h-3 text-amber-500 flex-shrink-0" />
                                )}
                                <span className={`text-sm sm:text-base font-semibold truncate ${isPinned
                                    ? "text-amber-900 dark:text-amber-100"
                                    : isUnread
                                        ? "text-violet-900 dark:text-violet-100"
                                        : "text-slate-700 dark:text-slate-300"}`}
                                >
                                    {sender?.fullname || "Không rõ"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                {isUnread && !isPinned && (
                                    <span className="w-2 h-2 sm:w-2 sm:h-2 rounded-full bg-violet-500 animate-pulse" />
                                )}
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {lastMessage && formatMessageDate(lastMessage.timecreated)}
                                </span>
                            </div>
                        </div>
                        <p className={`text-xs sm:text-sm truncate ${isPinned
                            ? "text-amber-700 dark:text-amber-300 font-medium"
                            : isUnread
                                ? "text-violet-700 dark:text-violet-300 font-medium"
                                : "text-muted-foreground"}`}
                        >
                            {lastMessage ? parseMessageText(lastMessage.text).substring(0, 50) : "Không có tin nhắn"}
                        </p>
                    </div>

                    <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform" />
                </div>
            </button>
        </div>
    );
}
