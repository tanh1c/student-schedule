/**
 * 🔬 Server Performance Test Script
 * 
 * Đo lường tài nguyên server cho mỗi user session
 * Chạy: node performance-test.js
 * 
 * Yêu cầu: Server đang chạy ở localhost:3001
 */

const BASE_URL = 'http://localhost:3001';

// Colors for console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, ...args) {
    console.log(color, ...args, colors.reset);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatMs(ms) {
    if (ms < 1000) return ms.toFixed(0) + 'ms';
    return (ms / 1000).toFixed(2) + 's';
}

// Get server memory stats (requires adding endpoint to server)
async function getServerStats() {
    try {
        const res = await fetch(`${BASE_URL}/api/stats`);
        if (res.ok) {
            return await res.json();
        }
    } catch {
        return null;
    }
    return null;
}

// Measure single request
async function measureRequest(name, url, options = {}) {
    const start = performance.now();

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const end = performance.now();
        const duration = end - start;
        const status = res.status;
        const bodySize = (await res.text()).length;

        return {
            name,
            success: status >= 200 && status < 400,
            status,
            duration,
            bodySize
        };
    } catch (e) {
        return {
            name,
            success: false,
            error: e.message,
            duration: performance.now() - start
        };
    }
}

// Run performance test suite
async function runPerformanceTest() {
    log(colors.cyan, '\n╔══════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║     🔬 SERVER PERFORMANCE TEST - Resource Analysis           ║');
    log(colors.cyan, '╚══════════════════════════════════════════════════════════════╝\n');

    // Check if server is running
    log(colors.yellow, '📡 Checking server connection...');
    const healthCheck = await measureRequest('Health Check', `${BASE_URL}/api/health`);

    if (!healthCheck.success) {
        log(colors.red, '❌ Server không chạy! Hãy start server trước: cd server && npm run dev');
        process.exit(1);
    }
    log(colors.green, '✅ Server đang hoạt động\n');

    // Get initial stats
    // Test results storage
    const results = [];

    // ═══════════════════════════════════════════════════════
    // TEST 1: Basic Endpoints (No Auth)
    // ═══════════════════════════════════════════════════════
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log(colors.magenta, '  📊 TEST 1: Basic Endpoints (Không cần Auth)');
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const basicTests = [
        { name: 'GET /api/health', url: `${BASE_URL}/api/health` },
        { name: 'GET /api/stats', url: `${BASE_URL}/api/stats` },
    ];

    for (const test of basicTests) {
        const result = await measureRequest(test.name, test.url);
        results.push(result);

        const statusColor = result.success ? colors.green : colors.red;
        const statusIcon = result.success ? '✅' : '❌';

        log(statusColor, `  ${statusIcon} ${result.name}`);
        log(colors.reset, `     ├─ Status: ${result.status || 'N/A'}`);
        log(colors.reset, `     ├─ Time: ${formatMs(result.duration)}`);
        log(colors.reset, `     └─ Size: ${formatBytes(result.bodySize || 0)}\n`);
    }

    // ═══════════════════════════════════════════════════════
    // TEST 2: Simulated Load (Multiple requests)
    // ═══════════════════════════════════════════════════════
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log(colors.magenta, '  📊 TEST 2: Simulated Load (10 concurrent requests)');
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const concurrentCount = 10;
    const concurrentStart = performance.now();

    const concurrentPromises = Array(concurrentCount).fill(null).map((_, i) =>
        measureRequest(`Concurrent #${i + 1}`, `${BASE_URL}/api/health`)
    );

    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentEnd = performance.now();
    const concurrentTotalTime = concurrentEnd - concurrentStart;

    const avgTime = concurrentResults.reduce((sum, r) => sum + r.duration, 0) / concurrentResults.length;
    const maxTime = Math.max(...concurrentResults.map(r => r.duration));
    const minTime = Math.min(...concurrentResults.map(r => r.duration));
    const successCount = concurrentResults.filter(r => r.success).length;

    log(colors.cyan, `  📈 Kết quả ${concurrentCount} requests đồng thời:`);
    log(colors.reset, `     ├─ Thành công: ${successCount}/${concurrentCount}`);
    log(colors.reset, `     ├─ Tổng thời gian: ${formatMs(concurrentTotalTime)}`);
    log(colors.reset, `     ├─ Avg response: ${formatMs(avgTime)}`);
    log(colors.reset, `     ├─ Min response: ${formatMs(minTime)}`);
    log(colors.reset, `     └─ Max response: ${formatMs(maxTime)}\n`);

    // ═══════════════════════════════════════════════════════
    // TEST 3: Memory Usage Estimation
    // ═══════════════════════════════════════════════════════
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log(colors.magenta, '  📊 TEST 3: Memory Usage Analysis');
    log(colors.magenta, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const finalStats = await getServerStats();

    if (finalStats) {
        log(colors.cyan, '  💾 Server Memory Usage:');
        log(colors.reset, `     ├─ Heap Used: ${formatBytes(finalStats.memory.heapUsed)}`);
        log(colors.reset, `     ├─ Heap Total: ${formatBytes(finalStats.memory.heapTotal)}`);
        log(colors.reset, `     ├─ RSS: ${formatBytes(finalStats.memory.rss)}`);
        log(colors.reset, `     ├─ External: ${formatBytes(finalStats.memory.external)}`);
        log(colors.reset, `     └─ Active Sessions: ${finalStats.activeSessions}\n`);

        // Calculate per-session estimate
        const baseMemory = 50 * 1024 * 1024; // ~50MB base Node.js
        const currentMemory = finalStats.memory.rss;
        const sessionCount = Math.max(1, finalStats.activeSessions);
        const memoryPerSession = (currentMemory - baseMemory) / sessionCount;

        log(colors.yellow, '  📐 Ước tính tài nguyên:');
        log(colors.reset, `     ├─ Base memory (Node.js): ~50 MB`);
        log(colors.reset, `     ├─ Memory per session: ~${formatBytes(Math.max(0, memoryPerSession))}`);
        log(colors.reset, `     └─ Với Render Free (512MB RAM):\n`);

        // Predictions
        const freeRam = 512 * 1024 * 1024;
        const availableRam = freeRam - baseMemory;
        const maxSessions = Math.floor(availableRam / Math.max(memoryPerSession, 1024 * 1024)); // At least 1MB per session

        log(colors.green, `        ✅ RAM khả dụng: ${formatBytes(availableRam)}`);
        log(colors.green, `        ✅ Ước tính max sessions: ~${Math.min(maxSessions, 200)} users`);
    } else {
        log(colors.yellow, '  ⚠️  Không lấy được stats. Thêm endpoint /api/stats vào server.\n');
    }

    // ═══════════════════════════════════════════════════════
    // SUMMARY & RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════
    log(colors.cyan, '\n╔══════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║                    📋 SUMMARY & ĐÁNH GIÁ                      ║');
    log(colors.cyan, '╚══════════════════════════════════════════════════════════════╝\n');

    const totalRequests = results.length + concurrentCount;
    const totalSuccess = results.filter(r => r.success).length + successCount;

    log(colors.reset, `  📊 Tổng requests test: ${totalRequests}`);
    log(colors.reset, `  ✅ Thành công: ${totalSuccess}/${totalRequests}`);
    log(colors.reset, `  ⏱️  Avg response time: ${formatMs(avgTime)}\n`);

    // Render Free Plan Analysis
    log(colors.yellow, '  🚀 ĐÁNH GIÁ CHO RENDER FREE PLAN:');
    log(colors.reset, '  ┌─────────────────────────────────────────────────────────┐');

    if (avgTime < 200) {
        log(colors.green, '  │ ✅ Response time: TỐT (< 200ms)                        │');
    } else if (avgTime < 500) {
        log(colors.yellow, '  │ ⚠️  Response time: CHẤP NHẬN (200-500ms)               │');
    } else {
        log(colors.red, '  │ ❌ Response time: CHẬM (> 500ms)                        │');
    }

    if (finalStats && finalStats.memory.rss < 200 * 1024 * 1024) {
        log(colors.green, '  │ ✅ Memory usage: TỐT (< 200MB)                          │');
    } else if (finalStats && finalStats.memory.rss < 400 * 1024 * 1024) {
        log(colors.yellow, '  │ ⚠️  Memory usage: CẨN THẬN (200-400MB)                  │');
    } else {
        log(colors.red, '  │ ❌ Memory usage: CAO (> 400MB) - Cần tối ưu!            │');
    }

    log(colors.reset, '  └─────────────────────────────────────────────────────────┘\n');

    // Recommendations
    log(colors.cyan, '  💡 KHUYẾN NGHỊ:');
    log(colors.reset, '     1. Thêm endpoint /api/stats để monitor real-time');
    log(colors.reset, '     2. Set timeout cho các external API calls');
    log(colors.reset, '     3. Dọn dẹp sessions cũ định kỳ');
    log(colors.reset, '     4. Với 100 concurrent users: Nên upgrade plan\n');

    log(colors.green, '  ✨ Test hoàn tất!\n');
}

// Add stats endpoint to server (paste this into index.js)
const statsEndpointCode = `
// Add this endpoint to your server/index.js for monitoring
app.get('/api/stats', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
        memory: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
            external: memoryUsage.external
        },
        activeSessions: sessions.size,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});
`;

console.log('\n📝 Nếu chưa có, thêm endpoint này vào server/index.js:');
console.log(colors.cyan, statsEndpointCode, colors.reset);

// Run the test
runPerformanceTest().catch(console.error);
