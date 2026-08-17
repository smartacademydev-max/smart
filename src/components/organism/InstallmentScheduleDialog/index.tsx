import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { ArrowRotateRight, CloseCircle } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useBrandSettings } from "../../../hooks/useBrandSettings";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useGetInstallmentScheduleQuery, usePayInstallmentMutation } from "../../../services/installmentApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { paymentOptions } from "../../../types";
import type { EnrollmentType, InstallmentRow } from "../../../types/transaction";
import { formatDateForDisplay } from "../../../utils/dateFormat";
import { generateInvoiceId, generateTransactionId } from "../../../utils/generateTransactionRefs";
import { getInstallmentStatusVariant } from "../../../utils/statusMap";
import { isInstallmentPlanSettled } from "../../../utils/transactionState";
import MakuraDatePicker from "../../atoms/MakuraDatePicker";
import StatusPill from "../../atoms/StatusPill";
import Actions from "../../molecules/Action";
import CustomTable from "../../molecules/Table";
import RefundDialog from "../RefundDialog";

interface Props {
    /** Purchase whose schedule to show. `null` keeps the dialog closed. */
    purchaseId: number | null;
    onClose: () => void;
    /** Passed through to the refund call — course and test/bundle IDs are not interchangeable. */
    moduleType?: EnrollmentType;
}

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Rows that will never be collected — paid already, or cancelled by a full refund. */
const isSettled = (row: InstallmentRow) => row.status === "paid" || row.status === "cancelled";

/** Cancelled rows stay in the schedule (§3d) but read as struck through. */
const cancelledSx = (row: InstallmentRow) =>
    row.status === "cancelled"
        ? { textDecoration: "line-through", opacity: 0.55 }
        : undefined;

/**
 * Schedule for one purchase (§2) with per-row "Mark as Paid" (§3).
 * The pay response IS the refreshed schedule and the mutation invalidates the
 * PURCHASE tag, so this query re-renders with fresh state — no manual refetch.
 */
