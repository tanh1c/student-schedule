import React from "react";
import {
    ArrowLeft,
    Clock,
    ExternalLink,
    Loader2,
    MessageSquare,
    Pin,
    PinOff,
    RefreshCw,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatMessageDate, sanitizeMessageHtml } from "@/services/lmsApi";

const MESSAGE_CONTENT_STYLES = `
    .lms-message-content * {
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
        max-width: 100% !important;
        color: inherit !important;
    }
    .lms-message-content p {
        margin-bottom: 0.75rem !important;
        margin-top: 0 !important;
        line-height: 1.6 !important;
    }
    .lms-message-content a {
        color: #8b5cf6 !important;
        text-decoration: underline !important;
        word-break: break-all !important;
    }
    .lms-message-content ul {
        list-style-type: disc !important;
        padding-left: 1.25rem !important;
        margin: 0.5rem 0 !important;
    }
    .lms-message-content ol {
        list-style-type: decimal !important;
        padding-left: 1.25rem !important;
        margin: 0.5rem 0 !important;
    }
    .lms-message-content li {
        margin-bottom: 0.25rem !important;
    }
    .lms-message-content strong, .lms-message-content b {
        font-weight: 600 !important;
    }
    .lms-message-content table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 0.5rem 0 !important;
        font-size: 0.75rem !important;
    }
    .lms-message-content td, .lms-message-content th {
        border: 1px solid hsl(var(--border)) !important;
        padding: 0.5rem !important;
    }
    .lms-message-content img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 0.5rem !important;
    }
`;

