import { Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { Gift } from "iconsax-reactjs";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetReferralOverviewQuery } from "../../../../services/referralApi";
import type { TopReferrer } from "../../../../types/referral";
import CustomTable from "../../../molecules/Table";
import DashboardAnalyticsCard from "../../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../../organism/Cards/DashboardAnalyticsCard/Loading";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";

export default function ReferralOverviewPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useGetReferralOverviewQuery();
    const overview = data?.data;

    const analyticsCards = [
        { title: "Total Referrals", value: (overview?.total_referrals ?? 0).toLocaleString(), description: "All time referrals", type: "info" as const },
        { title: "Conversion Rate", value: `${overview?.conversion_rate ?? 0}%`, description: "Referral to purchase rate", type: "warning" as const },
        { title: "Points Distributed", value: (overview?.total_points_distributed ?? 0).toLocaleString(), description: "Total points given out", type: "success" as const },
        { title: "Points Redeemed", value: (overview?.total_points_redeemed ?? 0).toLocaleString(), description: "Total points spent by users", type: "error" as const },
    ];

    const columns = useMemo<ColumnDef<TopReferrer>[]>(() => [
        {
            header: "Rank",
            accessorKey: "user_id",
            size: 70,
            cell: ({ row }) => (
                <Typography
                    variant="body2"
                    fontWeight={600}
                    color={row.index < 3 ? "primary.main" : "text.primary"}
                >
                    #{row.index + 1}
                </Typography>
            ),
        },
        {
            header: "User",
            accessorKey: "user_name",
            cell: ({ row }) => (
                <Typography
                    variant="body2"
                    fontWeight={500}
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(PATH.USER_MANAGEMENT.VIEW_USER.REFERRALS.ROOT(String(row.original.user_id)))}
                >
                    {row.original.user_name}
                </Typography>
            ),
        },
        {
            header: "Referrals",
            accessorKey: "referrals_count",
            cell: ({ row }) => (
                <Typography variant="body2">{row.original.referrals_count}</Typography>
            ),
        },
        {
            header: "Converted",
            accessorKey: "converted_count",
            cell: ({ row }) => (
                <Typography variant="body2">{row.original.converted_count}</Typography>
            ),
        },
        {
            header: "Points Earned",
            accessorKey: "points_earned",
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={500} color="success.main">
                    {row.original.points_earned.toLocaleString()} pts
                </Typography>
            ),
        },
    ], [navigate]);

    const topReferrers = overview?.top_referrers ?? [];

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                breadcrumb={[{
                    title: "Referral & Points",
                    icon: <Gift color="#1D82F5" />,
                }]}
            />

            <div className="gap-4 grid grid-cols-2 2xl:grid-cols-4 2xl:gap-8 mb-8 px-2 pt-2">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <DashboardAnalyticsLoading key={i} />)
                    : analyticsCards.map((card) => (
                        <DashboardAnalyticsCard key={card.title} data={card} />
                    ))}
            </div>

            <Typography variant="h6" fontWeight={600} mb={2}>Top Referrers</Typography>

            {!isLoading && !topReferrers.length ? (
                <EmptyRoute
                    title="No Referral Yet"
                    message="No referral data yet. Encourage users to share their referral links and start earning points!"
                />
            ) : (
                <CustomTable
                    data={topReferrers}
                    columns={columns}
                    loading={isLoading}
                />
            )}
        </div>
    );
}
