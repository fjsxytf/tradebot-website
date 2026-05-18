const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', 'utf8');
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
while ((match = scriptRegex.exec(c)) !== null) {
  const content = match[1].trim();
  if (content.length < 1000) continue;
  try {
    new Function(content);
    console.log('VALID JS (length:', content.length, ')');
  } catch (e) {
    console.log('SYNTAX ERROR:', e.message, '(length:', content.length, ')');
    // Find position
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      console.log('Context:', JSON.stringify(content.substring(Math.max(0,pos-80), pos+80)));
    }
  }
}
