'use client'
import React, { useContext, useState } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { Button } from '@/components/ui/button';
import LoaderOverlay from '@/app/_components/LoaderOverlay';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const { userDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleBuySubscription = async () => {
    if (!userDetail?.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe-create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userDetail.email })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to start Stripe checkout.');
        setLoading(false);
      }
    } catch (err) {
      setError('Stripe error.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4 flex flex-col items-center">
      <LoaderOverlay show={loading} />
      <h1 className="text-4xl font-extrabold mb-4 text-center">Upgrade to ClingAI Pro</h1>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full flex flex-col items-center mb-8 border border-gray-100">
        <div className="text-3xl font-bold mb-2">$5 <span className="text-lg font-medium">/ month</span></div>
        <div className="text-gray-500 mb-6">One simple plan. No hidden fees.</div>
        <ul className="text-left mb-6 space-y-3 w-full max-w-xs">
          <li className="flex items-center gap-2"><span className="text-green-500 font-bold">•</span> <span>200+ credits every month</span></li>
          <li className="flex items-center gap-2"><span className="text-green-500 font-bold">•</span> <span>Unlimited chat & follow-ups</span></li>
          <li className="flex items-center gap-2"><span className="text-green-500 font-bold">•</span> <span>Priority support</span></li>
          <li className="flex items-center gap-2"><span className="text-green-500 font-bold">•</span> <span>Early access to new features</span></li>
        </ul>
        <Button onClick={handleBuySubscription} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl text-lg w-full">
          Buy Subscription
        </Button>
        {error && <div className="text-red-500 text-center font-semibold mt-4">{error}</div>}
      </div>
      <div className="text-gray-400 text-sm text-center max-w-md">
        After payment, your account will be instantly upgraded and 200+ credits will be added every month. Cancel anytime.
      </div>
    </div>
  );
} 