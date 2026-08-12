import { Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { CloseCircle } from "iconsax-reactjs";
import { useGetTransactionByIdQuery } from "../../../../services/transactionApi";
import type { TransactionCourseStatus } from "../../../../types/transaction";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import { formatAmount, toAmount } from "../../../../utils/itemPrice";

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
    if (status === "pending") return { label: "Pending", color: "warning" };
    return { label: status, color: "info" };
}

export default function TransactionDetailDialog({ id, onClose }: { id: number | null; onClose: () => void }) {
    const theme = useTheme();
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

    return (
        <Dialog open={id !== null} onClose={onClose} maxWidth="xs" fullWidth>
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
