'use client';

import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../config';

/**
 * Subscription status information
 */
export interface SubscriptionInfo {
    userId: string;
    planType: 'FREE' | 'PREMIUM';
    isActive: boolean;
    endDate: string | null;
    canvasLimit: number;
    canvasCount: number;
    canCreateCanvas: boolean;
    isExpired: boolean;
}

/**
 * Hook for fetching and managing subscription status
 */
export function useSubscription(token: string | null) {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/subscription/status`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subscription status');
            }

            const data = await response.json();
            setSubscription(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching subscription:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const refresh = useCallback(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    return {
        subscription,
        loading,
        error,
        refresh,
        isPremium: subscription?.planType === 'PREMIUM' && subscription?.isActive,
        isExpired: subscription?.isExpired ?? false,
        canCreateCanvas: subscription?.canCreateCanvas ?? false,
        canvasLimit: subscription?.canvasLimit ?? 2,
        canvasCount: subscription?.canvasCount ?? 0,
    };
}
