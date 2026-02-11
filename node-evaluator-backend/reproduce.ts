
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAuthGuest() {
    console.log('Testing Auth Guest Login...');
    try {
        const res = await fetch(`${BASE_URL}/auth/guest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Guest', id: 'test-guest-id' }),
        });
        console.log(`Auth Guest Status: ${res.status}`);
        const data = await res.json();
        console.log('Auth Guest Data:', data);
    } catch (err) {
        console.error('Auth Guest Failed:', err);
    }
}

async function testChatMessage() {
    console.log('\nTesting Chat Message...');
    try {
        const res = await fetch(`${BASE_URL}/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: 'test-convo-id',
                sender: 'user',
                content: { text: 'Hello world' },
                userId: 'test-user-id'
            }),
        });
        console.log(`Chat Message Status: ${res.status}`);
        const text = await res.text();
        console.log('Chat Message Body:', text);
    } catch (err) {
        console.error('Chat Message Failed:', err);
    }
}

async function run() {
    await testAuthGuest();
    await testChatMessage();
}

run();
