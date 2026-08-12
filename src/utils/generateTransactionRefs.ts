/**
 * Reference-number generators for transactions.
 *
 * Both IDs are minted on the client (there is no server-side sequence endpoint),
 * so they carry the brand prefix + creation date for readability and a base36
 * time/entropy suffix for uniqueness. Every field they fill stays editable —
 * the admin can overwrite a generated value with a bank/gateway reference.
 */

const normalisePrefix = (brandName: string | undefined, fallback: string) =>
    (brandName?.trim() || fallback).toUpperCase().replace(/\s+/g, "-");

const dateStamp = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

/** Low-order slice of the epoch keeps the suffix short; the noise breaks same-millisecond ties. */
const uniqueSuffix = () => {
    const time = Date.now().toString(36).slice(-6);
    const noise = Math.floor(Math.random() * 1296).toString(36).padStart(2, "0");
    return `${time}${noise}`.toUpperCase();
};

/**
 * Invoice ID — e.g. `UDAAN-20260812-1754985600000-42`.
 * Kept in the original shape so it stays comparable with already-issued invoices.
 */
export const generateInvoiceId = (brandName?: string, studentId?: number) => {
    const prefix = normalisePrefix(brandName, "INVOICE");
    return `${prefix}-${dateStamp()}-${Date.now()}${studentId ? `-${studentId}` : ""}`;
};

/** Transaction ID / Bill No. — e.g. `UDAAN-BILL-20260812-4X1Q7B9C`. */
export const generateTransactionId = (brandName?: string) =>
    `${normalisePrefix(brandName, "TXN")}-BILL-${dateStamp()}-${uniqueSuffix()}`;
