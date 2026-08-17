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
import { CloseCircle } from "iconsax-reactjs";
import { useEffect, useMemo, useState } from "react";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useCreateRefundMutation, useGetRefundsQuery } from "../../../services/refundApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { refundMethodOptions } from "../../../types";
import { REFUND_REASON_MAX, type EnrollmentType, type RefundPayload } from "../../../types/transaction";
import { formatAmount, toAmount } from "../../../utils/itemPrice";
import { OutlinedTextarea } from "../../atoms/OutlinedTextArea";
import RefundHistory from "../RefundHistory";

interface Props {
    /** Purchase to refund. `null` keeps the dialog closed. */
    purchaseId: number | null;
    /**
     * MUST match the module the transaction was listed under — course and
     * test/bundle purchases have independent ID sequences, so the wrong value
     * refunds a different row (or 404s).
     */
    moduleType?: EnrollmentType;
    onClose: () => void;
    studentName?: string;
    itemName?: string;
    /** True when the purchase is on an installment plan — changes the consequence copy. */
    isInstallment?: boolean;
    /** Pre-scope the refund to one *paid* installment (courses only). */
    installment?: { id: number; installment_number: number; amount: number } | null;
}

const emptyForm = { amount: "", reason: "", refund_method: "", reference_id: "" };

/**
 * Records a refund (§1) against one purchase, with the ledger (§2) in view.
 *
 * Two steps on purpose: the consequence of a full refund — access revoked,
 * remaining installments cancelled — is irreversible from this screen, and the
 * money itself is never moved automatically.
 */
