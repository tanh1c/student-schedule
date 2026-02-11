import nodeFetch from 'node-fetch';
import logger from '../utils/logger.js';
import { swr, getClient } from './redisService.js';

const GITHUB_OWNER = 'tanh1c';
const GITHUB_REPO = 'student-schedule';

// Cache for 1 hour, fresh for 5 minutes
const CACHE_TTL = 3600; // 1 hour
const CACHE_FRESH = 300; // 5 minutes
const CACHE_KEY = 'github:contributors';

// Special roles for known contributors
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

// Manual contributors (not yet merged to default branch)
const manualContributors = [
    {
        github: "HThanh-how",
        commits: 8,
        note: "Commits in feature/server-refactor branch"
    }
];

// Fallback data when GitHub API is rate limited
const fallbackData = {
    contributors: [
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
    ],
    stats: {
        totalCommits: 79,
        totalContributors: 2,
        additions: 15500,
        deletions: 3100,
        devTime: "1+ năm"
    },
    _fallback: true
};

/**
 * Fetch contributors data from GitHub API with Redis caching
 */
export const getContributors = async () => {
    try {
        return await swr(CACHE_KEY, fetchContributorsFromGitHub, CACHE_TTL, CACHE_FRESH);
    } catch (error) {
        logger.warn('[GITHUB] Using fallback data due to error:', error.message);

        // Purge any cached fallback from Redis so next request retries GitHub
        try {
            const client = getClient();
            if (client?.isOpen) {
                await client.del(CACHE_KEY);
                logger.info('[GITHUB] Purged stale cache key');
            }
        } catch (e) { /* ignore */ }

        return fallbackData;
    }
};

/**
 * Internal function to fetch from GitHub API
 */
async function fetchContributorsFromGitHub() {
    logger.info('[GITHUB] Fetching contributors from GitHub API');

    // Fetch contributors list
    const contributorsRes = await nodeFetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors?per_page=50&anon=0`
    );

    if (!contributorsRes.ok) {
        const remaining = contributorsRes.headers.get('X-RateLimit-Remaining');
        const resetTime = contributorsRes.headers.get('X-RateLimit-Reset');
        logger.warn(`[GITHUB] API Error: ${contributorsRes.status}, Rate Limit Remaining: ${remaining}, Reset: ${resetTime}`);

        // THROW instead of returning fallback — so SWR doesn't cache fallback data!
        throw new Error(`GitHub API returned ${contributorsRes.status}`);
    }

    const contributorsData = await contributorsRes.json();

    // Fetch detailed stats
    let statsData = [];
    try {
        const statsRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/stats/contributors`
        );
        if (statsRes.status === 200) {
            statsData = await statsRes.json();
        }
    } catch (e) {
        logger.warn('[GITHUB] Stats API not available');
    }

    // Fetch repo info for dev time
    let devTime = "1+ năm";
    try {
        const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
        if (repoRes.ok) {
            const repoInfo = await repoRes.json();
            const createdAt = new Date(repoInfo.created_at);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now - createdAt) / (1000 * 60 * 60 * 24));

            if (diffDays > 365) {
                devTime = `${(diffDays / 365).toFixed(1)} năm`;
            } else if (diffDays > 30) {
                devTime = `${Math.floor(diffDays / 30)} tháng`;
            } else {
                devTime = `${diffDays} ngày`;
            }
        }
    } catch (e) {
        logger.warn('[GITHUB] Failed to fetch repo info');
    }

    // Enrich contributors with user info
    const enrichedContributors = await Promise.all(
        contributorsData.map(async (contributor) => {
            let userInfo = {};
            try {
                const userRes = await fetch(`https://api.github.com/users/${contributor.login}`);
                if (userRes.ok) {
                    userInfo = await userRes.json();
                }
            } catch (e) {
                logger.warn(`[GITHUB] Failed to fetch user: ${contributor.login}`);
            }

            const userStats = statsData.find(s => s.author?.login === contributor.login);
            const additions = userStats?.weeks?.reduce((sum, w) => sum + w.a, 0) || 0;
            const deletions = userStats?.weeks?.reduce((sum, w) => sum + w.d, 0) || 0;

            const special = specialRoles[contributor.login] || {};

            return {
                github: contributor.login,
                avatarUrl: contributor.avatar_url,
                commits: contributor.contributions,
                additions,
                deletions,
                role: special.role || "Contributor",
                type: special.type || "contributor",
                badgeType: special.badgeType || null,
                name: userInfo.name,
                bio: userInfo.bio,
                publicRepos: userInfo.public_repos,
                followers: userInfo.followers
            };
        })
    );

    // Add manual contributors
    for (const manual of manualContributors) {
        const existing = enrichedContributors.find(
            c => c.github.toLowerCase() === manual.github.toLowerCase()
        );

        if (!existing) {
            let userInfo = {};
            try {
                const userRes = await fetch(`https://api.github.com/users/${manual.github}`);
                if (userRes.ok) {
                    userInfo = await userRes.json();
                }
            } catch (e) { }

            const special = specialRoles[manual.github] || {};
            enrichedContributors.push({
                github: manual.github,
                avatarUrl: userInfo.avatar_url || null,
                commits: manual.commits || 0,
                additions: 0,
                deletions: 0,
                role: special.role || "Contributor",
                type: special.type || "contributor",
                badgeType: special.badgeType || null,
                note: manual.note,
                name: userInfo.name,
                bio: userInfo.bio,
                publicRepos: userInfo.public_repos,
                followers: userInfo.followers
            });
        } else {
            existing.commits = Math.max(existing.commits, manual.commits || 0);
            if (manual.note) existing.note = manual.note;
        }
    }

    // Sort by commits
    enrichedContributors.sort((a, b) => b.commits - a.commits);

    // Calculate totals
    const totalCommits = enrichedContributors.reduce((sum, c) => sum + c.commits, 0);
    const totalAdditions = enrichedContributors.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = enrichedContributors.reduce((sum, c) => sum + c.deletions, 0);

    logger.info(`[GITHUB] Fetched ${enrichedContributors.length} contributors`);

    return {
        contributors: enrichedContributors,
        stats: {
            totalCommits,
            totalContributors: enrichedContributors.length,
            additions: totalAdditions,
            deletions: totalDeletions,
            devTime
        }
    };
}

