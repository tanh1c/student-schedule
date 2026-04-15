import React from "react";
import {
    Bell,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Inbox,
    Mail,
    MessageSquare,
    Pin,
    PinOff,
    RefreshCw,
    Sparkles,
    Star,
    TrendingUp,
    User,
    WifiOff,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatMessageDate, parseMessageText } from "@/services/lmsApi";
import ConversationCard from "@/features/messages/components/ConversationCard";
import MessagesStatsCard from "@/features/messages/components/MessagesStatsCard";

export default function ConversationListView({
    stats,
    isLoading,
    handleRefresh,
    isOfflineMode,
    conversations,
    pinnedMessagesData,
    pinnedConversations,
    unpinnedConversations,
    showAllConversations,
    onToggleShowAll,
    togglePinMessage,
    openConversation,
    togglePin
}) {
    return (
        <div className="h-full w-full max-w-full flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-x-hidden">
            <div className="sticky top-0 z-10 box-border w-full max-w-full overflow-hidden border-b bg-white/80 p-1.5 backdrop-blur-md dark:bg-slate-900/80 sm:px-3 sm:py-4">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                                Tin nhắn LMS
                            </h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                BK E-Learning Messages
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="h-9 w-9 sm:h-10 sm:w-10"
                    >
                        <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3 w-full min-w-0">
                    <MessagesStatsCard
                        icon={Inbox}
                        title="Tổng cuộc trò chuyện"
                        value={stats.total}
                        color="blue"
                    />
                    <MessagesStatsCard
                        icon={Bell}
                        title="Chưa đọc"
                        value={stats.unread}
                        color="violet"
                        subtitle={stats.unread > 0 ? "cần xem ngay" : ""}
                    />
                    <MessagesStatsCard
                        icon={TrendingUp}
                        title="Trong 7 ngày qua"
                        value={stats.recent}
                        color="emerald"
                    />
                    <MessagesStatsCard
                        icon={Sparkles}
                        title="Hôm nay"
                        value={stats.today}
                        color="amber"
                    />
                </div>
            </div>

            {isOfflineMode && (
                <div className="mx-2 mb-3 sm:mx-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <WifiOff className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                                Chế độ Offline
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Đang xem tin nhắn đã lưu. Kết nối server để cập nhật mới nhất.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="flex-shrink-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden px-1.5 sm:px-3">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm sm:text-base font-medium">Không có tin nhắn</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Bạn chưa có cuộc trò chuyện nào
                        </p>
                    </div>
                ) : (
                    <div className="py-3 sm:py-4 space-y-4 min-w-0 w-full overflow-hidden">
                        {pinnedMessagesData.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                                            <Star className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                            Tin nhắn quan trọng
                                        </span>
                                        <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700 text-[10px] px-1.5 py-0">
                                            {pinnedMessagesData.length}
                                        </Badge>
                                    </div>
                                </div>

                                {pinnedMessagesData.map((message) => {
                                    const conversation = conversations.find((item) => item.id === message.conversationId);

                                    return (
                                        <div
                                            key={message.id}
                                            className="relative group cursor-pointer min-w-0 overflow-hidden"
                                            onClick={() => conversation && openConversation(conversation)}
                                        >
                                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/30 dark:via-pink-950/25 dark:to-fuchsia-950/30 border border-rose-200/60 dark:border-rose-800/50 p-3 sm:p-4 hover:shadow-md transition-all">
                                                <div className="absolute top-2 right-2">
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            togglePinMessage(message.id);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                                                        title="Bỏ ghim"
                                                    >
                                                        <PinOff className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {message.senderImage ? (
                                                            <img src={message.senderImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-sm text-rose-900 dark:text-rose-100 truncate">
                                                                {message.conversationName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span>{formatMessageDate(message.timecreated)}</span>
                                                            <span className="mx-1">•</span>
                                                            <span>{message.senderName}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 line-clamp-2">
                                                    {parseMessageText(message.text).substring(0, 120)}
                                                    {parseMessageText(message.text).length > 120 ? "..." : ""}
                                                </p>

                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-rose-500 dark:text-rose-500">
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span>Bấm để xem cuộc trò chuyện</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {pinnedConversations.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                            <Pin className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                                            Đã ghim
                                        </span>
                                        <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px] px-1.5 py-0">
                                            {pinnedConversations.length}
                                        </Badge>
                                    </div>
                                </div>

                                {pinnedConversations.map((conversation) => (
                                    <ConversationCard
                                        key={conversation.id}
                                        conv={conversation}
                                        onClick={() => openConversation(conversation)}
                                        isUnread={!conversation.isread}
                                        isPinned={true}
                                        onPin={togglePin}
                                    />
                                ))}

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {unpinnedConversations.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        {pinnedConversations.length > 0 ? "Khác" : "Cuộc trò chuyện"}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {unpinnedConversations.length}
                                    </Badge>
                                </div>

                                {(showAllConversations ? unpinnedConversations : unpinnedConversations.slice(0, 10)).map((conversation) => (
                                    <ConversationCard
                                        key={conversation.id}
                                        conv={conversation}
                                        onClick={() => openConversation(conversation)}
                                        isUnread={!conversation.isread}
                                        isPinned={false}
                                        onPin={togglePin}
                                    />
                                ))}

                                {unpinnedConversations.length > 10 && (
                                    <button
                                        onClick={onToggleShowAll}
                                        className="w-full py-3 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center justify-center gap-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                                    >
                                        {showAllConversations ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Thu gọn
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Xem thêm {unpinnedConversations.length - 10} cuộc trò chuyện
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            <div className="p-2 sm:p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <a
                    href="https://lms.hcmut.edu.vn/message/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 inline-flex items-center gap-1.5 font-medium"
                >
                    Mở LMS đầy đủ <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
