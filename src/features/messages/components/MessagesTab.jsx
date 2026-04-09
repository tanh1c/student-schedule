import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, LogIn, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MyBKLoginCard from "@/components/MyBKLoginCard";
import ConversationDetailView from "@/features/messages/components/ConversationDetailView";
import ConversationListView from "@/features/messages/components/ConversationListView";
import {
    getConversationMessages,
    getMessages,
    initLmsSession
} from "@/services/lmsApi";

const PINNED_CONVERSATIONS_KEY = "lms_pinned_conversations";
const PINNED_MESSAGES_KEY = "lms_pinned_messages_v2";

export default function MessagesTab() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showAllConversations, setShowAllConversations] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginJustCompleted, setLoginJustCompleted] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [statsNow, setStatsNow] = useState(() => Date.now());

    const [pinnedIds, setPinnedIds] = useState(() => {
        try {
            const saved = localStorage.getItem(PINNED_CONVERSATIONS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [pinnedMessagesData, setPinnedMessagesData] = useState(() => {
        try {
            const saved = localStorage.getItem(PINNED_MESSAGES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(PINNED_CONVERSATIONS_KEY, JSON.stringify(pinnedIds));
        } catch (currentError) {
            console.error("Failed to save pinned conversations:", currentError);
        }
    }, [pinnedIds]);

    useEffect(() => {
        try {
            localStorage.setItem(PINNED_MESSAGES_KEY, JSON.stringify(pinnedMessagesData));
        } catch (currentError) {
            console.error("Failed to save pinned messages:", currentError);
        }
    }, [pinnedMessagesData]);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setStatsNow(Date.now());
        }, 60_000);

        return () => window.clearInterval(timerId);
    }, []);

    const togglePin = useCallback((conversationId) => {
        setPinnedIds((previous) => (
            previous.includes(conversationId)
                ? previous.filter((id) => id !== conversationId)
                : [conversationId, ...previous]
        ));
    }, []);

    const pinnedMessageIds = useMemo(
        () => pinnedMessagesData.map((message) => Number(message.id)),
        [pinnedMessagesData]
    );

    const togglePinMessage = useCallback((messageId, messageData = null, conversationData = null) => {
        const normalizedId = Number(messageId);
        setPinnedMessagesData((previous) => {
            const existingIndex = previous.findIndex((message) => Number(message.id) === normalizedId);
            if (existingIndex >= 0) {
                return previous.filter((message) => Number(message.id) !== normalizedId);
            }

            if (messageData && conversationData) {
                const sender = conversationData.members?.[0];
                return [{
                    id: normalizedId,
                    text: messageData.text,
                    timecreated: messageData.timecreated,
                    conversationId: conversationData.id,
                    conversationName: sender?.fullname || "Không rõ",
                    senderName: messageData.useridfrom === sender?.id ? sender?.fullname : "Bạn",
                    senderImage: sender?.profileimageurl || null
                }, ...previous];
            }

            return previous;
        });
    }, []);

    const { pinnedMessages, unpinnedMessages } = useMemo(() => {
        const allMessages = [...conversationMessages].reverse();
        const pinnedSet = new Set(pinnedMessageIds.map((id) => Number(id)));
        return {
            pinnedMessages: allMessages.filter((message) => pinnedSet.has(Number(message.id))),
            unpinnedMessages: allMessages.filter((message) => !pinnedSet.has(Number(message.id)))
        };
    }, [conversationMessages, pinnedMessageIds]);

    const { pinnedConversations, unpinnedConversations } = useMemo(() => ({
        pinnedConversations: conversations.filter((conversation) => pinnedIds.includes(conversation.id)),
        unpinnedConversations: conversations.filter((conversation) => !pinnedIds.includes(conversation.id))
    }), [conversations, pinnedIds]);

    const stats = useMemo(() => {
        const now = statsNow;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;
        let recentCount = 0;
        let todayCount = 0;
        let unreadCount = 0;

        conversations.forEach((conversation) => {
            const lastMessage = conversation.messages?.[0];
            if (lastMessage) {
                const messageTime = lastMessage.timecreated * 1000;
                if (now - messageTime < oneWeek) recentCount += 1;
                if (now - messageTime < oneDay) todayCount += 1;
            }
            if (!conversation.isread) unreadCount += 1;
        });

        return {
            total: conversations.length,
            recent: recentCount,
            today: todayCount,
            unread: unreadCount,
            pinned: pinnedIds.length
        };
    }, [conversations, pinnedIds, statsNow]);

    const initSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await initLmsSession();
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return false;
        }

        setIsInitialized(true);
        return true;
    }, []);

    const loadConversations = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        const result = await getMessages({ limit: 50, forceRefresh });
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return false;
        }

        setConversations(result.data?.conversations || []);
        setIsLoading(false);
        return true;
    }, []);

    const loadConversationMessages = useCallback(async (conversation, forceRefresh = false) => {
        setSelectedConversation(conversation);
        setIsLoadingMessages(true);

        const result = await getConversationMessages(conversation.id, { forceRefresh });
        if (result.success) {
            setConversationMessages(result.data?.messages || []);
        } else {
            setConversationMessages([]);
        }

        setIsLoadingMessages(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            const success = await initSession();
            if (success) {
                await loadConversations();
                setIsOfflineMode(false);
            } else {
                console.log("[LMS] Session init failed, attempting to load cached data...");
                const cachedResult = await getMessages({ limit: 50, forceRefresh: false });
                if (cachedResult.success && cachedResult.data?.conversations?.length > 0) {
                    console.log("[LMS] Loaded offline cache successfully");
                    setConversations(cachedResult.data.conversations);
                    setIsLoading(false);
                    setIsOfflineMode(true);
                    setError(null);
                }
            }
        };

        void init();
    }, [initSession, loadConversations]);

    const handleRefresh = async () => {
        if (selectedConversation) {
            await loadConversationMessages(selectedConversation, true);
            return;
        }

        if (!isInitialized) {
            const success = await initSession();
            if (success) await loadConversations(true);
        } else {
            await loadConversations(true);
        }
    };

    const handleBack = () => {
        setSelectedConversation(null);
        setConversationMessages([]);
    };

    const handleReloadMessages = async () => {
        setShowLoginForm(false);
        setLoginJustCompleted(false);
        setError(null);
        setIsLoading(true);
        const success = await initSession();
        if (success) await loadConversations();
    };

    if (error && !isLoading) {
        const isTokenError = error.toLowerCase().includes("token")
            || error.toLowerCase().includes("expired")
            || error.toLowerCase().includes("session")
            || error.toLowerCase().includes("đăng nhập");

        return (
            <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <ScrollArea className="flex-1 p-4 sm:p-6">
                    <div className="max-w-md mx-auto space-y-6">
                        {loginJustCompleted && showLoginForm ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                                    Đăng nhập thành công!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Bấm nút bên dưới để tải tin nhắn LMS.
                                </p>
                                <Button
                                    onClick={handleReloadMessages}
                                    className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                    size="lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Tải tin nhắn LMS
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                                        <AlertCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        Không thể kết nối LMS
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {error}
                                    </p>
                                </div>

                                {isTokenError ? (
                                    <div className="space-y-4">
                                        {!showLoginForm ? (
                                            <div className="space-y-3">
                                                <p className="text-center text-sm text-muted-foreground">
                                                    Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.
                                                </p>
                                                <Button
                                                    onClick={() => setShowLoginForm(true)}
                                                    className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                                    size="lg"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                    Đăng nhập MyBK
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleRefresh}
                                                    className="w-full gap-2"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Thử lại không đăng nhập
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <MyBKLoginCard
                                                    onScheduleFetched={() => { }}
                                                    onError={(currentError) => console.log("Login error:", currentError)}
                                                    onLoginSuccess={() => setLoginJustCompleted(true)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setShowLoginForm(false)}
                                                    className="w-full text-muted-foreground"
                                                >
                                                    Quay lại
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button onClick={handleRefresh} className="w-full gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Thử lại
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    if (isLoading && conversations.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải tin nhắn LMS...</span>
                </div>
            </div>
        );
    }

    if (selectedConversation) {
        return (
            <ConversationDetailView
                selectedConversation={selectedConversation}
                pinnedIds={pinnedIds}
                togglePin={togglePin}
                loadConversationMessages={loadConversationMessages}
                isLoadingMessages={isLoadingMessages}
                conversationMessages={conversationMessages}
                pinnedMessages={pinnedMessages}
                unpinnedMessages={unpinnedMessages}
                togglePinMessage={togglePinMessage}
                onBack={handleBack}
            />
        );
    }

    return (
        <ConversationListView
            stats={stats}
            isLoading={isLoading}
            handleRefresh={handleRefresh}
            isOfflineMode={isOfflineMode}
            conversations={conversations}
            pinnedMessagesData={pinnedMessagesData}
            pinnedConversations={pinnedConversations}
            unpinnedConversations={unpinnedConversations}
            showAllConversations={showAllConversations}
            onToggleShowAll={() => setShowAllConversations((previous) => !previous)}
            togglePinMessage={togglePinMessage}
            openConversation={loadConversationMessages}
            togglePin={togglePin}
        />
    );
}
