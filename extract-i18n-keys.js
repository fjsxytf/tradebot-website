const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 提取所有 data-i18n="..." 的 key
const keys = new Set();
const regex = /data-i18n="([^"]+)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  keys.add(m[1]);
}

// 按字母顺序输出
const sorted = Array.from(keys).sort();
fs.writeFileSync('i18n-keys.txt', sorted.join('\n'), 'utf8');
console.log('Found ' + sorted.length + ' keys. Saved to i18n-keys.txt');
sorted.forEach(k => console.log(k));
