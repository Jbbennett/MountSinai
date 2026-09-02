# Mount Sinai

Mount Sinai is a Christian clothing storefront with the slogan **Elevated clothing**. The site pairs an outdoors-inspired visual identity with a daily Bible verse, a product collection, a persistent shopping bag, and a Stripe Checkout + Supabase backend foundation.

## Features

- Responsive storefront for desktop and mobile
- GSAP and ScrollTrigger entrance, reveal, and parallax animations
- Verse of the day selected by calendar day
- Product catalog served by the backend
- Persistent browser shopping bag
- Server-side product and price validation
- Stripe Checkout session creation
- Supabase order and newsletter persistence
- Stripe webhook route for marking paid orders

## Requirements

- Node.js 18 or newer
- A Supabase project
- A Stripe account for test or live mode

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your Stripe and Supabase credentials to `.env`:

   ```text
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Open the Supabase SQL editor and run [supabase/schema.sql](supabase/schema.sql).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000).

The server intentionally returns a configuration error for checkout and newsletter persistence until valid environment variables are supplied.

## Stripe webhook

Configure Stripe to send checkout events to:

```text
https://your-domain.com/api/stripe-webhook
```

The webhook verifies Stripe's signature and updates the matching Supabase order to `paid` when Stripe reports a successful payment. For local testing, use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/products` | Return the server catalog |
| GET | `/api/verse-of-day` | Return the current daily verse |
| POST | `/api/newsletter` | Save a subscriber in Supabase |
| POST | `/api/checkout` | Validate cart items and create a Stripe Checkout session |
| POST | `/api/stripe-webhook` | Confirm payment and update order status |

The browser never determines final prices. The server maps cart IDs to its own catalog before creating a Checkout session.

## Project structure

```text
.
├── main/
│   ├── images/
│   ├── main.html
│   ├── script.js
│   └── style.css
├── supabase/
│   └── schema.sql
├── .env.example
├── package.json
└── server.js
```

## Production notes

- Keep `.env` out of version control.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Use HTTPS in production.
- Replace the localhost success and cancel URLs in `server.js` with the production site URL.
- Add shipping, tax, inventory, customer email, and fulfillment workflows before launch.
- Use Stripe test mode until the full checkout and webhook flow has been verified.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
