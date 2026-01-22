import { prismaClient } from "@repo/db";
import { SUBSCRIPTION_CONFIG } from "@repo/backend-common/config";

/**
 * Subscription Service
 * Handles all subscription-related business logic including:
 * - Fetching user subscriptions
 * - Calculating canvas limits based on plan
 * - Checking subscription validity and expiry
 * - Activating/deactivating subscriptions
 */

export interface SubscriptionInfo {
    userId: string;
    planType: 'FREE' | 'PREMIUM';
    isActive: boolean;
    endDate: Date | null;
    canvasLimit: number;
    canvasCount: number;
    canCreateCanvas: boolean;
    isExpired: boolean;
}

/**
 * Get user's subscription info with computed properties
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
    const [subscription, canvasCount] = await Promise.all([
        prismaClient.subscription.findUnique({
            where: { userId },
        }),
        prismaClient.room.count({
            where: { adminId: userId },
        }),
    ]);

    console.log('getUserSubscription - userId:', userId);
    console.log('getUserSubscription - subscription found:', subscription);
    console.log('getUserSubscription - canvasCount:', canvasCount);

    // Default to FREE plan if no subscription exists
    if (!subscription) {
        console.log('getUserSubscription - No subscription found, returning FREE');
        return {
            userId,
            planType: 'FREE',
            isActive: true,
            endDate: null,
            canvasLimit: SUBSCRIPTION_CONFIG.FREE_CANVAS_LIMIT,
            canvasCount,
            canCreateCanvas: canvasCount < SUBSCRIPTION_CONFIG.FREE_CANVAS_LIMIT,
            isExpired: false,
        };
    }

    const now = new Date();
    const isExpired = subscription.planType === 'PREMIUM' &&
        subscription.endDate !== null &&
        subscription.endDate < now;

    // If premium expired, treat as expired premium (read-only, 2 visible)
    const effectivePlanType = isExpired ? 'FREE' : subscription.planType;
    const canvasLimit = effectivePlanType === 'PREMIUM'
        ? SUBSCRIPTION_CONFIG.PREMIUM_CANVAS_LIMIT
        : SUBSCRIPTION_CONFIG.FREE_CANVAS_LIMIT;

    return {
        userId,
        planType: subscription.planType,
        isActive: subscription.status === 'ACTIVE' && !isExpired,
        endDate: subscription.endDate,
        canvasLimit,
        canvasCount,
        canCreateCanvas: canvasCount < canvasLimit && !isExpired,
        isExpired,
    };
}

/**
 * Get the canvas limit for a user based on their subscription
 */
export async function getCanvasLimit(userId: string): Promise<number> {
    const subscription = await getUserSubscription(userId);
    return subscription.canvasLimit;
}

/**
 * Check if user can create a new canvas
 */
export async function canUserCreateCanvas(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId);

    if (subscription.isExpired) {
        return {
            allowed: false,
            reason: 'Your premium subscription has expired. Please renew to create new canvases.',
        };
    }

    if (!subscription.canCreateCanvas) {
        return {
            allowed: false,
            reason: `You have reached your canvas limit (${subscription.canvasLimit}). ${subscription.planType === 'FREE'
                ? 'Upgrade to Premium to create up to 10 canvases.'
                : 'You have reached the maximum canvas limit.'
                }`,
        };
    }

    return { allowed: true };
}

/**
 * Activate premium subscription after successful payment
 */
export async function activateSubscription(
    userId: string,
    paymentId: string
): Promise<void> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + SUBSCRIPTION_CONFIG.PREMIUM_DURATION_DAYS);

    await prismaClient.$transaction(async (tx) => {
        // Create or update subscription
        await tx.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planType: 'PREMIUM',
                status: 'ACTIVE',
                startDate: now,
                endDate,
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
            },
            update: {
                planType: 'PREMIUM',
                status: 'ACTIVE',
                startDate: now,
                endDate,
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
                canceledAt: null,
            },
        });

        // Get subscription id for linking payment
        const subscription = await tx.subscription.findUnique({
            where: { userId },
        });

        // Update payment with subscription link
        if (subscription) {
            await tx.payment.update({
                where: { id: paymentId },
                data: { subscriptionId: subscription.id },
            });
        }
    });
}

/**
 * Mark subscription as expired (called by cron/middleware check)
 */
export async function expireSubscription(userId: string): Promise<void> {
    await prismaClient.subscription.update({
        where: { userId },
        data: {
            status: 'EXPIRED',
        },
    });
}

/**
 * Get visible canvases for user based on subscription
 * FREE/Expired: Only 2 most recently updated
 * PREMIUM: All canvases
 */
export async function getVisibleCanvases(userId: string) {
    const subscription = await getUserSubscription(userId);

    const rooms = await prismaClient.room.findMany({
        where: {
            OR: [
                { adminId: userId },
                { users: { some: { id: userId } } },
            ],
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            admin: { select: { id: true, name: true, email: true } },
            users: { select: { id: true, name: true, email: true, avatar: true } },
        },
    });

    // If expired or free, limit to 2 most recent
    if (subscription.isExpired || subscription.planType === 'FREE') {
        const visibleRooms = rooms.slice(0, SUBSCRIPTION_CONFIG.FREE_CANVAS_LIMIT);
        const hiddenCount = Math.max(0, rooms.length - SUBSCRIPTION_CONFIG.FREE_CANVAS_LIMIT);

        return {
            rooms: visibleRooms,
            hiddenCount,
            isReadOnly: subscription.isExpired,
            subscription,
        };
    }

    return {
        rooms,
        hiddenCount: 0,
        isReadOnly: false,
        subscription,
    };
}
