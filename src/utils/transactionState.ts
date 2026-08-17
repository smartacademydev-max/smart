import type { InstallmentSchedule, InstallmentSummary, TransactionResponse } from "../types/transaction";
import { toAmount } from "./itemPrice";

/**
 * Derived state for a transaction row — which money actions it may offer.
 *
 * These read off `installment_summary` / the schedule rather than the row's
 * `status`, because a plan's status stays `installment` right up until it is
 * settled and says nothing about how much of it has actually been collected.
 */

/** Every installment paid and nothing outstanding. `false` when the summary is missing. */
export const isInstallmentPlanSettled = (
    summary?: InstallmentSummary | InstallmentSchedule | null,
): boolean => {
    if (!summary || !summary.total_count) return false;
    return summary.paid_count >= summary.total_count && toAmount(summary.outstanding_amount) <= 0;
};

/** Money actually reached us and hasn't been given back — the precondition for both actions. */
const collectedAndHeld = (transaction: TransactionResponse): boolean => {
    if (transaction.status === "failed" || transaction.status === "processing") return false;
    return true;
};

/**
 * Whether a refund may be started from the UI.
 *
 * Installment plans are deliberately withheld until the last installment is
 * paid. The API would accept a mid-plan refund — capped at what was collected —
 * but the product rule is that a plan is refunded only once it is complete, so
 * the control is not offered while a balance is outstanding.
 */
export const isRefundable = (transaction: TransactionResponse): boolean => {
    if (transaction.is_refunded || transaction.status === "refunded") return false;
    if (!collectedAndHeld(transaction)) return false;
    if (transaction.is_installment) return isInstallmentPlanSettled(transaction.installment_summary);
    return true;
};

/**
 * Whether an invoice may be generated.
 *
 * Stricter than {@link isRefundable}: a receipt states what the student paid and
 * kept, so any refund — whole or partial — disqualifies it, since the printed
 * figure would no longer match reality.
 */
export const isPaymentComplete = (transaction: TransactionResponse): boolean => {
    if (transaction.is_refunded || transaction.status === "refunded") return false;
    if (toAmount(transaction.refunded_amount) > 0) return false;
    if (!collectedAndHeld(transaction)) return false;
    if (transaction.is_installment) return isInstallmentPlanSettled(transaction.installment_summary);
    return transaction.status === "success";
};
