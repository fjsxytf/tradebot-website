const https = require('https');
https.get('https://changjiaofeng.com', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    while ((match = scriptRegex.exec(d)) !== null) {
      const content = match[1].trim();
      if (content.length < 1000) continue;
      
      // Find the = error by checking from the i18n end
      const i18nEnd = content.indexOf("noteAvax:");
      if (i18nEnd === -1) {
        console.log('noteAvax not found');
        return;
      }
      
      // Show 200 chars around and after the i18n closing
      const afterI18n = content.substring(i18nEnd, i18nEnd + 300);
      console.log('Around noteAvax + after:', afterI18n);
      
      // Try parsing from after i18n
      const closeBrace = content.indexOf('};', i18nEnd);
      if (closeBrace === -1) {
        console.log('No }; found after noteAvax');
        return;
      }
      
      const afterClose = content.substring(closeBrace, closeBrace + 200);
      console.log('\nAfter }; :', afterClose);
      
      // The issue: after i18n block, there should be var currentLang=...
      // But maybe the ; is missing or misplaced
      break;
    }
  });
});
