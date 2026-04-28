import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
    Box, Chip, CircularProgress, IconButton,
    Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    useGetUserPointsTransactionsQuery,
    useGetUserReferralHistoryQuery,
    useGetUserReferralStatsQuery,
} from "../../../../../services/referralApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import type { PointsTransactionProps, PointsTransactionType, ReferralProps, ReferralStatus } from "../../../../../types/referral";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";

interface StatCardProps { label: string; value: string | number }

function StatCard({ label, value }: StatCardProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 150 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>{value}</Typography>
        </Paper>
    );
}

const referralStatusColor: Record<ReferralStatus, "default" | "warning" | "info" | "success"> = {
    pending: "warning",
    registered: "info",
    purchased: "success",
};

export default function ReferralsTab() {
    const { id: userId = "" } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const [referralQp, setReferralQp] = useState({ pageIndex: 1, pageSize: 6 });
    const [txQp, setTxQp] = useState({ pageIndex: 1, pageSize: 6 });

    const { data: statsData, isLoading: statsLoading } = useGetUserReferralStatsQuery({ id: userId });
    const { data: historyData, isLoading: historyLoading } = useGetUserReferralHistoryQuery({ id: userId, ...referralQp });
    const { data: txData, isLoading: txLoading } = useGetUserPointsTransactionsQuery({ id: userId, ...txQp });

    const stats = statsData?.data;
    const referrals = historyData?.data?.data || [];
    const transactions = txData?.data?.data || [];

    const handleCopy = () => {
        if (stats?.referral_code) {
            navigator.clipboard.writeText(stats.referral_code);
            dispatch(showToast({ message: "Referral code copied!", severity: "success" }));
        }
    };

    const referralColumns = useMemo<ColumnDef<ReferralProps>[]>(() => [
        {
            header: "S.No.",
            accessorKey: "sno",
            size: 60,
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={500}>
                    {(referralQp.pageIndex - 1) * referralQp.pageSize + row.index + 1}
                </Typography>
            ),
        },
        {
            header: "Referred User",
            accessorKey: "referred_user_name",
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.referred_user_name || <span style={{ color: "gray" }}>Pending</span>}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <Chip
                    label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                    size="small"
                    color={referralStatusColor[row.original.status]}
                    variant="outlined"
                />
            ),
        },
        {
            header: "Points Earned",
            accessorKey: "points_earned",
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={500} color="success.main">
                    {row.original.points_earned > 0 ? `+${row.original.points_earned}` : "—"}
                </Typography>
            ),
        },
        {
            header: "Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {dayjs(row.original.created_at).format("MMM D, YYYY")}
                </Typography>
            ),
        },
    ], [referralQp]);

    const txColumns = useMemo<ColumnDef<PointsTransactionProps>[]>(() => [
        {
            header: "S.No.",
            accessorKey: "sno",
            size: 60,
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={500}>
                    {(txQp.pageIndex - 1) * txQp.pageSize + row.index + 1}
                </Typography>
            ),
        },
        {
            header: "Action",
            accessorKey: "action_label",
            cell: ({ row }) => <Typography variant="body2">{row.original.action_label}</Typography>,
        },
        {
            header: "Type",
            accessorKey: "transaction_type",
            cell: ({ row }) => (
                <Chip
                    label={row.original.transaction_type === "earned" ? "Earned" : "Spent"}
                    size="small"
                    color={row.original.transaction_type === "earned" ? "success" : "warning"}
                    variant="outlined"
                />
            ),
        },
        {
            header: "Points",
            accessorKey: "points",
            cell: ({ row }) => (
                <Typography
                    variant="body2" fontWeight={600}
                    color={(row.original.transaction_type as PointsTransactionType) === "earned" ? "success.main" : "warning.main"}
                >
                    {row.original.transaction_type === "earned" ? "+" : "-"}{row.original.points}
                </Typography>
            ),
        },
        {
            header: "Balance After",
            accessorKey: "balance_after",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">{row.original.balance_after} pts</Typography>
            ),
        },
        {
            header: "Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {dayjs(row.original.created_at).format("MMM D, YYYY")}
                </Typography>
            ),
        },
    ], [txQp]);

    if (statsLoading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Stack gap={3}>
            {/* Stats */}
            <Stack direction="row" flexWrap="wrap" gap={2}>
                <StatCard label="Total Referred" value={stats?.total_referred ?? 0} />
                <StatCard label="Converted" value={stats?.total_converted ?? 0} />
                <StatCard label="Points from Referrals" value={`${stats?.points_from_referrals ?? 0} pts`} />
                <StatCard label="Total Points Balance" value={`${stats?.total_points_balance ?? 0} pts`} />
            </Stack>

            {/* Referral Code */}
            {stats?.referral_code && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Referral Code
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography
                            variant="h6"
                            fontFamily="monospace"
                            fontWeight={700}
                            sx={{ letterSpacing: 2, bgcolor: "action.hover", px: 2, py: 0.75, borderRadius: 1 }}
                        >
                            {stats.referral_code}
                        </Typography>
                        <Tooltip title="Copy code">
                            <IconButton size="small" onClick={handleCopy}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Paper>
            )}

            {/* Referred Users */}
            <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Referred Users</Typography>
                <CustomTable data={referrals} columns={referralColumns} loading={historyLoading} />
                <TablePagination
                    qp={referralQp}
                    setQp={setReferralQp}
                    totalPages={historyData?.data?.pagination?.total_pages || 0}
                />
            </Box>

            {/* Points History */}
            <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Points History</Typography>
                <CustomTable data={transactions} columns={txColumns} loading={txLoading} />
                <TablePagination
                    qp={txQp}
                    setQp={setTxQp}
                    totalPages={txData?.data?.pagination?.total_pages || 0}
                />
            </Box>
        </Stack>
    );
}
