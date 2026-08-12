import { Box, Divider, LinearProgress, Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGetAllUserTransacionsQuery } from "../../../../services/transactionApi";
import { useGetUserTransactionAnalyticsQuery, useGetUserTransactionPaymentMethodsQuery } from "../../../../services/userApi";
import type { TransactionProps } from "../../../../types/transaction";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import { formatAmount, sameAmount } from "../../../../utils/itemPrice";
import { getTransactionStatus } from "../../../../utils/statusMap";
import StatusPill from "../../../atoms/StatusPill";
import ActionIconVisible from "../../../molecules/Action/ActionIconVisible";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import DashboardAnalyticsCard from "../../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../../organism/Cards/DashboardAnalyticsCard/Loading";
import EmptyRoute from "../../../organism/EmptyRoute";
import UserInstallments from "../../../organism/UserInstallments";
import TransactionDetailDialog from "./TransactionDetailDialog";

const METHOD_COLORS = ["success", "error", "primary", "warning", "info"] as const;

export default function UserTransactions() {
    const { t } = useTranslation();
    const { id } = useParams();
    const theme = useTheme();
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 5 });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data, isLoading } = useGetAllUserTransacionsQuery({ ...qp, id: Number(id) });
    const { data: analyticsData, isLoading: analyticsLoading } = useGetUserTransactionAnalyticsQuery({ id: Number(id) }, { skip: !id });
    const { data: paymentData, isLoading: paymentLoading } = useGetUserTransactionPaymentMethodsQuery({ id: Number(id) }, { skip: !id });

    const courses = data?.data?.data || [];
    const paymentMethods = paymentData?.data?.methods ?? [];

    const columns = useMemo<ColumnDef<TransactionProps>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => (
                <Typography fontWeight={500} variant="subtitle1">
                    {row.index + 1 || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Course Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Tooltip title={row.original.name} arrow>
                    <Typography fontWeight={500} variant="subtitle1" className="line-clamp-1">
                        {row.original.name || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Payment Method",
            accessorKey: "payment_method",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.payment_method || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Purchased Date",
            accessorKey: "purchased_date",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {formatDateForDisplay(row.original.purchased_date) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Sold Price",
            accessorKey: "sold_price",
            cell: ({ row }) => {
                // `amount_paid` is the read fallback for rows recorded before sold price existed.
                const sold = row.original.sold_price ?? row.original.amount_paid;
                const original = row.original.original_price;
                if (sold == null) return <Typography variant="subtitle1">N/A</Typography>;
                return (
                    <Stack sx={{ gap: "2px" }}>
                        <Typography variant="subtitle1">{formatAmount(sold)}</Typography>
                        {original != null && !sameAmount(original, sold) && (
                            <Typography variant="caption" color="text.secondary">
                                <del>{formatAmount(original)}</del>
                            </Typography>
                        )}
                    </Stack>
                );
            },
        },
        {
            header: "Invoice ID",
            accessorKey: "invoice_id",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.invoice_id || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <StatusPill status={row.original.status} variant={getTransactionStatus(row.original.status)} />
            ),
        },
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
                <ActionIconVisible onView={() => setSelectedId(row.original.id)} />
            ),
        },
    ], [qp])


    return (
        <div className="user__transactions__root">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3, p: 1 }}>
                {analyticsLoading
                    ? Array.from({ length: 3 }).map((_, i) => <DashboardAnalyticsLoading key={i} />)
                    : analyticsData?.data?.map((item) => (
                        <DashboardAnalyticsCard key={item.title} data={{ title: item.title, value: item.value.toLocaleString(), description: "", type: item.type }} />
                    ))
                }
                <Typography className="mb-1!" variant="h5" fontWeight={600}>{t("messages.transaction_information")}</Typography>
            </Box>
            {!isLoading && !courses.length ? <EmptyRoute
                title="No Transactions"
                message="This user has not made any transactions yet."
            /> : <>
                <CustomTable
                    data={courses}
                    columns={columns}
                    loading={isLoading} />
                <TablePagination
                    qp={qp}
                    setQp={setQp}
                    totalPages={data?.data?.pagination?.total_pages || 0}
                /></>
            }

            {/* Installments (§5b) — filterable, with per-row schedule + Mark as Paid. */}
            <UserInstallments userId={Number(id)} showFilter enablePay defaultStatus="all" title="Installments" />

            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2.5, mt: 3 }}>
                <Typography variant="h5" fontWeight={600} mb={1.5}>Payment Method Uses</Typography>
                <Divider sx={{ mb: 2 }} />
                {paymentLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)
                ) : (
                    <>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                            {paymentMethods.map((method, i) => (
                                <Stack key={method.name + i} direction="row" alignItems="center" gap={2}>
                                    <Typography variant="body2" sx={{ minWidth: 120, textTransform: "capitalize" }}>
                                        {method.name}
                                    </Typography>
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={method.percentage}
                                            color={METHOD_COLORS[i % METHOD_COLORS.length]}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 90, textAlign: "right" }}>
                                        NRs. {method.amount.toLocaleString()}
                                    </Typography>
                                </Stack>
                            ))}
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Stack direction="row" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Total Transaction</Typography>
                            <Typography variant="body2" fontWeight={500}>{paymentData?.data?.total_transactions ?? "—"}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                            <Typography variant="body2" fontWeight={500}>NRs. {paymentData?.data?.total_amount?.toLocaleString() ?? "—"}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Last Payment</Typography>
                            <Typography variant="body2" fontWeight={500}>{formatDateForDisplay(paymentData?.data?.last_payment ?? "") || "—"}</Typography>
                        </Stack>
                    </>
                )}
            </Box>
            <TransactionDetailDialog id={selectedId} onClose={() => setSelectedId(null)} />
        </div>
    )
}
