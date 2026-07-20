import type { QueryParams } from "../types";
import type {
    InstallmentListResponse,
    InstallmentListStatus,
    InstallmentPayPayload,
    InstallmentScheduleInput,
    InstallmentScheduleResponse,
    UserInstallmentFilter,
    UserInstallmentsResponse,
} from "../types/transaction";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const installmentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // §2 — schedule for a single transaction/purchase
        getInstallmentSchedule: builder.query<InstallmentScheduleResponse, number>({
            query: (purchaseId) => ({
                url: `/admin/transaction/${purchaseId}/installment`,
                method: "GET",
            }),
            providesTags: (_result, _error, purchaseId) => [
                { type: "Installment", id: `PURCHASE-${purchaseId}` },
            ],
        }),

        // §3 — record a payment against one installment
        payInstallment: builder.mutation<InstallmentScheduleResponse, InstallmentPayPayload>({
            query: ({ installment_id, ...body }) => ({
                url: `/admin/transaction/installment/${installment_id}/pay`,
                method: "POST",
                body,
            }),
            // The response IS the refreshed schedule (§3) — patch the open schedule cache
            // directly instead of refetching it. Cross-student lists still get invalidated.
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const purchaseId = data?.data?.purchase_id;
                    if (purchaseId != null) {
                        dispatch(
                            installmentApi.util.updateQueryData("getInstallmentSchedule", purchaseId, (draft) => {
                                draft.data = data.data;
                            }),
                        );
                    }
                } catch {
                    // Mutation error is surfaced to the caller via unwrap(); nothing to patch.
                }
            },
            invalidatesTags: [
                { type: "Installment", id: "LIST" },
                { type: "Transaction", id: "LIST" },
            ],
        }),

        // §4 — regenerate the whole schedule (blocked once any installment is paid → 422)
        regenerateInstallmentSchedule: builder.mutation<
            InstallmentScheduleResponse,
            { purchaseId: number; body: InstallmentScheduleInput }
        >({
            query: ({ purchaseId, body }) => ({
                url: `/admin/transaction/${purchaseId}/installment`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { purchaseId }) => [
                { type: "Installment", id: `PURCHASE-${purchaseId}` },
                { type: "Installment", id: "LIST" },
            ],
        }),

        // §5 — cross-student "who owes what" list
        getInstallmentList: builder.query<
            InstallmentListResponse,
            QueryParams & {
                status?: InstallmentListStatus;
                course_id?: number;
                student_id?: number;
            }
        >({
            query: ({ pageIndex, pageSize, search, status, course_id, student_id }) => ({
                url: `/admin/installment?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    status,
                    course_id,
                    student_id,
                })}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.data?.data
                    ? [
                          ...result.data.data.map(({ id }) => ({ type: "Installment" as const, id })),
                          { type: "Installment", id: "LIST" },
                      ]
                    : [{ type: "Installment", id: "LIST" }],
        }),

        // §5b — one student's installments across all their purchases.
        // NOTE: path is /user/... (NOT /admin/...) — this endpoint sits outside the admin prefix.
        getUserInstallments: builder.query<
            UserInstallmentsResponse,
            Partial<QueryParams> & { userId: number; status?: UserInstallmentFilter }
        >({
            query: ({ userId, status, pageIndex, pageSize }) => ({
                url: `/user/${userId}/installments?${buildQueryParams({
                    status,
                    page: pageIndex,
                    page_size: pageSize,
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { userId }) => [
                { type: "Installment", id: `USER-${userId}` },
                { type: "Installment", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetInstallmentScheduleQuery,
    usePayInstallmentMutation,
    useRegenerateInstallmentScheduleMutation,
    useGetInstallmentListQuery,
    useGetUserInstallmentsQuery,
} = installmentApi;
