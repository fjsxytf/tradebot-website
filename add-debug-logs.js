const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. 在 setLang() 函数里加调试日志
html = html.replace(
  'function setLang(lang){',
  `function setLang(lang){
    console.log('[setLang] Called with:', lang);
    console.log('[setLang] i18n object:', typeof i18n, i18n ? Object.keys(i18n) : 'undefined');
    console.log('[setLang] i18n[lang] exists:', i18n && i18n[lang] ? 'YES' : 'NO');
    console.log('[setLang] updatePageLanguage exists:', typeof updatePageLanguage);`
);

// 2. 在 updatePageLanguage() 函数里加调试日志
html = html.replace(
  'function updatePageLanguage(){',
  `function updatePageLanguage(){
    console.log('[updatePageLanguage] currentLang:', currentLang);
    console.log('[updatePageLanguage] i18n[currentLang]:', i18n && i18n[currentLang] ? Object.keys(i18n[currentLang]).length + ' keys' : 'undefined');
    var t=i18n[currentLang]||i18n['en'];
    console.log('[updatePageLanguage] Translations object t:', t ? Object.keys(t).length + ' keys' : 'undefined');
    var elements = document.querySelectorAll('[data-i18n]');
    console.log('[updatePageLanguage] Found', elements.length, '[data-i18n] elements');`
);

// 3. 在 hash 检测代码里加调试日志
html = html.replace(
  "console.log('[i18n] Hash detected:', hash);",
  "console.log('[i18n] Hash detected:', hash);\n    console.log('[i18n] i18n object:', typeof i18n);\n    console.log('[i18n] i18n[hash] exists:', i18n && i18n[hash] ? 'YES' : 'NO');"
);

// 保存
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ Added debug logs to setLang(), updatePageLanguage(), and hash detection');
console.log('📋 User should open browser console (F12) to see these logs');
