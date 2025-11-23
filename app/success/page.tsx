'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (sessionId) {
      checkOrderStatus();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const checkOrderStatus = async () => {
    if (!sessionId) return;
    
    setChecking(true);
    try {
      // First, try to process the order (this will work even if webhook hasn't fired)
      const processRes = await fetch('/api/orders/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (processRes.ok) {
        const processData = await processRes.json();
        setOrderData(processData.order);
        setLoading(false);
        setChecking(false);
        return;
      }

      // If processing failed, try to get existing order status
      const res = await fetch(`/api/orders/session/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderData(data.order);
      }
    } catch (error) {
      console.error('Error checking order:', error);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Processing your order...</p>
          <p className="text-sm text-gray-400">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Thank you for your purchase. {orderData?.filesDelivered ? 'Your files and license agreement have been sent to your email.' : 'Your order is being processed. You will receive an email shortly with your files and license agreement.'}
          </p>
        </div>


        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold mb-4">What's Next?</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Check your email for download links</li>
            <li>✓ Download your MP3, WAV, and trackout files</li>
            <li>✓ Review your license agreement PDF</li>
            <li>✓ Start creating your music!</li>
          </ul>
          {!orderData?.filesDelivered && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                If you don't receive the email within a few minutes, please check your spam folder or contact us.
              </p>
              <button
                onClick={checkOrderStatus}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Check Order Status Again
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/beats"
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse More Beats
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

