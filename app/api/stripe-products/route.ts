import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function GET() {
  try {
    const products = await stripe.products.list({ limit: 100 });
    const prices = await stripe.prices.list({ limit: 100, expand: ['data.product'] });
    // Map product ID to price
    const priceMap: Record<string, Stripe.Price> = {};
    prices.data.forEach((price) => {
      if (typeof price.product === 'object' && price.product.id) {
        priceMap[price.product.id] = price;
      }
    });
    // Attach price info to each product
    const productsWithPrices = products.data.map((product) => {
      const price = priceMap[product.id];
      return {
        ...product,
        price: price ? price.unit_amount : null,
        currency: price ? price.currency : null,
        priceId: price ? price.id : null,
      };
    });
    return NextResponse.json({ products: productsWithPrices });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}