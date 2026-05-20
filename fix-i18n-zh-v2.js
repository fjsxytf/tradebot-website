const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 1. 找到 i18n 对象
const i18nStart = html.indexOf('var i18n = {');
if (i18nStart === -1) {
  console.log('❌ Cannot find "var i18n"');
  process.exit(1);
}

// 2. 找到 i18n 对象的结束位置（匹配最外层的 }）
let depth = 0;
let i18nEnd = i18nStart + 'var i18n = '.length;
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
console.log('📊 i18n object length:', i18nStr.length, 'chars');

// 3. 找到 zh: { 的位置
const zhStart = i18nStr.indexOf('zh:{');
if (zhStart === -1) {
  console.log('⚠️ zh: { not found, might already be empty');
} else {
  // 4. 找到匹配的结束 }
  let zhDepth = 0;
  let zhEnd = zhStart + 'zh:'.length;
  for (let i = zhEnd; i < i18nStr.length; i++) {
    if (i18nStr[i] === '{') zhDepth++;
    if (i18nStr[i] === '}') {
      if (zhDepth === 0) {
        zhEnd = i + 1;
        break;
      }
      zhDepth--;
    }
  }
  
  // 5. 替换为 zh: {}
  const newI18nStr = i18nStr.substring(0, zhStart) + 'zh:{}' + i18nStr.substring(zhEnd);
  console.log('✅ Replaced zh object with empty {}');
  
  // 6. 写回文件
  const newHtml = html.substring(0, i18nStart) + newI18nStr + html.substring(i18nEnd);
  fs.writeFileSync('index.html', newHtml, 'utf8');
  console.log('✅ index.html updated');
}
