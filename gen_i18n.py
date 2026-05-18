import json, re, urllib.request

API_KEY = "sk-39925d60faac4795bd57430b478bcbc1"

with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Extract zh block to get all key-value pairs
m = re.search(r'zh:\{(.+?)\},en:\{', content, re.DOTALL)
if not m:
    print("ERROR: zh block not found")
    exit(1)

zh_text = m.group(1)
# Parse key:value pairs
pairs = re.findall(r"(\w+):'((?:[^'\\]|\\.)*)'", zh_text)
print(f"Found {len(pairs)} key-value pairs")

# Build zh reference
zh_ref = {k: v for k, v in pairs}

# Build prompt for DeepSeek
prompt = f"""You are a professional translator. Translate the following website UI strings from Chinese to 7 languages: Japanese (ja), Korean (ko), Russian (ru), Turkish (tr), Vietnamese (vi), Spanish (es), Portuguese (pt).

Rules:
- Keep all emojis, $ signs, price numbers, and technical terms (API Key, USDT, TRC20, EMA, RSI, MACD, Python, etc.) unchanged
- Keep exchange names (Hyperliquid, Binance, OKX, dYdX, Apex, GMX) unchanged
- Keep brand name "TradeBot" unchanged
- Use natural, friendly tone appropriate for each language
- Every language MUST have exactly the same set of keys as shown below
- Output ONLY valid JSON, no explanation

Input keys and Chinese values:
{json.dumps(zh_ref, ensure_ascii=False, indent=2)}

Output format:
{{"ja":{{...}}, "ko":{{...}}, "ru":{{...}}, "tr":{{...}}, "vi":{{...}}, "es":{{...}}, "pt":{{...}}}}"""

body = json.dumps({
    "model": "deepseek-chat",
    "messages": [
        {"role": "system", "content": "You are a translator. Output ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ],
    "max_tokens": 32000,
    "temperature": 0.3
}).encode("utf-8")

req = urllib.request.Request(
    "https://api.deepseek.com/chat/completions",
    data=body,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
)

print("Calling DeepSeek API (max_tokens=32000)...")
resp = urllib.request.urlopen(req, timeout=120)
result = json.loads(resp.read().decode("utf-8"))
text = result["choices"][0]["message"]["content"]

# Clean up markdown code blocks if present
text = text.strip()
if text.startswith("```"):
    text = re.sub(r'^```\w*\n?', '', text)
    text = re.sub(r'\n?```$', '', text)

translations = json.loads(text)
print(f"Got translations for {len(translations)} languages")

# Verify all keys present
for lang, vals in translations.items():
    missing = set(zh_ref.keys()) - set(vals.keys())
    extra = set(vals.keys()) - set(zh_ref.keys())
    if missing:
        print(f"WARNING: {lang} missing keys: {missing}")
    if extra:
        print(f"WARNING: {lang} extra keys: {extra}")
    if not missing and not extra:
        print(f"  {lang}: OK ({len(vals)} keys)")

# Save to file
with open(r"C:\Users\Administrator\.qclaw\workspace\product-website\i18n_new.json", "w", encoding="utf-8") as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)

print("Saved to i18n_new.json")
