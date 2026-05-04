import {
    Box, Checkbox, Chip, Stack, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Gift } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllReferralsQuery, useGetReferralOverviewQuery } from "../../../../services/referralApi";
import { PATH } from "../../../../routes/PATH";
import DashboardAnalyticsCard from "../../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../../organism/Cards/DashboardAnalyticsCard/Loading";
import TabController from "../../../molecules/TabController";
import type { ReferralProps, ReferralStatus } from "../../../../types/referral";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

const STATUS_OPTIONS: { label: string; value: ReferralStatus | "" }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Registered", value: "registered" },
    { label: "Course Purchased", value: "course_purchased" },
    { label: "Test Purchased", value: "test_purchased" },
    { label: "Bundle Purchased", value: "bundle_purchased" },
];

const statusColor: Record<ReferralStatus, "default" | "warning" | "info" | "success"> = {
    pending: "warning",
    registered: "info",
    course_purchased: "success",
    test_purchased: "success",
    bundle_purchased: "success",
};

export default function AllReferralsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [status, setStatus] = useState<ReferralStatus | "">("");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    const { data, isLoading } = useGetAllReferralsQuery({ ...qp, search, status });
    const { data: overviewData, isLoading: overviewLoading } = useGetReferralOverviewQuery();
    const overview = overviewData?.data;

    const analyticsCards = [
        { title: "Total Referrals", value: (overview?.total_referrals ?? 0).toLocaleString(), description: "All time referrals", type: "info" as const },
        { title: "Conversion Rate", value: `${overview?.conversion_rate ?? 0}%`, description: "Referral to purchase rate", type: "warning" as const },
        { title: "Points Distributed", value: (overview?.total_points_distributed ?? 0).toLocaleString(), description: "Total points given out", type: "success" as const },
        { title: "Points Redeemed", value: (overview?.total_points_redeemed ?? 0).toLocaleString(), description: "Total points spent", type: "error" as const },
    ];
    const referrals = data?.data?.data || [];

    const isAllSelected = referrals.length > 0 && selectedRows.size === referrals.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < referrals.length;

    const handleSelectAll = (checked: boolean) =>
        setSelectedRows(checked ? new Set(referrals.map((r) => r.id)) : new Set());

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        checked ? next.add(id) : next.delete(id);
        setSelectedRows(next);
    };

    const columns = useMemo<ColumnDef<ReferralProps>[]>(() => [
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
            header: "Referrer",
            accessorKey: "referrer_name",
            cell: ({ row }) => (
                <Typography
                    variant="body2" fontWeight={500}
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(PATH.USER_MANAGEMENT.VIEW_USER.REFERRALS.ROOT(String(row.original.referrer_id)))}
                >
                    {row.original.referrer_name}
                </Typography>
            ),
        },
        {
            header: "Referred User",
            accessorKey: "referred_user_name",
            cell: ({ row }) => (
                <Typography variant="body2" color={row.original.referred_user_name ? "text.primary" : "text.disabled"}>
                    {row.original.referred_user_name || "Pending"}
                </Typography>
            ),
        },
        {
            header: "Referral Code",
            accessorKey: "referral_code",
            cell: ({ row }) => (
                <Typography variant="body2" fontFamily="monospace" sx={{
                    bgcolor: "action.hover", px: 1, py: 0.25, borderRadius: 1, display: "inline-block"
                }}>
                    {row.original.referral_code}
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
                    color={statusColor[row.original.status]}
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
    ], [selectedRows, isAllSelected, isSomeSelected, qp]);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        { title: "Referral & Points", url: PATH.REFERRAL_POINTS.ROOT, icon: <Gift color="#1D82F5" /> },
                        { title: "All Referrals" },
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
                    currentActive={status}
                    setActiveTab={(val) => { setStatus(val as ReferralStatus | ""); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                    options={STATUS_OPTIONS}
                />

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={() => {}}
                    handleResetFilter={() => { setSearch(""); setStatus(""); setQp({ pageIndex: 1, pageSize: 8 }); }}
                />
            </div>

            {!isLoading && !referrals.length ? (
                <EmptyRoute
                    title="No Referrals Found"
                    message="Referrals will appear here when users start referring others."
                    icon={<Gift color="#1D82F5" size={24} />}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        <CustomTable data={referrals} columns={columns} loading={isLoading} />
                    </Box>
                    <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
                </>
            )}
        </div>
    );
}
