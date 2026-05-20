const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 从 HTML 中提取每个 data-i18n key 对应的中文文本
const zhTexts = {};
const regex = /data-i18n="([^"]+)"[^>]*>([^<]+)</g;
let m;
while ((m = regex.exec(html)) !== null) {
  zhTexts[m[1]] = m[2].trim();
}

// 也提取 placeholder
const placeholderRegex = /data-i18n-placeholder="([^"]+)"[^>]*placeholder="([^"]*)"/g;
while ((m = placeholderRegex.exec(html)) !== null) {
  zhTexts[m[1]] = m[2].trim();
}

// 英文翻译（根据 key 名称和中文语境推断）
const en = {
  // Hero
  heroBadge: '🤖 AI Auto Trading · 24/7 Running',
  heroLine1: 'Let',
  heroLine2: 'AI trade for you',
  heroLine3: 'Keep emotions out',
  heroDesc: 'TradeBot Strategy Pack · Execute verified trading strategies across multiple exchanges, no staring at charts, goodbye FOMO / FUD / holding bags.',
  heroCta: 'Buy Now · From $0.9',
  heroNote: 'Supports Hyperliquid, Binance, OKX & more',

  // Exchanges
  exchangesTitle: 'Supported Platforms',
  exHyperliquid: 'Hyperliquid',
  exBinance: 'Binance',
  exOKX: 'OKX',
  exDyDx: 'dYdX',
  exApex: 'Apex',
  exGMX: 'GMX',

  // Pain points
  pain1: "Can't help chasing pumps when others profit",
  pain2: 'Panic sold and missed the rebound',
  pain3: 'Too anxious to sleep when holding positions',
  pain4: "Don't know when to buy or sell",

  // What is it
  whatTitle: 'What is a Skill Package?',
  whatDesc: 'A complete <strong style="color:var(--text)">auto-trading solution</strong>. Get strategy pack + installation tutorial + AI support after purchase. Deploy in 30 min, then AI trades 24/7 for you.',
  pcReqTitle: '⚠️ Important Notice',
  pcReqDesc: 'This product requires <strong style="color:var(--text)">PC</strong> with Python environment. Mobile can be used for file storage and viewing TradingView signals.',
  feature1Title: 'Strategy Pack',
  feature1Desc: 'Pre-configured parameters, ready to use, no coding',
  feature2Title: 'AI Auto Execution',
  feature2Desc: '24/7 running, no need to watch charts, strategy auto-orders',
  feature3Title: 'Auto Stop-Loss',
  feature3Desc: 'Built-in stop-loss logic, control max loss per trade',
  feature4Title: 'AI Support 24/7',
  feature4Desc: 'Installation issues anytime, dedicated support',

  // Steps
  stepsTitle: '4 Steps to Start Auto-Trading',
  step1Title: 'Buy Strategy Pack',
  step1Desc: 'Choose a plan, pay with USDT/USDC, receive download link instantly after payment.',
  step2Title: 'Deploy (30 min)',
  step2Desc: 'Follow the tutorial to set up Python environment + API Key, AI support available anytime.',
  step3Title: 'Start Strategy',
  step3Desc: 'Run the script, AI automatically monitors signals and executes trades when opportunities arise.',
  step4Title: 'Sit Back & Profit',
  step4Desc: 'No need to watch charts. AI works for you while sleeping, working, commuting.',

  // Pricing
  pricingTitle: 'Choose Your Plan',
  pricingSubtitle: 'Starter / Standard / Premium options available',
  starterName: 'Starter',
  starterDesc: 'Try it out, test the waters',
  starterFeat1: '1 core strategy pack',
  starterFeat2: 'Complete illustrated tutorial',
  starterFeat3: 'Basic AI support',
  starterFeat4: 'Risk disclosure',
  selectStarter: 'Select Starter',
  standardName: 'Standard',
  standardDesc: 'Serious use, stable running',
  standardFeat1: '3 core strategy packs',
  standardFeat2: 'Complete illustrated tutorial',
  standardFeat3: 'Priority AI support (faster response)',
  standardFeat4: 'Risk disclosure',
  selectStandard: 'Select Standard ⭐',
  premiumName: 'Premium',
  premiumDesc: 'Power user, continuous updates',
  premiumFeat1: 'All strategy packs (incl. future updates)',
  premiumFeat2: 'Illustrated + video tutorials',
  premiumFeat3: 'Dedicated priority AI support',
  premiumFeat4: 'Strategy update service (3 months)',
  premiumFeat5: '1× 1-on-1 installation assistance',
  selectPremium: 'Select Premium',
  riskWarning: '⚠️ Crypto trading carries risk. Please read the',
  riskLink: 'Risk Disclosure',

  // FAQ
  faqTitle: 'Frequently Asked Questions',
  faq1Q: 'Is my fund safe? Who operates my account?',
  faq1A: 'Funds always stay in YOUR exchange account. We only provide strategy packs, never touch your funds. API Key is fully controlled by you, revocable anytime.',
  faq2Q: 'Do I need to know programming?',
  faq2A: 'No. Tutorial is written for non-technical users. 30 minutes following steps is enough. AI support available anytime.',
  faq3Q: 'Can strategies guarantee profits?',
  faq3A: 'No strategy can guarantee profits. Strategies are based on technical analysis (EMA, RSI, MACD, etc.). Performs well in trending markets, may have small losses in ranging markets. Past backtests ≠ future performance.',
  faq4Q: 'How soon after payment do I receive it?',
  faq4A: 'TRC20 usually confirms within 3 seconds, auto-delivery after confirmation. ERC20/BEP20 about 1-5 minutes.',
  faq5Q: 'Can I get a refund?',
  faq5A: 'No. Digital goods, all sales final. Please read product description and risk disclosure before purchasing.',
  faq6Q: 'Which exchanges are supported?',
  faq6A: 'Currently supports Hyperliquid, Binance, OKX, dYdX, Apex, GMX and other major centralized and decentralized futures platforms.',

  // Risk
  riskBoxTitle: '⚠️ Important Risk Disclosure (MUST READ before purchase)',
  risk1: 'Crypto trading carries extreme risk, may lose entire principal',
  risk2: 'This product may use leveraged trading, losses are amplified',
  risk3: 'Past strategy performance ≠ future returns',
  risk4: 'Do NOT use borrowed or essential living funds for trading',
  risk5: 'This product does not constitute investment advice, profit/loss borne by user',
  risk6: 'All sales final, no refunds',

  // Footer
  footerSlogan: 'Let emotions be the past, let profits walk in themselves.',
  footerRisk: 'Risk Disclosure',
  footerTerms: 'Terms of Use',
  footerSupport: 'Support Policy',

  // Payment Modal
  buy: 'Buy',
  tabCard: 'Credit Card',
  tabCrypto: 'USDT',
  payAmount: 'Amount Due',
  cardAmount: '$5',
  cardProduct: 'Product',
  cardDelivery: 'Delivery',
  cardDeliveryAuto: 'Download link auto-sent after payment',
  cardPaymentMethod: 'Payment Method',
  stripeBtn: '🔒 Secure Payment via Stripe',
  stripeSecureNote: '🔒 Secured by Stripe, supports 135+ currencies',
  chainLabel: 'Select Payment Chain',
  chainOptTrc20: 'TRC20 (USDT) - Recommended, lowest fee ~$0.2',
  chainOptSol: 'Solana (SOL/USDC/USDT) - Fast ~$0.01',
  chainOptEth: 'Ethereum (USDT/USDC/ETH)',
  chainOptBsc: 'BSC (USDT/USDC/BNB) - Low fee',
  chainOptPoly: 'Polygon (USDT/USDC/MATIC) - Very low fee',
  chainOptArb: 'Arbitrum (USDT/USDC)',
  chainOptAvax: 'Avalanche (USDT/USDC/AVAX)',
  walletLabel: 'TRC20 Wallet Address (USDT)',
  chainWarn: 'Warning: Use the selected network only',
  chainNote: 'TRC20 USDT recommended, lowest fee (~$0.2)',
  payStepsTitle: '📝 Payment Steps:',
  payStep1: '1️⃣ Copy the TRC20 address above',
  payStep2: '2️⃣ In your wallet, select <strong style="color:var(--text)">TRC20 network</strong>, send corresponding amount of USDT',
  payStep3New: '3️⃣ After payment, copy the TXID (transaction hash)',
  payStep4New: '4️⃣ Enter TXID below, click verify → auto-get download link 👇',
  txidLabel: '🔍 Enter TXID (auto-verify)',
  verifyBtnText: '✅ Verify Payment & Get Download Link',
  contactSupportFallback: "Can't find TXID? Contact support for manual delivery",
  delveryNoteAuto: 'Download link shown immediately after verification (usually <3 sec)',
  copyAddressBtn: 'Copy Address',

  // Success Modal
  paymentSuccessTitle: 'Payment Successful!',
  paymentSuccessDesc: 'Your download link has been generated. Click the button below to get the strategy pack.',
  downloadHint: 'Click button below to download (link valid for 48h)',
  downloadBtn: '⬇️ Download Strategy Pack',
  closeBtn: 'Close',

  // Chat Widget
  online: 'Online · Avg response <1 min',
  quickProduct: '📦 Product Details',
  quickInstall: '🔧 Installation Guide',
  quickPaid: '💰 I Paid',
  quickError: '🐛 Report Error',
  encrypted: '🔒 Encrypted · AI Support 24/7 Online',
  typeMessage: 'Type a message...'
};

// 生成 i18n 对象字符串
const i18nObj = `var i18n = {
  zh: {}, // Chinese is default (hardcoded in HTML)
  en: ${JSON.stringify(en, null, 4).replace(/\n/g, '\n    ')}
};`;

console.log('Generated i18n object with', Object.keys(en).length, 'English translations');
console.log('\\n=== INSERT THIS BEFORE </script> TAG ===');
console.log(i18nObj);
