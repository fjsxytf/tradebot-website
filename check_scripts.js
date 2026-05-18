const https = require('https');
https.get('https://changjiaofeng.com', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Extract all script blocks
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    let scriptNum = 0;
    while ((match = scriptRegex.exec(d)) !== null) {
      scriptNum++;
      const content = match[1].trim();
      if (content.length < 10) continue; // skip empty/tiny scripts
      
      console.log(`\n--- Script #${scriptNum} (length: ${content.length}) ---`);
      
      try {
        new Function(content);
        console.log('VALID JS');
      } catch (e) {
        console.log('SYNTAX ERROR:', e.message);
        // Find error location
        const lines = content.split('\n');
        console.log('Total lines:', lines.length);
        // Show context around potential error
        const errMatch = e.message.match(/position (\d+)/);
        if (errMatch) {
          const pos = parseInt(errMatch[1]);
          const context = content.substring(Math.max(0, pos - 50), pos + 50);
          console.log('Error context:', JSON.stringify(context));
        }
      }
    }
  });
});