export default function InstallmentScheduleDialog({ purchaseId, onClose, moduleType = "course" }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { brandName } = useBrandSettings();
    const canRefund = useHasPermission("add_refunds");

    // The paid installment being refunded, if any — scopes the refund dialog to one row.
    const [refundRow, setRefundRow] = useState<InstallmentRow | null>(null);

    const { data, isLoading, isFetching, refetch } = useGetInstallmentScheduleQuery(purchaseId as number, {
        skip: !purchaseId,
    });
    const [payInstallment, { isLoading: paying }] = usePayInstallmentMutation();

    const schedule = data?.data;
    const rows = schedule?.installments ?? [];
    // Refunds only open up once the last installment has been paid.
    const planSettled = isInstallmentPlanSettled(schedule);

    // The row currently being paid (drives the payment sub-form).
    const [payRow, setPayRow] = useState<InstallmentRow | null>(null);
    const [form, setForm] = useState({ payment_method: "cash", transaction_id: "", invoice_id: "", paid_at: "" });

    const paidAtInvalid = Boolean(form.paid_at) && form.paid_at > todayStr();
    // Every field is required before a payment can be recorded.
    const canRecordPayment = Boolean(
        form.payment_method && form.paid_at && !paidAtInvalid && form.transaction_id.trim() && form.invoice_id.trim(),
    );

    const openPayForm = (row: InstallmentRow) => {
        // Both references are minted up front — same as the transaction form — so the
        // admin only types when they have a real bank/gateway reference to use instead.
        setForm({
            payment_method: "cash",
            transaction_id: generateTransactionId(brandName),
            invoice_id: generateInvoiceId(brandName),
            paid_at: "",
        });
        setPayRow(row);
    };

    const regenerateBillNo = () =>
        setForm((f) => ({ ...f, transaction_id: generateTransactionId(brandName) }));

    const regenerateInvoiceNo = () =>
        setForm((f) => ({ ...f, invoice_id: generateInvoiceId(brandName) }));

    const handleClose = () => {
        setPayRow(null);
        onClose();
    };

    const handleRecordPayment = async () => {
        if (!payRow || !canRecordPayment) return;
        try {
            const res = await payInstallment({
                installment_id: payRow.id,
                payment_method: form.payment_method,
                transaction_id: form.transaction_id || undefined,
                invoice_id: form.invoice_id || undefined,
                paid_at: form.paid_at || undefined,
            }).unwrap();
            dispatch(showToast({ message: res?.message || "Payment recorded", severity: "success" }));
            setPayRow(null);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to record payment", severity: "error" }));
            // 404 (stale list) / 422 (already paid by someone else) — resync from the server.
            const code = e?.status ?? e?.originalStatus;
            if (code === 404 || code === 422) {
                setPayRow(null);
                refetch();
            }
        }
    };

    const columns = useMemo<ColumnDef<InstallmentRow>[]>(() => [
        {
            header: "#",
            accessorKey: "installment_number",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} sx={cancelledSx(row.original)}>
                    #{row.original.installment_number}
                </Typography>
            ),
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} sx={cancelledSx(row.original)}>
                    NRs. {Number(row.original.amount).toLocaleString()}
                </Typography>
            ),
        },
        {
            header: "Due Date",
            accessorKey: "due_date",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} sx={cancelledSx(row.original)}>
                    {formatDateForDisplay(row.original.due_date) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Paid On",
            accessorKey: "paid_at",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} sx={cancelledSx(row.original)}>
                    {row.original.paid_at ? formatDateForDisplay(row.original.paid_at) : "—"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                // Badge off is_overdue (live), not the stored status (§2) — except for
                // cancelled rows, which are closed and can never go overdue.
                const effective = row.original.is_overdue && !isSettled(row.original)
                    ? "overdue"
                    : row.original.status;
                return <StatusPill status={effective} variant={getInstallmentStatusVariant(effective)} />;
            },
        },
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => {
                // Closed by a full refund — nothing is owed and nothing can be collected.
                if (row.original.status === "cancelled") {
                    return <Typography variant="caption" color="text.secondary">Cancelled</Typography>;
                }
                if (row.original.status === "paid") {
                    // Refunding is withheld until the whole plan is settled, so a paid row
                    // in a plan that still owes money offers nothing.
                    return canRefund && planSettled
                        ? <Actions onRefund={() => setRefundRow(row.original)} />
                        : <Typography variant="caption" color="text.secondary">Paid</Typography>;
                }
                return <Actions onMarkPaid={() => openPayForm(row.original)} />;
            },
        },
    ], [canRefund, planSettled]);

    return (
        <>
        <Dialog open={!!purchaseId} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent className="flex flex-col gap-4" sx={{ background: theme.palette.primary.contrastText }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" fontWeight={600}>Installment Schedule</Typography>
                    <IconButton onClick={handleClose}><CloseCircle size={22} color={theme.palette.error.main} /></IconButton>
                </Stack>
                <Divider />

                {isLoading ? (
                    <Box className="flex justify-center p-8"><CircularProgress size={26} /></Box>
                ) : !schedule ? (
                    <Typography color="text.secondary" className="py-6! text-center">No schedule found.</Typography>
                ) : (
                    <>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent="space-between">
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600} className="capitalize">{schedule.student_name}</Typography>
                                <Typography variant="body2" color="text.secondary" className="capitalize">{schedule.course_name}</Typography>
                            </Box>
                            {schedule.is_archived && (
                                <Chip size="small" color="error" variant="outlined" label="Access suspended for non-payment" />
                            )}
                        </Stack>

                        {/* Say why the refund action is absent — otherwise an admin who holds
                            the permission just sees it missing and assumes something is broken. */}
                        {canRefund && !planSettled && (
                            <Alert severity="info" sx={{ background: "transparent", p: 0 }}>
                                Refunds open up once the last installment is paid — {schedule.paid_count} of{" "}
                                {schedule.total_count} settled, NRs. {Number(schedule.outstanding_amount ?? 0).toLocaleString()} outstanding.
                            </Alert>
                        )}

                        <CustomTable data={rows} columns={columns} loading={isFetching} skeletonRows={rows.length || 3} />

                        {payRow && (
                            <>
                                <Divider />
                                <Box className="flex flex-col gap-3">
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Record payment — Installment #{payRow.installment_number} · NRs. {Number(payRow.amount).toLocaleString()}
                                    </Typography>
                                    <Alert severity="warning" sx={{ background: "transparent", p: 0 }}>
                                        This cannot be undone, and the schedule can no longer be regenerated once any installment is paid.
                                    </Alert>

                                    <div className="md:grid grid-cols-2 flex flex-col gap-3">
                                        <div>
                                            <InputLabel className="required mb-1!">Payment Method</InputLabel>
                                            <Autocomplete
                                                fullWidth
                                                disableClearable
                                                options={paymentOptions}
                                                getOptionLabel={(o) => o.label}
                                                value={paymentOptions.find((o) => o.value === form.payment_method) || undefined}
                                                onChange={(_e, v) => setForm((f) => ({ ...f, payment_method: v?.value ?? "" }))}
                                                renderInput={(params) => <TextField {...params} placeholder="Select payment method" />}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel className="required mb-1!">Payment Date</InputLabel>
                                            <MakuraDatePicker
                                                value={form.paid_at ? dayjs(form.paid_at) : null}
                                                onChange={(v) => setForm((f) => ({ ...f, paid_at: v ? v.format("YYYY-MM-DD") : "" }))}
                                                placeholder="Select date"
                                                error={paidAtInvalid}
                                            />
                                            {paidAtInvalid && (
                                                <Typography color="error" variant="caption">Payment date cannot be in the future</Typography>
                                            )}
                                        </div>
                                        <div>
                                            <InputLabel className="required mb-1!">Transaction ID / Bill No.</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                placeholder="Transaction ID / Bill No."
                                                value={form.transaction_id}
                                                onChange={(e) => setForm((f) => ({ ...f, transaction_id: e.target.value }))}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Generate a new Transaction ID / Bill No." arrow>
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={regenerateBillNo}
                                                                aria-label="Generate a new Transaction ID / Bill No."
                                                            >
                                                                <ArrowRotateRight size={18} color={theme.palette.text.primary} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                }
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                Auto-generated — overwrite it with a bank/gateway reference if needed.
                                            </Typography>
                                        </div>
                                        <div>
                                            <InputLabel className="required mb-1!">Invoice ID</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                placeholder="Invoice ID"
                                                value={form.invoice_id}
                                                onChange={(e) => setForm((f) => ({ ...f, invoice_id: e.target.value }))}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Generate a new Invoice ID" arrow>
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={regenerateInvoiceNo}
                                                                aria-label="Generate a new Invoice ID"
                                                            >
                                                                <ArrowRotateRight size={18} color={theme.palette.text.primary} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                }
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                Auto-generated — edit it if you need a different reference.
                                            </Typography>
                                        </div>
                                    </div>

                                    <Stack direction="row" justifyContent="flex-end" gap={2} mt={1}>
                                        <Button variant="outlined" onClick={() => setPayRow(null)} disabled={paying}>Cancel</Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleRecordPayment}
                                            disabled={paying || !canRecordPayment}
                                        >
                                            {paying ? "Recording…" : "Confirm & Record Payment"}
                                        </Button>
                                    </Stack>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>

        <RefundDialog
            purchaseId={refundRow ? purchaseId : null}
            moduleType={moduleType}
            studentName={schedule?.student_name}
            itemName={schedule?.course_name}
            isInstallment
            installment={refundRow ? {
                id: refundRow.id,
                installment_number: refundRow.installment_number,
                amount: Number(refundRow.amount),
            } : null}
            onClose={() => setRefundRow(null)}
        />
        </>
    );
}
