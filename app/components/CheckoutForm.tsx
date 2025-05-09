'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';

// --- Customer Dropdown Logic ---
// TODO: Replace with actual customer fetching logic
interface Customer {
  id: string; // Stripe Customer ID (cus_xxx)
  name: string;
  email: string;
}

const dummyCustomers: Customer[] = [
  { id: 'cus_Pz...', name: 'Valerie Too', email: 'valerie.too@example.com' },
  { id: 'cus_Qy...', name: 'Test Customer', email: 'test.customer@example.com' },
  // Add more customers or fetch dynamically
];
// --- End Customer Dropdown Logic ---

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set default customer if needed, or based on logged-in user
    if (dummyCustomers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(dummyCustomers[0].id);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the PaymentIntent client secret from the URL query parameters
    // This happens if the user is redirected back after an off-session payment (like 3D Secure)
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          // TODO: Update UI, clear cart, redirect to success page, etc.
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      console.log('Stripe.js has not loaded yet.');
      setMessage('Stripe is not ready. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // --- Option 1: Update Payment Intent with Customer ID ---
    // If you created the Payment Intent *without* the customer ID on the checkout page load,
    // you might need to update it *before* confirming.
    // This requires the Payment Intent ID, which isn't directly available here usually.
    // It's often better to create the PI with the customer ID initially if possible (like in Option 2 below).

    // --- Option 2: Pass customer details during confirmation (if applicable) ---
    // Some confirmation methods might allow passing customer details, but confirmPayment
    // primarily relies on the details associated with the PaymentIntent itself.
    // The best practice is to associate the customer when *creating* the PaymentIntent on the server.
    // We assume the selectedCustomerId was passed to the /api/create-payment-intent endpoint
    // via a separate state management or prop drilling mechanism if needed *before* this form rendered.
    // For simplicity here, we'll just proceed assuming the PI was created correctly.

    const { error } = await stripe.confirmPayment({
      elements, // Pass the Elements instance
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment-status`, // The URL to redirect to after payment
        // Optionally pass payment_method_data like billing details if not collected by Elements
        // payment_method_data: {
        //   billing_details: {
        //     name: 'Jenny Rosen',
        //     email: 'jenny.rosen@example.com',
        //   },
        // },
      },
      // If you redirect immediately, you might not show inline errors from confirmPayment
      // redirect: 'if_required' // Default is 'if_required'
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'An error occurred.');
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      // Redirect happens automatically, or you might handle it here if redirect: 'if_required' isn't sufficient
      // setMessage("Payment processing...");
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs"
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">

      {/* Customer Dropdown */}
      <div className="mb-4">
        <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Customer
        </label>
        <select
          id="customer-select"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border"
          disabled={isLoading}
        >
          <option value="" disabled>-- Select a customer --</option>
          {dummyCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
        {/* TODO: Fetch real customers and handle selection properly,
             potentially re-fetching the PaymentIntent with the new customer ID if needed,
             although it's better to create it with the ID initially. */}
      </div>

      {/* Optional: Email input for Link (Stripe's fast checkout) */}
      <LinkAuthenticationElement
        id="link-authentication-element"
        // @ts-expect-error - Stripe types might be slightly off depending on version
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4"
      />

      {/* Payment Element: Renders Card input, Google Pay, Apple Pay, etc. */}
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className={`w-full py-2 px-4 text-white font-semibold ${
          isLoading || !stripe || !elements
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } transition-colors`}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>

      {/* Show any error or success messages */}
      {message && <div id="payment-message" className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
    </form>
  );
}