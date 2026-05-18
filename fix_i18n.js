const fs = require('fs');

const content = fs.readFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', 'utf8');

// Find i18n block boundaries
const startIdx = content.indexOf('var i18n=');
// Find where i18n ends - look for the next var declaration after i18n
const afterStart = startIdx + 9; // after 'var i18n='

// Find the matching closing brace and semicolon
let braceCount = 0;
let endIdx = -1;
for (let i = afterStart; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            // Check if next char is ; or ,
            endIdx = i + 1;
            break;
        }
    }
}

if (endIdx === -1) {
    console.log('ERROR: Could not find end of i18n block');
    process.exit(1);
}

const oldI18n = content.substring(startIdx, endIdx);
console.log('Old i18n block length:', oldI18n.length);

// Try to evaluate it
try {
    const i18nObj = eval('(' + oldI18n.replace('var i18n=', '') + ')');
    const langs = Object.keys(i18nObj);
    console.log('Languages found:', langs.join(', '));
    langs.forEach(l => console.log(`  ${l}: ${Object.keys(i18nObj[l]).length} keys`));
    
    // Now regenerate with proper JSON
    let newParts = [];
    for (const [lang, vals] of Object.entries(i18nObj)) {
        const inner = Object.entries(vals).map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(',');
        newParts.push(`${lang}:{${inner}}`);
    }
    const newI18n = `var i18n={${newParts.join(',')}}`;
    
    // Verify the new version is valid
    try {
        eval('(' + newI18n.replace('var i18n=', '') + ')');
        console.log('New i18n: VALID JS');
    } catch (e) {
        console.log('New i18n ERROR:', e.message);
        process.exit(1);
    }
    
    // Replace in content
    const newContent = content.substring(0, startIdx) + newI18n + content.substring(endIdx);
    
    // Also need to check if there's a stray ; after the old i18n that we need to handle
    // Look for currentLang after the replacement
    const checkIdx = newContent.indexOf('currentLang', startIdx + newI18n.length);
    console.log('currentLang found at:', checkIdx, checkIdx > 0 ? 'OK' : 'MISSING');
    
    fs.writeFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', newContent, 'utf8');
    console.log('Written successfully!');
    
} catch (e) {
    console.log('EVAL ERROR:', e.message);
    
    // Fallback: just extract zh/en from the original HTML and rebuild
    // The problem is the injected translations have unescaped quotes
    // Let's use the JSON file instead
    const translations = JSON.parse(fs.readFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/i18n_new.json', 'utf8'));
    
    // Extract zh/en using regex on original content
    const zhMatch = content.match(/zh:\{([^}]+)\}/);
    const enMatch = content.match(/en:\{([^}]+)\}/);
    
    if (!zhMatch || !enMatch) {
        console.log('Cannot extract zh/en blocks');
        process.exit(1);
    }
    
    function parseKv(block) {
        const result = {};
        // Handle both 'value' and "value" formats
        for (const m of block.matchAll(/(\w+):["']((?:[^"'\\]|\\.)*)["']/g)) {
            result[m[1]] = m[2];
        }
        return result;
    }
    
    const zh = parseKv(zhMatch[1]);
    const en = parseKv(enMatch[1]);
    console.log(`Extracted zh: ${Object.keys(zh).length}, en: ${Object.keys(en).length} keys`);
    
    const allTranslations = {zh, en, ...translations};
    
    let newParts = [];
    for (const [lang, vals] of Object.entries(allTranslations)) {
        const inner = Object.entries(vals).map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(',');
        newParts.push(`${lang}:{${inner}}`);
    }
    const newI18n = `var i18n={${newParts.join(',')}}`;
    
    // Verify
    try {
        eval('(' + newI18n.replace('var i18n=', '') + ')');
        console.log('Rebuilt i18n: VALID JS');
    } catch (e2) {
        console.log('Rebuilt i18n STILL INVALID:', e2.message);
        process.exit(1);
    }
    
    // Find and replace entire i18n block
    const newContent = content.substring(0, startIdx) + newI18n + ';' + content.substring(endIdx);
    fs.writeFileSync('C:/Users/Administrator/.qclaw/workspace/product-website/index.html', newContent, 'utf8');
    console.log('Written successfully (fallback method)!');
}
