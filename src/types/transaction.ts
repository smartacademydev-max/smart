import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse } from "./user";

export type PaymentMethodProps = "esewa" | "khalti" | "cash" | "fonepay"
export type PaymentStatusProps = "success" | "installment"
export type EnrollmentType = "course" | "test" | "bundle"

export type InstallmentInterval = "monthly" | "weekly";
export type InstallmentStatus = "pending" | "paid" | "overdue";

/** A single custom row when the admin wants uneven amounts / hand-picked dates. */
export interface InstallmentRowInput {
    amount: number | string;
    due_date: string;
}

/** Installment fields sent alongside a transaction when status === "installment". */
export interface InstallmentScheduleInput {
    installment_count?: number | string;
    installment_start_date?: string;
    installment_interval?: InstallmentInterval;
    installments?: InstallmentRowInput[];
}

export interface TransactionPayload {
    id?: number;
    student_id: number;
    course_id?: number;
    test_id?: number;
    bundle_id?: number;
    subscription_id: number;
    invoice_id: string;
    transaction_id: string;
    payment_method: PaymentMethodProps;
    status: PaymentStatusProps;
    image: File | null;
    image_url?: string | null;
}
export const TransactionInitialState: TransactionPayload = {
    student_id: 0,
    course_id: 0,
    test_id: 0,
    bundle_id: 0,
    subscription_id: 0,
    invoice_id: "",
    transaction_id: "",
    payment_method: "cash",
    status: "success",
    image: null,
};

export type TransactionCourseStatus = "purchase" | "free_trial_expired" | "free_trial" | "purchase_expired";

export interface InstallmentSummary {
    total_count: number;
    paid_count: number;
    outstanding_amount: number;
    next_due_date: string | null;
    has_overdue: boolean;
}

export interface TransactionResponse extends TransactionPayload {
    name: string;
    added_by: string;
    course_name: string;
    email: string;
    contact: string;
    created_at: string;
    course_status?: TransactionCourseStatus;
    is_installment?: boolean;
    installment_summary?: InstallmentSummary | null;
}

export interface TransactionList {
    data: {
        data: TransactionResponse[];
        pagination: Pagination;
    }
}

export interface TransactionProps {
    id: number;
    name: string;
    payment_method: string;
    purchased_date: string;
    amount_paid: number;
    invoice_id: string;
    status: "success" | "failed" | "pending";
}


export interface UserTransactionResponse extends GlobalResponse {
    data: {
        data: TransactionProps[];
        pagination: Pagination;
    }
}

export interface TransactionDetail {
    id?: number;
    student_id: number;
    course_id?: number;
    test_id?: number;
    bundle_id?: number;
    subscription_id: number;
    invoice_id: string;
    transaction_id: string;
    payment_method: string;
    status: string;
    image_url?: string | null;
    name?: string;
    amount_paid?: number;
    purchased_date?: string;
    course_status?: TransactionCourseStatus;
    issued_to?: string;
}

export interface TransactionDetailResponse extends GlobalResponse {
    data: TransactionDetail;
}

export interface PaymentMethodItem {
    name: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface PaymentMethodsAnalytics {
    methods: PaymentMethodItem[];
    total_transactions: number;
    total_amount: number;
    last_payment: string | null;
}

export interface PaymentMethodsResponse extends GlobalResponse {
    data: PaymentMethodsAnalytics;
}

/* -------------------------------------------------------------------------- */
/*                                Installments                                 */
/* -------------------------------------------------------------------------- */

/** One row of a schedule (per §2). `amount` / totals are JSON numbers. */
export interface InstallmentRow {
    id: number;
    purchase_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    paid_at: string | null;
    status: InstallmentStatus;
    /** Computed live (unpaid AND past due) — drive the "overdue" badge off this, not `status`. */
    is_overdue: boolean;
    payment_method: string | null;
    transaction_id: string | null;
    invoice_id: string | null;
    added_by: string | null;
}

/** Schedule for one transaction/purchase (per §2 / returned by §3 pay). */
export interface InstallmentSchedule {
    purchase_id: number;
    student_name: string;
    course_name: string;
    is_installment: boolean;
    is_archived: boolean;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    paid_count: number;
    total_count: number;
    next_due_date: string | null;
    installments: InstallmentRow[];
}

export interface InstallmentScheduleResponse extends GlobalResponse {
    data: InstallmentSchedule;
}

/** Record-a-payment body (per §3). */
export interface InstallmentPayPayload {
    installment_id: number;
    payment_method: string;
    transaction_id?: string;
    invoice_id?: string;
    /** When the money actually arrived (YYYY-MM-DD). Omit → server stamps now. Must not be future. */
    paid_at?: string;
}

/** Row in the cross-student list (per §5) — enriched with student/course fields. */
export interface InstallmentListRow {
    id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    status: InstallmentStatus;
    is_overdue: boolean;
    student_name: string;
    student_email: string;
    student_phone: string;
    course_name: string;
    is_archived: boolean;
}

export type InstallmentListStatus = "overdue" | "upcoming" | "pending" | "paid";

export interface InstallmentListResponse extends GlobalResponse {
    data: {
        data: InstallmentListRow[];
        pagination: Pagination;
    };
}

/* -------------------------------------------------------------------------- */
/*                    Per-user installments (§5b)                             */
/* -------------------------------------------------------------------------- */

/**
 * Settlement filter for GET /user/{user_id}/installments (§5b).
 * `pending` deliberately INCLUDES rows whose stored status is "overdue".
 */
export type UserInstallmentFilter = "pending" | "settled" | "all";

/** One row of the per-user installments endpoint (§5b) — schedule row + student/course. */
export interface UserInstallmentRow {
    id: number;
    purchase_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    paid_at: string | null;
    status: InstallmentStatus;
    /** Computed live (unpaid AND past due) — drive the "overdue" badge off this. */
    is_overdue: boolean;
    payment_method: string | null;
    transaction_id: string | null;
    invoice_id: string | null;
    student_name: string | null;
    student_email: string | null;
    student_phone: string | null;
    course_name: string | null;
    is_archived: boolean;
}

export interface UserInstallmentsResponse extends GlobalResponse {
    data: {
        data: UserInstallmentRow[];
        pagination: Pagination;
    };
}