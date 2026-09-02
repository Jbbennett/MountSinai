const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');
require('dotenv').config();
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'main');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
const products = {
  'summit-tee': { id: 'summit-tee', name: 'The Summit Tee', description: 'Heavyweight organic cotton', price: 48 },
  'wilderness-crew': { id: 'wilderness-crew', name: 'Wilderness Crew', description: 'Brushed fleece / oat', price: 88 },
  'good-soil-cap': { id: 'good-soil-cap', name: 'Good Soil Cap', description: '6-panel cotton twill', price: 36 }
};
const verses = [
  { text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.', reference: 'Isaiah 40:31' },
  { text: 'Your word is a lamp for my feet, a light on my path.', reference: 'Psalm 119:105' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', reference: 'Joshua 1:9' },
  { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1' },
  { text: 'Let all that you do be done in love.', reference: '1 Corinthians 16:14' },
  { text: 'I can do all things through Christ who strengthens me.', reference: 'Philippians 4:13' },
  { text: 'He has made everything beautiful in its time.', reference: 'Ecclesiastes 3:11' }
];

function dailyVerse() {
  const dayNumber = Math.floor(Date.now() / 86400000);
  return verses[((dayNumber % verses.length) + verses.length) % verses.length];
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 10000) request.destroy(); });
    request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    request.on('error', reject);
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function validatedItems(rawItems) {
  if (!rawItems || typeof rawItems !== 'object') throw new Error('Order items are required.');
  const items = Object.entries(rawItems).map(([id, quantity]) => ({ product: products[id], quantity: Number(quantity) }));
  if (!items.length || items.some(({ product, quantity }) => !product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20)) throw new Error('Order contains invalid items.');
  return items;
}

function serveStatic(request, response, pathname) {
  const requested = pathname === '/' ? '/main.html' : pathname;
  const filePath = path.resolve(publicDir, `.${requested}`);
  if (!filePath.startsWith(`${publicDir}${path.sep}`)) return sendJson(response, 403, { error: 'Forbidden' });
  fs.readFile(filePath, (error, content) => {
    if (error) return sendJson(response, error.code === 'ENOENT' ? 404 : 500, { error: 'File not found' });
    const extension = path.extname(filePath);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/stripe-webhook' && request.method === 'POST') {
      if (!stripe || !supabase || !process.env.STRIPE_WEBHOOK_SECRET) return sendJson(response, 503, { error: 'Stripe webhook is not configured yet.' });
      const event = stripe.webhooks.constructEvent(await readBody(request), request.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { error } = await supabase.from('orders').update({ status: session.payment_status === 'paid' ? 'paid' : 'pending' }).eq('id', session.metadata.order_id);
        if (error) throw error;
      }
      return sendJson(response, 200, { received: true });
    }
    if (url.pathname === '/api/products' && request.method === 'GET') return sendJson(response, 200, Object.values(products));
    if (url.pathname === '/api/verse-of-day' && request.method === 'GET') return sendJson(response, 200, { ...dailyVerse(), date: new Date().toISOString().slice(0, 10) });
    if (url.pathname === '/api/newsletter' && request.method === 'POST') {
      const body = await readJson(request);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || '')) return sendJson(response, 400, { error: 'A valid email is required.' });
      if (!supabase) return sendJson(response, 503, { error: 'Newsletter storage is not configured.' });
      const { error } = await supabase.from('subscribers').upsert({ email: body.email.toLowerCase() }, { onConflict: 'email' });
      if (error) throw error;
      return sendJson(response, 201, { message: 'You are on the list.' });
    }
    if (url.pathname === '/api/checkout' && request.method === 'POST') {
      const body = await readJson(request);
      if (!stripe || !supabase) return sendJson(response, 503, { error: 'Checkout is not configured yet.' });
      const items = validatedItems(body.items);
      const orderId = crypto.randomUUID();
      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: items.map(({ product, quantity }) => ({ price_data: { currency: 'usd', product_data: { name: product.name, description: product.description }, unit_amount: product.price * 100 }, quantity })),
        success_url: `http://localhost:${PORT}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:${PORT}/?checkout=cancelled`,
        metadata: { order_id: orderId }
      });
      const { error } = await supabase.from('orders').insert({ id: orderId, stripe_session_id: session.id, status: 'pending', total_cents: total * 100, items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity, unit_price_cents: product.price * 100 })) });
      if (error) throw error;
      return sendJson(response, 201, { checkoutUrl: session.url });
    }
    if (url.pathname === '/api/orders' && request.method === 'POST') {
      const body = await readJson(request);
      const items = validatedItems(body.items);
      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return sendJson(response, 201, { orderId: `MS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, status: 'received', total });
    }
    if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { error: 'API route not found' });
    return serveStatic(request, response, url.pathname);
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Server error' });
  }
});

server.listen(PORT, () => console.log(`Mount Sinai server running at http://localhost:${PORT}`));
