import React, { useState, useEffect } from "react";
import {
    Heart,
    Github,
    ExternalLink,
    Star,
    Code2,
    Users,
    Sparkles,
    Crown,
    Award,
    Coffee,
    Zap,
    Rocket,
    Shield,
    Bug,
    Lightbulb,
    MessageSquare,
    GitPullRequest,
    GitCommit,
    Plus,
    Minus,
    AlertCircle,
    Clock
} from "lucide-react";
import { Badge } from "./ui/badge";

// GitHub repository info
const GITHUB_OWNER = "tanh1c";
const GITHUB_REPO = "student-schedule";

// Special roles for known contributors (optional customization)
const specialRoles = {
    "tanh1c": {
        role: "Creator & Lead Developer",
        type: "creator",
        badgeType: "founder"
    },
    "HThanh-how": {
        role: "Backend Developer",
        type: "core",
        badgeType: "core"
    }
};

// Badge configurations with icons and premium styling
const badgeConfig = {
    founder: {
        label: "Founder",
        icon: Crown,
        gradient: "from-amber-500 via-yellow-500 to-orange-500",
        glow: "shadow-amber-500/30",
        textColor: "text-white",
        animation: "animate-pulse"
    },
    core: {
        label: "Core Supporter",
        icon: Star,
        gradient: "from-violet-500 via-purple-500 to-indigo-500",
        glow: "shadow-violet-500/30",
        textColor: "text-white",
        animation: ""
    },
    maintainer: {
        label: "Maintainer",
        icon: Shield,
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        glow: "shadow-emerald-500/30",
        textColor: "text-white",
        animation: ""
    },
    developer: {
        label: "Developer",
        icon: Code2,
        gradient: "from-blue-500 via-indigo-500 to-violet-500",
        glow: "shadow-blue-500/30",
        textColor: "text-white",
        animation: ""
    },
    contributor: {
        label: "Contributor",
        icon: GitPullRequest,
        gradient: "from-cyan-500 via-sky-500 to-blue-500",
        glow: "shadow-cyan-500/30",
        textColor: "text-white",
        animation: ""
    },
    sponsor: {
        label: "Sponsor",
        icon: Heart,
        gradient: "from-pink-500 via-rose-500 to-red-500",
        glow: "shadow-pink-500/30",
        textColor: "text-white",
        animation: ""
    },
    tester: {
        label: "Tester",
        icon: Bug,
        gradient: "from-orange-500 via-amber-500 to-yellow-500",
        glow: "shadow-orange-500/30",
        textColor: "text-white",
        animation: ""
    }
};

// Manual contributors - for those who have commits in unmerged branches
// These will be added even if GitHub API doesn't return them
const manualContributors = [
    {
        github: "HThanh-how",
        commits: 8, // From git shortlog
        note: "Commits in feature/server-refactor branch"
    }
];

// Fallback data when GitHub API is rate limited
const fallbackContributors = [
    {
        github: "tanh1c",
        avatarUrl: "https://avatars.githubusercontent.com/u/166195192",
        commits: 71,
        additions: 15000,
        deletions: 3000,
        role: "Creator & Lead Developer",
        type: "creator",
        badgeType: "founder",
        name: "TAnh",
        bio: "Student at HCMUT",
        publicRepos: 10,
        followers: 5
    },
    {
        github: "HThanh-how",
        avatarUrl: "https://avatars.githubusercontent.com/u/114163977",
        commits: 8,
        additions: 500,
        deletions: 100,
        role: "Backend Developer",
        type: "core",
        badgeType: "core",
        name: "Huy Thanh",
        bio: null,
        note: "Commits in feature/server-refactor branch",
        publicRepos: 5,
        followers: 2
    }
];

