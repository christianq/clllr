import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/app/store/cartStore'; // Import CartItem type

// Initialize Stripe with the secret key
// Ensure your Stripe secret key is set in .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // apiVersion: '2024-06-20', // Remove or update based on installed Stripe types
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cartItems = body.items as CartItem[]; // Type assertion

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Transform cart items into Stripe line items
    // Ensure product IDs in your store are Stripe Price IDs (e.g., price_xxx)
    const line_items = cartItems.map((item) => ({
      price: item.id, // Use the product ID as the Price ID
      quantity: item.quantity,
    }));

    // Define success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000'; // Fallback for local dev
    const success_url = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/`;

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url,
      cancel_url,
      // Optional: Add customer email, billing address collection, etc.
      // automatic_tax: { enabled: true }, // Enable automatic tax calculation if needed
    });

    if (!session.id) {
      throw new Error('Could not create Stripe Checkout Session');
    }

    // Return the session ID
    return NextResponse.json({ sessionId: session.id });

  } catch (error: unknown) {
    console.error('Error creating Stripe session:', error);
    // Return a generic error message or more specific based on err.type
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}