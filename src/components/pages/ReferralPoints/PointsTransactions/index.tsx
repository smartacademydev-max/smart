import {
    Box, Checkbox, Chip, Stack, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Gift } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllPointsTransactionsQuery, useGetReferralOverviewQuery } from "../../../../services/referralApi";
import { PATH } from "../../../../routes/PATH";
import DashboardAnalyticsCard from "../../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../../organism/Cards/DashboardAnalyticsCard/Loading";
import TabController from "../../../molecules/TabController";
import type { PointsTransactionProps, PointsTransactionType } from "../../../../types/referral";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

const TYPE_OPTIONS: { label: string; value: PointsTransactionType | "" }[] = [
    { label: "All Types", value: "" },
    { label: "Earned", value: "earned" },
    { label: "Spent", value: "spent" },
];

export default function PointsTransactionsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [transactionType, setTransactionType] = useState<PointsTransactionType | "">("");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    const { data, isLoading } = useGetAllPointsTransactionsQuery({ ...qp, search, transaction_type: transactionType });
    const { data: overviewData, isLoading: overviewLoading } = useGetReferralOverviewQuery();
    const overview = overviewData?.data;

    const analyticsCards = [
        { title: "Points Distributed", value: (overview?.total_points_distributed ?? 0).toLocaleString(), description: "Total points given out", type: "success" as const },
        { title: "Points Redeemed", value: (overview?.total_points_redeemed ?? 0).toLocaleString(), description: "Total points spent by users", type: "error" as const },
        { title: "Total Referrals", value: (overview?.total_referrals ?? 0).toLocaleString(), description: "All time referrals", type: "info" as const },
        { title: "Conversion Rate", value: `${overview?.conversion_rate ?? 0}%`, description: "Referral to purchase rate", type: "warning" as const },
    ];
    const transactions = data?.data?.data || [];

    const isAllSelected = transactions.length > 0 && selectedRows.size === transactions.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < transactions.length;

    const handleSelectAll = (checked: boolean) =>
        setSelectedRows(checked ? new Set(transactions.map((t) => t.id)) : new Set());

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        checked ? next.add(id) : next.delete(id);
        setSelectedRows(next);
    };

    const columns = useMemo<ColumnDef<PointsTransactionProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox checked={isAllSelected} indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)} color="primary" />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            size: 80,
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox checked={selectedRows.has(row.original.id)}
                        onChange={(e) => handleSelectRow(row.original.id, e.target.checked)} color="primary" />
                    <Typography fontWeight={500}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
        },
        {
            header: "User",
            accessorKey: "user_name",
            cell: ({ row }) => (
                <Typography
                    variant="body2" fontWeight={500}
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(PATH.USER_MANAGEMENT.VIEW_USER.REFERRALS.ROOT(String(row.original.user_id)))}
                >
                    {row.original.user_name}
                </Typography>
            ),
        },
        {
            header: "Action",
            accessorKey: "action_label",
            cell: ({ row }) => (
                <Typography variant="body2">{row.original.action_label}</Typography>
            ),
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
                    color={row.original.transaction_type === "earned" ? "success.main" : "warning.main"}
                >
                    {row.original.transaction_type === "earned" ? "+" : "-"}{row.original.points}
                </Typography>
            ),
        },
        {
            header: "Balance After",
            accessorKey: "balance_after",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {row.original.balance_after} pts
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
    ], [selectedRows, isAllSelected, isSomeSelected, qp]);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        { title: "Referral & Points", url: PATH.REFERRAL_POINTS.ROOT, icon: <Gift color="#1D82F5" /> },
                        { title: "Points Transactions" },
                    ]}
                />

                <div className="gap-4 grid grid-cols-2 2xl:grid-cols-4 2xl:gap-8 mb-8 px-2 pt-2">
                    {overviewLoading
                        ? Array.from({ length: 4 }).map((_, i) => <DashboardAnalyticsLoading key={i} />)
                        : analyticsCards.map((card) => (
                            <DashboardAnalyticsCard key={card.title} data={card} />
                        ))}
                </div>

                <TabController
                    size="sm"
                    currentActive={transactionType}
                    setActiveTab={(val) => { setTransactionType(val as PointsTransactionType | ""); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                    options={TYPE_OPTIONS}
                />

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={() => {}}
                    handleResetFilter={() => { setSearch(""); setTransactionType(""); setQp({ pageIndex: 1, pageSize: 8 }); }}
                />
            </div>

            {!isLoading && !transactions.length ? (
                <EmptyRoute
                    title="No Transactions Yet"
                    message="Points transactions will appear here as users earn and spend points."
                    icon={<Gift color="#1D82F5" size={24} />}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        <CustomTable data={transactions} columns={columns} loading={isLoading} />
                    </Box>
                    <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
                </>
            )}
        </div>
    );
}
