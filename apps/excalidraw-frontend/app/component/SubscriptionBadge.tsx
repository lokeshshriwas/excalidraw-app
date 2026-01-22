"use client";

import React from "react";
import { Crown, Clock, AlertCircle } from "lucide-react";

interface SubscriptionBadgeProps {
  planType: "FREE" | "PREMIUM";
  isActive: boolean;
  isExpired: boolean;
  endDate: string | null;
  canvasCount: number;
  canvasLimit: number;
}

/**
 * Display current subscription status with visual indicators
 */
export function SubscriptionBadge({
  planType,
  isActive,
  isExpired,
  endDate,
  canvasCount,
  canvasLimit,
}: SubscriptionBadgeProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const end = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  if (planType === "PREMIUM" && isActive && !isExpired && endDate) {
    const daysRemaining = getDaysRemaining(endDate);

    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Premium Plan</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining (expires ${formatDate(endDate)})`
                  : `Expires today`}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">{canvasCount}</span> of{" "}
          <span className="font-medium">{canvasLimit}</span> canvases used
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                Premium Expired
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Read-Only
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              Your canvases are now read-only. Renew to regain full access.
            </p>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Only your <span className="font-medium">2 most recent</span> canvases
          are visible
        </div>
      </div>
    );
  }

  // Free plan
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <Crown className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <span className="font-semibold text-gray-900">Free Plan</span>
          <p className="text-sm text-gray-600 mt-0.5">
            Upgrade to Premium for more canvases
          </p>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        <span className="font-medium">{canvasCount}</span> of{" "}
        <span className="font-medium">{canvasLimit}</span> canvases used
      </div>
    </div>
  );
}

/**
 * Read-only badge for expired subscriptions
 */
export function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
      <AlertCircle className="w-3 h-3" />
      Read-Only
    </span>
  );
}
