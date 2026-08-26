import { Alert, Box, Button, Dialog, DialogContent, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { CloseCircle, Printer } from "iconsax-reactjs";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useBrandSettings } from "../../../hooks/useBrandSettings";
import { PATH } from "../../../routes/PATH";
import { useGetAppSettingsQuery } from "../../../services/settingApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import type { EnrollmentType, TransactionResponse } from "../../../types/transaction";
import { formatDateCustom } from "../../../utils/dateFormat";
import { formatAmount, sameAmount, toAmount } from "../../../utils/itemPrice";

const PRINT_AREA_ID = "invoice-print-area";
const PRINT_STYLE_ID = "invoice-print-style";

/**
 * The receipt renders as paper — fixed light colours in both themes.
 *
 * Printing inherits whatever is on screen, so a dark-theme receipt would put
 * near-white ink on white paper. Pinning the document's own palette means the
 * preview is exactly what comes out of the printer either way.
 */
/** A5, the usual size for a Nepali sales bill — two copies fit one A4 sheet. */
const BILL_WIDTH = "148mm";

const PAPER = {
    /** Pale yellow, the carbon-copy bill look. Light enough not to tint ink. */
    bg: "#FEFCE8",
    ink: "#111827",
    muted: "#6B7280",
    /** Warmed to sit on the yellow rather than reading as a grey overlay. */
    line: "#E4DFC4",
    panel: "#FBF8DC",
    /** Money taken off the total. */
    deduction: "#DC2626",
    paid: "#047857",
    paidBg: "#ECFDF5",
    /** A plan still collecting — neither settled nor failed. */
    partial: "#B45309",
    partialBg: "#FFFBEB",
    /** Money given back. Shares the deduction ink; only the wash differs. */
    refundBg: "#FEF2F2",
};

interface Props {
    /** Transaction to invoice. `null` keeps the dialog closed. */
    transaction: TransactionResponse | null;
    moduleType?: EnrollmentType;
    onClose: () => void;
}

const moduleLabel: Record<EnrollmentType, string> = {
    course: "Course",
    test: "Test",
    bundle: "Bundle",
};

/**
 * Printable tax invoice for a transaction — the admin-side counterpart of the receipt
 * a student gets on the purchase success screen, built from the same fields so both
 * documents agree.
 *
 * It describes the transaction in whatever state it is actually in: settled, a plan
 * still collecting, or refunded in whole or in part. The figures shift to match, but
 * the invoiced total is never rewritten — refunds are shown against it.
 *
 * Download is `window.print()` against a print-only stylesheet rather than a
 * generated PDF: it keeps the rendered markup as the single source of truth and
 * lets the admin pick "Save as PDF" from the browser's own dialog.
 */
