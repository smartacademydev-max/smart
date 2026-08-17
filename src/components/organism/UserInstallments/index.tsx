import { Alert, Box, Chip, Divider, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useGetUserInstallmentsQuery } from "../../../services/installmentApi";
import type { UserInstallmentFilter, UserInstallmentRow } from "../../../types/transaction";
import { formatDateForDisplay } from "../../../utils/dateFormat";
import { getInstallmentStatusVariant } from "../../../utils/statusMap";
import StatusPill from "../../atoms/StatusPill";
import ActionIconVisible from "../../molecules/Action/ActionIconVisible";
import TabController from "../../molecules/TabController";
import CustomTable from "../../molecules/Table";
import TablePagination from "../../molecules/Table/Pagination";
import InstallmentScheduleDialog from "../InstallmentScheduleDialog";

/** Cancelled rows stay in the schedule but read as closed — struck through, dimmed. */
const cancelledSx = (row: UserInstallmentRow) =>
    row.status === "cancelled"
        ? { textDecoration: "line-through", opacity: 0.55 }
        : undefined;

interface Props {
    userId: number;

    defaultStatus?: UserInstallmentFilter;

    showFilter?: boolean;

    compact?: boolean;

    hideWhenEmpty?: boolean;

    enablePay?: boolean;
    title?: string;
}


export default function UserInstallments({
    userId,
    defaultStatus = "all",
    showFilter = false,
    compact = false,
    hideWhenEmpty = false,
    enablePay = false,
    title = "Installments",
}: Props) {
    const theme = useTheme();
    const [status, setStatus] = useState<UserInstallmentFilter>(defaultStatus);
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: compact ? 5 : 10 });
    const [schedulePurchaseId, setSchedulePurchaseId] = useState<number | null>(null);

    const { data, isLoading, isFetching } = useGetUserInstallmentsQuery(
        { userId, status, ...qp },
        { skip: !userId },
    );

    const rows = data?.data?.data ?? [];
    const total = data?.data?.pagination?.total ?? 0;
    const totalPages = data?.data?.pagination?.total_pages ?? 0;

    const handleFilterChange = (value: UserInstallmentFilter) => {
        setStatus(value);
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
    };

    const columns = useMemo<ColumnDef<UserInstallmentRow>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
            ),
        },
        {
            header: "Course",
            accessorKey: "course_name",
            cell: ({ row }) => (
                <Tooltip title={row.original.course_name ?? ""} arrow>
                    <Typography variant="subtitle2" fontWeight={400} className="line-clamp-1 capitalize">
                        {row.original.course_name || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Installment",
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
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                // Overdue is computed live, but a row settled by payment — or cancelled by a
                // full refund — is closed and can never go overdue.
                const settled = row.original.status === "paid" || row.original.status === "cancelled";
                const effective = row.original.is_overdue && !settled
                    ? "overdue"
                    : row.original.status;
                return <StatusPill status={effective} variant={getInstallmentStatusVariant(effective)} />;
            },
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
        ...(enablePay ? [{
            header: "Action",
            accessorKey: "action",
            cell: ({ row }: { row: { original: UserInstallmentRow } }) => (
                <ActionIconVisible onView={() => setSchedulePurchaseId(row.original.purchase_id)} />
            ),
        }] : []),
    ], [qp.pageIndex, qp.pageSize, enablePay]);

    // In the form, stay quiet until we know the student owes nothing.
    if (hideWhenEmpty && !isLoading && total === 0) return null;
    if (hideWhenEmpty && (isLoading || isFetching) && rows.length === 0) return null;

    const filterTabs: { label: string; value: UserInstallmentFilter }[] = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Settled", value: "settled" },
    ];

    return (
        <Box
            className="rounded-xl"
            sx={compact
                ? { border: `1px solid ${theme.palette.warning.main}`, background: theme.palette.warning.light, p: 2, mt: 1 }
                : { border: `1px solid ${theme.palette.divider}`, p: 2.5, mt: 3 }}
        >
            {compact ? (
                <Alert severity="warning" className="mb-3!" sx={{ background: "transparent", p: 0 }}>
                    This student already has <strong>{total}</strong> outstanding installment
                    {total === 1 ? "" : "s"}. Review before assigning a new transaction.
                </Alert>
            ) : (
                <>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.5}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Typography variant="h5" fontWeight={600}>{title}</Typography>
                            {total > 0 && (
                                <Chip
                                    size="small"
                                    label={status === "settled" ? `${total} settled` : `${total} outstanding`}
                                    color={status === "settled" ? "success" : "warning"}
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                </>
            )}

            {showFilter && (
                <TabController
                    size="sm"
                    currentActive={status}
                    setActiveTab={handleFilterChange}
                    options={filterTabs}
                />
            )}

            {!isLoading && rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary" className="py-4! text-center">
                    {status === "settled" ? "No settled installments." : "No installments found."}
                </Typography>
            ) : (
                <>
                    <CustomTable data={rows} columns={columns} loading={isLoading || isFetching} skeletonRows={compact ? 3 : 5} />
                    {!compact && totalPages > 1 && (
                        <TablePagination qp={qp} setQp={setQp} totalPages={totalPages} totalRecords={total} />
                    )}
                </>
            )}

            {enablePay && (
                <InstallmentScheduleDialog
                    purchaseId={schedulePurchaseId}
                    onClose={() => setSchedulePurchaseId(null)}
                />
            )}
        </Box>
    );
}
