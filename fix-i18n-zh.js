const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. 找到 i18n 对象，清空 zh 对象
const i18nStart = html.indexOf('var i18n = {');
if (i18nStart === -1) {
  console.log('❌ Cannot find "var i18n"');
  process.exit(1);
}

// 找到 i18n 对象的结束位置
let depth = 0;
let i18nEnd = i18nStart + 'var i18n = {'.length;
for (let i = i18nEnd; i < html.length; i++) {
  if (html[i] === '{') depth++;
  if (html[i] === '}') {
    depth--;
    if (depth === 0) {
      i18nEnd = i + 1;
      break;
    }
  }
}

const i18nStr = html.substring(i18nStart, i18nEnd);
console.log('📊 Found i18n object (length:', i18nStr.length, 'chars)');

// 2. 替换 zh: {...} 为 zh: {}
const zhRegex = /zh\s*:\s*\{[^}]*([^}]*\}[^}]*\})/;  // 匹配 zh: { ... }
const newI18nStr = i18nStr.replace(/zh\s*:\s*\{[\s\S]*?\}\s*,\s*en:/, 'zh: {},\n      en:');

if (newI18nStr === i18nStr) {
  console.log('⚠️ zh object not found or already empty');
} else {
  console.log('✅ Emptied zh object');
  html = html.replace(i18nStr, newI18nStr);
}

// 3. 保存
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ index.html updated');
console.log('🎯 zh object is now empty, en object preserved');
