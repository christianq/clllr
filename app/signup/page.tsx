"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [signupStatus, setSignupStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createUser = useMutation(api.users.createUser);

  // Check subdomain availability
  const checkSubdomain = async (value: string) => {
    setChecking(true);
    setAvailable(null);
    setError(null);
    try {
      const res = await fetch("/api/vercel/check-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: value }),
      });
      const data = await res.json();
      setAvailable(data.available);
    } catch (err) {
      setError("Failed to check subdomain");
    } finally {
      setChecking(false);
    }
  };

  // Handle subdomain input change
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    if (value) {
      checkSubdomain(value);
    } else {
      setAvailable(null);
    }
  };

  // Handle signup form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus(null);
    setError(null);
    if (!available) {
      setError("Subdomain is not available");
      return;
    }
    setSignupStatus("Creating subdomain...");
    try {
      const res = await fetch("/api/vercel/create-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create subdomain");
        setSignupStatus(null);
        return;
      }
      setSignupStatus("Creating user account...");
      try {
        await createUser({ name, email, subdomain, role: "store_owner" });
        setSignupStatus(`Signup complete! Your store is ready at https://${data.domain}`);
      } catch (err: any) {
        setError("Subdomain created, but failed to create user: " + (err?.message || err));
        setSignupStatus(null);
      }
    } catch (err) {
      setError("Signup failed");
      setSignupStatus(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your store
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {signupStatus && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{signupStatus}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="subdomain" className="sr-only">Store subdomain</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${available === false ? 'border-red-300' : available === true ? 'border-green-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="your-store"
                  value={subdomain}
                  onChange={handleSubdomainChange}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  .hurterlove.com
                </span>
              </div>
              {checking && <p className="mt-2 text-sm text-gray-500">Checking availability...</p>}
              {available !== null && !checking && (
                <p className={`mt-2 text-sm ${available ? 'text-green-600' : 'text-red-600'}`}>
                  {available ? 'Subdomain is available!' : 'Subdomain is taken'}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={checking || available === false || !subdomain || !email || !name}
            >
              {signupStatus ? 'Done' : 'Create store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}