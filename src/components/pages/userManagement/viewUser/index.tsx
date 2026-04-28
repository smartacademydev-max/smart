import { Avatar, Box, Button, Chip, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { Call, Location, Sms, UserTag } from "iconsax-reactjs";
import { useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetUserByIdQuery, useGetUserProfileQuery, useSuspendUserMutation } from "../../../../services/userApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import TabController from "../../../molecules/TabController";
import ConfirmationDialog from "../../../organism/ConfirmationDialog";
import PageHeader from "../../../organism/PageHeader";

type TabValue = "profile" | "courses" | "transactions" | "device-requests" | "performance" | "referrals";

const TABS: { label: string; value: TabValue }[] = [
    { label: "Profile", value: "profile" },
    { label: "Courses", value: "courses" },
    { label: "Transactions", value: "transactions" },
    { label: "Device Request", value: "device-requests" },
    { label: "Performance", value: "performance" },
    { label: "Referrals", value: "referrals" },
];

export default function ViewUserRoot() {
    const { id } = useParams<{ id: string }>();
    const uid = Number(id);
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const { data: userByIdData, isLoading } = useGetUserByIdQuery({ id: id! }, { skip: !id });
    const { data: profileData } = useGetUserProfileQuery({ id: uid }, { skip: !uid });
    const [suspendUser] = useSuspendUserMutation();

    const user = userByIdData?.data;
    const ai = profileData?.data?.account_info;
    const streakAchievement = profileData?.data?.achievements?.find((a) => a.type === "error") ?? null;
    const isSuspended = user ? !!user.is_suspended : false;
    const activeTab = (TABS.find((t) => location.pathname.endsWith(t.value))?.value ?? "profile") as TabValue;

    const handleSuspendToggle = async () => {
        if (!id) return;
        try {
            const response = await suspendUser({ body: [id] }).unwrap();
            dispatch(showToast({ message: response.message || `User ${isSuspended ? "activated" : "suspended"} successfully.`, severity: "success" }));
            setConfirmOpen(false);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Action failed.", severity: "error" }));
            setConfirmOpen(false);
        }
    };

    return (
        <Box className="view__user__root h-full flex flex-col overflow-hidden">
            <PageHeader
                breadcrumb={[
                    { title: "User Management", url: PATH.USER_MANAGEMENT.ROOT },
                    { title: user?.name ?? (isLoading ? "..." : "User"), url: PATH.USER_MANAGEMENT.VIEW_USER.ROOT(id) },
                ]}
            />

            <Box
                sx={{
                    flexShrink: 0,
                    borderRadius: 3,
                    bgcolor: theme.palette.primary.light,
                    p: { xs: 2, md: 3 },
                    mb: 2,
                }}
            >
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "flex-start" }} justifyContent="space-between" gap={2}>
                    <Stack direction="row" alignItems="flex-start" gap={2}>
                        {isLoading ? (
                            <Skeleton variant="circular" width={64} height={64} />
                        ) : (
                            <Avatar
                                src={user?.thumbnail_url || undefined}
                                sx={{ width: 64, height: 64, fontSize: 24, fontWeight: 700, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                        )}

                        <Box flex={1} minWidth={0}>
                            {isLoading ? (
                                <>
                                    <Skeleton width={180} height={28} />
                                    <Skeleton width={240} height={20} sx={{ mt: 0.5 }} />
                                </>
                            ) : (
                                <>
                                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                                        <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
                                        <Chip
                                            size="small"
                                            label={user?.role?.name?.replace(/_/g, " ")}
                                            sx={{ textTransform: "capitalize", fontSize: 11, bgcolor: "transparent", color: theme.palette.primary.main }}
                                        />
                                        <Chip
                                            size="small"
                                            label={isSuspended ? "Suspended" : "Active"}
                                            sx={{
                                                fontWeight: 400,
                                                fontSize: 11,
                                                bgcolor: isSuspended ? theme.palette.error.light : theme.palette.success.light,
                                                color: isSuspended ? theme.palette.error.main : theme.palette.success.main,
                                                border: `1px solid ${isSuspended ? theme.palette.error.main : theme.palette.success.main}`,
                                            }}
                                        />
                                    </Stack>

                                    <Stack direction="row" flexWrap="wrap" gap={{ xs: 1, md: 2 }} alignItems="center" mb={streakAchievement ? 1 : 0}>
                                        {user?.email && (
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "primary.main" }}>
                                                <Sms variant="Bold" size={12} />
                                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                            </Stack>
                                        )}
                                        {user?.phone && (
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "primary.main" }}>
                                                <Call variant="Bold" size={12} />
                                                <Typography variant="caption" color="text.secondary">{user.phone}</Typography>
                                            </Stack>
                                        )}
                                        {user?.address && (
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "primary.main" }}>
                                                <Location variant="Bold" size={12} />
                                                <Typography variant="caption" color="text.secondary">{user.address}</Typography>
                                            </Stack>
                                        )}
                                        {ai?.user_id && (
                                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "primary.main" }}>
                                                <UserTag variant="Bold" size={12} />
                                                <Typography variant="caption" color="text.secondary">{ai.user_id}</Typography>
                                            </Stack>
                                        )}
                                        {ai?.joined_at && (
                                            <Typography variant="caption" color="text.secondary">
                                                Joined: {new Date(ai.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                                            </Typography>
                                        )}
                                    </Stack>

                                    {streakAchievement && (
                                        <Chip
                                            size="small"
                                            label={<div className="flex items-center gap-1">
                                                <img src="/fire.png" alt="" className="w-4 h-4" />
                                                {` ${streakAchievement.title} ${streakAchievement.description}`}
                                            </div>}
                                            sx={{ fontSize: 11, bgcolor: theme.palette.warning.light, color: theme.palette.warning.main, borderRadius: 2 }}
                                        />
                                    )}
                                </>
                            )}
                        </Box>
                    </Stack>

                    {!isLoading && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setConfirmOpen(true)}
                            sx={{
                                bgcolor: isSuspended ? "success.main" : "error.main",
                                "&:hover": { bgcolor: isSuspended ? "success.dark" : "error.dark" },
                                flexShrink: 0,
                                alignSelf: { xs: "flex-start", sm: "flex-start" },
                            }}
                        >
                            {isSuspended ? "Activate" : "Suspend"}
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Tab Navigation */}
            <TabController<TabValue>
                options={TABS.map((t) => ({
                    ...t,
                    redirect_url: `${PATH.USER_MANAGEMENT.VIEW_USER.ROOT(id)}/${t.value}`,
                }))}
                currentActive={activeTab}
                setActiveTab={() => { }}
            />

            <Box flex={1} sx={{ overflowY: "auto", minHeight: 0 }}>
                <Outlet />
            </Box>

            <ConfirmationDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                title={isSuspended ? "Activate User" : "Suspend User"}
                description={
                    isSuspended
                        ? "Are you sure you want to activate this user?"
                        : "Are you sure you want to suspend this user? They will lose access immediately."
                }
                onSave={handleSuspendToggle}
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 2C6.38 2 4.25 4.13 4.25 6.75C4.25 9.32 6.26 11.4 8.88 11.49C8.96 11.48 9.04 11.48 9.1 11.49C9.12 11.49 9.13 11.49 9.15 11.49C9.16 11.49 9.16 11.49 9.17 11.49C11.73 11.4 13.74 9.32 13.75 6.75C13.75 4.13 11.62 2 9 2Z" fill="#1D82F5" />
                        <path d="M14.08 14.1499C11.29 12.2899 6.73999 12.2899 3.92999 14.1499C2.65999 14.9999 1.95999 16.1499 1.95999 17.3799C1.95999 18.6099 2.65999 19.7499 3.91999 20.5899C5.31999 21.5299 7.15999 21.9999 8.99999 21.9999C10.84 21.9999 12.68 21.5299 14.08 20.5899C15.34 19.7399 16.04 18.5999 16.04 17.3599C16.03 16.1299 15.34 14.9899 14.08 14.1499Z" fill="#1D82F5" />
                    </svg>
                }
            />
        </Box>
    );
}
