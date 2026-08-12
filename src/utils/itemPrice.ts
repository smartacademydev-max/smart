import type { DiscountTypeProps } from "../types/course";

/**
 * Price resolution for a purchasable item (course / individual test / bundle).
 *
 * The three catalogues expose price differently — courses and bundles carry
 * `marked_price` (MRP) + `sale_price` (post-discount), tests carry a raw `price`
 * with a `discount` + `discount_type`. These helpers flatten that into the two
 * numbers a transaction needs: what the item lists for, and what it sells for.
 */

/** Structural shape rather than a union of the three item types — their `discount`
 *  fields disagree (`number | null` vs `string`) and would intersect to `never`. */
export interface PriceBearingItem {
    price?: string | number | null;
    marked_price?: string | number | null;
    sale_price?: string | number | null;
    discount?: string | number | null;
    discount_type?: DiscountTypeProps;
    course_expiry?: { price?: string | number | null };
}

/** Parses a `"1,200.00"` / `1200` / `null` price into a number. Returns 0 when unusable. */
export const toAmount = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value !== "string") return 0;
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
};

const applyDiscount = (price: number, discount: unknown, type?: DiscountTypeProps) => {
    const off = toAmount(discount);
    if (off <= 0) return price;
    const reduced = type === "amount" ? price - off : price - (price * off) / 100;
    return Math.max(reduced, 0);
};

/** Catalogue list price before any discount. */
export const resolveMarkedPrice = (item?: PriceBearingItem | null): number => {
    if (!item) return 0;
    return toAmount(item.marked_price) || toAmount(item.price) || toAmount(item.course_expiry?.price);
};

/**
 * Price the item currently sells for — `sale_price` when the API supplies it,
 * otherwise the marked price with the item's own discount applied.
 */
export const resolveSellingPrice = (item?: PriceBearingItem | null): number => {
    if (!item) return 0;
    const sale = toAmount(item.sale_price);
    if (sale > 0) return sale;
    return applyDiscount(resolveMarkedPrice(item), item.discount, item.discount_type);
};

/** `1234.5` → `"1,234.5"`. Blank for non-values so callers can render their own dash. */
export const formatAmount = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "";
    const amount = toAmount(value);
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/** Money comparison that tolerates the string/number mix coming off the form and API. */
export const sameAmount = (a: unknown, b: unknown) => Math.abs(toAmount(a) - toAmount(b)) < 0.005;