function ConversationMessageCard({
    message,
    sender,
    selectedConversation,
    isPinned,
    onTogglePin
}) {
    const isFromSender = message.useridfrom === sender?.id;
    const messageSender = isFromSender ? sender : null;

    return (
        <div key={message.id} className={`flex items-start gap-2 sm:gap-3 w-full min-w-0 ${isPinned ? "" : "group"}`}>
            <button
                onClick={() => onTogglePin(message.id, message, selectedConversation)}
                className={`flex-shrink-0 mt-3 sm:mt-4 ${isPinned ? "" : "opacity-60 group-hover:opacity-100 transition-opacity"}`}
                title={isPinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn quan trọng"}
            >
                <div className={`w-6 h-6 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all hover:scale-110 ${isPinned
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500"
                    }`}>
                    {isPinned && <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                </div>
            </button>

            <article className={`flex-1 min-w-0 w-0 relative overflow-hidden rounded-xl sm:rounded-xl border p-3 sm:p-4 shadow-sm ${isPinned
                ? "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border-amber-300/70 dark:border-amber-700/50"
                : "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/60 dark:via-gray-950/50 dark:to-zinc-950/60 border-slate-200/60 dark:border-slate-800/50 hover:shadow-md transition-shadow"
                }`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className={`w-8 h-8 sm:w-8 sm:h-8 rounded-lg sm:rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden ${isPinned ? "from-amber-400 to-orange-500" : "from-violet-400 to-purple-500"}`}>
                        {messageSender?.profileimageurl ? (
                            <img src={messageSender.profileimageurl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className={`font-semibold text-sm sm:text-sm ${isPinned ? "text-amber-900 dark:text-amber-100" : "text-slate-800 dark:text-slate-200"}`}>
                            {isFromSender ? sender?.fullname : "Bạn"}
                        </span>
                        <span className={`text-xs sm:text-xs flex items-center gap-1 ${isPinned ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                            <Clock className="w-3 h-3 sm:w-3 sm:h-3" />
                            {formatMessageDate(message.timecreated)}
                        </span>
                    </div>
                </div>

                <div
                    className={`lms-message-content text-sm leading-relaxed ${isPinned ? "text-amber-900 dark:text-amber-100" : "text-slate-700 dark:text-slate-300"}`}
                    style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeMessageHtml(message.text) }}
                />
            </article>
        </div>
    );
}

export default function ConversationDetailView({
    selectedConversation,
    pinnedIds,
    togglePin,
    loadConversationMessages,
    isLoadingMessages,
    conversationMessages,
    pinnedMessages,
    unpinnedMessages,
    togglePinMessage,
    onBack
}) {
    const sender = selectedConversation.members?.[0];
    const isConversationPinned = pinnedIds.includes(selectedConversation.id);

    return (
        <div className="h-full w-full max-w-full flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className={`sticky top-0 z-10 flex w-full max-w-full items-center gap-2 overflow-hidden border-b p-2.5 backdrop-blur-md transition-colors box-border sm:gap-3 sm:px-3 sm:py-4 ${isConversationPinned
                ? "bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
                : "bg-white/80 dark:bg-slate-900/80"
                }`}>
                <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md ${isConversationPinned ? "from-amber-400 to-orange-500" : "from-violet-400 to-purple-500"}`}>
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

                <div className="flex-1 min-w-0 w-0">
                    <div className="flex items-center gap-1">
                        <h3 className={`font-bold text-sm sm:text-base truncate ${isConversationPinned ? "text-amber-900 dark:text-amber-100" : "text-slate-900 dark:text-slate-100"}`}>
                            {sender?.fullname || "Không rõ"}
                        </h3>
                        {isConversationPinned && (
                            <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px] sm:text-[9px] px-1.5 py-0 flex-shrink-0">
                                <Pin className="w-3 h-3 sm:w-2.5 sm:h-2.5 mr-0.5" />
                                Ghim
                            </Badge>
                        )}
                    </div>
                    {sender?.isonline && (
                        <span className="text-xs sm:text-xs text-emerald-500 flex items-center gap-1">
                            <span className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </span>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(selectedConversation.id)}
                    className={`h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-colors ${isConversationPinned
                        ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900"
                        : "text-muted-foreground hover:text-amber-500"
                        }`}
                    title={isConversationPinned ? "Bỏ ghim" : "Ghim cuộc trò chuyện"}
                >
                    {isConversationPinned ? (
                        <PinOff className="w-4 h-4 sm:w-4 sm:h-4" />
                    ) : (
                        <Pin className="w-4 h-4 sm:w-4 sm:h-4" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => loadConversationMessages(selectedConversation, true)}
                    className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                >
                    <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoadingMessages ? "animate-spin" : ""}`} />
                </Button>
            </div>

            <ScrollArea className="flex-1 w-full max-w-full overflow-x-hidden px-2 sm:px-3">
                {isLoadingMessages ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : conversationMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Không có tin nhắn</p>
                    </div>
                ) : (
                    <div className="py-3 sm:py-4 space-y-3 sm:space-y-4 w-full min-w-0 overflow-hidden">
                        {pinnedMessages.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                        <Pin className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                                        Tin nhắn đã ghim
                                    </span>
                                    <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px] px-1.5 py-0">
                                        {pinnedMessages.length}
                                    </Badge>
                                </div>

                                {pinnedMessages.map((message) => (
                                    <ConversationMessageCard
                                        key={message.id}
                                        message={message}
                                        sender={sender}
                                        selectedConversation={selectedConversation}
                                        isPinned={true}
                                        onTogglePin={togglePinMessage}
                                    />
                                ))}

                                {unpinnedMessages.length > 0 && (
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {unpinnedMessages.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                                {pinnedMessages.length > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-violet-500" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                            Tất cả tin nhắn
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {unpinnedMessages.length}
                                        </Badge>
                                    </div>
                                )}

                                {unpinnedMessages.map((message) => (
                                    <ConversationMessageCard
                                        key={message.id}
                                        message={message}
                                        sender={sender}
                                        selectedConversation={selectedConversation}
                                        isPinned={false}
                                        onTogglePin={togglePinMessage}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <style>{MESSAGE_CONTENT_STYLES}</style>
            </ScrollArea>

            <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <a
                    href="https://lms.hcmut.edu.vn/message/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 inline-flex items-center gap-1.5 font-medium"
                >
                    Trả lời trên LMS <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
