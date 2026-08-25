import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse } from "./user";

export type PaymentMethodProps = "esewa" | "khalti" | "cash" | "fonepay"
/** Statuses the admin can *write* when recording a sale. */
export type PaymentStatusProps = "success" | "installment"
/**
 * Statuses the API can *present* on a read.
 *
 * `refunded` is presentation-only — the underlying row stays `success` in the
 * database so historic revenue is never rewritten, and the refund lives in its
 * own ledger. Badge it directly; never compute it.
 */
export type TransactionReadStatus = "success" | "failed" | "processing" | "installment" | "refunded";
export type EnrollmentType = "course" | "test" | "bundle"

export type InstallmentInterval = "monthly" | "weekly";
/** `cancelled` is set on the unpaid rows of a plan whose purchase was fully refunded. */
export type InstallmentStatus = "pending" | "paid" | "overdue" | "cancelled";

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
    /** Typed by the admin for a walk-in sale; falls back to the profile. */
    customer_pan?: string | null;
    transaction_id: string;
    payment_method: PaymentMethodProps;
    status: PaymentStatusProps;
    /** Catalogue price of the item at the time of sale — reference only, not editable. */
    original_price: number | string;
    /** What the student was actually charged. Defaults to `original_price`, admin may override. */
    sold_price: number | string;
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
    customer_pan: "",
    transaction_id: "",
    payment_method: "cash",
    status: "success",
    original_price: "",
    sold_price: "",
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

export interface TransactionResponse extends Omit<TransactionPayload, "original_price" | "sold_price" | "status"> {
    name: string;
    added_by: string;
    course_name: string;
    email: string;
    contact: string;
    created_at: string;
    /** Presented status — may read `refunded` even though the stored row is still `success`. */
    status: TransactionReadStatus;
    /** Catalogue price when the sale was recorded. Absent on rows created before pricing was tracked. */
    original_price?: number | null;
    /** Amount actually charged. Falls back to `original_price` when never overridden. */
    sold_price?: number | null;
    course_status?: TransactionCourseStatus;
    is_installment?: boolean;
    installment_summary?: InstallmentSummary | null;
    /** True only when **fully** refunded. Partials leave this `false`. */
    is_refunded?: boolean;
    /** Running total refunded so far; `0` when none. */
    refunded_amount?: number;
    /** Timestamp of the refund that settled it. */
    refunded_at?: string | null;
    /**
     * Tax fields for the printed tax invoice. VAT is exclusive — charged on top of
     * `sold_price` — matching the purchase flow's `finalPrice = price + vat - discount`.
     * Absent on rows recorded before VAT was collected, which read as zero VAT.
     */
    vat_amount?: number | string | null;
    /** Rate applied at sale time, so historical invoices survive a future rate change. */
    vat_percentage?: number | string | null;
    /**
     * Deliberately absent. The invoice total is derived as `sold_price + vat_amount` —
     * `total_amount` is already taken by {@link InstallmentSchedule} for the plan total,
     * so a field of that name here is ambiguous and must not be read as an invoice total.
     */
    /** Buyer's PAN, when they have one on file. */
    customer_pan?: string | null;
    /** Issue date in Bikram Sambat, converted server-side (e.g. "2083/05/09"). */
    issued_on_bs?: string | null;
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
    /** Legacy total; kept as the read fallback for rows predating `sold_price`. */
    amount_paid: number;
    original_price?: number | null;
    sold_price?: number | null;
    invoice_id: string;
    customer_pan?: string | null;
    /** Same presented value as the admin list — `refunded` is possible here too. */
    status: TransactionReadStatus | "pending";
}


export interface UserTransactionResponse extends GlobalResponse {
    data: {
        data: TransactionProps[];
        pagination: Pagination;
    }
}

export interface TransactionDetail {
    id?: number;
    customer_pan?: string | null;
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
    /** Catalogue price when the sale was recorded. */
    original_price?: number | null;
    /** Amount actually charged — the editable one. */
    sold_price?: number | null;
    /** Legacy total; kept as the read fallback for rows predating `sold_price`. */
    amount_paid?: number;
    purchased_date?: string;
    course_status?: TransactionCourseStatus;
    issued_to?: string;
    /** True only when **fully** refunded. */
    is_refunded?: boolean;
    /** Running total refunded so far; `0` when none. */
    refunded_amount?: number;
    refunded_at?: string | null;
    /** Detail endpoint only — what is still refundable. */
    refundable_amount?: number;
    /** Present when the relation is eager-loaded. */
    refunds?: RefundRow[];
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
/* -------------------------------------------------------------------------- */
/*                                  Refunds                                    */
/* -------------------------------------------------------------------------- */

/**
 * One row of the refunds ledger.
 *
 * A refund never overwrites the sale — it is written as a separate row so that
 * "revenue = sum of successful transactions" keeps reporting historic figures
 * correctly. Net revenue is sales minus refunds.
 */
export interface RefundRow {
    id: number;
    amount: number;
    reason: string;
    refund_method: string | null;
    reference_id: string | null;
    /** Set when the refund was made against one specific paid installment. */
    installment_id: number | null;
    /** Only emitted when the installment relation is eager-loaded — never depend on it. */
    installment_number?: number;
    refunded_at: string;
    refunded_by: string;
    created_at: string;
}

/** Ledger for one purchase — GET /admin/transaction/{purchase_id}/refund. */
export interface RefundLedger {
    refunded_amount: number;
    /** Live ceiling for the next refund. Cap the amount input on it; `0` disables refunding. */
    refundable_amount: number;
    /** True only when **fully** refunded. */
    is_refunded: boolean;
    refunds: RefundRow[];
}

export interface RefundLedgerResponse extends GlobalResponse {
    data: RefundLedger;
}

export interface RefundCreateResponse extends GlobalResponse {
    data: RefundRow;
}

/** Body for POST /admin/transaction/{purchase_id}/refund. */
export interface RefundPayload {
    /** Shown in the ledger. Required, max 1000 chars. */
    reason: string;
    /** Omit to refund the full remaining balance — the common case. */
    amount?: number;
    /** Refund one specific *paid* installment; courses only. */
    installment_id?: number;
    /** How the money was returned, e.g. `cash`, `bank`. */
    refund_method?: string;
    /** The admin's own reference for the refund payment. */
    reference_id?: string;
}

export const REFUND_REASON_MAX = 1000;
