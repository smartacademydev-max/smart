import type { CourseTypeProps } from "./course";

export interface QueryParams {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sort_by?: "asc" | "desc" | ""
}


export interface CategoryFilterParams {
    mega_category?: number[];
    category?: number[];
    sub_category?: number[];
    positions?: number[];
    teachers?: number[];
    roles?: number[];
    course_type?: CourseTypeProps[];
    status?: Status[];
    device?: DeviceType[];
}

export type Status = "success" | "failed" | "pending" | "completed" | "not_completed" | "approved" | "rejected" | "refunded";

export const StatusFilter: { label: string; value: Status }[] = [
    { label: "Success", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
]

/**
 * Transaction-only status filter.
 *
 * `success` and `installment` exclude refunded rows server-side, so the three
 * options partition cleanly — a refunded transaction appears under exactly one.
 */
export const TransactionStatusFilter: { label: string; value: Status }[] = [
    ...StatusFilter,
    { label: "Refunded", value: "refunded" },
]

export type DeviceType = "web" | "mobile";

export const DeviceFilter: { label: string; value: DeviceType }[] = [
    { label: "Web", value: "web" },
    { label: "Mobile", value: "mobile" },
]

export type UserStatus = "all" | "suspended" | "active"

export const paymentOptions = [
    { label: "Esewa", value: "esewa" },
    { label: "Khalti", value: "khalti" },
    { label: "Cash", value: "cash" },
    { label: "Fonepay", value: "fonepay" },
];

/**
 * How the money was handed back. Gateways have no refund API wired in, so every
 * refund is settled by hand — these are records of what the admin actually did.
 */
export const refundMethodOptions = [
    { label: "Cash", value: "cash" },
    { label: "Bank Transfer", value: "bank" },
    { label: "Cheque", value: "cheque" },
    { label: "Esewa", value: "esewa" },
    { label: "Khalti", value: "khalti" },
];