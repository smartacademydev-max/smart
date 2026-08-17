export type StatusVariant = "success" | "info" | "warning" | "error" | "primary";

export type PublishedStatus = "draft" | "published"

export function statusMap<T extends string>(map: Record<T, StatusVariant>) {
    return (key: T): StatusVariant => {
        return map[key] ?? "info";
    };
}

import type { DeviceRequestStatus } from "../types/deviceReset";
import type { GorkhapatraTypes } from "../types/gorkhapatra";
import type { TestTypeProps } from "../types/question";
import type { TicketPriority, TicketStatus } from "../types/ticket";
import type { InstallmentStatus, TransactionCourseStatus, TransactionReadStatus } from "../types/transaction";

export const getTransactionStatusVariant = statusMap<TransactionCourseStatus>({
    purchase: "success",
    free_trial: "success",
    free_trial_expired: "error",
    purchase_expired: "error",
});
export const getPublishedStatus = statusMap<PublishedStatus>({
    published: "success",
    draft: "warning",
});

export const getGorkhapatraStatus = statusMap<GorkhapatraTypes>({
    mcqs: "success",
    descriptive: "warning",
});

export const getTransactionStatus = statusMap<"failed" | "success" | "pending">({
    failed: "error",
    success: "success",
    pending: "warning",
});

export const getPaymentTypeVariant = statusMap<"installment" | "paid">({
    installment: "warning",
    paid: "success",
});

export const getInstallmentStatusVariant = statusMap<InstallmentStatus>({
    pending: "warning",
    paid: "success",
    overdue: "error",
    // Closed by a full refund — no money owed, and it can never go overdue.
    cancelled: "info",
});

/**
 * Presented transaction status. `refunded` is a presentation value the API emits
 * for fully refunded purchases — the stored row is still `success`.
 */
export const getTransactionReadStatusVariant = statusMap<TransactionReadStatus | "pending">({
    success: "success",
    failed: "error",
    pending: "warning",
    processing: "warning",
    installment: "warning",
    refunded: "error",
});

export const getCourseStatus = (progress?: number): StatusVariant => {
    if (progress === 0) return "error";
    if (progress === 100) return "success";
    return "warning";
};

export const getDiscussionStatus = statusMap<"visible" | "hidden">({
    visible: "success",
    hidden: "warning",
});
export const getTicketStatusVariant = statusMap<TicketStatus>({
    open: "info",
    assigned: "primary",
    waiting_for_reply: "warning",
    resolved: "success",
});
export const getTicketPriorityVariant = statusMap<TicketPriority>({
    low: "primary",
    urgent: "error",
    medium: "warning",
    high: "info",
});
export const getTestTypeVariant = statusMap<TestTypeProps>({
    mcq: "primary",
    omr: "error",
    subjective: "warning",
});

export const RequestStatusColor = statusMap<DeviceRequestStatus>({
    pending: "warning",
    approved: "success",
    rejected: "error",
})