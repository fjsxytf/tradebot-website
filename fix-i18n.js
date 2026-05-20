const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. 删除重复的 i18n 对象
// 找到第一个 i18n 对象的位置
const firstVar = html.indexOf('var i18n = {');
if (firstVar === -1) {
  console.log('❌ Cannot find first "var i18n"');
  process.exit(1);
}

// 找到第二个 i18n 对象的位置
const secondVar = html.indexOf('var i18n = {', firstVar + 10);
if (secondVar === -1) {
  console.log('✅ No duplicate found, only one i18n object');
} else {
  console.log('🔍 Found duplicate i18n at position', secondVar);
  
  // 找到第二个 i18n 对象的结束位置（匹配 `  };\n`）
  let depth = 0;
  let endPos = secondVar + 'var i18n = {'.length;
  for (let i = endPos; i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}') {
      depth--;
      if (depth === 0 && html.substring(i, i+3) === '}; ') {
        endPos = i + 3;
        break;
      }
    }
  }
  
  // 删除第二个 i18n 对象
  html = html.slice(0, secondVar) + html.slice(endPos);
  console.log('✅ Removed duplicate i18n object');
}

// 2. 确保语言切换逻辑正确
// 查找是否有读取 window.location.hash 的代码
if (!html.includes('location.hash') && !html.includes('window.location.hash')) {
  console.log('⚠️ No hash reading code found, adding...');
  
  // 在 </script> 前插入 hash 读取代码
  const hashCode = `
  // Auto-detect language from URL hash (e.g., #en, #zh)
  (function() {
    var hash = window.location.hash.replace('#', '') || 'zh';
    if (i18n[hash]) {
      setLang(hash);
    }
  })();
  `;
  
  html = html.replace('</script>', hashCode + '\n  </script>');
  console.log('✅ Added URL hash detection code');
} else {
  console.log('✅ Hash reading code already exists');
}

// 保存
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ index.html updated');
