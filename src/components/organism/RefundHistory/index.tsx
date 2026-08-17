import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { RefundRow } from "../../../types/transaction";
import { formatDateTime } from "../../../utils/dateFormat";
import { formatAmount } from "../../../utils/itemPrice";
import CustomTable from "../../molecules/Table";

interface Props {
    refunds: RefundRow[];
    /** Rendered in place of the table when there is nothing to show yet. */
    emptyMessage?: string;
    title?: string;
    /** Drops the heading — for callers that already have one. */
    hideTitle?: boolean;
    loading?: boolean;
}

/**
 * The refund ledger for one purchase, in the order the API returns it.
 *
 * Read-only by design: refunds are records of money the admin moved by hand, and
 * nothing here can be edited or reversed once written.
 */
export default function RefundHistory({
    refunds,
    emptyMessage = "No refunds recorded for this transaction.",
    title = "Refund History",
    hideTitle = false,
    loading = false,
}: Props) {
    const columns = useMemo<ColumnDef<RefundRow>[]>(() => [
        {
            header: "Amount",
            accessorKey: "amount",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={600} color="error.main" className="text-nowrap">
                    − NRs. {formatAmount(row.original.amount)}
                </Typography>
            ),
        },
        {
            header: "Against",
            accessorKey: "installment_id",
            cell: ({ row }) => (
                row.original.installment_id == null ? (
                    <Typography variant="subtitle2" fontWeight={400} color="text.secondary">Transaction</Typography>
                ) : (
                    <Chip
                        size="small"
                        variant="outlined"
                        className="text-nowrap"
                        // `installment_number` is only emitted when the relation is
                        // eager-loaded — never depend on it being there.
                        label={row.original.installment_number != null
                            ? `Installment #${row.original.installment_number}`
                            : "Installment"}
                        sx={{ fontSize: 11 }}
                    />
                )
            ),
        },
        {
            header: "Reason",
            accessorKey: "reason",
            cell: ({ row }) => (
                <Tooltip title={row.original.reason || ""} arrow>
                    <Typography variant="subtitle2" fontWeight={400} className="line-clamp-2 min-w-40">
                        {row.original.reason || "—"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Method",
            accessorKey: "refund_method",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} className="capitalize text-nowrap">
                    {row.original.refund_method || "—"}
                </Typography>
            ),
        },
        {
            header: "Reference",
            accessorKey: "reference_id",
            cell: ({ row }) => (
                <Tooltip title={row.original.reference_id || ""} arrow>
                    <Typography variant="subtitle2" fontWeight={400} className="line-clamp-1">
                        {row.original.reference_id || "—"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Refunded By",
            accessorKey: "refunded_by",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} className="capitalize text-nowrap">
                    {row.original.refunded_by || "—"}
                </Typography>
            ),
        },
        {
            header: "Date",
            accessorKey: "refunded_at",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} className="text-nowrap">
                    {formatDateTime(row.original.refunded_at) || "—"}
                </Typography>
            ),
        },
    ], []);

    return (
        <Box>
            {!hideTitle && (
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                    <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
                    {refunds.length > 0 && (
                        <Chip size="small" variant="outlined" color="error" label={refunds.length} />
                    )}
                </Stack>
            )}

            {!loading && !refunds.length ? (
                <Typography variant="body2" color="text.secondary" className="py-2!">
                    {emptyMessage}
                </Typography>
            ) : (
                <CustomTable
                    data={refunds}
                    columns={columns}
                    loading={loading}
                    skeletonRows={refunds.length || 2}
                />
            )}
        </Box>
    );
}
