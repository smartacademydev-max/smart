import type { QueryParams } from "../types";
import type {
    InstallmentListResponse,
    InstallmentListStatus,
    InstallmentPayPayload,
    InstallmentScheduleInput,
    InstallmentScheduleResponse,
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
            // Response IS the refreshed schedule (§3); still invalidate the cross-student list.
            invalidatesTags: (result) => [
                { type: "Installment", id: "LIST" },
                ...(result?.data?.purchase_id
                    ? [{ type: "Installment" as const, id: `PURCHASE-${result.data.purchase_id}` }]
                    : []),
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
    }),
});

export const {
    useGetInstallmentScheduleQuery,
    usePayInstallmentMutation,
    useRegenerateInstallmentScheduleMutation,
    useGetInstallmentListQuery,
} = installmentApi;
