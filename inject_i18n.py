import json, re

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\i18n_new.json", "r", encoding="utf-8") as f:
    translations = json.load(f)

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "r", encoding="utf-8") as f:
    content = f.read()

def to_js(obj):
    parts = []
    for lang, vals in obj.items():
        pairs = ", ".join(f"{k}:{json.dumps(v, ensure_ascii=False)}" for k, v in vals.items())
        parts.append(f"{lang}:{{{pairs}}}")
    return ", ".join(parts)

js_str = to_js(translations)

# Find insertion point: after the en block ends, before var currentLang
marker = "fast confirmations'}}"
idx = content.find(marker)
if idx == -1:
    print("ERROR: marker not found")
    exit(1)

insert_pos = idx + len(marker)  # right after the closing }}
new_content = content[:insert_pos] + "," + js_str + content[insert_pos:]

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"SUCCESS: Injected 7 languages ({len(translations)} langs, {len(next(iter(translations.values())))} keys each)")

# Verify
with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "r", encoding="utf-8") as f:
    verify = f.read()
for lang in ["ja", "ko", "ru", "tr", "vi", "es", "pt"]:
    if f"{lang}:{{" in verify:
        print(f"  {lang}: found in index.html")
    else:
        print(f"  {lang}: MISSING!")
