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
    InputLabel,
    OutlinedInput,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { CloseCircle } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useGetInstallmentScheduleQuery, usePayInstallmentMutation } from "../../../services/installmentApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { paymentOptions } from "../../../types";
import type { InstallmentRow } from "../../../types/transaction";
import { formatDateForDisplay } from "../../../utils/dateFormat";
import { getInstallmentStatusVariant } from "../../../utils/statusMap";
import MakuraDatePicker from "../../atoms/MakuraDatePicker";
import StatusPill from "../../atoms/StatusPill";
import Actions from "../../molecules/Action";
import CustomTable from "../../molecules/Table";

interface Props {
    /** Purchase whose schedule to show. `null` keeps the dialog closed. */
    purchaseId: number | null;
    onClose: () => void;
}

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Schedule for one purchase (§2) with per-row "Mark as Paid" (§3).
 * The pay response IS the refreshed schedule and the mutation invalidates the
 * PURCHASE tag, so this query re-renders with fresh state — no manual refetch.
 */
export default function InstallmentScheduleDialog({ purchaseId, onClose }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const { data, isLoading, isFetching, refetch } = useGetInstallmentScheduleQuery(purchaseId as number, {
        skip: !purchaseId,
    });
    const [payInstallment, { isLoading: paying }] = usePayInstallmentMutation();

    const schedule = data?.data;
    const rows = schedule?.installments ?? [];

    // The row currently being paid (drives the payment sub-form).
    const [payRow, setPayRow] = useState<InstallmentRow | null>(null);
    const [form, setForm] = useState({ payment_method: "cash", transaction_id: "", invoice_id: "", paid_at: "" });

    const paidAtInvalid = Boolean(form.paid_at) && form.paid_at > todayStr();
    // Every field is required before a payment can be recorded.
    const canRecordPayment = Boolean(
        form.payment_method && form.paid_at && !paidAtInvalid && form.transaction_id.trim() && form.invoice_id.trim(),
    );

    const openPayForm = (row: InstallmentRow) => {
        setForm({ payment_method: "cash", transaction_id: "", invoice_id: "", paid_at: "" });
        setPayRow(row);
    };

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
            cell: ({ row }) => <Typography variant="subtitle2" fontWeight={400}>#{row.original.installment_number}</Typography>,
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>NRs. {Number(row.original.amount).toLocaleString()}</Typography>
            ),
        },
        {
            header: "Due Date",
            accessorKey: "due_date",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>{formatDateForDisplay(row.original.due_date) || "N/A"}</Typography>
            ),
        },
        {
            header: "Paid On",
            accessorKey: "paid_at",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>
                    {row.original.paid_at ? formatDateForDisplay(row.original.paid_at) : "—"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                // Badge off is_overdue (live), not the stored status (§2).
                const effective = row.original.is_overdue && row.original.status !== "paid"
                    ? "overdue"
                    : row.original.status;
                return <StatusPill status={effective} variant={getInstallmentStatusVariant(effective)} />;
            },
        },
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
                row.original.status === "paid" ? (
                    <Typography variant="caption" color="text.secondary">Paid</Typography>
                ) : (
                    <Actions onMarkPaid={() => openPayForm(row.original)} />
                )
            ),
        },
    ], []);

    return (
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
                                            <InputLabel className="required mb-1!">Transaction / Bill No.</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                placeholder="Transaction / Bill No."
                                                value={form.transaction_id}
                                                onChange={(e) => setForm((f) => ({ ...f, transaction_id: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel className="required mb-1!">Invoice ID</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                placeholder="Invoice ID"
                                                value={form.invoice_id}
                                                onChange={(e) => setForm((f) => ({ ...f, invoice_id: e.target.value }))}
                                            />
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
    );
}
