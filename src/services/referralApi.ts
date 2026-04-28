import type { QueryParams } from "../types";
import type {
    PointsConfigResponse,
    PointsConfig,
    ReferralList,
    PointsTransactionList,
    ReferralOverviewResponse,
    UserReferralStatsResponse,
    ReferralUserHistory,
    UserPointsTransactionList,
    ReferralStatus,
    PointsTransactionType,
    MarketingLinkList,
    MarketingLinkDetailResponse,
    MarketingLinkActivityList,
    MarketingLinkFormProps,
    MarketingLinkActivityAction,
    MarketingLinksAnalyticsResponse,
    CouponCodeList,
    CouponCodeDetailResponse,
    CouponCodeFormProps,
    CouponDiscountType,
    CouponCodeAnalyticsResponse,
} from "../types/referral";
import type { GlobalResponse } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const referralApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPointsConfig: builder.query<PointsConfigResponse, void>({
            query: () => ({ url: `admin/referral/config`, method: "GET" }),
            providesTags: [{ type: "PointsConfig", id: "LIST" }],
        }),

        updatePointsConfig: builder.mutation<GlobalResponse, PointsConfig>({
            query: (body) => ({ url: `admin/referral/config`, method: "PUT", body }),
            invalidatesTags: [{ type: "PointsConfig", id: "LIST" }],
        }),

        getReferralOverview: builder.query<ReferralOverviewResponse, void>({
            query: () => ({ url: `admin/referral/overview`, method: "GET" }),
            providesTags: [{ type: "ReferralOverview", id: "LIST" }],
        }),

        getAllReferrals: builder.query<ReferralList, QueryParams & { status?: ReferralStatus | "" }>({
            query: ({ pageIndex, pageSize, search, status, startDate, endDate }) => ({
                url: `admin/referrals?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    status,
                    start_date: startDate,
                    end_date: endDate,
                })}`,
                method: "GET",
            }),
            providesTags: [{ type: "Referral", id: "LIST" }],
        }),

        getAllPointsTransactions: builder.query<
            PointsTransactionList,
            QueryParams & { transaction_type?: PointsTransactionType | ""; action_key?: string }
        >({
            query: ({ pageIndex, pageSize, search, transaction_type, action_key, startDate, endDate }) => ({
                url: `admin/points-transactions?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    transaction_type,
                    action_key,
                    start_date: startDate,
                    end_date: endDate,
                })}`,
                method: "GET",
            }),
            providesTags: [{ type: "PointsTransaction", id: "LIST" }],
        }),

        getUserReferralStats: builder.query<UserReferralStatsResponse, { id: string }>({
            query: ({ id }) => ({ url: `admin/referrals/user/${id}`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "Referral", id }],
        }),

        getUserReferralHistory: builder.query<ReferralUserHistory, QueryParams & { id: string }>({
            query: ({ id, pageIndex, pageSize, search }) => ({
                url: `admin/referrals/user/${id}/history?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Referral", id: `history-${id}` }],
        }),

        getUserPointsTransactions: builder.query<
            UserPointsTransactionList,
            QueryParams & { id: string; transaction_type?: PointsTransactionType | "" }
        >({
            query: ({ id, pageIndex, pageSize, transaction_type }) => ({
                url: `admin/points-transactions/user/${id}?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    transaction_type,
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "PointsTransaction", id }],
        }),

        // ── Marketing Links ───────────────────────────────────────────────────

        getAllMarketingLinks: builder.query<MarketingLinkList, QueryParams & { source?: string }>({
            query: ({ pageIndex, pageSize, search, source }) => ({
                url: `admin/marketing-links?${buildQueryParams({ page: pageIndex, page_size: pageSize, search, source })}`,
                method: "GET",
            }),
            providesTags: [{ type: "MarketingLink", id: "LIST" }],
        }),

        getMarketingLinkById: builder.query<MarketingLinkDetailResponse, { id: number }>({
            query: ({ id }) => ({ url: `admin/marketing-links/${id}`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "MarketingLink", id }],
        }),

        createMarketingLink: builder.mutation<MarketingLinkDetailResponse, { body: MarketingLinkFormProps }>({
            query: ({ body }) => ({ url: `admin/marketing-links`, method: "POST", body }),
            invalidatesTags: [{ type: "MarketingLink", id: "LIST" }],
        }),

        updateMarketingLink: builder.mutation<MarketingLinkDetailResponse, { id: number; body: Partial<MarketingLinkFormProps> }>({
            query: ({ id, body }) => ({ url: `admin/marketing-links/${id}`, method: "PUT", body }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "MarketingLink", id: "LIST" },
                { type: "MarketingLink", id },
            ],
        }),

        deleteMarketingLinks: builder.mutation<GlobalResponse, { ids: number[] }>({
            query: ({ ids }) => ({ url: `admin/marketing-links`, method: "DELETE", body: { ids } }),
            invalidatesTags: [{ type: "MarketingLink", id: "LIST" }],
        }),

        getMarketingLinkActivity: builder.query<
            MarketingLinkActivityList,
            QueryParams & { id: number; action?: MarketingLinkActivityAction | "" }
        >({
            query: ({ id, pageIndex, pageSize, action }) => ({
                url: `admin/marketing-links/${id}/activity?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    action,
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "MarketingLink", id: `activity-${id}` }],
        }),

        getMarketingLinksAnalytics: builder.query<MarketingLinksAnalyticsResponse, void>({
            query: () => ({ url: "admin/marketing-links/analytics", method: "GET" }),
            providesTags: [{ type: "MarketingLink", id: "ANALYTICS" }],
        }),

        // ── Coupon Codes ──────────────────────────────────────────────────────

        getCouponCodesAnalytics: builder.query<CouponCodeAnalyticsResponse, void>({
            query: () => ({ url: "admin/coupon-codes/analytics", method: "GET" }),
            providesTags: [{ type: "CouponCode", id: "ANALYTICS" }],
        }),

        getAllCouponCodes: builder.query<CouponCodeList, QueryParams & { discount_type?: CouponDiscountType | "" }>({
            query: ({ pageIndex, pageSize, search, discount_type }) => ({
                url: `admin/coupon-codes?${buildQueryParams({ page: pageIndex, page_size: pageSize, search, discount_type })}`,
                method: "GET",
            }),
            providesTags: [{ type: "CouponCode", id: "LIST" }],
        }),

        createCouponCode: builder.mutation<CouponCodeDetailResponse, { body: CouponCodeFormProps }>({
            query: ({ body }) => ({ url: "admin/coupon-codes", method: "POST", body }),
            invalidatesTags: [{ type: "CouponCode", id: "LIST" }],
        }),

        updateCouponCode: builder.mutation<CouponCodeDetailResponse, { id: number; body: Partial<CouponCodeFormProps> }>({
            query: ({ id, body }) => ({ url: `admin/coupon-codes/${id}`, method: "PUT", body }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "CouponCode", id: "LIST" },
                { type: "CouponCode", id },
            ],
        }),

        deleteCouponCodes: builder.mutation<GlobalResponse, { ids: number[] }>({
            query: ({ ids }) => ({ url: "admin/coupon-codes", method: "DELETE", body: { ids } }),
            invalidatesTags: [{ type: "CouponCode", id: "LIST" }],
        }),
    }),
});

export const {
    useGetPointsConfigQuery,
    useUpdatePointsConfigMutation,
    useGetReferralOverviewQuery,
    useGetAllReferralsQuery,
    useGetAllPointsTransactionsQuery,
    useGetUserReferralStatsQuery,
    useGetUserReferralHistoryQuery,
    useGetUserPointsTransactionsQuery,
    useGetAllMarketingLinksQuery,
    useGetMarketingLinkByIdQuery,
    useCreateMarketingLinkMutation,
    useUpdateMarketingLinkMutation,
    useDeleteMarketingLinksMutation,
    useGetMarketingLinkActivityQuery,
    useGetMarketingLinksAnalyticsQuery,
    useGetCouponCodesAnalyticsQuery,
    useGetAllCouponCodesQuery,
    useCreateCouponCodeMutation,
    useUpdateCouponCodeMutation,
    useDeleteCouponCodesMutation,
} = referralApi;