// Role type configurations
const roleConfig = {
    creator: {
        gradient: "from-amber-400 via-yellow-500 to-orange-500",
        borderColor: "border-amber-300 dark:border-amber-700",
        bgGradient: "from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30",
        decoration1: "bg-amber-200/40 dark:bg-amber-900/30",
        decoration2: "bg-yellow-200/40 dark:bg-yellow-900/30",
        textColor: "text-amber-700 dark:text-amber-400",
        ring: "ring-4 ring-amber-400/30 dark:ring-amber-500/20"
    },
    core: {
        gradient: "from-violet-400 via-purple-500 to-indigo-500",
        borderColor: "border-violet-300 dark:border-violet-700",
        bgGradient: "from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/30",
        decoration1: "bg-violet-200/40 dark:bg-violet-900/30",
        decoration2: "bg-indigo-200/40 dark:bg-indigo-900/30",
        textColor: "text-violet-700 dark:text-violet-400",
        ring: "ring-4 ring-violet-400/30 dark:ring-violet-500/20"
    },
    contributor: {
        gradient: "from-blue-400 via-indigo-500 to-violet-500",
        borderColor: "border-blue-200 dark:border-blue-800",
        bgGradient: "from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20",
        decoration1: "bg-blue-200/30 dark:bg-blue-900/20",
        decoration2: "bg-indigo-200/30 dark:bg-indigo-900/20",
        textColor: "text-blue-700 dark:text-blue-400",
        ring: ""
    },
    sponsor: {
        gradient: "from-pink-400 via-rose-500 to-red-500",
        borderColor: "border-pink-200 dark:border-pink-800",
        bgGradient: "from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/20 dark:via-rose-950/15 dark:to-red-950/20",
        decoration1: "bg-pink-200/30 dark:bg-pink-900/20",
        decoration2: "bg-rose-200/30 dark:bg-rose-900/20",
        textColor: "text-pink-700 dark:text-pink-400",
        ring: ""
    },
    tester: {
        gradient: "from-emerald-400 via-green-500 to-teal-500",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        bgGradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
        decoration1: "bg-emerald-200/30 dark:bg-emerald-900/20",
        decoration2: "bg-green-200/30 dark:bg-green-900/20",
        textColor: "text-emerald-700 dark:text-emerald-400",
        ring: ""
    },
    designer: {
        gradient: "from-purple-400 via-fuchsia-500 to-pink-500",
        borderColor: "border-purple-200 dark:border-purple-800",
        bgGradient: "from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/20 dark:via-fuchsia-950/15 dark:to-pink-950/20",
        decoration1: "bg-purple-200/30 dark:bg-purple-900/20",
        decoration2: "bg-fuchsia-200/30 dark:bg-fuchsia-900/20",
        textColor: "text-purple-700 dark:text-purple-400",
        ring: ""
    }
};

// Contribution types
const contributionTypes = [
    { icon: Code2, label: "Code", color: "from-blue-500 to-indigo-600" },
    { icon: Bug, label: "Bug Reports", color: "from-red-500 to-orange-600" },
    { icon: Lightbulb, label: "Ideas", color: "from-yellow-500 to-amber-600" },
    { icon: MessageSquare, label: "Feedback", color: "from-green-500 to-emerald-600" },
    { icon: GitPullRequest, label: "Pull Requests", color: "from-purple-500 to-violet-600" },
    { icon: Shield, label: "Security", color: "from-slate-500 to-gray-600" }
];

