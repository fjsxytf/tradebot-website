const https = require('https');
https.get('https://changjiaofeng.com', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const idx = d.indexOf('var i18n=');
    if (idx === -1) { console.log('i18n not found'); return; }
    
    // Find matching brace
    let braceCount = 0;
    let endIdx = -1;
    for (let i = idx + 9; i < d.length; i++) {
      if (d[i] === '{') braceCount++;
      if (d[i] === '}') {
        braceCount--;
        if (braceCount === 0) { endIdx = i + 1; break; }
      }
    }
    
    const i18nBlock = d.substring(idx, endIdx);
    console.log('i18n block length:', i18nBlock.length);
    
    // Try to eval
    try {
      eval('var i18nTest=' + i18nBlock.replace('var i18n=', ''));
      console.log('i18n VALID! Languages:', Object.keys(i18nTest).join(', '));
    } catch (e) {
      console.log('i18n SYNTAX ERROR:', e.message);
      // Find the error location
      const first100 = i18nBlock.substring(0, 200);
      console.log('First 200 chars:', first100);
    }
    
    // Check if toggleChat exists
    if (d.includes('function toggleChat')) {
      console.log('toggleChat: FOUND');
    } else {
      console.log('toggleChat: MISSING');
    }
    
    // Check for any obvious JS errors after i18n
    const afterI18n = d.substring(endIdx, endIdx + 500);
    console.log('After i18n (first 300):', afterI18n.substring(0, 300));
  });
});
