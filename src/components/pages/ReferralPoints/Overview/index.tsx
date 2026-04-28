import { Box, Typography } from "@mui/material";
import { Gift } from "iconsax-reactjs";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetReferralOverviewQuery } from "../../../../services/referralApi";
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
            <Typography variant="h5" fontWeight={500}>Top Referrers</Typography>


            {!overview?.top_referrers?.length ? (
                <EmptyRoute
                    title="No Referral Yet"
                    message="No referral data yet. Encourage users to share their referral links and start earning points!"
                />
            ) : (
                overview.top_referrers.map((referrer, idx) => (
                    <Box
                        key={referrer.user_id}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "60px 1fr 120px 120px 140px",
                            px: 3,
                            py: 1.5,
                            alignItems: "center",
                            borderBottom: idx < overview.top_referrers.length - 1 ? "1px solid" : "none",
                            borderColor: "divider",
                            "&:hover": { bgcolor: "action.hover" },
                        }}
                    >
                        <Typography variant="body2" fontWeight={600} color={idx < 3 ? "primary.main" : "text.primary"}>
                            #{idx + 1}
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate(PATH.USER_MANAGEMENT.VIEW_USER.REFERRALS.ROOT(String(referrer.user_id)))}
                        >
                            {referrer.user_name}
                        </Typography>
                        <Typography variant="body2">{referrer.referrals_count}</Typography>
                        <Typography variant="body2">{referrer.converted_count}</Typography>
                        <Typography variant="body2" fontWeight={500} color="success.main">
                            {referrer.points_earned} pts
                        </Typography>
                    </Box>
                ))
            )}
        </div>
    );
}
