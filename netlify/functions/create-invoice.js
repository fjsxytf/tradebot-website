const https = require('https');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NOWPAYMENTS_API_KEY
};

const PRODUCT_MAP = {
  starter: {
    price: 0.9,
    name_en: 'TradeBot Starter Package',
    name_zh: 'TradeBot 体验版',
    order_prefix: 'TB-S'
  },
  standard: {
    price: 4.99,
    name_en: 'TradeBot Standard Package',
    name_zh: 'TradeBot 标准版',
    order_prefix: 'TB-D'
  },
  premium: {
    price: 14.99,
    name_en: 'TradeBot Premium Package',
    name_zh: 'TradeBot 高级版',
    order_prefix: 'TB-P'
  }
};

const SUCCESS_URL = process.env.NOWPAYMENTS_SUCCESS_URL || '';
const CANCEL_URL = process.env.NOWPAYMENTS_CANCEL_URL || '';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
``javascript
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { tier, email } = JSON.parse(event.body || '{}');
    const product = PRODUCT_MAP[tier];

    if (!product) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid tier' }) };
    }

    const orderId = ${product.order_prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)};

    const body = {
      price_amount: product.price,
      price_currency: 'usd',
      order_id: orderId,
      order_description: product.name_en,
      pay_currency: 'usdttrc20',
      success_url: ${SUCCESS_URL}?
tier=${tier}&order=${orderId}${email ? '&email=' + encodeURIComponent(email) : ''},
      cancel_url: ${CANCEL_URL}?tier=${tier},
      ipn_callback_url: ${process.env.URL || ''}/.netlify/functions/payment-webhook`
    };

    console.log('Creating invoice:', JSON.stringify(body));

    const options = {
      hostname: 'api.nowpayments.io',
      path: '/v1/invoice',
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      }
    };

    const result = await makeRequest(options, JSON.stringify(body));

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('NOWPayments error:', JSON.stringify(result.data));
      return {
        statusCode: result.statusCode,
        body: JSON.stringify({
error: result.data.message || 'Payment service error' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        invoice_url: result.data.invoice_url,
        invoice_id: result.data.id,
        order_id: orderId
      })
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Internal server error' }) };
  }
};
``
