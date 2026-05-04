import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse } from "./user";

export type ReferralStatus = "pending" | "registered" | "course_purchased" | "test_purchased" | "bundle_purchased";
export type PointsTransactionType = "earned" | "spent";

export interface PointsRule {
    id?: number;
    action_key: string;
    action_label: string;
    points: number;
    is_active: boolean;
}

export interface PointsConfig {
    rules: PointsRule[];
    conversion_rate: number;
}

export interface PointsConfigResponse extends GlobalResponse {
    data: PointsConfig;
}

export interface ReferralProps {
    id: number;
    referrer_id: number;
    referrer_name: string;
    referred_user_id?: number;
    referred_user_name?: string;
    referral_code: string;
    status: ReferralStatus;
    points_earned: number;
    created_at: string;
}

export interface PointsTransactionProps {
    id: number;
    user_id: number;
    user_name: string;
    action_key: string;
    action_label: string;
    transaction_type: PointsTransactionType;
    points: number;
    balance_after: number;
    created_at: string;
}

export interface UserReferralStats {
    referral_code: string;
    total_referred: number;
    total_converted: number;
    points_from_referrals: number;
    total_points_balance: number;
}

export interface ReferralOverview {
    total_referrals: number;
    conversion_rate: number;
    total_points_distributed: number;
    total_points_redeemed: number;
    top_referrers: TopReferrer[];
}

export interface TopReferrer {
    user_id: number;
    user_name: string;
    referrals_count: number;
    converted_count: number;
    points_earned: number;
}

export interface ReferralOverviewResponse extends GlobalResponse {
    data: ReferralOverview;
}

export interface UserReferralStatsResponse extends GlobalResponse {
    data: UserReferralStats;
}

export interface ReferralList extends GlobalResponse {
    data: {
        data: ReferralProps[];
        pagination: Pagination;
    };
}

export interface PointsTransactionList extends GlobalResponse {
    data: {
        data: PointsTransactionProps[];
        pagination: Pagination;
    };
}

export interface ReferralUserHistory extends GlobalResponse {
    data: {
        data: ReferralProps[];
        pagination: Pagination;
    };
}

export interface UserPointsTransactionList extends GlobalResponse {
    data: {
        data: PointsTransactionProps[];
        pagination: Pagination;
    };
}

// ─── Marketing Links ──────────────────────────────────────────────────────────

export type MarketingLinkSource =
    | "google_ads"
    | "facebook_ads"
    | "instagram"
    | "twitter"
    | "youtube"
    | "email"
    | "sms"
    | "other";

export const MARKETING_LINK_SOURCE_LABELS: Record<MarketingLinkSource, string> = {
    google_ads: "Google Ads",
    facebook_ads: "Facebook Ads",
    instagram: "Instagram",
    twitter: "Twitter / X",
    youtube: "YouTube",
    email: "Email Campaign",
    sms: "SMS Campaign",
    other: "Other",
};

export type MarketingLinkActivityAction = "click" | "registration" | "purchase";

export interface MarketingLinkProps {
    id: number;
    name: string;
    source: MarketingLinkSource;
    campaign_code: string;
    tracking_url: string;
    description?: string;
    clicks: number;
    registrations: number;
    purchases: number;
    conversion_rate: number;
    revenue_generated: number;
    is_active: boolean;
    created_at: string;
}

export interface MarketingLinkFormProps {
    name: string;
    source: MarketingLinkSource;
    description?: string;
    is_active: boolean;
}

export interface MarketingLinkActivityProps {
    id: number;
    user_id?: number;
    user_name?: string;
    user_email?: string;
    action: MarketingLinkActivityAction;
    amount?: number;
    created_at: string;
}

export interface MarketingLinkList extends GlobalResponse {
    data: {
        data: MarketingLinkProps[];
        pagination: Pagination;
    };
}

export interface MarketingLinkDetailResponse extends GlobalResponse {
    data: MarketingLinkProps;
}

export interface MarketingLinkActivityList extends GlobalResponse {
    data: {
        data: MarketingLinkActivityProps[];
        pagination: Pagination;
    };
}

export interface MarketingLinksAnalyticsItem {
    title: string;
    value: number;
    description: string | null;
    type: "success" | "error" | "info" | "warning";
}

export interface MarketingLinksAnalyticsResponse {
    status: number;
    data: MarketingLinksAnalyticsItem[];
    message: string;
}

// ─── Coupon Codes ─────────────────────────────────────────────────────────────

export type CouponDiscountType = "percentage" | "fixed";

export const COUPON_DISCOUNT_TYPE_LABELS: Record<CouponDiscountType, string> = {
    percentage: "Percentage",
    fixed: "Fixed Amount",
};

export interface CouponCodeProps {
    id: number;
    code: string;
    discount_type: CouponDiscountType;
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    expiry_date?: string;
    usage_limit?: number;
    used_count: number;
    is_active: boolean;
    created_at: string;
}

export interface CouponCodeFormProps {
    code: string;
    discount_type: CouponDiscountType;
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    expiry_date?: string;
    usage_limit?: number;
    is_active: boolean;
}

export interface CouponCodeList extends GlobalResponse {
    data: {
        data: CouponCodeProps[];
        pagination: Pagination;
    };
}

export interface CouponCodeDetailResponse extends GlobalResponse {
    data: CouponCodeProps;
}

export interface CouponCodeAnalyticsResponse {
    status: number;
    data: MarketingLinksAnalyticsItem[];
    message: string;
}
