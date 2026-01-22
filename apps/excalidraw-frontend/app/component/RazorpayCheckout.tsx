"use client";

import { useState } from "react";
import { BASE_URL } from "../config";

// Razorpay key from environment
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

interface RazorpayCheckoutProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  token: string;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Razorpay Checkout Component
 * Handles the complete payment flow:
 * 1. Create order on backend
 * 2. Open Razorpay checkout
 * 3. Verify payment on backend
 */
export function RazorpayCheckout({
  onSuccess,
  onError,
  token,
  buttonText = "Upgrade to Premium",
  buttonClassName = "",
  disabled = false,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (loading || disabled) return;

    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay. Please refresh and try again.",
        );
      }

      // Create order on backend
      const orderResponse = await fetch(
        `${BASE_URL}/subscription/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const { orderId, amount, currency, keyId } = await orderResponse.json();

      // Open Razorpay checkout
      const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "DrawTogether",
        description: "Premium Subscription - 30 Days",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${BASE_URL}/subscription/verify`,
              {
                method: "POST",
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || "Payment verification failed");
            }

            onSuccess();
          } catch (err: any) {
            onError(err.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {},
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      onError(err.message);
      setLoading(false);
    }
  };

  const defaultClassName = `
    px-6 py-3 
    bg-gradient-to-r from-blue-600 to-purple-600 
    hover:from-blue-700 hover:to-purple-700
    text-white font-semibold rounded-lg 
    transition-all duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed
    ${buttonClassName}
  `.trim();

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={defaultClassName}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}
