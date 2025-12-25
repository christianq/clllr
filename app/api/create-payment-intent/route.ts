import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '../../store/cartStore';
import { calculateTotalAmount } from '../../utils/cart';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items as CartItem[];
    const customerId = body.customerId as string | undefined; // Get optional customer ID

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const amount = calculateTotalAmount(items);

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Create a PaymentIntent with the order amount, currency, and customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Change currency if needed
      customer: customerId, // Optional: associate with a Stripe Customer
      automatic_payment_methods: {
        enabled: true, // Allow Stripe to dynamically show relevant payment methods
      },
      // Optional: Add metadata, description, etc.
      // metadata: { order_id: 'your_order_id' },
    });

    // Return the client secret for the PaymentIntent
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount // Optionally return amount for display
    });

  } catch (error: unknown) {
    console.error('Error creating PaymentIntent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}