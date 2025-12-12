const mongoose = require('mongoose');
const http = require('http');
const User = require('./models/User');

// Configuration
const PORT = 5004;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyslexia_detection';

// Helpers
function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Failed to parse JSON:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function verify() {
    console.log('🚀 Starting Chatbot Verification...');

    try {
        // 1. Connect to DB to get/create a user
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);

        let user = await User.findOne({ email: 'test_chat_user@example.com' });
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                firstName: 'Test',
                lastName: 'ChatUser',
                email: 'test_chat_user@example.com',
                password: 'Password123!',
                role: 'student'
            });
        }
        console.log('✅ User ready:', user._id);

        // 2. Test Hello (Normal)
        console.log('\nTesting "Hello" message...');
        const resHello = await makeRequest('/chat', 'POST', {
            userId: user._id,
            message: 'Hello'
        });

        if (resHello.status === 'success' && !resHello.data.isFlagged) {
            console.log('✅ "Hello" test passed:', resHello.data.response);
        } else {
            console.error('❌ "Hello" test failed:', resHello);
        }

        // 3. Test Problem (Flagged)
        console.log('\nTesting "Problem" message...');
        const resProblem = await makeRequest('/chat', 'POST', {
            userId: user._id,
            message: 'I have a big problem with the game.'
        });

        if (resProblem.status === 'success' && resProblem.data.isFlagged) {
            console.log('✅ "Problem" test passed (Flagged set to true):', resProblem.data.response);
        } else {
            console.error('❌ "Problem" test failed:', resProblem);
        }

        // 4. Test Context (Follow-up)
        console.log('\nTesting Context Flow (Problem -> Detail)...');

        // Create a dedicated user for context test to avoid state interference from previous tests
        const contextUserId = new mongoose.Types.ObjectId();
        // We can just use a random ID, code uses default "guest" if not found or just strings ID.
        // Actually code uses userId.toString(). db/schema expects ObjectId.

        // First trigger the problem state
        await makeRequest('/chat', 'POST', {
            userId: contextUserId,
            message: 'I have a problem'
        });

        // Then send detail
        const resDetail = await makeRequest('/chat', 'POST', {
            userId: contextUserId,
            message: 'The game freezes on level 2'
        });

        if (resDetail.status === 'success' && resDetail.data.response.includes('logged that for the consultant')) {
            console.log('✅ Context test passed:', resDetail.data.response);
        } else {
            console.error('❌ Context test failed:', resDetail.data.response);
        }

        // 5. Test Admin Route
        console.log('\nTesting Admin View...');
        const resAdmin = await makeRequest('/chat/admin/flagged', 'GET');

        // Check if our detail message is flagged (logic says yes)
        const found = resAdmin.data && resAdmin.data.some(msg => msg.message === 'The game freezes on level 2');

        if (found) {
            console.log('✅ Admin verification passed: Contextual flagged message found.');
        } else {
            console.error('❌ Admin verification failed: Contextual message not found.');
        }

        console.log('\n🎉 Verification Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Verification Error:', err);
        process.exit(1);
    }
}

verify();