export default function HonorWallPage() {
    const [contributors, setContributors] = useState([]);
    const [repoStats, setRepoStats] = useState({ totalCommits: 0, totalContributors: 0, additions: 0, deletions: 0, devTime: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContributors = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch from backend API (with Redis caching)
                // In production, FE and BE are on same domain, use relative URL
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_BASE}/api/github/contributors`);

                if (!res.ok) {
                    throw new Error('Failed to fetch contributors');
                }

                const data = await res.json();

                setContributors(data.contributors || []);
                setRepoStats(data.stats || {
                    totalCommits: 0,
                    totalContributors: 0,
                    additions: 0,
                    deletions: 0,
                    devTime: "1+ năm"
                });

            } catch (err) {
                console.error('Error fetching contributors:', err);
                // Use fallback data when API fails
                console.log('Using fallback data...');
                setContributors(fallbackContributors);
                setRepoStats({
                    totalCommits: fallbackContributors.reduce((sum, c) => sum + c.commits, 0),
                    totalContributors: fallbackContributors.length,
                    additions: fallbackContributors.reduce((sum, c) => sum + c.additions, 0),
                    deletions: fallbackContributors.reduce((sum, c) => sum + c.deletions, 0),
                    devTime: "1+ năm"
                });
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchContributors();
    }, []);

    // Stats data - now using real data
    const stats = [
        { icon: Users, value: repoStats.totalContributors, label: "Contributors", color: "blue" },
        { icon: GitCommit, value: repoStats.totalCommits, label: "Commits", color: "emerald" },
        { icon: Clock, value: repoStats.devTime || "...", label: "Thời gian", color: "amber" },
        { icon: Heart, value: "100%", label: "Đam mê", color: "rose" }
    ];

    return (
        <div className="space-y-6 p-3 sm:p-6 pb-24">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 p-6 sm:p-8 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Clean Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center h-16 w-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/40">
                        <Award className="h-8 w-8 text-white" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                        Contributors
                    </h1>

                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                        Cảm ơn tất cả những đóng góp quý giá từ cộng đồng sinh viên Bách Khoa. <br className="hidden sm:block" />
                        Cùng nhau xây dựng TKB Smart ngày càng tốt hơn! 💜
                    </p>

                    {/* Real-time stats from GitHub - Simplified */}
                    {!loading && repoStats.additions > 0 && (
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <Plus className="h-3 w-3" />
                                {repoStats.additions.toLocaleString()}
                            </span>
                            <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                            <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                <Minus className="h-3 w-3" />
                                {repoStats.deletions.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">Không thể tải dữ liệu từ GitHub: {error}</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, idx) => {
                    const colorSchemes = {
                        blue: {
                            gradient: "from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-violet-950/20",
                            border: "border-blue-200/60 dark:border-blue-900/50",
                            iconBg: "from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700",
                            value: "text-blue-900 dark:text-blue-300",
                            text: "text-blue-600 dark:text-blue-500"
                        },
                        emerald: {
                            gradient: "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/15 dark:to-teal-950/20",
                            border: "border-emerald-200/60 dark:border-emerald-900/50",
                            iconBg: "from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700",
                            value: "text-emerald-900 dark:text-emerald-300",
                            text: "text-emerald-600 dark:text-emerald-500"
                        },
                        amber: {
                            gradient: "from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/15 dark:to-orange-950/20",
                            border: "border-amber-200/60 dark:border-amber-900/50",
                            iconBg: "from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700",
                            value: "text-amber-900 dark:text-amber-300",
                            text: "text-amber-600 dark:text-amber-500"
                        },
                        rose: {
                            gradient: "from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/20 dark:via-pink-950/15 dark:to-red-950/20",
                            border: "border-rose-200/60 dark:border-rose-900/50",
                            iconBg: "from-rose-400 to-pink-500 dark:from-rose-600 dark:to-pink-700",
                            value: "text-rose-900 dark:text-rose-300",
                            text: "text-rose-600 dark:text-rose-500"
                        }
                    };
                    const scheme = colorSchemes[stat.color];
                    const Icon = stat.icon;

                    return (
                        <div key={idx} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border} p-4 shadow-sm`}>
                            <div className="absolute -top-8 -right-8 h-20 w-20 bg-white/30 dark:bg-white/5 rounded-full blur-xl" />
                            <div className="relative flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${scheme.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-black ${scheme.value}`}>
                                        {loading ? "..." : stat.value}
                                    </p>
                                    <p className={`text-xs font-medium ${scheme.text}`}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Contributors Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-foreground">Contributors</h2>
                        <p className="text-xs text-muted-foreground">
                            Tự động cập nhật từ GitHub Repository
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl border bg-muted/30 p-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-muted" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded w-32" />
                                        <div className="h-3 bg-muted rounded w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {contributors.map((contributor, idx) => (
                            <ContributorCard
                                key={contributor.github}
                                contributor={contributor}
                                rank={idx + 1}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* How to Contribute */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 sm:p-8 text-white">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />

                <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                            <Rocket className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Muốn đóng góp?</h3>
                            <p className="text-slate-300 text-sm">Bạn cũng có thể xuất hiện trên trang này!</p>
                        </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-6">
                        Có nhiều cách để đóng góp cho TKB Smart: viết code, báo lỗi, đề xuất tính năng,
                        hoặc đơn giản là chia sẻ với bạn bè. Trang này tự động cập nhật từ GitHub!
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                        {contributionTypes.map((type, idx) => {
                            const Icon = type.icon;
                            return (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                    <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                                        <Icon className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-white/80">{type.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <a
                            href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            Xem trên GitHub
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by the community
                </p>
                <p className="text-xs text-muted-foreground">
                    © 2024 - 2026 TKB Smart • For HCMUT Students
                </p>
            </div>
        </div>
    );
}

// Contributor Card Component - Now shows real GitHub stats
function ContributorCard({ contributor, rank }) {
    const config = roleConfig[contributor.type] || roleConfig.contributor;
    const isCreator = contributor.type === "creator";
    const isCore = contributor.type === "core";

    return (
        <a
            href={`https://github.com/${contributor.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                group relative overflow-hidden rounded-2xl
                bg-gradient-to-br ${config.bgGradient}
                border ${config.borderColor}
                p-5 shadow-sm
                transition-all duration-300
                hover:shadow-xl hover:scale-[1.02]
                ${config.ring}
            `}
        >
            {/* Background decorations */}
            <div className={`absolute -top-10 -right-10 h-32 w-32 ${config.decoration1} rounded-full blur-2xl`} />
            <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${config.decoration2} rounded-full blur-2xl`} />

            {/* Rank Badge */}
            {rank <= 3 && (
                <div className={`absolute -top-1 -left-1 h-7 w-7 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xs
                    ${rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                            'bg-gradient-to-br from-amber-600 to-amber-700'}`}>
                    #{rank}
                </div>
            )}

            {/* Creator Crown */}
            {isCreator && (
                <div className="absolute -top-1 -right-1 h-8 w-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Crown className="h-4 w-4 text-white" />
                </div>
            )}

            {/* Core Member Star */}
            {isCore && (
                <div className="absolute -top-1 -right-1 h-8 w-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Star className="h-4 w-4 text-white fill-white" />
                </div>
            )}

            <div className="relative flex items-start gap-4">
                {/* Avatar */}
                <div className={`relative shrink-0 ${(isCreator || isCore) ? `ring-4 ${isCreator ? 'ring-amber-400/50' : 'ring-violet-400/50'} rounded-full` : ''}`}>
                    {contributor.avatarUrl ? (
                        <img
                            src={contributor.avatarUrl}
                            alt={contributor.github}
                            className="h-16 w-16 rounded-full object-cover shadow-lg"
                        />
                    ) : (
                        <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                            <Github className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`font-bold text-base ${config.textColor}`}>
                            @{contributor.github}
                        </span>
                        {contributor.badgeType && badgeConfig[contributor.badgeType] && (
                            <RoleBadge badgeType={contributor.badgeType} />
                        )}
                    </div>

                    <p className="text-sm text-foreground/70 dark:text-foreground/60 mb-2">
                        {contributor.name || contributor.role}
                    </p>

                    {/* Bio from GitHub */}
                    {contributor.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {contributor.bio}
                        </p>
                    )}

                    {/* Real GitHub Stats */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 font-bold">
                            <GitCommit className="h-3 w-3" />
                            {contributor.commits} commits
                        </span>
                        {contributor.additions > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium">
                                <Plus className="h-2.5 w-2.5" />
                                {contributor.additions.toLocaleString()}
                            </span>
                        )}
                        {contributor.deletions > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-medium">
                                <Minus className="h-2.5 w-2.5" />
                                {contributor.deletions.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Note for unmerged branch contributors */}
                    {contributor.note && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                            📌 {contributor.note}
                        </p>
                    )}

                    {/* GitHub Profile Stats */}
                    {(contributor.publicRepos || contributor.followers) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {contributor.publicRepos !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Code2 className="h-3 w-3" />
                                    {contributor.publicRepos} repos
                                </span>
                            )}
                            {contributor.followers !== undefined && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {contributor.followers} followers
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* External link indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </a>
    );
}

// Premium Role Badge Component
function RoleBadge({ badgeType }) {
    const badge = badgeConfig[badgeType];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 
                px-2.5 py-1 
                rounded-full 
                bg-gradient-to-r ${badge.gradient}
                ${badge.textColor}
                text-[10px] font-bold
                shadow-lg ${badge.glow}
                ${badge.animation}
                border border-white/20
                backdrop-blur-sm
            `}
        >
            <Icon className="h-3 w-3" />
            {badge.label}
        </span>
    );
}
