const { exec } = require('child_process');
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = "8675691795:AAF67pPyk5SBZIablEZ71j7oRCIIC6mIhqE";  // تم إزالة الفاصلة المنقوطة الغريبة

// تعيين Webhook لـ Telegram باستخدام الرابط الجديد لـ Bonto.dev
const https = require('https');
const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=https://thyezenali.bonto.run/webhook`;

https.get(url, (res) => {
    console.log(`✅ تم تعيين الـ Webhook. سيعمل البوت عبر المنفذ ${PORT}`);
    exec(`node server.js`, (error, stdout, stderr) => {
        if (error) console.error(`خطأ: ${error}`);
        console.log(stdout);
        console.error(stderr);
    });
});
