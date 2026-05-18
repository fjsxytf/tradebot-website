const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', 'utf8');
const idx = c.indexOf('var i18n=');

// Find matching closing brace
let braceCount = 0;
let endIdx = -1;
for (let i = idx + 9; i < c.length; i++) {
    if (c[i] === '{') braceCount++;
    if (c[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }
}

const i18nBlock = c.substring(idx, endIdx);
console.log('i18n block length:', i18nBlock.length);

// Try eval
try {
    eval('var i18n2=' + i18nBlock.replace('var i18n=', ''));
    const zhKeys = Object.keys(i18n2.zh).sort();
    const enKeys = Object.keys(i18n2.en).sort();
    const missing = zhKeys.filter(k => !enKeys.includes(k));
    console.log('en missing keys:', missing);
    
    // Fix: copy missing keys
    missing.forEach(k => { i18n2.en[k] = i18n2.zh[k]; });
    console.log('Fixed en:', Object.keys(i18n2.en).length, 'keys');
    
    // All languages should have same key count
    for (const [lang, vals] of Object.entries(i18n2)) {
        const diff = zhKeys.filter(k => !Object.keys(vals).includes(k));
        if (diff.length > 0) {
            console.log(`${lang} missing:`, diff);
            diff.forEach(k => { vals[k] = i18n2.zh[k]; });
        }
    }
    
    // Rebuild
    let newParts = [];
    for (const [lang, vals] of Object.entries(i18n2)) {
        const inner = Object.entries(vals).map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(',');
        newParts.push(`${lang}:{${inner}}`);
    }
    const newI18n = `var i18n={${newParts.join(',')}}`;
    
    // Verify
    eval('var i18n3=' + newI18n.replace('var i18n=', ''));
    console.log('All languages:', Object.keys(i18n3).join(', '));
    for (const [l, v] of Object.entries(i18n3)) {
        console.log(`  ${l}: ${Object.keys(v).length} keys`);
    }
    
    const newContent = c.substring(0, idx) + newI18n + c.substring(endIdx);
    fs.writeFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', newContent, 'utf8');
    console.log('Done!');
} catch (e) {
    console.log('EVAL ERROR:', e.message);
    process.exit(1);
}
