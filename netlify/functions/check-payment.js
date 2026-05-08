const headers = {
  'x-api-key': process.env.NOWPAYMENTS_API_KEY
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const invoiceId = event.queryStringParameters?.invoice_id;

  if (!invoiceId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing invoice_id' }) };
  }

  try {
    const response = await fetch(`https://api.nowpayments.io/v1/invoice/${invoiceId}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.message || 'Check failed' }) };
    }

    // Map NOWPayments status to simple states
    // Possible statuses: new, pending, paid, expired, failed, refunded, partially_paid
    const status = data.status || 'unknown';

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: status,
        price_amount: data.price_amount,
        price_currency: data.price_currency,
        pay_currency: data.pay_currency,
        pay_amount: data.pay_amount,
        order_id: data.order_id,
        updated_at: data.updated_at
      })
    };
  } catch (err) {
    console.error('Check error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
