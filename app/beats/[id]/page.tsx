'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { IBeat } from '@/models/Beat';
import { licenseTerms } from '@/lib/license-terms';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BeatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [beat, setBeat] = useState<IBeat | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<'MP3 Lease' | 'WAV Lease' | 'Trackout Lease' | 'Exclusive' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchBeat();
    }
  }, [params.id]);

  const fetchBeat = async () => {
    try {
      const res = await fetch(`/api/beats/${params.id}`);
      const data = await res.json();
      setBeat(data.beat);
    } catch (error) {
      console.error('Error fetching beat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beat || !selectedLicense) return;

    if (selectedLicense === 'Exclusive' && !beat.exclusivePrice) {
      alert('Exclusive license not available. Please contact for pricing.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatId: beat._id,
          customerName,
          customerEmail,
          licenseType: selectedLicense,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initiate checkout. Please try again.');
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Beat not found</p>
      </div>
    );
  }

  const getPrice = (licenseType: string) => {
    if (licenseType === 'MP3 Lease') return beat.mp3Price;
    if (licenseType === 'WAV Lease') return beat.wavPrice;
    if (licenseType === 'Trackout Lease') return beat.trackoutPrice;
    if (licenseType === 'Exclusive') return beat.exclusivePrice || 0;
    return 0;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Beat Image/Player */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-6">
              {beat.imageUrl ? (
                <Image
                  src={beat.imageUrl}
                  alt={beat.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              )}
              {beat.isSold && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                  SOLD
                </div>
              )}
            </div>
            {beat.mp3Url && (
              <audio controls className="w-full">
                <source src={beat.mp3Url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>

          {/* Beat Info & Checkout */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{beat.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1 bg-gray-100 rounded-full text-sm font-medium">
                {beat.category}
              </span>
              <span className="text-gray-600">{beat.bpm} BPM</span>
              <span className="text-gray-600">Key: {beat.key}</span>
            </div>
            {beat.description && (
              <p className="text-gray-700 mb-8 leading-relaxed">{beat.description}</p>
            )}

            {beat.isSold ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-semibold text-lg">This beat has been sold</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Choose Your License</h2>
                
                {/* License Options */}
                <div className="space-y-3 mb-6">
                  {(['MP3 Lease', 'WAV Lease', 'Trackout Lease'] as const).map((licenseType) => {
                    const terms = licenseTerms[licenseType];
                    const price = getPrice(licenseType);
                    return (
                      <button
                        key={licenseType}
                        onClick={() => setSelectedLicense(licenseType)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                          selectedLicense === licenseType
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{licenseType}</p>
                            <p className="text-sm text-gray-600">{terms.rights[0]}</p>
                          </div>
                          <p className="text-lg font-bold">£{price}</p>
                        </div>
                      </button>
                    );
                  })}
                  
                  {beat.exclusivePrice && (
                    <button
                      onClick={() => setSelectedLicense('Exclusive')}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                        selectedLicense === 'Exclusive'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Exclusive License</p>
                          <p className="text-sm text-gray-600">Exclusive rights + Beat removed</p>
                        </div>
                        <p className="text-lg font-bold">£{beat.exclusivePrice}</p>
                      </div>
                    </button>
                  )}
                </div>

                {selectedLicense && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">License Includes:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {licenseTerms[selectedLicense].rights.map((right, idx) => (
                        <li key={idx}>• {right}</li>
                      ))}
                    </ul>
                    <p className="text-sm mt-3 font-medium">
                      Publishing: {licenseTerms[selectedLicense].publishing}
                    </p>
                    <p className="text-sm mt-1">
                      {licenseTerms[selectedLicense].credit}
                    </p>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={checkoutLoading || !selectedLicense}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? 'Processing...' : selectedLicense ? `Purchase ${selectedLicense} - £${getPrice(selectedLicense)}` : 'Select a License'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
