import type {
    EnrollmentType,
    RefundCreateResponse,
    RefundLedgerResponse,
    RefundPayload,
} from "../types/transaction";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

/**
 * Course transactions and test/bundle transactions live in two different tables
 * with independent ID sequences — purchase `42` is a different row in each. Both
 * endpoints are therefore always keyed on (purchaseId, moduleType), and the same
 * `module_type` used to fetch a list must be sent back when refunding from it.
 */
export interface RefundScope {
    purchaseId: number;
    moduleType?: EnrollmentType;
}

const refundUrl = ({ purchaseId, moduleType = "course" }: RefundScope) =>
    `/admin/transaction/${purchaseId}/refund?${buildQueryParams({ module_type: moduleType })}`;

const scopeTag = ({ purchaseId, moduleType = "course" }: RefundScope) =>
    ({ type: "Refund" as const, id: `${moduleType}-${purchaseId}` });

export const refundApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // §2 — the ledger for one purchase. Needs `view_refunds`, which is granted
        // independently of `add_refunds` — read-only staff can hold it alone, and a
        // refunding admin may not hold it at all.
        getRefunds: builder.query<RefundLedgerResponse, RefundScope>({
            query: (scope) => ({
                url: refundUrl(scope),
                method: "GET",
            }),
            providesTags: (_result, _error, scope) => [scopeTag(scope)],
        }),

        // §1 — record a refund. Needs `add_refunds`; 403 when the admin lacks it.
        createRefund: builder.mutation<RefundCreateResponse, RefundScope & { body: RefundPayload }>({
            query: ({ body, ...scope }) => ({
                url: refundUrl(scope),
                method: "POST",
                body,
            }),
            // A full refund revokes access and cancels the remaining unpaid installments,
            // so the schedule and the transaction rows both go stale.
            invalidatesTags: (_result, _error, { purchaseId, moduleType }) => [
                scopeTag({ purchaseId, moduleType }),
                { type: "Transaction", id: purchaseId },
                { type: "Transaction", id: "LIST" },
                { type: "Installment", id: `PURCHASE-${purchaseId}` },
                { type: "Installment", id: "LIST" },
            ],
        }),
    }),
});

export const { useGetRefundsQuery, useCreateRefundMutation } = refundApi;
