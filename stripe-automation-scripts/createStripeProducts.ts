import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY not found in environment variables');
}

// Configure your GitHub info here
const GITHUB_USERNAME = 'christianq';
const GITHUB_REPO = 'clllr';
const GITHUB_BRANCH = 'main';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' });
const productPhotosDir = path.resolve(__dirname, '../product-photos');

function getGithubRawUrl(filename: string) {
  return `https://raw.githubusercontent.com/christianq/clllr/main/product-photos/${filename}`;
}

async function main() {
  const files = fs.readdirSync(productPhotosDir);
  for (const filename of files) {
    if (!filename.endsWith('.png')) continue;
    const parts = filename.slice(0, -4).split('-');
    if (parts.length < 4) {
      console.log(`Skipping ${filename}: not enough parts`);
      continue;
    }
    const [producttype, producttitle, color, price] = parts;
    const name = `${capitalize(producttype)} | ${capitalize(producttitle)} | ${capitalize(color)}`;
    const imageUrl = getGithubRawUrl(filename);

    // Check if product already exists by name
    const products = await stripe.products.list({ limit: 100, active: true });
    let product = products.data.find((p) => p.name === name);

    if (product) {
      console.log(`Updating metadata and image for ${name} (${product.id})`);
      await stripe.products.update(product.id, {
        metadata: {
          variant_name: producttitle,
          color,
          price,
          producttype,
        },
        images: [imageUrl],
      });
    } else {
      console.log(`Creating product: ${name}`);
      product = await stripe.products.create({
        name,
        description: `A modern ${producttype} tote bag.`,
        metadata: {
          variant_name: producttitle,
          color,
          price,
          producttype,
        },
        images: [imageUrl],
      });
    }

    // Create price if not already present
    const prices = await stripe.prices.list({ product: product.id, limit: 1 });
    if (prices.data.length === 0) {
      await stripe.prices.create({
        unit_amount: parseInt(price, 10),
        currency: 'usd',
        product: product.id,
      });
      console.log(`  -> Created price ${(parseInt(price, 10) / 100).toFixed(2)} usd for ${product.id}`);
    } else {
      console.log(`  -> Price already exists for ${product.id}`);
    }
  }
  console.log('Done.');
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});