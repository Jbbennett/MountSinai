const verses = [
  { text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.', reference: 'Isaiah 40:31' },
  { text: 'Your word is a lamp for my feet, a light on my path.', reference: 'Psalm 119:105' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', reference: 'Joshua 1:9' },
  { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1' },
  { text: 'Let all that you do be done in love.', reference: '1 Corinthians 16:14' },
  { text: 'I can do all things through Christ who strengthens me.', reference: 'Philippians 4:13' },
  { text: 'He has made everything beautiful in its time.', reference: 'Ecclesiastes 3:11' }
];

let products = {
  'summit-tee': { name: 'The Summit Tee', description: 'Heavyweight organic cotton', price: 48 },
  'wilderness-crew': { name: 'Wilderness Crew', description: 'Brushed fleece / oat', price: 88 },
  'good-soil-cap': { name: 'Good Soil Cap', description: '6-panel cotton twill', price: 36 }
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

function getDailyVerse() {
  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return verses[((dayNumber % verses.length) + verses.length) % verses.length];
}

async function renderDailyVerse() {
  let verse = getDailyVerse();
  try { verse = await apiRequest('/api/verse-of-day'); } catch { /* Local fallback keeps file previews usable. */ }
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
  document.querySelector('#verse-text').textContent = `“${verse.text}”`;
  document.querySelector('#verse-reference').textContent = verse.reference;
  document.querySelector('#verse-date').textContent = date;
}

let cart = JSON.parse(localStorage.getItem('mount-sinai-cart') || '{}');

function saveCart() {
  localStorage.setItem('mount-sinai-cart', JSON.stringify(cart));
}

function formatPrice(price) {
  return `$${price.toLocaleString('en-US')}`;
}

function renderCart() {
  const items = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const count = items.reduce((total, [, quantity]) => total + quantity, 0);
  const total = items.reduce((sum, [id, quantity]) => sum + products[id].price * quantity, 0);
  document.querySelector('#bag-count').textContent = count;
  document.querySelector('#cart-total').textContent = formatPrice(total);
  document.querySelector('#cart-items').innerHTML = items.length ? items.map(([id, quantity]) => `
    <div class="cart-item"><div><h3>${products[id].name}</h3><p>${products[id].description}</p><button class="remove-item" type="button" data-remove="${id}">Remove</button></div><div class="cart-item-price"><span>× ${quantity}</span><strong>${formatPrice(products[id].price * quantity)}</strong></div></div>
  `).join('') : '<p class="empty-cart">Your bag is waiting for its first piece.</p>';
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
    delete cart[button.dataset.remove];
    saveCart();
    renderCart();
  }));
}

function setCartOpen(isOpen) {
  document.querySelector('#cart-drawer').setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('cart-open', isOpen);
}

function initMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);
  document.body.classList.add('motion-ready');

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero-content > *', { duration: 0.8, opacity: 1, y: 0, stagger: 0.1 })
    .to('.hero-mark, .image-credit', { duration: 0.6, opacity: 1 }, '-=0.35');

  gsap.to('.hero-image', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  document.querySelectorAll('.verse-body, .product-card, .story-copy, .story-image, .journal-content').forEach((element) => {
    gsap.to(element, {
      duration: 0.9,
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 82%', once: true }
    });
  });
}

document.querySelectorAll('.quick-add').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.product;
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart();
    renderCart();
    button.innerHTML = 'Added <span>✓</span>';
    setTimeout(() => { button.innerHTML = 'Add to bag <span>+</span>'; }, 1400);
  });
});

document.querySelector('.bag-button').addEventListener('click', () => setCartOpen(true));
document.querySelector('.cart-close').addEventListener('click', () => setCartOpen(false));
document.querySelector('[data-cart-close]').addEventListener('click', () => setCartOpen(false));
document.querySelector('.checkout-button').addEventListener('click', () => {
  if (!Object.keys(cart).length) return;
  apiRequest('/api/checkout', { method: 'POST', body: JSON.stringify({ items: cart }) })
    .then(({ checkoutUrl }) => { window.location.href = checkoutUrl; })
    .catch((error) => { document.querySelector('#checkout-message').textContent = error.message; });
});

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(button.dataset.scroll).scrollIntoView({ behavior: 'smooth' }));
});

document.querySelector('#newsletter-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = new FormData(event.target).get('email') || document.querySelector('#email').value;
  try {
    await apiRequest('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
    document.querySelector('#form-message').textContent = 'You are on the list. See you up there.';
    event.target.reset();
  } catch (error) { document.querySelector('#form-message').textContent = error.message; }
});

apiRequest('/api/products').then((catalog) => {
  products = Object.fromEntries(catalog.map((product) => [product.id, product]));
  renderCart();
}).catch(() => {});
renderDailyVerse();
renderCart();
initMotion();
