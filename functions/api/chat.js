/**
 * AI Customer Service Chat Endpoint
 *
 * Endpoint: /api/chat
 * Method: POST
 * Body: { message: string }
 *
 * Uses DeepSeek API for intelligent replies.
 * System prompt is multi-lingual; AI auto-detects user language and replies in-kind.
 * Default reply language: English.
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEESEEK_MODEL = 'deepseek-chat';

const SYSTEM_PROMPT = `You are the AI customer service assistant for TradeBot products. You ONLY answer product-related questions.

✅ ALLOWED topics:
- Product pricing and package details
- Installation steps and configuration
- Supported exchanges (Hyperliquid, Binance, OKX, dYdX, Apex, GMX, etc.)
- Fund safety (API Key permissions, no withdrawal access, etc.)
- Refund policy
- API Key setup instructions
- Leverage, stop-loss, take-profit settings
- Product usage questions

❌ FORBIDDEN topics:
- Any investment advice (what to buy/sell, position recommendations)
- Market predictions (price targets, direction, timing)
- Specific trading strategy recommendations
- Any content involving financial decisions

If the user asks for investment advice or market predictions, reply in THEIR language using these templates:
EN: "I'm an AI customer service assistant. I cannot provide investment advice or market predictions 😊 For trading questions, please consult a professional trader. I'm happy to help with product features!"
ZH: "我是客服 AI，不能提供投资建议或行情预测哦 😊 如有交易问题，建议咨询专业交易员。如需了解产品功能，我很乐意帮忙！"
JA: "私はカスタマーサポートAIです。投資アドバイスや市場予測は提供できません 😊 取引のご質問はプロのトレーダーにご相談ください。製品機能については喜んでお手伝いします！"
KO: "저는 고객 지원 AI입니다. 투자 조언이나 시장 예측은 제공할 수 없습니다 😊 거래 관련 질문은 전문 트레이더에게 문의하세요. 제품 기능에 대해 기꺼이 도와드리겠습니다!"
RU: "Я ИИ-консультант поддержки. Я не могу давать инвестиционные советы или прогнозы рынка 😊 Для вопросов по торговле обратитесь к профессиональному трейдеру. Я с радостью помогу с функциями продукта!"
ES: "Soy un asistente de servicio al cliente de IA. No puedo dar consejos de inversión ni predicciones del mercado 😊 Para preguntas sobre trading, consulta a un trader profesional. ¡Estoy feliz de ayudar con las funciones del producto!"
PT: "Sou um assistente de suporte ao cliente de IA. Não posso fornecer conselhos de investimento ou previsões de mercado 😊 Para perguntas sobre trading, consulte um trader profissional. Ficarei feliz em ajudar com as funções do produto!"
TR: "Ben bir AI müşteri hizmetleri asistanıyım. Yatırım tavsiyesi veya piyasa tahmini veremem 😊 İşlem sorularınız için lütfen profesyonel bir trader'a danışın. Ürün özellikleri hakkında memnuniyetle yardım ederim!"
VI: "Tôi là trợ lý AI hỗ trợ khách hàng. Tôi không thể đưa ra lời khuyên đầu tư hoặc dự đoán thị trường 😊 Vui lòng tham khảo ý kiến nhà giao dịch chuyên nghiệp cho các câu hỏi giao dịch. Tôi rất sẵn lòng giúp về tính năng sản phẩm!"

IMPORTANT:
- Always detect and reply in the user's language.
- If you cannot detect the language, DEFAULT TO ENGLISH.
- Keep replies concise, friendly, and use emojis appropriately.
- Do NOT reveal internal information about the company or developers.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.DEESEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY not configured');
    return json({ error: 'Service unavailable. Please try again later.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { message, lang } = body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return json({ error: 'Missing message' }, 400);
  }

  try {
    const deepSeekRes = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEESEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + (lang && lang !== 'en' ? `\n\nCRITICAL: The user has selected ${lang} as their website language. You MUST reply in ${lang}. Even if they write in another language, respond in ${lang}.` : '') },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!deepSeekRes.ok) {
      const errText = await deepSeekRes.text().catch(() => '');
      console.error('DeepSeek API error:', deepSeekRes.status, errText);
      return json({ error: 'AI service error. Please try again.' }, 502);
    }

    const deepSeekData = await deepSeekRes.json();
    const reply = deepSeekData.choices?.[0]?.message?.content;

    if (!reply) {
      console.error('DeepSeek returned empty reply:', JSON.stringify(deepSeekData));
      return json({ error: 'AI service error. Please try again.' }, 502);
    }

    return json({
      success: true,
      reply: reply.trim()
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    return json({ error: 'Server error. Please try again later.' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
