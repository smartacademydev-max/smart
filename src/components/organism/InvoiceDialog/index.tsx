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
const PAPER = {
    bg: "#FFFFFF",
    ink: "#111827",
    muted: "#6B7280",
    line: "#E5E7EB",
    panel: "#F9FAFB",
    /** Money taken off the total. */
    deduction: "#DC2626",
    paid: "#047857",
    paidBg: "#ECFDF5",
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

/** `"Makura Creations"` → `"MC"`. Feeds the placeholder mark when no logo is set. */
const initialsOf = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

/**
 * Printable receipt for a settled transaction — the admin-side counterpart of the
 * receipt a student gets on the purchase success screen, built from the same
 * fields so both documents agree.
 *
 * Download is `window.print()` against a print-only stylesheet rather than a
 * generated PDF: it keeps the rendered markup as the single source of truth and
 * lets the admin pick "Save as PDF" from the browser's own dialog.
 */
export default function InvoiceDialog({ transaction, moduleType = "course", onClose }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const { companyName, brandName, tagline, logoUrl } = useBrandSettings();
    const { data: appSettings } = useGetAppSettingsQuery();

    const issuerName = companyName || brandName;
    const issuerPhone = appSettings?.data?.phones?.[0]?.value ?? "";
    const issuerEmail = appSettings?.data?.emails?.[0]?.value ?? "";
    // Always the light logo — this is a white document, not a themed surface.
    const hasLogo = Boolean(logoUrl);

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
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
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

                {/* The receipt carries the brand mark, so an unset logo is a real gap —
                    say so rather than quietly printing the placeholder. */}
                {!hasLogo && (
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
                        No brand logo is set, so this receipt prints a placeholder mark. Upload one
                        under Settings → Site Info before issuing invoices to students.
                    </Alert>
                )}

                <Box
                    id={PRINT_AREA_ID}
                    className="rounded-md py-6 px-4"
                    sx={{ border: `1px solid ${PAPER.line}`, background: PAPER.bg, color: PAPER.ink }}
                >
                    {/* Issuer — who this receipt is from. Centred masthead. */}
                    <div className="text-center flex flex-col items-center gap-1 mb-4">
                        {hasLogo ? (
                            <img src={logoUrl} alt="" style={{ height: 40, objectFit: "contain" }} />
                        ) : (
                            // Placeholder monogram — keeps the masthead composed on paper
                            // instead of leaving a hole where the logo belongs.
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: `1.5px dashed ${PAPER.muted}`,
                                    color: PAPER.muted,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {initialsOf(issuerName) || "LOGO"}
                            </Box>
                        )}
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
                    </div>

                    {/* Document title — a rule with the label sitting on it. */}
                    <div className="flex items-center gap-3 mb-4">
                        <Box sx={{ flex: 1, borderTop: `1px solid ${PAPER.line}` }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: PAPER.muted }} className="uppercase tracking-[0.2em]">
                            Payment Receipt
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
                                {formatDateCustom(transaction.created_at || "", { shortMonth: true })}
                            </Typography>
                        ))}
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
                                    background: PAPER.paidBg,
                                    color: PAPER.paid,
                                    fontWeight: 600,
                                    fontSize: 13,
                                }}
                            >
                                Paid
                            </Box>
                        ))}

                        {/* Settled plans only reach this dialog, so the count is a closed fact. */}
                        {transaction.is_installment && summary && row("Paid In", (
                            <Typography variant="subtitle1" fontWeight={600}>
                                {summary.total_count} installment{summary.total_count === 1 ? "" : "s"}
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

                        <Box sx={{ borderTop: `1px dashed ${PAPER.muted}`, my: 1.5 }} />
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: PAPER.ink }}>Amount Paid</Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ color: PAPER.ink }} className="text-end">
                                NRs. {formatAmount(sold ?? original ?? 0) || "0"}
                            </Typography>
                        </div>
                    </div>

                    <Box sx={{ borderTop: `1px solid ${PAPER.line}`, mt: 2 }} />
                    <Typography variant="caption" sx={{ color: PAPER.muted }} className="block text-center pt-3">
                        This is a computer-generated receipt and does not require a signature.
                        {issuerEmail ? ` For any queries, contact ${issuerEmail}.` : ""}
                    </Typography>
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
