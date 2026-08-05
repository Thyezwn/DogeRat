const { exec } = require('child_process');
const PORT = process.env.PORT || 3000;
const BOT_TOKEN ="8675691795:AAF67pPyk5SBZIablEZ71j7oRCIIC6mIhqE؛"

// 1. نقوم بإخبار تليجرام بأن البوت سيستخدم Webhook وتحديد الرابط الخاص بك
const https = require('https');
const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=https://اسم_مشروعك.railway.app/webhook`;

https.get(url, (res) => {
    console.log(`✅ تم تعيين الـ Webhook. سيعمل البوت عبر المنفذ ${PORT}`);
    // 2. بعد تعيين الويب هوك، نقوم بتشغيل ملف السيرفر الأصلي
    exec(`node server.js`, (error, stdout, stderr) => {
        if (error) console.error(`خطأ: ${error}`);
        console.log(stdout);
        console.error(stderr);
    });
});
