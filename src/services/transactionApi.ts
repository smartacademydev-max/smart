import type { CategoryFilterParams, DeviceType, QueryParams, Status } from "../types";
import type { CourseList } from "../types/course";
import type { EnrollmentType, TransactionDetailResponse, TransactionList, UserTransactionResponse } from "../types/transaction";
import type { GlobalResponse } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseApi } from "./baseApi";

export const transactionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addTransaction: builder.mutation<GlobalResponse, { body: FormData }>({
            query: ({ body }) => ({
                url: `/admin/transaction`,
                method: "POST",
                body
            }),
            invalidatesTags: [{ type: "Transaction", id: "LIST" }, { type: "MenuCounts", id: "ALL" }]
        }),
        getAllTransactions: builder.query<TransactionList, QueryParams & { categoryFilter?: CategoryFilterParams; status?: Status, payment_method?: string, payment_type?: string, days?: number | null; device_type?: DeviceType; module_type?: EnrollmentType; }>({
            query: ({ pageIndex, pageSize, search, startDate, endDate, days, status, categoryFilter, device_type, payment_method, payment_type, module_type }) => {
                const queryString = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    start_date: startDate,
                    end_date: endDate,
                    days: days,
                    device_type: device_type,
                    status: status,
                    payment_method: payment_method,
                    payment_type: payment_type,
                    module_type: module_type,
                    mega_categories: categoryFilter?.mega_category,
                    categories: categoryFilter?.category,
                    sub_categories: categoryFilter?.sub_category,
                    positions: categoryFilter?.positions,
                });

                return {
                    url: `/admin/transaction?${queryString}`,
                    method: "GET",
                }
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
                        { type: 'Transaction', id: 'LIST' }
                    ]
                    : [{ type: 'Transaction', id: 'LIST' }]
        }),
        getTransactionById: builder.query<TransactionDetailResponse, number>({
            query: (id) => ({
                url: `admin/transaction/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Transaction", id }]
        }),
        updateTransactionById: builder.mutation<GlobalResponse, { id: number, body: FormData }>({
            query: ({ id, body }) => ({
                url: `admin/transaction/${id}`,
                method: "POST",
                body: body
            }),
            invalidatesTags: (_result, _error, _arg) => [
                { type: "Transaction", id: "LIST" },
                { type: "MenuCounts", id: "ALL" },
            ]
        }),
        deleteTransaction: builder.mutation<GlobalResponse, { body: string[] }>({
            query: ({ body }) => ({
                url: `admin/transaction`,
                method: "DELETE",
                body: {
                    transactions: body
                }
            }),
            invalidatesTags: [{ type: "Transaction", id: "LIST" }, { type: "MenuCounts", id: "ALL" }]
        }),
        getUserPurchasedCourse: builder.query<CourseList, QueryParams & { id: number }>({
            query: ({ pageIndex, pageSize, search, id }) => ({
                url: `admin/user/${id}/enrolled-courses?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                })}`,
                method: "GET",
            }),
            providesTags: (result, _error, _arg) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
                        { type: 'Transaction', id: 'LIST' }
                    ]
                    : [{ type: 'Transaction', id: 'LIST' }]
        }),
        getAllUserTransacions: builder.query<UserTransactionResponse, QueryParams & { id: number }>({
            query: ({ pageIndex, pageSize, search, id }) => ({
                url: `admin/user/${id}/transaction?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                })}`,
                method: "GET",
            }),
            providesTags: (result, _error, _arg) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
                        { type: 'Transaction', id: 'LIST' }
                    ]
                    : [{ type: 'Transaction', id: 'LIST' }]
        })
    })
})

export const {
    useAddTransactionMutation,
    useGetAllTransactionsQuery,
    useGetTransactionByIdQuery,
    useDeleteTransactionMutation,
    useUpdateTransactionByIdMutation,
    useGetUserPurchasedCourseQuery,
    useGetAllUserTransacionsQuery
} = transactionApi;
