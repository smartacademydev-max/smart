import type { QueryParams, UserStatus } from "../types";
import type { PaymentMethodsResponse } from "../types/transaction";
import type { GlobalResponse, RegisterUserProps, UserList } from "../types/user";
import type { NewSignUpsResponse, RoleDistributionResponse, UserAnalyticsResponse } from "../types/userAnalytics";
import type { CourseAnalyticsResponse, LoginHistoryResponse, MonthlyActivityResponse, PerformanceAnalyticsResponse, RecentActivityResponse, TrackPerformanceResponse, UserEnrolledBundleResponse, UserEnrolledTestResponse, UserProfileResponse } from "../types/userProfile";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export interface UserImportResultRow {
    row: number;
    message: string;
}

export interface UserImportResult {
    total: number;
    created: number;
    skipped: number;
    errors: UserImportResultRow[];
    reset_links_sent: number;
}

/** Columns the backend expects in the bulk-import file. */
export const USER_IMPORT_TEMPLATE_COLUMNS = [
    "name",
    "email",
    "phone",
    "role",
    "designation",
];

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createUser: builder.mutation<GlobalResponse, FormData>({
            query: (body) => ({
                url: "/admin/user",
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "User", id: "LIST" }, { type: "MenuCounts", id: "ALL" }]
        }),

        getAllUser: builder.query<UserList, QueryParams & { role?: number | string; status?: UserStatus; days?: number | null; admin_filter?: string | null; }>({
            query: ({ pageIndex, pageSize, search, role, status, days, startDate, endDate, admin_filter }) => {
                const params = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    role: role,
                    status: status,
                    start_date: startDate,
                    end_date: endDate,
                    days: days,
                    admin_filter: admin_filter ?? undefined,
                });

                return {
                    url: `/admin/user?${params}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((user) => ({ type: "User" as const, id: user.id })),
                        { type: "User", id: "LIST" },
                    ]
                    : [{ type: "User", id: "LIST" }],
        }),
        getAllUserExcludeStudents: builder.query<UserList, QueryParams & { role?: number | string; status?: UserStatus; days?: number | null; }>({
            query: ({ pageIndex, pageSize, search, role, status, days, startDate, endDate }) => {
                const params = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    role: role,
                    status: status,
                    start_date: startDate,
                    end_date: endDate,
                    days: days,
                    
                });

                return {
                    url: `/admin/user/exclude-students?${params}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((user) => ({ type: "User" as const, id: user.id })),
                        { type: "User", id: "LIST" },
                    ]
                    : [{ type: "User", id: "LIST" }],
        }),
        editUser: builder.mutation<{ data: RegisterUserProps; message: string }, { body: FormData; id: string }>({
            query: ({ body, id }) => ({
                url: `/admin/user/${id}`,
                method: "POST",
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "User", id },
                { type: "User", id: "LIST" }
            ],
        }),
        deleteUser: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/user/`,
                method: "DELETE",
                body: { users: body }
            }),
            invalidatesTags: (_result, _error,) => [
                { type: "User", id: "LIST" },
                { type: "MenuCounts", id: "ALL" },
            ],
        }),
        getUserById: builder.query<{ data: RegisterUserProps }, { id: string }>({
            query: ({ id }) => ({
                url: `/admin/user/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),
        suspendUser: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `/admin/user/suspend`,
                method: "DELETE",
                body: { users: body }
            }),
            invalidatesTags: (_result, _error,) => [
                { type: "User", id: "LIST" },
                { type: "MenuCounts", id: "ALL" },
            ],
        }),
        generateOTP: builder.mutation<GlobalResponse & { data: { otp: string } }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/user/${id}/generate-otp`,
                method: "POST",
            })
        }),

        sendPasswordResetLink: builder.mutation<
            GlobalResponse & { data?: { token: string; email: string; reset_url?: string } },
            { id: string }
        >({
            query: ({ id }) => ({
                url: `/admin/user/${id}/send-password-reset`,
                method: "POST",
            }),
        }),

        getUserAnalytics: builder.query<UserAnalyticsResponse, void>({
            query: () => ({
                url: `/admin/user/analytics`,
                method: "GET",
            }),
            providesTags: [{ type: "Analytics" }],
        }),

        getNewSignUps: builder.query<NewSignUpsResponse, void>({
            query: () => ({
                url: `/admin/user/new-sign-ups`,
                method: "GET",
            }),
            providesTags: [{ type: "Analytics" }],
        }),

        getRoleDistribution: builder.query<RoleDistributionResponse, void>({
            query: () => ({
                url: `/admin/user/role-distribution`,
                method: "GET",
            }),
            providesTags: [{ type: "Analytics" }],
        }),

        getUserProfile: builder.query<UserProfileResponse, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/user/${id}/profile`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserLoginHistory: builder.query<LoginHistoryResponse, { id: number; pageIndex?: number; pageSize?: number; search?: string }>({
            query: ({ id, pageIndex = 1, pageSize = 5, search }) => {
                const params = buildQueryParams({ page: pageIndex, page_size: pageSize, search });
                return { url: `/admin/user/${id}/login-history?${params}`, method: "GET" };
            },
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserRecentActivities: builder.query<RecentActivityResponse, { id: number; pageIndex?: number; pageSize?: number; search?: string }>({
            query: ({ id, pageIndex = 1, pageSize = 10, search }) => {
                const params = buildQueryParams({ page: pageIndex, page_size: pageSize, search });
                return { url: `/admin/user/${id}/recent-activities?${params}`, method: "GET" };
            },
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserTransactionAnalytics: builder.query<{ status: number; data: { title: string; value: number; type: "success" | "error" | "info" | "warning" }[]; message: string }, { id: number }>({
            query: ({ id }) => ({ url: `/admin/user/${id}/transaction/analytics`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserEnrolledCourseAnalytics: builder.query<CourseAnalyticsResponse, { id: number }>({
            query: ({ id }) => ({ url: `/admin/user/${id}/enrolled-courses/analytics`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserEnrolledTests: builder.query<UserEnrolledTestResponse, { id: number; pageIndex?: number; pageSize?: number; search?: string }>({
            query: ({ id, pageIndex = 1, pageSize = 10, search }) => {
                const params = buildQueryParams({ page: pageIndex, page_size: pageSize, search });
                return { url: `/admin/user/${id}/tests?${params}`, method: "GET" };
            },
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserEnrolledBundles: builder.query<UserEnrolledBundleResponse, { id: number; pageIndex?: number; pageSize?: number; search?: string }>({
            query: ({ id, pageIndex = 1, pageSize = 10, search }) => {
                const params = buildQueryParams({ page: pageIndex, page_size: pageSize, search });
                return { url: `/admin/user/${id}/bundles?${params}`, method: "GET" };
            },
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserTransactionPaymentMethods: builder.query<PaymentMethodsResponse, { id: number }>({
            query: ({ id }) => ({ url: `/admin/user/${id}/transaction/payment-methods`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserPerformanceAnalytics: builder.query<PerformanceAnalyticsResponse, { id: number }>({
            query: ({ id }) => ({ url: `/admin/user/${id}/performance/analytics`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserTrackPerformance: builder.query<TrackPerformanceResponse, { id: number }>({
            query: ({ id }) => ({ url: `/admin/user/${id}/performance/track-performance`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserMonthlyActivity: builder.query<MonthlyActivityResponse, { id: number; period: 7 | 30 }>({
            query: ({ id, period }) => ({ url: `/admin/user/${id}/performance/monthly-activity?period=${period}`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "User", id }],
        }),

        getUserImportTemplate: builder.query<{ data: string }, void>({
            queryFn: async (_arg, _api, _extra, baseQuery) => {
                const res = await baseQuery({
                    url: "/admin/user/import/template",
                    method: "GET",
                    responseHandler: (response) => response.text(),
                });
                if (res.error) return { error: res.error };
                return { data: { data: res.data as string } };
            },
        }),

        importUsers: builder.mutation<
            GlobalResponse & { data: UserImportResult },
            FormData
        >({
            query: (body) => ({
                url: "/admin/user/import",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "User", id: "LIST" }, { type: "MenuCounts", id: "ALL" }],
        }),
    })
})

export const {
    useCreateUserMutation,
    useGetAllUserQuery,
    useGetAllUserExcludeStudentsQuery,
    useEditUserMutation,
    useDeleteUserMutation,
    useGetUserByIdQuery,
    useSuspendUserMutation,
    useGenerateOTPMutation,
    useSendPasswordResetLinkMutation,
    useGetUserAnalyticsQuery,
    useGetNewSignUpsQuery,
    useGetRoleDistributionQuery,
    useGetUserProfileQuery,
    useGetUserLoginHistoryQuery,
    useGetUserRecentActivitiesQuery,
    useGetUserTransactionAnalyticsQuery,
    useGetUserEnrolledCourseAnalyticsQuery,
    useGetUserEnrolledTestsQuery,
    useGetUserEnrolledBundlesQuery,
    useGetUserTransactionPaymentMethodsQuery,
    useGetUserPerformanceAnalyticsQuery,
    useGetUserTrackPerformanceQuery,
    useGetUserMonthlyActivityQuery,
    useLazyGetUserImportTemplateQuery,
    useImportUsersMutation,
} = userApi;
