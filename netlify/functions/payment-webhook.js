const PRODUCT_DOWNLOADS = {
  starter: 'https://tradebot-products.pages.dev/download/starter',
  standard: 'https://tradebot-products.pages.dev/download/standard',
  premium: 'https://tradebot-products.pages.dev/download/premium'
};

exports.handler = async (event) => {
  // Only NOWPayments should call this
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { payment_status, order_id, invoice_id, price_amount } = body;

    console.log('Webhook received:', JSON.stringify(body));

    // Only process completed payments
    if (payment_status !== 'finished' && payment_status !== 'confirmed') {
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    // Extract tier from order_id (e.g., TB-S-xxx -> starter)
    let tier = 'standard';
    if (order_id) {
      const prefix = order_id.split('-')[1];
      if (prefix === 'S') tier = 'starter';
      else if (prefix === 'D') tier = 'standard';
      else if (prefix === 'P') tier = 'premium';
    }

    console.log(`Payment confirmed: ${order_id} -> tier=${tier}, amount=${price_amount}`);

    // In production, you would:
    // 1. Record the payment in a database
    // 2. Send email with download link
    // 3. Send WeChat notification
    // For now, just log it
    console.log(`Download URL: ${PRODUCT_DOWNLOADS[tier]}`);

    return { statusCode: 200, body: JSON.stringify({ received: true, tier }) };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500 };
  }
};
