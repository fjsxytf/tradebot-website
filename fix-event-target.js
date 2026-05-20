const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 修复 setLang() 中的 event.target 问题
// 原代码: event.target.classList.add('active')
// 改为: 安全调用，如果没有 event.target 就跳过

const oldSetLang = 'event.target.classList.add("active")';
const newSetLang = 'if(event&&event.target)event.target.classList.add("active")';

// 也检查单引号版本
let count = 0;
while (html.includes(oldSetLang)) {
  html = html.replace(oldSetLang, newSetLang);
  count++;
}
// 单引号版本
const oldSetLang2 = "event.target.classList.add('active')";
const newSetLang2 = "if(event&&event.target)event.target.classList.add('active')";
while (html.includes(oldSetLang2)) {
  html = html.replace(oldSetLang2, newSetLang2);
  count++;
}

if (count > 0) {
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✅ Fixed event.target in setLang() -', count, 'replacement(s)');
} else {
  console.log('⚠️ event.target not found');
  // 尝试查找 setLang 函数中的 event.target
  const idx = html.indexOf('event.target');
  if (idx !== -1) {
    console.log('Found event.target at position', idx);
    console.log('Context:', html.substring(idx - 20, idx + 50));
  }
}
