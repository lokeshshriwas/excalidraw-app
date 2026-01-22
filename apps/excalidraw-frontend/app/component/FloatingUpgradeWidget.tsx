"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../hooks/useSubscription";

interface FloatingUpgradeWidgetProps {
  className?: string;
}

const FloatingUpgradeWidget: React.FC<FloatingUpgradeWidgetProps> = ({
  className = "",
}) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const { subscription, loading } = useSubscription(token);

  // Don't show widget if:
  // - Still loading
  // - User has active premium subscription
  // - Widget was dismissed
  if (loading || !isVisible) {
    return null;
  }

  // Check if user is premium and not expired
  const isPremiumActive =
    subscription?.planType === "PREMIUM" &&
    subscription?.isActive &&
    !subscription?.isExpired;

  // Don't show for premium users
  if (isPremiumActive) {
    return null;
  }

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={handleMinimize}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-xs ${className}`}>
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        {/* Close and minimize buttons */}
        <div className="flex justify-end gap-1 mb-2">
          <button
            onClick={handleMinimize}
            className="text-gray-400 hover:text-white p-1 transition-colors"
            title="Minimize"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 transition-colors"
            title="Dismiss"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Upgrade to Pro</h3>
            <p className="text-gray-400 text-xs">Unlock full potential</p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="text-gray-300 text-xs space-y-1 mb-4">
          <li className="flex items-center gap-2">
            <svg
              className="w-3 h-3 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Create up to 10 canvases
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-3 h-3 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Full edit access to all rooms
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-3 h-3 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Priority support
          </li>
        </ul>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <span>Upgrade Now</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>

        {/* Current plan indicator */}
        {subscription?.isExpired && (
          <p className="text-orange-400 text-xs text-center mt-2">
            ⚠️ Your subscription has expired
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingUpgradeWidget;
