import { Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { CloseCircle } from "iconsax-reactjs";
import { useHasPermission } from "../../../../hooks/useHasPermission";
import { useGetTransactionByIdQuery } from "../../../../services/transactionApi";
import type { TransactionCourseStatus } from "../../../../types/transaction";
import { formatDateForDisplay, formatDateTime } from "../../../../utils/dateFormat";
import { formatAmount, toAmount } from "../../../../utils/itemPrice";
import RefundHistory from "../../../organism/RefundHistory";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>{label}</Typography>
            <Typography variant="body2" fontWeight={400} textAlign="right" sx={{ maxWidth: 220, wordBreak: "break-word" }}>{value ?? "—"}</Typography>
        </Stack>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <Typography variant="subtitle1" fontWeight={600} mt={2} mb={0.5}>{title}</Typography>;
}

function courseAccessLabel(status?: TransactionCourseStatus): { label: string; color: "success" | "error" | "info" | "warning" } {
    if (!status) return { label: "—", color: "info" };
    if (status === "purchase" || status === "free_trial") return { label: "Active", color: "success" };
    return { label: "Expired", color: "error" };
}

function paymentStatusLabel(status?: string): { label: string; color: "success" | "error" | "info" | "warning" } {
    if (!status) return { label: "—", color: "info" };
    if (status === "success") return { label: "Completed", color: "success" };
    if (status === "failed") return { label: "Failed", color: "error" };
    if (status === "pending" || status === "processing") return { label: "Pending", color: "warning" };
    // Presentation-only — the stored row is still `success`, so revenue reporting is untouched.
    if (status === "refunded") return { label: "Refunded", color: "error" };
    if (status === "installment") return { label: "Installment", color: "warning" };
    return { label: status, color: "info" };
}

