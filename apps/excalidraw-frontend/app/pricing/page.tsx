"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MobileMenu } from "../component/MobileMenu";
import { RazorpayCheckout } from "../component/RazorpayCheckout";
import { SubscriptionBadge } from "../component/SubscriptionBadge";
import { useSubscription } from "../hooks/useSubscription";

export default function PricingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const { subscription, loading, refresh, isPremium, isExpired } =
    useSubscription(token);

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    setError(null);
    refresh();
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                DrawTogether
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </Link>
              {token ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Start for free
                  </Link>
                </>
              )}
            </div>

            <MobileMenu />
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start for free with 2 rooms. Upgrade to Pro when you need more space
            to create.
          </p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">
                  Payment successful!
                </p>
                <p className="text-sm text-green-600">
                  Your Premium subscription is now active for 30 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">Payment failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Current Subscription Status */}
        {token && subscription && !loading && (
          <div className="max-w-md mx-auto mb-12">
            <SubscriptionBadge
              planType={subscription.planType}
              isActive={subscription.isActive}
              isExpired={subscription.isExpired}
              endDate={subscription.endDate}
              canvasCount={subscription.canvasCount}
              canvasLimit={subscription.canvasLimit}
            />
          </div>
        )}

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Free Plan */}
          <div
            className={`bg-white border-2 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow ${
              subscription?.planType === "FREE" && !isExpired
                ? "border-blue-500"
                : "border-gray-200"
            }`}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                {subscription?.planType === "FREE" && !isExpired && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600">
                Perfect for personal projects and trying out DrawTogether
              </p>
            </div>

            {token ? (
              subscription?.planType === "FREE" && !isExpired ? (
                <div className="block w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold text-center mb-8">
                  Current Plan
                </div>
              ) : (
                <div className="block w-full py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold text-center mb-8">
                  Free features included
                </div>
              )
            ) : (
              <Link
                href="/login"
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors mb-8 text-center"
              >
                Start for free
              </Link>
            )}

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">2 collaborative rooms</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Unlimited collaborators per room
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time synchronization</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Infinite canvas</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic drawing tools</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div
            className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl ${
              isPremium ? "ring-4 ring-purple-300" : ""
            }`}
          >
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                {isPremium ? "YOUR PLAN" : "POPULAR"}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold">₹1000</span>
                <span className="text-blue-100 ml-2">/month</span>
              </div>
              <p className="text-blue-100">
                For professionals and growing teams who need more rooms
              </p>
            </div>

            {token ? (
              isPremium ? (
                <div className="block w-full py-3 bg-white/20 text-white rounded-lg font-semibold text-center mb-8">
                  Active until{" "}
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString()
                    : ""}
                </div>
              ) : (
                <RazorpayCheckout
                  token={token}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  buttonText={isExpired ? "Renew Premium" : "Upgrade to Pro"}
                  buttonClassName="block w-full py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors mb-8 text-center"
                />
              )
            ) : (
              <Link
                href="/login"
                className="block w-full py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors mb-8 text-center"
              >
                Upgrade to Pro
              </Link>
            )}

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span className="font-semibold">10 collaborative rooms</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Unlimited collaborators per room</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Real-time synchronization</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Infinite canvas</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Advanced drawing tools</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Pro at any time. After your subscription
                expires, you'll automatically return to the Free plan with
                read-only access to your rooms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my rooms if my subscription expires?
              </h3>
              <p className="text-gray-600">
                Your rooms remain accessible in read-only mode. Only your 2 most
                recently updated rooms will be visible. Renew your subscription
                to regain full edit access.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many people can collaborate in one room?
              </h3>
              <p className="text-gray-600">
                There's no limit! Invite as many collaborators as you need to
                any room, on both Free and Pro plans.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit/debit cards, UPI, net banking, and
                wallets through Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>
            © {new Date().getFullYear()} DrawTogether. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