export default function RefundDialog({
    purchaseId,
    moduleType = "course",
    onClose,
    studentName,
    itemName,
    isInstallment = false,
    installment = null,
}: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // `view_refunds` and `add_refunds` are independent — an admin may be able to
    // record a refund without being able to read the ledger. Don't fire a request
    // we know will 403; the dialog degrades to a blind full-refund instead.
    const canViewLedger = useHasPermission("view_refunds");

    const { data, isLoading, isFetching, isError, error, refetch } = useGetRefundsQuery(
        { purchaseId: purchaseId as number, moduleType },
        { skip: !purchaseId || !canViewLedger },
    );
    const [createRefund, { isLoading: submitting }] = useCreateRefundMutation();

    const [form, setForm] = useState(emptyForm);
    const [confirming, setConfirming] = useState(false);

    const ledger = data?.data;
    const refunds = ledger?.refunds ?? [];
    const refundedSoFar = toAmount(ledger?.refunded_amount);
    // The live ceiling — never let the input exceed it, and disable the whole
    // action once it reaches zero. Only trustworthy when the ledger loaded.
    const refundable = toAmount(ledger?.refundable_amount);
    const ledgerKnown = canViewLedger && !isError && Boolean(ledger);

    // A single installment can only give back what that installment collected,
    // and never more than the purchase's remaining balance. Without the ledger
    // there is no client-side ceiling — the server still enforces one (422).
    const ceiling = installment
        ? (ledgerKnown ? Math.min(toAmount(installment.amount), refundable) : toAmount(installment.amount))
        : (ledgerKnown ? refundable : Infinity);
    /** False only when we have no idea what the balance is — don't cap or quote a figure. */
    const hasCeiling = Number.isFinite(ceiling);

    // Reset whenever the dialog is pointed at a different purchase/installment.
    useEffect(() => {
        setForm(emptyForm);
        setConfirming(false);
    }, [purchaseId, installment?.id]);

    const amountEntered = form.amount.trim() !== "";
    const parsedAmount = toAmount(form.amount);
    // Blank amount means "refund everything still refundable" (§1) — for an
    // installment refund that is the installment's own amount.
    const effectiveAmount = amountEntered ? parsedAmount : ceiling;

    const amountError = useMemo(() => {
        if (!amountEntered) return "";
        if (parsedAmount <= 0) return "Amount must be greater than zero.";
        if (parsedAmount > ceiling) return `Cannot exceed NRs. ${formatAmount(ceiling)}.`;
        return "";
    }, [amountEntered, parsedAmount, ceiling]);

    const reason = form.reason.trim();
    const reasonError = reason.length > REFUND_REASON_MAX
        ? `Reason cannot exceed ${REFUND_REASON_MAX} characters.`
        : "";

    // Only claim there is nothing left when we actually read the balance — an
    // unread ledger would otherwise look identical to a fully refunded one.
    const nothingLeft = ledgerKnown && refundable <= 0;
    const canSubmit = Boolean(reason) && !reasonError && !amountError && !nothingLeft && !isError && ceiling > 0;

    /**
     * Access is revoked when the refund clears the *entire* remaining balance —
     * whether that happens in one go or as the last of several partials.
     * `null` when the ledger is unreadable: we can't tell, so we don't claim to.
     */
    const revokesAccess = !ledgerKnown
        ? null
        : effectiveAmount >= refundable && refundable > 0;

    const handleClose = () => {
        if (submitting) return;
        setForm(emptyForm);
        setConfirming(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!purchaseId || !canSubmit) return;

        const body: RefundPayload = { reason };
        // Omitting `amount` is what asks for the full remaining balance — only
        // send it when the admin actually typed one.
        if (amountEntered) body.amount = parsedAmount;
        if (installment) body.installment_id = installment.id;
        if (form.refund_method) body.refund_method = form.refund_method;
        if (form.reference_id.trim()) body.reference_id = form.reference_id.trim();

        try {
            const res = await createRefund({ purchaseId, moduleType, body }).unwrap();
            dispatch(showToast({ message: res?.message || "Refund recorded successfully!", severity: "success" }));
            handleClose();
        } catch (e: any) {
            // 422 messages are written for the admin to read — surface them verbatim.
            dispatch(showToast({ message: e?.data?.message || "Unable to record the refund.", severity: "error" }));
            setConfirming(false);
            // The balance moved under us (a concurrent refund, a stale list) — resync,
            // but only if we're actually subscribed; refetching a skipped query warns.
            const code = e?.status ?? e?.originalStatus;
            if (canViewLedger && (code === 404 || code === 422)) refetch();
        }
    };

    const summary = (
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
            <Box className="rounded-xl px-3 py-2" sx={{ border: `1px solid ${theme.palette.divider}`, flex: "1 1 140px" }}>
                <Typography variant="caption" color="text.secondary">Refunded so far</Typography>
                <Typography variant="subtitle1" fontWeight={600} color={refundedSoFar > 0 ? "error.main" : undefined}>
                    NRs. {formatAmount(refundedSoFar) || "0"}
                </Typography>
            </Box>
            <Box className="rounded-xl px-3 py-2" sx={{ border: `1px solid ${theme.palette.divider}`, flex: "1 1 140px" }}>
                <Typography variant="caption" color="text.secondary">Still refundable</Typography>
                <Typography variant="subtitle1" fontWeight={600}>NRs. {formatAmount(refundable) || "0"}</Typography>
            </Box>
            {ledger?.is_refunded && (
                <Box className="flex items-center">
                    <Chip size="small" color="error" variant="outlined" label="Fully refunded" />
                </Box>
            )}
        </Stack>
    );

    return (
        <Dialog open={!!purchaseId} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent className="flex flex-col gap-4" sx={{ background: theme.palette.primary.contrastText }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                    <Box>
                        <Typography variant="h5" fontWeight={600}>
                            {installment ? `Refund Installment #${installment.installment_number}` : "Refund Transaction"}
                        </Typography>
                        {(studentName || itemName) && (
                            <Typography variant="body2" color="text.secondary" className="capitalize">
                                {[studentName, itemName].filter(Boolean).join(" · ")}
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={handleClose} disabled={submitting}>
                        <CloseCircle size={22} color={theme.palette.error.main} />
                    </IconButton>
                </Stack>
                <Divider />

                {isLoading ? (
                    <Box className="flex justify-center p-8"><CircularProgress size={26} /></Box>
                ) : isError ? (
                    <>
                        <Alert
                            severity="error"
                            action={<Button size="small" color="inherit" onClick={() => refetch()}>Retry</Button>}
                        >
                            {(error as any)?.data?.message
                                || "Couldn't load the refund ledger. A 404 here usually means the module type doesn't match the transaction, and refunding would hit the same wrong row."}
                        </Alert>
                        <Stack direction="row" justifyContent="flex-end">
                            <Button variant="outlined" onClick={handleClose}>Close</Button>
                        </Stack>
                    </>
                ) : confirming ? (
                    /* ---------------------------- Confirmation ---------------------------- */
                    <>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {Number.isFinite(effectiveAmount)
                                ? `Refund NRs. ${formatAmount(effectiveAmount)}?`
                                : "Refund the full remaining balance?"}
                        </Typography>

                        <Alert severity={revokesAccess === false ? "warning" : "error"}>
                            {revokesAccess === null ? (
                                <>
                                    Your account can't read this transaction's refund balance, so the
                                    outcome can't be shown here. If this clears the full remaining
                                    balance the student <strong>loses access immediately</strong>
                                    {isInstallment ? " and every unpaid installment is cancelled" : ""};
                                    if it doesn't, their access is untouched.
                                </>
                            ) : revokesAccess ? (
                                <>
                                    This clears the full remaining balance, so the student
                                    <strong> loses access immediately</strong>
                                    {isInstallment ? " and every unpaid installment is cancelled." : "."}
                                </>
                            ) : (
                                <>
                                    This is a partial refund — the student
                                    <strong> keeps their access</strong>. Treat it as a price adjustment.
                                </>
                            )}
                        </Alert>

                        <Alert severity="info">
                            No money moves automatically. eSewa and Khalti have no refund API wired in,
                            so this records a repayment you settle by hand. The student is notified, and
                            the notification states whether their access was removed.
                        </Alert>

                        <Box className="rounded-xl p-3" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="caption" color="text.secondary">Reason</Typography>
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{reason}</Typography>
                            {(form.refund_method || form.reference_id.trim()) && (
                                <Stack direction="row" flexWrap="wrap" gap={2} mt={1}>
                                    {form.refund_method && (
                                        <Typography variant="caption" color="text.secondary" className="capitalize">
                                            Method: <strong>{form.refund_method}</strong>
                                        </Typography>
                                    )}
                                    {form.reference_id.trim() && (
                                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                                            Ref: <strong>{form.reference_id.trim()}</strong>
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                        </Box>

                        <Stack direction="row" justifyContent="flex-end" gap={2}>
                            <Button variant="outlined" onClick={() => setConfirming(false)} disabled={submitting}>
                                Back
                            </Button>
                            <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? "Recording…" : "Confirm Refund"}
                            </Button>
                        </Stack>
                    </>
                ) : (
                    /* -------------------------------- Form -------------------------------- */
                    <>
                        {canViewLedger ? summary : (
                            <Alert severity="info">
                                Your account can't view refund balances, so the amount already
                                refunded and what's still refundable aren't shown. Leaving the
                                amount blank still refunds the full remaining balance.
                            </Alert>
                        )}

                        {nothingLeft ? (
                            <Alert severity="info">
                                Nothing left to refund on this transaction.
                            </Alert>
                        ) : (
                            <>
                                {installment && (
                                    <Alert severity="info" sx={{ background: "transparent", p: 0 }}>
                                        Refunding installment #{installment.installment_number} · collected
                                        NRs. {formatAmount(installment.amount)}.
                                    </Alert>
                                )}

                                <div className="md:grid grid-cols-3 flex flex-col gap-3">
                                    <div>
                                        <InputLabel className="mb-1!">Amount</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            type="number"
                                            inputProps={{ min: 0, step: "0.01", ...(hasCeiling ? { max: ceiling } : {}) }}
                                            placeholder={hasCeiling
                                                ? `Full refund — NRs. ${formatAmount(ceiling)}`
                                                : "Full refund of the remaining balance"}
                                            value={form.amount}
                                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                            error={Boolean(amountError)}
                                        />
                                        <Typography variant="caption" color={amountError ? "error" : "text.secondary"}>
                                            {amountError || (hasCeiling
                                                ? `Leave blank to refund the full NRs. ${formatAmount(ceiling)}.`
                                                : "Leave blank to refund the full remaining balance.")}
                                        </Typography>
                                    </div>
                                    <div>
                                        <InputLabel className="mb-1!">Refund Method</InputLabel>
                                        <Autocomplete
                                            fullWidth
                                            options={refundMethodOptions}
                                            getOptionLabel={(o) => o.label}
                                            value={refundMethodOptions.find((o) => o.value === form.refund_method) || null}
                                            onChange={(_e, v) => setForm((f) => ({ ...f, refund_method: v?.value ?? "" }))}
                                            renderInput={(params) => <TextField {...params} placeholder="How was it returned?" />}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel className="mb-1!">Reference ID</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            placeholder="Your reference for the repayment"
                                            value={form.reference_id}
                                            onChange={(e) => setForm((f) => ({ ...f, reference_id: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel className="required mb-1!">Reason</InputLabel>
                                    <OutlinedTextarea
                                        rows={3}
                                        placeholder="Why is this being refunded? Shown in the refund ledger."
                                        value={form.reason}
                                        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                                        sx={reasonError ? { borderColor: theme.palette.error.main } : undefined}
                                    />
                                    <Typography variant="caption" color={reasonError ? "error" : "text.secondary"}>
                                        {reasonError || `${reason.length}/${REFUND_REASON_MAX}`}
                                    </Typography>
                                </div>

                                <Stack direction="row" justifyContent="flex-end" gap={2}>
                                    <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => setConfirming(true)}
                                        disabled={!canSubmit || isFetching}
                                    >
                                        Continue
                                    </Button>
                                </Stack>
                            </>
                        )}

                        {/* The ledger is a separate read — `view_refunds`, not `add_refunds`. */}
                        {canViewLedger && (
                            <>
                                <Divider />
                                <RefundHistory refunds={refunds} />
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
