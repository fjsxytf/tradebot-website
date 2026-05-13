/**
 * TRC20 USDT Payment Verification - Cloudflare Pages Function
 *
 * Endpoint: /api/verify-trx
 * Method: POST
 * Body: { txid: string, tier: string }
 *
 * KV Binding: VERIFIED_TX (namespace: verified_tx_v1)
 */

const WALLET_ADDRESS = 'TY58AoPsaDo5gpEaaddHTphVhZRHpFtC1j';
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const TIER_PRICES = {
  starter: 0.9,
  standard: 4.99,
  premium: 14.99
};

const DOWNLOAD_LINKS = {
  starter: 'https://drive.google.com/uc?export=download&id=1cvDA4ISQaws3v3tV0-aVBEmZGr1wLxyH',
  standard: 'https://drive.google.com/uc?export=download&id=16eH9dcSD4WY-kuzoLEcIcOAMlAe3KLnK',
  premium: 'https://drive.google.com/uc?export=download&id=1vxHGwP_6RdI-paqpNPv4uUJ19NlnwUx-'
};

/** CORS headers */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

/** JSON response helper */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

/** Handle OPTIONS preflight */
export function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders() });
}

/** Handle POST - main verification logic */
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch (e) {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { txid, tier } = body;

  if (!txid || typeof txid !== 'string') {
    return json({ error: 'Missing txid' }, 400);
  }
  if (!tier || !TIER_PRICES[tier]) {
    return json({ error: 'Invalid tier' }, 400);
  }

  // Check duplicate in KV
  if (env.VERIFIED_TX) {
    const dup = await env.VERIFIED_TX.get(txid);
    if (dup) {
      return json({ success: true, alreadyDelivered: true, ...JSON.parse(dup) });
    }
  }

  try {
    // Step 1: Get transaction events via TronGrid API (free tier)
    const eventUrl = `https://api.trongrid.io/v1/transactions/${txid}/events`;
    const eventRes = await fetch(eventUrl, { headers: { 'Accept': 'application/json' } });

    if (!eventRes.ok) {
      if (eventRes.status === 404) return json({ error: 'Transaction not found. Check TXID.' }, 404);
      return json({ error: 'Query failed. Try again later.' }, 502);
    }

    const eventData = await eventRes.json();
    const events = eventData.data || [];

    // Find Transfer event for USDT
    let transferAmount = 0;
    let fromAddr = '';
    let toAddr = '';
    let foundUSDT = false;

    for (const evt of events) {
      if (evt.event_name === 'Transfer') {
        const result = evt.result || [];
        const val = result.find(r => r.name === 'value');
        const from = result.find(r => r.name === 'from');
        const to = result.find(r => r.name === 'to');

        if (val) transferAmount = parseInt(val.value || val) / 1e6;
        if (from) fromAddr = from.value || from;
        if (to) toAddr = to.value || to;

        // Check contract address is USDT
        const evtContract = (evt.contract_address || '').toLowerCase();
        if (evtContract === USDT_CONTRACT.toLowerCase()) {
          foundUSDT = true;
          break;
        }
      }
    }

    if (transferAmount === 0 || !foundUSDT) {
      return json({ error: 'No USDT TRC20 transfer found. Did you send USDT on TRC20?' }, 400);
    }

    // Verify recipient is our wallet
    if (toAddr.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
      return json({ error: 'Recipient does not match.' }, 400);
    }

    // Verify amount (2% tolerance)
    const expected = TIER_PRICES[tier];
    if (Math.abs(transferAmount - expected) > expected * 0.02) {
      return json({
        error: `Wrong amount. Expected ~${expected} USDT, got ${transferAmount.toFixed(2)} USDT.`,
        got: transferAmount,
        expected: expected
      }, 400);
    }

    // Verify tx status (SUCCESS)
    const txUrl = `https://api.trongrid.io/v1/transactions/${txid}`;
    const txRes = await fetch(txUrl, { headers: { 'Accept': 'application/json' } });
    if (txRes.ok) {
      const txData = await txRes.json();
      const tx = txData.data ? (Array.isArray(txData.data) ? txData.data[0] : txData.data) : null;
      if (tx && tx.ret && tx.ret[0] && tx.ret[0].contractRet !== 'SUCCESS') {
        return json({ error: 'Transaction failed or reverted.' }, 400);
      }
    }

    // Success! Store in KV and return download link
    const dl = DOWNLOAD_LINKS[tier];
    if (env.VERIFIED_TX) {
      await env.VERIFIED_TX.put(txid, JSON.stringify({
        tier, amount: transferAmount, downloadLink: dl,
        verifiedAt: new Date().toISOString(), from: fromAddr
      }), { expirationTtl: 86400 * 7 }); // 7 days TTL
    }

    return json({
      success: true,
      downloadLink: dl,
      message: 'Payment verified!',
      details: { txid, amount: transferAmount, tier, from: fromAddr }
    });

  } catch (err) {
    console.error('Verify error:', err);
    return json({ error: 'Server error. Try again.' }, 500);
  }
}
