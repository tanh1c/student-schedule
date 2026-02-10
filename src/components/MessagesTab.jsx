import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Mail, Inbox, RefreshCw, ChevronRight, User, Clock,
    AlertCircle, Loader2, ArrowLeft, ExternalLink, MessageSquare,
    Bell, TrendingUp, Calendar, Sparkles, ChevronDown, ChevronUp,
    Pin, PinOff, Star, LogIn, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    initLmsSession,
    getMessages,
    getConversationMessages,
    parseMessageText,
    sanitizeMessageHtml,
    formatMessageDate
} from '@/services/lmsApi';
import MyBKLoginCard from './MyBKLoginCard';
import * as mybkApi from '@/services/mybkApi';

// Stats Card Component - Premium Design
function StatsCard({ icon: Icon, title, value, color, subtitle }) {
    const colorSchemes = {
        blue: {
            gradient: "from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/30 dark:via-indigo-950/25 dark:to-sky-950/30",
            border: "border-blue-200/60 dark:border-blue-800/50",
            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
            iconShadow: "shadow-blue-200/50 dark:shadow-blue-950/40",
            text: "text-blue-700 dark:text-blue-400",
            value: "text-blue-900 dark:text-blue-200"
        },
        violet: {
            gradient: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/25 dark:to-fuchsia-950/30",
            border: "border-violet-200/60 dark:border-violet-800/50",
            iconBg: "from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700",
            iconShadow: "shadow-violet-200/50 dark:shadow-violet-950/40",
            text: "text-violet-700 dark:text-violet-400",
            value: "text-violet-900 dark:text-violet-200"
        },
        emerald: {
            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/25 dark:to-teal-950/30",
            border: "border-emerald-200/60 dark:border-emerald-800/50",
            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
            iconShadow: "shadow-emerald-200/50 dark:shadow-emerald-950/40",
            text: "text-emerald-700 dark:text-emerald-400",
            value: "text-emerald-900 dark:text-emerald-200"
        },
        amber: {
            gradient: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/25 dark:to-yellow-950/30",
            border: "border-amber-200/60 dark:border-amber-800/50",
            iconBg: "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700",
            iconShadow: "shadow-amber-200/50 dark:shadow-amber-950/40",
            text: "text-amber-700 dark:text-amber-400",
            value: "text-amber-900 dark:text-amber-200"
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;

    return (
        <div className={`relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-1.5 sm:p-4 shadow-sm w-full min-w-0`}>
            <div className="absolute -top-6 -right-6 h-16 w-16 bg-white/30 dark:bg-white/5 rounded-full blur-xl" />
            <div className="relative flex items-center gap-1 sm:gap-3">
                <div className={`h-7 w-7 sm:h-10 sm:w-10 rounded-md sm:rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg ${scheme.iconShadow} shrink-0`}>
                    <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-base sm:text-2xl font-black ${scheme.value}`}>{value}</p>
                    <p className={`text-[8px] sm:text-xs font-medium ${scheme.text} truncate leading-tight`}>{title}</p>
                    {subtitle && (
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Conversation Card Component - Premium Design with Checkbox Pin  
function ConversationCard({ conv, onClick, isUnread, isPinned, onPin }) {
    const sender = conv.members?.[0];
    const lastMsg = conv.messages?.[0];

    const handlePin = (e) => {
        e.stopPropagation();
        onPin?.(conv.id);
    };

    // Determine card style based on pinned/unread state
    const getCardStyle = () => {
        if (isPinned) {
            return 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/25 dark:to-yellow-950/30 border-amber-300/70 dark:border-amber-700/50';
        }
        if (isUnread) {
            return 'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/25 dark:to-fuchsia-950/30 border-violet-200/60 dark:border-violet-800/50';
        }
        return 'from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/40 dark:via-gray-950/30 dark:to-zinc-950/40 border-slate-200/60 dark:border-slate-800/50';
    };

    const getAvatarStyle = () => {
        if (isPinned) {
            return 'from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700';
        }
        if (isUnread) {
            return 'from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700';
        }
        return 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700';
    };

    return (
        <div className="flex items-stretch gap-1.5 sm:gap-3 group min-w-0 w-full overflow-hidden">
            {/* Checkbox for Pin - Left side, always visible */}
            <button
                onClick={handlePin}
                className={`flex-shrink-0 w-6 sm:w-7 flex items-center justify-center transition-all duration-200
                    ${isPinned ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                `}
                title={isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn quan trọng'}
            >
                <div className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-md border-2 transition-all duration-200 flex items-center justify-center
                    ${isPinned
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500'
                    }
                `}>
                    {isPinned && (
                        <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-in zoom-in-50 duration-200" />
                    )}
                </div>
            </button>

            {/* Card Content */}
            <button
                onClick={onClick}
                className={`flex-1 min-w-0 w-0 relative overflow-hidden rounded-xl sm:rounded-xl bg-gradient-to-br transition-all duration-200 border text-left
                    ${getCardStyle()}
                    hover:shadow-md hover:scale-[1.005] active:scale-[0.995]
                `}
            >
                {/* Hover glow */}
                <div className="absolute -top-8 -right-8 h-24 w-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Avatar */}
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

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-0">
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-0.5">
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                {isPinned && (
                                    <Pin className="w-3 h-3 sm:w-3 sm:h-3 text-amber-500 flex-shrink-0" />
                                )}
                                <span className={`text-sm sm:text-base font-semibold truncate 
                                    ${isPinned ? 'text-amber-900 dark:text-amber-100' :
                                        isUnread ? 'text-violet-900 dark:text-violet-100' :
                                            'text-slate-700 dark:text-slate-300'}`}
                                >
                                    {sender?.fullname || 'Không rõ'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                {isUnread && !isPinned && (
                                    <span className="w-2 h-2 sm:w-2 sm:h-2 rounded-full bg-violet-500 animate-pulse" />
                                )}
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {lastMsg && formatMessageDate(lastMsg.timecreated)}
                                </span>
                            </div>
                        </div>
                        <p className={`text-xs sm:text-sm truncate 
                            ${isPinned ? 'text-amber-700 dark:text-amber-300 font-medium' :
                                isUnread ? 'text-violet-700 dark:text-violet-300 font-medium' :
                                    'text-muted-foreground'}`}
                        >
                            {lastMsg ? parseMessageText(lastMsg.text).substring(0, 50) : 'Không có tin nhắn'}
                        </p>
                    </div>

                    <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform" />
                </div>
            </button>
        </div>
    );
}

/**
 * MessagesTab - Displays LMS messages from BK E-Learning with Premium UI
 */
export default function MessagesTab() {
    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showAllConversations, setShowAllConversations] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false); // Show login when token expired
    const [loginJustCompleted, setLoginJustCompleted] = useState(false); // Track successful login
    const [isOfflineMode, setIsOfflineMode] = useState(false); // Track offline mode with cached data

    // Pinned conversations - stored in localStorage
    const [pinnedIds, setPinnedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('lms_pinned_conversations');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Save pinned conversations to localStorage when changed
    useEffect(() => {
        try {
            localStorage.setItem('lms_pinned_conversations', JSON.stringify(pinnedIds));
        } catch (e) {
            console.error('Failed to save pinned conversations:', e);
        }
    }, [pinnedIds]);

    // Toggle pin for a conversation
    const togglePin = useCallback((convId) => {
        setPinnedIds(prev => {
            if (prev.includes(convId)) {
                return prev.filter(id => id !== convId);
            } else {
                return [convId, ...prev];
            }
        });
    }, []);

    // Pinned MESSAGES state - stored in localStorage with FULL message data for display on main page
    // Format: [{ id, text, timecreated, conversationId, senderName, senderImage }]
    const [pinnedMessagesData, setPinnedMessagesData] = useState(() => {
        try {
            const saved = localStorage.getItem('lms_pinned_messages_v2');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Save pinned messages to localStorage when changed
    useEffect(() => {
        try {
            localStorage.setItem('lms_pinned_messages_v2', JSON.stringify(pinnedMessagesData));
        } catch (e) {
            console.error('Failed to save pinned messages:', e);
        }
    }, [pinnedMessagesData]);

    // Get pinned message IDs for quick lookup
    const pinnedMessageIds = useMemo(() =>
        pinnedMessagesData.map(m => Number(m.id)),
        [pinnedMessagesData]
    );

    // Toggle pin for an individual message - now stores full message data
    const togglePinMessage = useCallback((msgId, messageData = null, conversationData = null) => {
        const numId = Number(msgId);
        setPinnedMessagesData(prev => {
            const existingIndex = prev.findIndex(m => Number(m.id) === numId);
            if (existingIndex >= 0) {
                // Unpin - remove from list
                return prev.filter(m => Number(m.id) !== numId);
            } else if (messageData && conversationData) {
                // Pin - add with full data
                const sender = conversationData.members?.[0];
                return [{
                    id: numId,
                    text: messageData.text,
                    timecreated: messageData.timecreated,
                    conversationId: conversationData.id,
                    conversationName: sender?.fullname || 'Không rõ',
                    senderName: messageData.useridfrom === sender?.id ? sender?.fullname : 'Bạn',
                    senderImage: sender?.profileimageurl || null
                }, ...prev];
            }
            return prev;
        });
    }, []);

    // Separate pinned and unpinned messages in current conversation
    const { pinnedMessages, unpinnedMessages } = useMemo(() => {
        const allMessages = [...conversationMessages].reverse();
        // Ensure consistent type comparison (convert both to numbers)
        const pinnedSet = new Set(pinnedMessageIds.map(id => Number(id)));
        const pinned = allMessages.filter(m => pinnedSet.has(Number(m.id)));
        const unpinned = allMessages.filter(m => !pinnedSet.has(Number(m.id)));
        return { pinnedMessages: pinned, unpinnedMessages: unpinned };
    }, [conversationMessages, pinnedMessageIds]);

    // Separate pinned and unpinned conversations
    const { pinnedConversations, unpinnedConversations } = useMemo(() => {
        const pinned = conversations.filter(c => pinnedIds.includes(c.id));
        const unpinned = conversations.filter(c => !pinnedIds.includes(c.id));
        return { pinnedConversations: pinned, unpinnedConversations: unpinned };
    }, [conversations, pinnedIds]);

    // Calculate stats with pinned count
    const stats = useMemo(() => {
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;

        let recentCount = 0;
        let todayCount = 0;
        let unreadCount = 0;

        conversations.forEach(conv => {
            const lastMsg = conv.messages?.[0];
            if (lastMsg) {
                const msgTime = lastMsg.timecreated * 1000;
                if (now - msgTime < oneWeek) recentCount++;
                if (now - msgTime < oneDay) todayCount++;
            }
            if (!conv.isread) unreadCount++;
        });

        return {
            total: conversations.length,
            recent: recentCount,
            today: todayCount,
            unread: unreadCount,
            pinned: pinnedIds.length
        };
    }, [conversations, pinnedIds]);

    // Initialize LMS session
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

    // Load conversations
    const loadConversations = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        const result = await getMessages({ limit: 50, forceRefresh });

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        setConversations(result.data?.conversations || []);
        setIsLoading(false);
    }, []);

    // Load messages for a conversation
    const loadConversationMessages = useCallback(async (conv, forceRefresh = false) => {
        setSelectedConversation(conv);
        setIsLoadingMessages(true);

        const result = await getConversationMessages(conv.id, { forceRefresh });

        if (result.success) {
            setConversationMessages(result.data?.messages || []);
        } else {
            setConversationMessages([]);
        }

        setIsLoadingMessages(false);
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const success = await initSession();
            if (success) {
                await loadConversations();
                setIsOfflineMode(false);
            } else {
                // Even if session init fails, try to load cached conversations for offline mode
                console.log('[LMS] Session init failed, attempting to load cached data...');
                const cachedResult = await getMessages({ limit: 50, forceRefresh: false });
                if (cachedResult.success && cachedResult.data?.conversations?.length > 0) {
                    console.log('[LMS] Loaded offline cache successfully');
                    setConversations(cachedResult.data.conversations);
                    setIsLoading(false);
                    setIsOfflineMode(true);
                    setError(null); // Clear error so we can show cached data with offline banner
                }
            }
        };
        init();
    }, [initSession, loadConversations]);

    // Refresh handler - force refresh bypasses cache
    const handleRefresh = async () => {
        if (selectedConversation) {
            await loadConversationMessages(selectedConversation, true);
        } else {
            if (!isInitialized) {
                const success = await initSession();
                if (success) await loadConversations(true);
            } else {
                await loadConversations(true);
            }
        }
    };

    // Back to list
    const handleBack = () => {
        setSelectedConversation(null);
        setConversationMessages([]);
    };

    // Error state - with inline login option for token errors
    if (error && !isLoading) {
        const isTokenError = error.toLowerCase().includes('token') ||
            error.toLowerCase().includes('expired') ||
            error.toLowerCase().includes('session') ||
            error.toLowerCase().includes('đăng nhập');

        // Handle reload after login success
        const handleReloadMessages = async () => {
            setShowLoginForm(false);
            setLoginJustCompleted(false);
            setError(null);
            setIsLoading(true);
            const success = await initSession();
            if (success) await loadConversations();
        };

        return (
            <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <ScrollArea className="flex-1 p-4 sm:p-6">
                    <div className="max-w-md mx-auto space-y-6">
                        {/* Success state - user just logged in, show reload button */}
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
                                {/* Error Header */}
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

                                {/* Show login form for token errors */}
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
                                                    onError={(err) => console.log('Login error:', err)}
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

    // Loading state
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

    // Conversation detail view
    if (selectedConversation) {
        const sender = selectedConversation.members?.[0];
        const isConvPinned = pinnedIds.includes(selectedConversation.id);

        return (
            <div className="h-full w-full max-w-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden">
                {/* Header - Sticky with glassmorphism */}
                <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 border-b backdrop-blur-md sticky top-0 z-10 transition-colors w-full max-w-full overflow-hidden box-border
                    ${isConvPinned
                        ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                        : 'bg-white/80 dark:bg-slate-900/80'
                    }`}
                >
                    <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Avatar */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md
                        ${isConvPinned
                            ? 'from-amber-400 to-orange-500'
                            : 'from-violet-400 to-purple-500'
                        }`}
                    >
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
                            <h3 className={`font-bold text-sm sm:text-base truncate 
                                ${isConvPinned ? 'text-amber-900 dark:text-amber-100' : 'text-slate-900 dark:text-slate-100'}`}
                            >
                                {sender?.fullname || 'Không rõ'}
                            </h3>
                            {isConvPinned && (
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

                    {/* Pin Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePin(selectedConversation.id)}
                        className={`h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-colors
                            ${isConvPinned
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900'
                                : 'text-muted-foreground hover:text-amber-500'
                            }`}
                        title={isConvPinned ? 'Bỏ ghim' : 'Ghim cuộc trò chuyện'}
                    >
                        {isConvPinned ? (
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
                        <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-2 sm:px-4 w-full max-w-full overflow-x-hidden">
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
                            {/* Pinned Messages Section */}
                            {pinnedMessages.length > 0 && (
                                <div className="space-y-2 sm:space-y-3">
                                    {/* Pinned Section Header */}
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

                                    {/* Pinned Messages */}
                                    {pinnedMessages.map((msg) => {
                                        const isFromSender = msg.useridfrom === sender?.id;
                                        const msgSender = isFromSender ? sender : null;

                                        return (
                                            <div key={msg.id} className="flex items-start gap-2 sm:gap-3 w-full min-w-0">
                                                {/* Pin Checkbox */}
                                                <button
                                                    onClick={() => togglePinMessage(msg.id, msg, selectedConversation)}
                                                    className="flex-shrink-0 mt-3 sm:mt-4"
                                                    title="Bỏ ghim tin nhắn"
                                                >
                                                    <div className="w-6 h-6 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-500 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30 flex items-center justify-center transition-all hover:scale-110">
                                                        <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                                                    </div>
                                                </button>

                                                {/* Message Card */}
                                                <article className="flex-1 min-w-0 w-0 relative overflow-hidden rounded-xl sm:rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 border border-amber-300/70 dark:border-amber-700/50 p-3 sm:p-4 shadow-sm">
                                                    {/* Message Header */}
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                        <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg sm:rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {msgSender?.profileimageurl ? (
                                                                <img src={msgSender.profileimageurl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                            <span className="font-semibold text-sm sm:text-sm text-amber-900 dark:text-amber-100">
                                                                {isFromSender ? sender?.fullname : 'Bạn'}
                                                            </span>
                                                            <span className="text-xs sm:text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-3 sm:h-3" />
                                                                {formatMessageDate(msg.timecreated)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Message Content */}
                                                    <div
                                                        className="lms-message-content text-sm text-amber-900 dark:text-amber-100 leading-relaxed"
                                                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', overflow: 'hidden' }}
                                                        dangerouslySetInnerHTML={{ __html: sanitizeMessageHtml(msg.text) }}
                                                    />
                                                </article>
                                            </div>
                                        );
                                    })}

                                    {/* Divider */}
                                    {unpinnedMessages.length > 0 && (
                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Regular Messages Section */}
                            {unpinnedMessages.length > 0 && (
                                <div className="space-y-2 sm:space-y-3">
                                    {/* Section Header */}
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

                                    {/* Unpinned Messages */}
                                    {unpinnedMessages.map((msg) => {
                                        const isFromSender = msg.useridfrom === sender?.id;
                                        const msgSender = isFromSender ? sender : null;

                                        return (
                                            <div key={msg.id} className="flex items-start gap-2 sm:gap-3 group w-full min-w-0">
                                                {/* Pin Checkbox */}
                                                <button
                                                    onClick={() => togglePinMessage(msg.id, msg, selectedConversation)}
                                                    className="flex-shrink-0 mt-3 sm:mt-4 opacity-60 group-hover:opacity-100 transition-opacity"
                                                    title="Ghim tin nhắn quan trọng"
                                                >
                                                    <div className="w-6 h-6 sm:w-6 sm:h-6 rounded-md bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 flex items-center justify-center transition-all hover:scale-110">
                                                    </div>
                                                </button>

                                                {/* Message Card */}
                                                <article className="flex-1 min-w-0 w-0 relative overflow-hidden rounded-xl sm:rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/60 dark:via-gray-950/50 dark:to-zinc-950/60 border border-slate-200/60 dark:border-slate-800/50 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    {/* Message Header */}
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                        <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg sm:rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {msgSender?.profileimageurl ? (
                                                                <img src={msgSender.profileimageurl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                            <span className="font-semibold text-sm sm:text-sm text-slate-800 dark:text-slate-200">
                                                                {isFromSender ? sender?.fullname : 'Bạn'}
                                                            </span>
                                                            <span className="text-xs sm:text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-3 sm:h-3" />
                                                                {formatMessageDate(msg.timecreated)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Message Content */}
                                                    <div
                                                        className="lms-message-content text-sm sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                                                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', overflow: 'hidden' }}
                                                        dangerouslySetInnerHTML={{ __html: sanitizeMessageHtml(msg.text) }}
                                                    />
                                                </article>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CSS for message content */}
                    <style>{`
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
                    `}</style>
                </ScrollArea>

                {/* Footer */}
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

    // Conversation list view
    return (
        <div className="h-full w-full max-w-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-x-hidden overflow-hidden">
            {/* Header with glassmorphism */}
            <div className="w-full max-w-full p-1.5 sm:p-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 overflow-hidden box-border">
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
                        <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3 w-full min-w-0">
                    <StatsCard
                        icon={Inbox}
                        title="Tổng cuộc trò chuyện"
                        value={stats.total}
                        color="blue"
                    />
                    <StatsCard
                        icon={Bell}
                        title="Chưa đọc"
                        value={stats.unread}
                        color="violet"
                        subtitle={stats.unread > 0 ? "cần xem ngay" : ""}
                    />
                    <StatsCard
                        icon={TrendingUp}
                        title="Trong 7 ngày qua"
                        value={stats.recent}
                        color="emerald"
                    />
                    <StatsCard
                        icon={Sparkles}
                        title="Hôm nay"
                        value={stats.today}
                        color="amber"
                    />
                </div>
            </div>

            {/* Offline Mode Banner */}
            {isOfflineMode && (
                <div className="mx-2 sm:mx-4 mb-3">
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

            {/* Conversations list */}
            <ScrollArea className="flex-1 w-full max-w-full px-1.5 sm:px-4 min-w-0 overflow-x-hidden">
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
                        {/* Pinned Messages Section - Messages pinned from inside conversations */}
                        {pinnedMessagesData.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                {/* Pinned Messages Header */}
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

                                {/* Pinned Messages List */}
                                {pinnedMessagesData.map((msg) => {
                                    // Find the conversation for this message
                                    const conv = conversations.find(c => c.id === msg.conversationId);

                                    return (
                                        <div
                                            key={msg.id}
                                            className="relative group cursor-pointer min-w-0 overflow-hidden"
                                            onClick={() => conv && loadConversationMessages(conv)}
                                        >
                                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/30 dark:via-pink-950/25 dark:to-fuchsia-950/30 border border-rose-200/60 dark:border-rose-800/50 p-3 sm:p-4 hover:shadow-md transition-all">
                                                {/* Star indicator */}
                                                <div className="absolute top-2 right-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePinMessage(msg.id);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                                                        title="Bỏ ghim"
                                                    >
                                                        <PinOff className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Header - Conversation info */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {msg.senderImage ? (
                                                            <img src={msg.senderImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-sm text-rose-900 dark:text-rose-100 truncate">
                                                                {msg.conversationName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span>{formatMessageDate(msg.timecreated)}</span>
                                                            <span className="mx-1">•</span>
                                                            <span>{msg.senderName}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Message preview */}
                                                <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 line-clamp-2">
                                                    {parseMessageText(msg.text).substring(0, 120)}
                                                    {parseMessageText(msg.text).length > 120 ? '...' : ''}
                                                </p>

                                                {/* Click hint */}
                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-rose-500 dark:text-rose-500">
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span>Bấm để xem cuộc trò chuyện</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pinned Conversations Section */}
                        {pinnedConversations.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                {/* Pinned Section Header */}
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

                                {/* Pinned Conversations */}
                                {pinnedConversations.map((conv) => (
                                    <ConversationCard
                                        key={conv.id}
                                        conv={conv}
                                        onClick={() => loadConversationMessages(conv)}
                                        isUnread={!conv.isread}
                                        isPinned={true}
                                        onPin={togglePin}
                                    />
                                ))}

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Regular Conversations Section */}
                        {unpinnedConversations.length > 0 && (
                            <div className="space-y-2 sm:space-y-3 min-w-0 overflow-hidden">
                                {/* Section Title */}
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        {pinnedConversations.length > 0 ? 'Khác' : 'Cuộc trò chuyện'}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {unpinnedConversations.length}
                                    </Badge>
                                </div>

                                {/* Unpinned Conversations */}
                                {(showAllConversations ? unpinnedConversations : unpinnedConversations.slice(0, 10)).map((conv) => (
                                    <ConversationCard
                                        key={conv.id}
                                        conv={conv}
                                        onClick={() => loadConversationMessages(conv)}
                                        isUnread={!conv.isread}
                                        isPinned={false}
                                        onPin={togglePin}
                                    />
                                ))}

                                {/* Show more/less button */}
                                {unpinnedConversations.length > 10 && (
                                    <button
                                        onClick={() => setShowAllConversations(!showAllConversations)}
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

            {/* Footer */}
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
