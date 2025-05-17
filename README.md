# Stripe Cart App

A modern, full-stack e-commerce admin and storefront built with Next.js, Convex, and Stripe.

## Overview

This project is a demo e-commerce platform featuring:
- A beautiful, responsive product grid and cart UI
- Real-time product and image management with Convex
- Stripe integration for product publishing and price syncing
- Admin interface for product CRUD, image upload, and Stripe sync

## Features

### Storefront
- Responsive homepage with product grid
- Product variants, swatch galleries, and modern layout
- Sticky, collapsible sidebar cart with quantity controls
- Google DM Sans font for headings
- Fallback image support for missing product images

### Admin Interface (`/admin/products`)
- View, edit, create, and delete products
- Upload and manage product images (stored in Convex file storage)
- Select images for products from Convex
- Real-time updates via Convex queries/mutations
- Mark products as "draft" or "published"
- Publish or update products to Stripe with a single click
- Full sync: name, description, image, and price are kept in sync with Stripe
- Only shows "Publish to Stripe" if Convex data differs from Stripe
- Stripe product and price IDs are stored in Convex for reference

### Automation & Scripts
- Script to patch existing products with missing fields (e.g., `status`)
- Stripe automation script for bulk product creation (optional)

## Tech Stack
- **Next.js** (App Router)
- **Convex** (database, file storage, real-time backend)
- **Stripe** (product, price, and checkout management)
- **TypeScript** throughout
- **Tailwind CSS** for styling

## Setup

1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd stripe-cart-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root with:
     ```
     NEXT_PUBLIC_CONVEX_URL=your_convex_url
     STRIPE_SECRET_KEY=sk_test_...
     ```
   - (Optional) Add any other required keys for Next.js or Stripe.
4. **Start Convex dev server:**
   ```sh
   npx convex dev
   ```
5. **Start Next.js dev server:**
   ```sh
npm run dev
   ```
6. **(Optional) Patch old products:**
   ```sh
   node scripts/patchAllProductsStatus.mjs
   ```

## Usage

- Visit `/` for the storefront.
- Visit `/admin/products` for the admin interface.
- Upload images, create/edit products, and publish to Stripe.
- The admin UI will only show "Publish to Stripe" if the Convex data is out of sync with Stripe.

## Stripe & Convex Integration
- Products and images are managed in Convex.
- Images are uploaded to Convex file storage and linked to products.
- Publishing to Stripe creates or updates the product, image, and price on Stripe.
- Stripe product and price IDs are stored in Convex for future syncs.
- Price changes create a new Stripe price and deactivate the old one (Stripe prices are immutable).

## Scripts
- `scripts/patchAllProductsStatus.mjs`: Patches all products to ensure they have a `status` field (run after schema changes).

## License
MIT (or your preferred license)