export default function InvoiceDialog({ transaction, moduleType = "course", onClose }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const { companyName, brandName, tagline, logoUrl, logoDarkUrl, tpin } = useBrandSettings();
    const { data: appSettings } = useGetAppSettingsQuery();

    const issuerName = companyName || brandName;
    const issuerPhone = appSettings?.data?.phones?.[0]?.value ?? "";
    const issuerEmail = appSettings?.data?.emails?.[0]?.value ?? "";
    /**
     * The receipt is always white paper, never a themed surface, so it needs the
     * dark-inked mark. `/logo-dark.svg` is that one despite the name — `/logo.svg`
     * is solid white and would print invisible here.
     */
    /**
     * The invoice always prints on pale paper, whatever theme the admin is
     * viewing in, so it takes the inked mark meant for light surfaces. The
     * light-surface logo is white artwork and vanished against the page.
     */
    const invoiceLogo = logoDarkUrl || logoUrl || "/logo-dark.svg";
    const hasCustomLogo = Boolean(logoDarkUrl || logoUrl);

    // Scoped to the mounted dialog so the rule never leaks into other screens.
    useEffect(() => {
        if (!transaction) return;

        const style = document.createElement("style");
        style.id = PRINT_STYLE_ID;
        style.innerHTML = `
        @page { margin: 12mm; }
        @media print {
            body * { visibility: hidden !important; }
            #${PRINT_AREA_ID}, #${PRINT_AREA_ID} * {
                visibility: visible !important;
                /* Keep the tinted item block and the paid mark from printing blank. */
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            #${PRINT_AREA_ID} {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
            .invoice__copy {
                width: ${BILL_WIDTH} !important;
                max-width: ${BILL_WIDTH} !important;
                margin: 0 auto !important;
            }
            /* Kept explicit: the office copy must reach the sheet even if a
               future rule hides it on screen. */
            .invoice__copy--office { display: block !important; }
            .invoice__copy { border: none !important; box-shadow: none !important; }
            .invoice__no-print { display: none !important; }
        }
    `;
        document.head.appendChild(style);

        return () => { document.getElementById(PRINT_STYLE_ID)?.remove(); };
    }, [transaction]);

    if (!transaction) return null;

    const sold = transaction.sold_price;
    const original = transaction.original_price;
    const discount = original != null && sold != null
        ? Math.max(toAmount(original) - toAmount(sold), 0)
        : 0;
    const showDiscount = discount > 0 && !sameAmount(original, sold);
    const summary = transaction.installment_summary;

    /**
     * VAT is exclusive — added on top of the discounted price, the same basis the
     * purchase flow uses (`finalPrice = price + vat - discount`). The amount and rate
     * come from the transaction rather than being recomputed here, so a rate change
     * never rewrites what an old invoice says was charged.
     */
    const soldAmount = toAmount(sold ?? original ?? 0);
    const vatAmount = toAmount(transaction.vat_amount);
    const vatPercentage = toAmount(transaction.vat_percentage);
    /**
     * Under inclusive pricing the listed price is the total and the tax sits
     * inside it, so the taxable base is less than what was sold. The mode is
     * recorded on the sale rather than guessed from the figures — a zero-rate
     * sale looks identical either way.
     */
    const taxable = transaction.vat_inclusive ? soldAmount - vatAmount : soldAmount;
    /**
     * Shown whenever the sale recorded a VAT rate, including a zero one: a tax
     * invoice that simply omits the line reads as if VAT was never considered.
     * Only a sale predating VAT entirely — no rate stored — hides it.
     */
    const hasVat = transaction.vat_percentage !== null && transaction.vat_percentage !== undefined;
    /**
     * Derived, never read off the row. `total_amount` already exists on the API as an
     * *installment plan* total — 0 on an ordinary sale — so trusting a field by that
     * name printed a zero total on every non-installment invoice.
     */
    const totalAmount = taxable + vatAmount;

    /**
     * A plan mid-flight still gets an invoice, but it must not claim the whole sum was
     * collected. `installment_summary` carries the outstanding balance; what has been
     * paid is the rest of the total.
     */
    const outstanding = toAmount(summary?.outstanding_amount);
    const isPartiallyPaid = Boolean(transaction.is_installment && summary && outstanding > 0);
    const paidSoFar = Math.max(totalAmount - outstanding, 0);

    /**
     * A refunded sale still gets an invoice — withholding it would leave no record of
     * the transaction at all. The document carries the refund instead, so the printed
     * figure matches what the student was ultimately left paying.
     *
     * A full refund with no `refunded_amount` on the row falls back to the whole total,
     * so the net can never overstate what was kept.
     */
    const isFullyRefunded = Boolean(transaction.is_refunded || transaction.status === "refunded");
    const rawRefund = toAmount(transaction.refunded_amount);
    const refundedAmount = isFullyRefunded && rawRefund <= 0 ? totalAmount : rawRefund;
    const hasRefund = refundedAmount > 0;
    const isPartiallyRefunded = hasRefund && !isFullyRefunded;
    const netAmount = Math.max(totalAmount - refundedAmount, 0);

    const statusLabel = isFullyRefunded
        ? "Refunded"
        : isPartiallyRefunded
            ? "Partially Refunded"
            : isPartiallyPaid
                ? "Partially Paid"
                : "Paid";
    const statusInk = isFullyRefunded || isPartiallyRefunded
        ? { fg: PAPER.deduction, bg: PAPER.refundBg }
        : isPartiallyPaid
            ? { fg: PAPER.partial, bg: PAPER.partialBg }
            : { fg: PAPER.paid, bg: PAPER.paidBg };

    const handlePrint = () => {
        try {
            window.print();
        } catch (e: any) {
            dispatch(showToast({ message: e?.message || "Unable to open the print dialog.", severity: "error" }));
        }
    };

    const rule = <Box sx={{ borderTop: `1px solid ${PAPER.line}`, my: 1.5 }} />;

    const row = (label: string, value: React.ReactNode, valueColor: string = PAPER.ink) => (
        <>
            {rule}
            <div className="grid grid-cols-2 gap-2">
                <Typography variant="subtitle1" sx={{ color: PAPER.muted }}>{label}</Typography>
                <Box className="text-end" sx={{ color: valueColor }}>{value}</Box>
            </div>
        </>
    );

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ background: theme.palette.primary.contrastText }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    className="invoice__no-print"
                    mb={2}
                >
                    <Typography variant="h5" fontWeight={600}>Invoice</Typography>
                    <IconButton onClick={onClose}>
                        <CloseCircle size={22} color={theme.palette.error.main} />
                    </IconButton>
                </Stack>

                {/* The receipt carries the brand mark, so falling back to the bundled
                    default is worth saying out loud rather than doing quietly. */}
                {!hasCustomLogo && (
                    <Alert
                        severity="warning"
                        className="invoice__no-print"
                        sx={{ mb: 2 }}
                        action={
                            <Button size="small" color="inherit" component={RouterLink} to={PATH.SETTINGS.SYSTEM.SITE_INFO.ROOT}>
                                Set logo
                            </Button>
                        }
                    >
                        No brand logo is set, so this invoice prints the bundled default logo.
                        Upload your own under Settings → Site Info before issuing invoices to students.
                    </Alert>
                )}

                {/**
                  * Two copies print: the tax invoice for the customer and a
                  * plain "Invoice" retained by the office. Rendered from one
                  * function so the two can never drift apart.
                  */}
                <Box id={PRINT_AREA_ID}>
                {(["Tax Invoice", "Invoice"] as const).map((heading, copyIndex) => (
                <Box
                    key={heading}
                    className={`rounded-md py-6 px-5 invoice__copy${
                        copyIndex === 0 ? "" : " invoice__copy--office"
                    }`}
                    sx={{
                        border: `1px solid ${PAPER.line}`,
                        background: PAPER.bg,
                        color: PAPER.ink,
                        // Sized as a bill rather than filling the dialog, so
                        // what is on screen matches what comes out of the
                        // printer.
                        width: "100%",
                        maxWidth: BILL_WIDTH,
                        mx: "auto",
                        // Separated on screen; each copy starts its own sheet
                        // when printed.
                        mt: copyIndex === 0 ? 0 : 3,
                        "@media print": copyIndex === 0
                            ? {}
                            : { marginTop: 0, pageBreakBefore: "always" }
                    }}
                >
                    {/* Issuer — who this receipt is from. Centred masthead. */}
                    <div className="text-center flex flex-col items-center gap-1 mb-4">
                        <img src={invoiceLogo} alt="" style={{ height: 40, objectFit: "contain" }} />
                        {issuerName && (
                            <Typography variant="h5" fontWeight={700} sx={{ color: PAPER.ink }} className="uppercase tracking-wide">
                                {issuerName}
                            </Typography>
                        )}
                        {tagline && <Typography variant="caption" sx={{ color: PAPER.muted }}>{tagline}</Typography>}
                        {(issuerPhone || issuerEmail) && (
                            <Typography variant="caption" sx={{ color: PAPER.muted }}>
                                {[issuerPhone, issuerEmail].filter(Boolean).join("  ·  ")}
                            </Typography>
                        )}
                        {tpin && (
                            <Typography variant="caption" fontWeight={600} sx={{ color: PAPER.ink }}>
                                TPIN No.: {tpin}
                            </Typography>
                        )}
                    </div>

                    {/* Document title — a rule with the label sitting on it. */}
                    <div className="flex items-center gap-3 mb-4">
                        <Box sx={{ flex: 1, borderTop: `1px solid ${PAPER.line}` }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: PAPER.muted }} className="uppercase tracking-[0.2em]">
                            {heading}
                        </Typography>
                        <Box sx={{ flex: 1, borderTop: `1px solid ${PAPER.line}` }} />
                    </div>

                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Typography variant="subtitle1" sx={{ color: PAPER.muted }}>
                                {transaction.invoice_id ? "Invoice No." : "Reference No."}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: PAPER.ink }} className="text-end break-all">
                                {transaction.invoice_id || transaction.transaction_id || "—"}
                            </Typography>
                        </div>
                        {row("Issued On", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                {/* Bikram Sambat, converted server-side so every
                                    client shows the same date. */}
                                {transaction.issued_on_bs
                                    ? `${transaction.issued_on_bs} BS`
                                    : formatDateCustom(transaction.created_at || "", { shortMonth: true })}
                            </Typography>
                        ))}
                        {transaction.issued_on_bs && transaction.created_at && (
                            row("", (
                                <Typography variant="caption" sx={{ color: PAPER.muted }}>
                                    {formatDateCustom(transaction.created_at, { shortMonth: true })} AD
                                </Typography>
                            ))
                        )}
                        {row("Billed To", (
                            <>
                                <Typography variant="subtitle1" fontWeight={600} className="capitalize">
                                    {transaction.name || "—"}
                                </Typography>
                                {(transaction.email || transaction.contact) && (
                                    <Typography variant="caption" sx={{ color: PAPER.muted }} className="block break-all">
                                        {[transaction.email, transaction.contact].filter(Boolean).join("  ·  ")}
                                    </Typography>
                                )}
                            </>
                        ))}
                        {/* A tax invoice names the buyer's PAN when they have one; a dash
                            records that it was asked for and not supplied. */}
                        {row("Customer PAN No.", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                {transaction.customer_pan || "—"}
                            </Typography>
                        ), transaction.customer_pan ? PAPER.ink : PAPER.muted)}
                    </div>

                    <Box sx={{ background: PAPER.panel, border: `1px solid ${PAPER.line}` }} className="rounded-md p-4 mb-4">
                        <Typography variant="caption" sx={{ color: PAPER.muted }} className="uppercase tracking-wide">
                            {moduleLabel[moduleType]}
                        </Typography>
                        <Typography variant="h5" fontWeight={600} sx={{ color: PAPER.ink }} className="line-clamp-2 capitalize">
                            {transaction.course_name || "—"}
                        </Typography>
                    </Box>

                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            <Typography variant="subtitle1" sx={{ color: PAPER.muted }}>Transaction ID</Typography>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: PAPER.ink }} className="text-end break-all">
                                {transaction.transaction_id || "—"}
                            </Typography>
                        </div>

                        {row("Payment Method", (
                            <Typography variant="subtitle1" fontWeight={600} className="capitalize">
                                {transaction.payment_method || "—"}
                            </Typography>
                        ))}

                        {row("Payment Status", (
                            <Box
                                component="span"
                                sx={{
                                    display: "inline-block",
                                    px: 1.5,
                                    py: 0.25,
                                    borderRadius: 99,
                                    background: statusInk.bg,
                                    color: statusInk.fg,
                                    fontWeight: 600,
                                    fontSize: 13,
                                }}
                            >
                                {statusLabel}
                            </Box>
                        ))}

                        {/* Mid-plan invoices are allowed, so state progress rather than a total. */}
                        {transaction.is_installment && summary && row("Paid In", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                {isPartiallyPaid
                                    ? `${summary.paid_count} of ${summary.total_count} installments`
                                    : `${summary.total_count} installment${summary.total_count === 1 ? "" : "s"}`}
                            </Typography>
                        ))}

                        {original != null && row("Base Price", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                NRs. {formatAmount(original)}
                            </Typography>
                        ))}

                        {/* Deductions are red — money coming off the total, never a gain. */}
                        {showDiscount && row("Discount", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                − NRs. {formatAmount(discount)}
                            </Typography>
                        ), PAPER.deduction)}

                        {/* Only shown once VAT is actually charged — on a zero-VAT sale the
                            taxable amount and the total are the same figure twice. */}
                        {hasVat && row("Taxable Amount", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                NRs. {formatAmount(taxable) || "0"}
                            </Typography>
                        ))}

                        {hasVat && row(`VAT @ ${formatAmount(vatPercentage) || "13"}%`, (
                            <Typography variant="subtitle1" fontWeight={600}>
                                NRs. {formatAmount(vatAmount)}
                            </Typography>
                        ))}

                        <Box sx={{ borderTop: `1px dashed ${PAPER.muted}`, my: 1.5 }} />
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: PAPER.ink }}>Total Amount</Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ color: PAPER.ink }} className="text-end">
                                NRs. {formatAmount(totalAmount) || "0"}
                            </Typography>
                        </div>

                        {/* Split the total only while a balance is still owed — on a settled
                            plan "paid so far" and the total are the same number twice. */}
                        {isPartiallyPaid && (
                            <>
                                {row("Paid So Far", (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        NRs. {formatAmount(paidSoFar) || "0"}
                                    </Typography>
                                ), PAPER.paid)}

                                {row("Outstanding", (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        NRs. {formatAmount(outstanding)}
                                    </Typography>
                                ), PAPER.partial)}

                                {summary?.next_due_date && row("Next Due", (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {formatDateCustom(summary.next_due_date, { shortMonth: true })}
                                    </Typography>
                                ))}
                            </>
                        )}

                        {/* The total above stays what was invoiced; the refund and the net
                            sit under it so the document shows both, not a rewritten figure. */}
                        {hasRefund && (
                            <>
                                {row(isFullyRefunded ? "Refunded (full)" : "Refunded", (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        − NRs. {formatAmount(refundedAmount)}
                                    </Typography>
                                ), PAPER.deduction)}

                                {transaction.refunded_at && row("Refunded On", (
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {formatDateCustom(transaction.refunded_at, { shortMonth: true })}
                                    </Typography>
                                ))}

                                <Box sx={{ borderTop: `1px dashed ${PAPER.muted}`, my: 1.5 }} />
                                <div className="grid grid-cols-2 gap-2 items-center">
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: PAPER.ink }}>
                                        Net Amount
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} sx={{ color: PAPER.ink }} className="text-end">
                                        NRs. {formatAmount(netAmount) || "0"}
                                    </Typography>
                                </div>
                            </>
                        )}
                    </div>

                    <Box sx={{ borderTop: `1px solid ${PAPER.line}`, mt: 2 }} />
                    <Typography variant="caption" sx={{ color: PAPER.muted }} className="block text-center pt-3">
                        This is a computer-generated invoice and does not require a signature.
                        {issuerEmail ? ` For any queries, contact ${issuerEmail}.` : ""}
                    </Typography>
                </Box>
                ))}
                </Box>

                <Stack direction="row" justifyContent="flex-end" gap={2} mt={3} className="invoice__no-print">
                    <Button variant="outlined" onClick={onClose}>Close</Button>
                    <Button variant="contained" onClick={handlePrint} startIcon={<Printer size={18} color="currentColor" />}>
                        Print / Save as PDF
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
