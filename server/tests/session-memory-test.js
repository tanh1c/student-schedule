/**
 * 🔬 Session Memory Test
 * 
 * Đo lường chính xác memory tiêu tốn cho mỗi session
 * để tính toán MAX_SESSIONS tối ưu cho Render Free Plan
 * 
 * Chạy: node session-memory-test.js
 */

const BASE_URL = 'http://localhost:3001';

async function getStats() {
    const res = await fetch(`${BASE_URL}/api/stats`);
    return await res.json();
}

function formatMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🔬 SESSION MEMORY ANALYSIS - Tính toán MAX_SESSIONS      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Get current stats
    const stats = await getStats();

    console.log('📊 THÔNG TIN SERVER HIỆN TẠI:\n');
    console.log('  💾 Memory Usage:');
    console.log(`     ├─ Heap Used: ${stats.memory.heapUsedMB} MB`);
    console.log(`     ├─ RSS: ${stats.memory.rssMB} MB`);
    console.log(`     └─ Per Session: ${stats.memory.memoryPerSessionMB} MB\n`);

    console.log('  👥 Sessions:');
    console.log(`     ├─ Active: ${stats.sessions.active}`);
    console.log(`     ├─ Max: ${stats.sessions.max}`);
    console.log(`     └─ Available: ${stats.sessions.available}\n`);

    console.log('  ⚙️  Config:');
    console.log(`     ├─ Session Timeout: ${stats.config.sessionTimeoutMinutes} phút`);
    console.log(`     ├─ Cleanup Interval: ${stats.config.cleanupIntervalMinutes} phút`);
    console.log(`     └─ Max Sessions: ${stats.config.maxSessions}\n`);

    console.log('  ⏱️  Uptime:', stats.uptimeHuman, '\n');

    // Calculate optimal MAX_SESSIONS for Render Free
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📐 TÍNH TOÁN MAX_SESSIONS CHO RENDER FREE (512MB RAM):\n');

    const RENDER_FREE_RAM = 512 * 1024 * 1024;  // 512MB
    const BASE_MEMORY = 70 * 1024 * 1024;        // ~70MB base (Node.js + modules)
    const SAFETY_BUFFER = 50 * 1024 * 1024;      // 50MB buffer để tránh crash
    const AVAILABLE_FOR_SESSIONS = RENDER_FREE_RAM - BASE_MEMORY - SAFETY_BUFFER;

    // Estimate memory per session based on current data
    const currentRSS = parseFloat(stats.memory.rssMB) * 1024 * 1024;
    const currentSessions = stats.sessions.active;

    // If we have active sessions, use real data; otherwise estimate
    let estimatedMemoryPerSession;
    if (currentSessions > 0) {
        estimatedMemoryPerSession = (currentRSS - BASE_MEMORY) / currentSessions;
        console.log(`  📈 Dựa trên dữ liệu thực (${currentSessions} sessions):`);
    } else {
        // Estimate based on typical session structure
        estimatedMemoryPerSession = 8 * 1024 * 1024; // ~8MB per session (conservative)
        console.log('  📈 Ước tính (chưa có session active):');
    }

    console.log(`     ├─ Render Free RAM: ${formatMB(RENDER_FREE_RAM)}`);
    console.log(`     ├─ Base Memory: ${formatMB(BASE_MEMORY)}`);
    console.log(`     ├─ Safety Buffer: ${formatMB(SAFETY_BUFFER)}`);
    console.log(`     ├─ Available for Sessions: ${formatMB(AVAILABLE_FOR_SESSIONS)}`);
    console.log(`     └─ Est. Memory per Session: ${formatMB(estimatedMemoryPerSession)}\n`);

    const optimalMaxSessions = Math.floor(AVAILABLE_FOR_SESSIONS / estimatedMemoryPerSession);
    const conservativeMaxSessions = Math.floor(optimalMaxSessions * 0.8); // 80% for safety

    console.log('  🎯 KẾT QUẢ:');
    console.log(`     ├─ Optimal MAX_SESSIONS: ${optimalMaxSessions}`);
    console.log(`     └─ Khuyến nghị (đã trừ 20% buffer): ${conservativeMaxSessions}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 KHUYẾN NGHỊ:\n');

    if (conservativeMaxSessions >= 40) {
        console.log(`  ✅ Đặt MAX_SESSIONS = ${conservativeMaxSessions}`);
        console.log('  ✅ Server có thể phục vụ nhiều users cùng lúc');
    } else if (conservativeMaxSessions >= 20) {
        console.log(`  ⚠️  Đặt MAX_SESSIONS = ${conservativeMaxSessions}`);
        console.log('  ⚠️  Đủ cho lượng truy cập vừa phải');
    } else {
        console.log(`  ❌ MAX_SESSIONS rất thấp (${conservativeMaxSessions})`);
        console.log('  ❌ Cần tối ưu thêm hoặc upgrade plan');
    }

    console.log('\n  📝 Để áp dụng, sửa trong server/index.js:');
    console.log(`     const MAX_SESSIONS = ${conservativeMaxSessions};`);
    console.log('\n✨ Phân tích hoàn tất!\n');
}

main().catch(console.error);