export default function TransactionDetailDialog({ id, onClose }: { id: number | null; onClose: () => void }) {
    const theme = useTheme();
    const canViewRefunds = useHasPermission("view_refunds");
    const { data, isLoading } = useGetTransactionByIdQuery(id!, { skip: id === null });
    const tx = data?.data;

    const imageFilename = tx?.image_url ? tx.image_url.split("/").pop() ?? "image.png" : null;
    const courseAccess = courseAccessLabel(tx?.course_status);
    const paymentStatus = paymentStatusLabel(tx?.status);

    // `amount_paid` is the read fallback for rows recorded before sold price existed.
    const soldPrice = tx?.sold_price ?? tx?.amount_paid ?? null;
    const discount = tx?.original_price != null && soldPrice != null
        ? Math.max(toAmount(tx.original_price) - toAmount(soldPrice), 0)
        : 0;
    // `0` on an untouched sale — the refund block only appears once money went back.
    const refundedAmount = toAmount(tx?.refunded_amount);

    return (
        // `sm` rather than `xs`: the refund ledger below is tabular and needs the room.
        <Dialog open={id !== null} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Typography variant="h5" fontWeight={600}>Transaction Details</Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseCircle size={22} color={theme.palette.error.main} />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 1.5 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={28} />
                    </Box>
                ) : !tx ? null : (
                    <>
                        {tx.image_url && (
                            <>
                                <SectionHeader title="Image" />
                                <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }}>
                                    <img src={tx.image_url} alt="Transaction" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                                </Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" px={0.5}>
                                    <Typography variant="caption" color="text.secondary">{imageFilename}</Typography>
                                    <Stack direction="row" gap={1}>
                                        <Button size="small" variant="outlined" href={tx.image_url} download={imageFilename} target="_blank" component="a">
                                            Download
                                        </Button>
                                        <Button size="small" variant="contained" href={tx.image_url} target="_blank" component="a">
                                            View
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Divider sx={{ mt: 1.5 }} />
                            </>
                        )}

                        <SectionHeader title="Course Purchased" />
                        <Divider sx={{ mb: 0.5 }} />
                        <InfoRow label="Course Name" value={tx.name || "—"} />
                        <Divider />
                        <InfoRow
                            label="Course Access"
                            value={
                                <Chip
                                    size="small"
                                    label={courseAccess.label}
                                    sx={{
                                        fontSize: 11,
                                        bgcolor: theme.palette[courseAccess.color].light,
                                        color: theme.palette[courseAccess.color].main,
                                        border: `1px solid ${theme.palette[courseAccess.color].main}`,
                                    }}
                                />
                            }
                        />

                        <SectionHeader title="Payment Details" />
                        <Divider sx={{ mb: 0.5 }} />
                        <InfoRow label="Payment Method" value={<Typography variant="body2" className="capitalize">{tx.payment_method || "—"}</Typography>} />
                        <Divider />
                        <InfoRow label="Transaction ID / Bill No." value={tx.transaction_id || "—"} />
                        <Divider />
                        <InfoRow
                            label="Original Price"
                            value={tx.original_price != null ? `NRs. ${formatAmount(tx.original_price)}` : "—"}
                        />
                        <Divider />
                        <InfoRow
                            label="Sold Price"
                            value={
                                soldPrice == null ? "—" : (
                                    <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={0.75}>
                                        <Typography variant="body2" fontWeight={500}>NRs. {formatAmount(soldPrice)}</Typography>
                                        {discount > 0 && (
                                            <Chip
                                                size="small"
                                                label={`NRs. ${formatAmount(discount)} off`}
                                                sx={{
                                                    fontSize: 11,
                                                    bgcolor: theme.palette.success.light,
                                                    color: theme.palette.success.main,
                                                    border: `1px solid ${theme.palette.success.main}`,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                )
                            }
                        />
                        <Divider />
                        <InfoRow label="Payment Date" value={formatDateForDisplay(tx.purchased_date ?? "") || "—"} />
                        <Divider />
                        <InfoRow
                            label="Payment Status"
                            value={
                                <Chip
                                    size="small"
                                    label={paymentStatus.label}
                                    sx={{
                                        fontSize: 11,
                                        bgcolor: theme.palette[paymentStatus.color].light,
                                        color: theme.palette[paymentStatus.color].main,
                                        border: `1px solid ${theme.palette[paymentStatus.color].main}`,
                                    }}
                                />
                            }
                        />

                        {refundedAmount > 0 && (
                            <>
                                <SectionHeader title="Refund" />
                                <Divider sx={{ mb: 0.5 }} />
                                <InfoRow
                                    label="Refunded"
                                    value={
                                        <Typography variant="body2" fontWeight={500} color="error.main">
                                            − NRs. {formatAmount(refundedAmount)}
                                        </Typography>
                                    }
                                />
                                <Divider />
                                {/* Only the detail endpoint carries the live ceiling. */}
                                {tx.refundable_amount != null && (
                                    <>
                                        <InfoRow label="Still Refundable" value={`NRs. ${formatAmount(tx.refundable_amount)}`} />
                                        <Divider />
                                    </>
                                )}
                                <InfoRow
                                    label="Refund Type"
                                    value={
                                        <Chip
                                            size="small"
                                            label={tx.is_refunded ? "Fully refunded" : "Partially refunded"}
                                            sx={{
                                                fontSize: 11,
                                                bgcolor: theme.palette[tx.is_refunded ? "error" : "warning"].light,
                                                color: theme.palette[tx.is_refunded ? "error" : "warning"].main,
                                                border: `1px solid ${theme.palette[tx.is_refunded ? "error" : "warning"].main}`,
                                            }}
                                        />
                                    }
                                />
                                {tx.refunded_at && (
                                    <>
                                        <Divider />
                                        <InfoRow label="Refunded On" value={formatDateTime(tx.refunded_at) || "—"} />
                                    </>
                                )}
                                {/*
                                  * The totals above are plain transaction fields, but the itemised
                                  * ledger — who refunded, why, against what reference — is the refund
                                  * module's own read, so it needs `view_refunds`. `refunds` also only
                                  * arrives when the relation is eager-loaded.
                                  */}
                                {canViewRefunds && tx.refunds?.length ? (
                                    <Box mt={1.5}>
                                        <RefundHistory refunds={tx.refunds} title="Refund History" />
                                    </Box>
                                ) : null}
                            </>
                        )}

                        <SectionHeader title="Invoice" />
                        <Divider sx={{ mb: 0.5 }} />
                        <InfoRow label="Invoice ID" value={tx.invoice_id || "—"} />
                        <Divider />
                        <InfoRow label="Issued to" value={tx.issued_to || "—"} />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
