const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. 删除旧的 hash 检测代码（如果存在）
const oldHashCode = /\(function\(\)\s*\{\s*var hash[\s\S]*?\}\)\(\);/;
if (oldHashCode.test(html)) {
  html = html.replace(oldHashCode, '');
  console.log('✅ Removed old hash detection code');
}

// 2. 添加新的 hash 检测代码（在 </script> 前，用 DOMContentLoaded 确保页面加载完）
const newHashCode = `
  
  // Auto-detect language from URL hash (e.g., #en, #zh)
  window.addEventListener('DOMContentLoaded', function() {
    var hash = window.location.hash.replace('#', '') || 'zh';
    console.log('[i18n] Hash detected:', hash);
    if (typeof i18n !== 'undefined' && i18n[hash]) {
      console.log('[i18n] Switching to:', hash);
      if (typeof setLang === 'function') {
        setLang(hash);
      }
    }
  });
  `;

html = html.replace('</script>', newHashCode + '\n  </script>');
console.log('✅ Added new hash detection code (DOMContentLoaded)');

// 3. 确保 currentLang 有默认值
if (!html.includes('var currentLang')) {
  html = html.replace('var i18n = {', 'var currentLang = "zh";\n  var i18n = {');
  console.log('✅ Added currentLang initialization');
}

// 保存
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ index.html updated');
