'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore'; // Import cart store
import CheckoutForm from '../components/CheckoutForm'; // Import the form component
import { DM_Sans } from "next/font/google";
import { calculateTotalAmount, formatPrice } from '../utils/cart';

// Load Stripe outside of the component render to avoid recreating the Stripe object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["200"] });

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { items: cartItems } = useCartStore(); // Get items from Zustand store

  // Calculate total
  const totalAmount = calculateTotalAmount(cartItems);

  useEffect(() => {
    // Function to fetch the client secret
    const createPaymentIntent = async () => {
      if (cartItems.length === 0) {
        setError('Your cart is empty.');
        setLoading(false);
        // Optionally redirect back or show a message
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // We send the items here, customerId will be handled in CheckoutForm
          body: JSON.stringify({ items: cartItems }),
        });

        if (!response.ok) {
          const { error: apiError } = await response.json();
          throw new Error(apiError || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: unknown) {
        console.error('Error fetching client secret:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - cart items shouldn't change during checkout

  const appearance: StripeElementsOptions['appearance'] = {
    theme: 'stripe',
    // Add other appearance customizations here
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading checkout...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!clientSecret) {
    // This might happen if the cart was empty initially or fetch failed silently
    return <div className="container mx-auto p-4 text-center">Could not initialize checkout. Please try again.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className={`text-3xl font-bold text-center mb-8 ${dmSans.className}`}>Checkout</h1>
      {/* Cart summary */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 ${dmSans.className}`}>Order Summary</h2>
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="py-2">{item.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatPrice(typeof item.price === 'number' ? item.price * item.quantity : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-lg mt-2">
          Total: {formatPrice(totalAmount)}
        </div>
      </div>
      {/* Pass clientSecret and options to Elements */}
      <Elements options={options} stripe={stripePromise}>
        {/* Pass the cart items to the form if needed, or let form access store */}
        <CheckoutForm />
      </Elements>
    </div>
  );
}