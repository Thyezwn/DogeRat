const { exec } = require('child_process');

// تأكد أن المنفذ هو الذي يعطيه رايلواي
const PORT = process.env.PORT || 3000;

// هذا السطر سيقوم بتشغيل ملف السيرفر الأصلي الخاص بك
const child = exec(`node server.js`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

// طباعة المنفذ للتأكد
console.log(`Starting bot on port: ${PORT}`);
