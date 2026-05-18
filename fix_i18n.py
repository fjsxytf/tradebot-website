import json, re

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "r", encoding="utf-8") as f:
    content = f.read()

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\i18n_new.json", "r", encoding="utf-8") as f:
    translations = json.load(f)

# Extract existing zh and en from index.html
# Parse the i18n object by evaluating it
m = re.search(r'var i18n=(\{[\s\S]*?\});\s*var currentLang', content)
if not m:
    print("ERROR: i18n block not found")
    exit(1)

i18n_str = m.group(1)

# Replace single-quoted values with double-quoted (JSON-compatible)
# This is tricky because values contain single quotes. Let's use a different approach:
# Parse by extracting zh and en blocks separately

# Extract zh key-value pairs
zh_match = re.search(r'zh:\{(.+?)\},en:\{', i18n_str, re.DOTALL)
en_match = re.search(r'en:\{(.+?)\}(?:,|\s*$)', i18n_str, re.DOTALL)

def parse_kv_block(block):
    """Parse key:'value' pairs from a JS object block"""
    result = {}
    # Match key:'value' where value may contain escaped quotes
    for m in re.finditer(r"(\w+):'((?:[^'\\]|\\.)*)'", block):
        result[m.group(1)] = m.group(2)
    return result

zh_data = parse_kv_block(zh_match.group(1))
en_data = parse_kv_block(en_match.group(1))

print(f"zh: {len(zh_data)} keys, en: {len(en_data)} keys")

# Build new i18n object as proper JSON
all_translations = {"zh": zh_data, "en": en_data}
all_translations.update(translations)

# Generate as valid JS using double quotes
def to_js_obj(obj):
    parts = []
    for lang, vals in obj.items():
        inner = ", ".join(f'{k}:{json.dumps(v, ensure_ascii=False)}' for k, v in vals.items())
        parts.append(f'{lang}:{{{inner}}}')
    return "{" + ", ".join(parts) + "}"

new_i18n_js = f"var i18n={to_js_obj(all_translations)};"

# Replace old i18n block
new_content = content[:m.start()] + new_i18n_js + content[m.end():]

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "w", encoding="utf-8") as f:
    f.write(new_content)

# Verify
with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "r", encoding="utf-8") as f:
    verify = f.read()

vm = re.search(r'var i18n=(\{[\s\S]*?\});\s*var currentLang', verify)
if vm:
    try:
        # Test if it's valid JS by parsing it
        import subprocess
        result = subprocess.run(["node", "-e", f"var i18n={vm.group(1)}; console.log(Object.keys(i18n).join(','))"], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"SUCCESS! Valid JS. Languages: {result.stdout.strip()}")
            # Check key counts
            result2 = subprocess.run(["node", "-e", f"var i18n={vm.group(1)}; Object.keys(i18n).forEach(l=>console.log(l+':'+Object.keys(i18n[l]).length))"], 
                                   capture_output=True, text=True, timeout=5)
            print(result2.stdout.strip())
        else:
            print(f"JS ERROR: {result.stderr[:300]}")
    except Exception as e:
        print(f"Verify error: {e}")
else:
    print("ERROR: i18n block not found after rewrite")
