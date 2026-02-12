PS C:\Users\LG\Desktop\Study Material\AI\TKBSV\server> node performance-test.js 

📝 Nếu chưa có, thêm endpoint này vào server/index.js:
 
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
 

╔══════════════════════════════════════════════════════════════╗
 ║     🔬 SERVER PERFORMANCE TEST - Resource Analysis           ║
 ╚══════════════════════════════════════════════════════════════╝

 📡 Checking server connection...
 ✅ Server đang hoạt động

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
   📊 TEST 1: Basic Endpoints (Không cần Auth)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ GET /api/health
      ├─ Status: 200
      ├─ Time: 2ms
      └─ Size: 15 B

   ✅ GET /api/stats
      ├─ Status: 200
      ├─ Time: 2ms
      └─ Size: 174 B

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 TEST 2: Simulated Load (10 concurrent requests)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📈 Kết quả 10 requests đồng thời: 
      ├─ Thành công: 10/10 
      ├─ Tổng thời gian: 20ms
      ├─ Avg response: 13ms
      ├─ Min response: 5ms
      └─ Max response: 15ms

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 TEST 3: Memory Usage Analysis
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   💾 Server Memory Usage:
      ├─ Heap Used: 18.68 MB
      ├─ Heap Total: 19.62 MB
      ├─ RSS: 68.94 MB
      ├─ External: 3.63 MB
      └─ Active Sessions: 0

   📐 Ước tính tài nguyên:
      ├─ Base memory (Node.js): ~50 MB
      ├─ Memory per session: ~18.94 MB
      └─ Với Render Free (512MB RAM):

         ✅ RAM khả dụng: 462.00 MB
         ✅ Ước tính max sessions: ~24 users

╔══════════════════════════════════════════════════════════════╗
 ║                    📋 SUMMARY & ĐÁNH GIÁ                      ║
 ╚══════════════════════════════════════════════════════════════╝

   📊 Tổng requests test: 12
   ✅ Thành công: 12/12
   ⏱️  Avg response time: 13ms

   🚀 ĐÁNH GIÁ CHO RENDER FREE PLAN:
   ┌─────────────────────────────────────────────────────────┐
   │ ✅ Response time: TỐT (< 200ms)                        │
   │ ✅ Memory usage: TỐT (< 200MB)                          │
   └─────────────────────────────────────────────────────────┘

   💡 KHUYẾN NGHỊ:
      1. Thêm endpoint /api/stats để monitor real-time
      2. Set timeout cho các external API calls
      3. Dọn dẹp sessions cũ định kỳ
      4. Với 100 concurrent users: Nên upgrade plan

   ✨ Test hoàn tất!