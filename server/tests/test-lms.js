/**
 * Test LMS Integration
 * Run: node test-lms.js
 */

const BASE_URL = 'http://localhost:3001/api';

async function test() {
    console.log('🧪 Testing LMS Integration...\n');

    // Step 1: Login to get session token
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: process.env.TEST_USER || 'YOUR_USERNAME',
            password: process.env.TEST_PASS || 'YOUR_PASSWORD'
        })
    });

    const loginData = await loginRes.json();

    if (!loginData.success) {
        console.error('❌ Login failed:', loginData.error);
        return;
    }

    console.log('✅ Login successful!');
    console.log('   User:', loginData.user?.hoTen || loginData.user?.email);

    const token = loginData.token;
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    };

    // Step 2: Initialize LMS session
    console.log('\n2️⃣ Initializing LMS session via SSO...');
    const lmsInitRes = await fetch(`${BASE_URL}/lms/init`, {
        method: 'POST',
        headers
    });

    const lmsInitData = await lmsInitRes.json();

    if (!lmsInitData.success) {
        console.error('❌ LMS init failed:', lmsInitData.error);
        console.log('   Code:', lmsInitData.code);
        return;
    }

    console.log('✅ LMS session initialized!');
    console.log('   LMS User ID:', lmsInitData.userid);
    console.log('   Cached:', lmsInitData.cached || false);

    // Step 3: Fetch messages
    console.log('\n3️⃣ Fetching LMS messages...');
    const messagesRes = await fetch(`${BASE_URL}/lms/messages?limit=10`, {
        headers
    });

    const messagesData = await messagesRes.json();

    if (!messagesData.success) {
        console.error('❌ Get messages failed:', messagesData.error);
        return;
    }

    console.log('✅ Messages fetched!');
    const conversations = messagesData.data?.conversations || [];
    console.log(`   Found ${conversations.length} conversations\n`);

    // Show first few messages
    conversations.slice(0, 5).forEach((conv, i) => {
        const sender = conv.members?.[0]?.fullname || 'Unknown';
        const lastMsg = conv.messages?.[0];
        const date = lastMsg ? new Date(lastMsg.timecreated * 1000).toLocaleDateString('vi-VN') : '';
        // Strip HTML from text
        const text = lastMsg?.text?.replace(/<[^>]+>/g, '').substring(0, 50) || '';

        console.log(`   ${i + 1}. ${sender} (${date})`);
        console.log(`      ${text}...`);
    });

    // Step 4: Get unread count
    console.log('\n4️⃣ Checking unread count...');
    const unreadRes = await fetch(`${BASE_URL}/lms/unread`, { headers });
    const unreadData = await unreadRes.json();

    if (unreadData.success) {
        console.log('✅ Unread counts:', unreadData.data);
    }

    console.log('\n✨ All tests passed!');
}

test().catch(console.error);
