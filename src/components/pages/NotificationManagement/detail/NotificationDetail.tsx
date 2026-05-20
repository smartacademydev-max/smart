import {
    Box,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Messages2,
    Mobile,
    Notification as NotificationIcon,
    Send2,
    Sms,
} from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useNotificationStatsSocket } from "../../../../hooks/useNotificationStatsSocket";
import { PATH } from "../../../../routes/PATH";
import {
    useGetNotificationByIdQuery,
    useGetNotificationEventsQuery,
    useGetNotificationStatsQuery,
    useResendNotificationFailedMutation,
} from "../../../../services/notificationApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { Analytics } from "../../../../types/dashboard";
import type {
    NotificationChannel,
    NotificationEvent,
    NotificationEventAction,
    NotificationStats,
} from "../../../../types/notification";
import { renderHtml } from "../../../../utils/renderHtml";
import FilterDropdown from "../../../molecules/FilterDropdown";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import EmptyRoute from "../../../organism/EmptyRoute";
import DashboardAnalyticsCard from "../../../organism/Cards/DashboardAnalyticsCard";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

const EMPTY_STATS: NotificationStats = {
    id: 0,
    status: "draft",
    target_count: 0,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    clicked_count: 0,
    failed_count: 0,
    per_channel: {},
};

const STATUS_COLOR: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
    draft: "default",
    scheduled: "info",
    sending: "warning",
    sent: "success",
    partial: "warning",
    failed: "error",
};

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
    push_notification: "Push",
    email_notification: "Email",
    sms_notification: "SMS",
    notice_board: "Notice Board",
};

const CHANNEL_ICON: Record<NotificationChannel, React.ReactNode> = {
    push_notification: <Mobile size={16} />,
    email_notification: <Messages2 size={16} />,
    sms_notification: <Sms size={16} />,
    notice_board: <NotificationIcon size={16} />,
};

const ACTION_COLOR: Record<NotificationEventAction, "default" | "info" | "success" | "primary" | "error"> = {
    sent: "success",
    delivered: "success",
    read: "primary",
    clicked: "primary",
    failed: "error",
};

function formatDateTime(date: string | null | undefined) {
    if (!date) return "—";
    try {
        return new Date(date).toLocaleString([], {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
    } catch { return "—"; }
}

function formatTime(date: string | null | undefined) {
    if (!date) return "";
    try {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
}

function ChannelRow({ channel, stats }: { channel: NotificationChannel; stats: NotificationStats["per_channel"][NotificationChannel] }) {
    const s = stats ?? { sent: 0, delivered: 0, read: 0, clicked: 0, failed: 0 };
    const deliveryRate = s.sent > 0 ? Math.round((s.delivered / s.sent) * 100) : 0;
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 36, height: 36, borderRadius: 1.5,
                            bgcolor: "primary.light", color: "primary.main",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        {CHANNEL_ICON[channel]}
                    </Box>
                    <Box>
                        <Typography fontWeight={600}>{CHANNEL_LABEL[channel]}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {deliveryRate}% delivery
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" gap={3} flexWrap="wrap">
                    <Metric label="Sent" value={s.sent} />
                    <Metric label="Delivered" value={s.delivered} tone="success" />
                    <Metric label="Read" value={s.read} />
                    <Metric label="Clicked" value={s.clicked} />
                    <Metric label="Failed" value={s.failed} tone="error" />
                </Stack>
            </Stack>
        </Paper>
    );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "success" | "error" }) {
    const color = tone === "success" ? "success.main" : tone === "error" ? "error.main" : "text.primary";
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography fontWeight={600} color={color}>{value.toLocaleString()}</Typography>
        </Box>
    );
}

function TimelineStrip({ timeline }: { timeline: NotificationStats["timeline"] }) {
    if (!timeline || timeline.length === 0) {
        return (
            <Typography variant="caption" color="text.secondary">
                Timeline not available yet.
            </Typography>
        );
    }
    const max = Math.max(...timeline.map(t => t.sent + t.delivered + t.failed), 1);
    return (
        <Stack direction="row" alignItems="flex-end" gap={0.5} sx={{ height: 64 }}>
            {timeline.map((t, i) => {
                const total = t.sent + t.delivered + t.failed;
                const h = Math.round((total / max) * 100);
                return (
                    <Tooltip
                        key={i}
                        title={`${new Date(t.bucket).toLocaleTimeString()} — sent ${t.sent}, delivered ${t.delivered}, failed ${t.failed}`}
                        arrow
                    >
                        <Box
                            sx={{
                                flex: 1,
                                height: `${h}%`,
                                minHeight: 2,
                                bgcolor: "primary.main",
                                opacity: 0.7,
                                borderRadius: "2px 2px 0 0",
                            }}
                        />
                    </Tooltip>
                );
            })}
        </Stack>
    );
}

export default function NotificationDetail() {
    const { id: rawId } = useParams<{ id: string }>();
    const id = Number(rawId);
    const dispatch = useAppDispatch();

    const [search, setSearch] = useState("");
    const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
    const [, setDays] = useState<number | null>(null);
    const [actionFilter, setActionFilter] = useState<NotificationEventAction | "">("");
    const [channelFilter, setChannelFilter] = useState<NotificationChannel | "">("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 10 });

    const { data: notif, isLoading: loadingNotif } = useGetNotificationByIdQuery({ id }, { skip: !id });
    const { data: statsRes } = useGetNotificationStatsQuery({ id }, { skip: !id });
    const { data: eventsRes, isLoading: loadingEvents } = useGetNotificationEventsQuery(
        {
            id,
            pageIndex: qp.pageIndex,
            pageSize: qp.pageSize,
            search,
            startDate: customRange.startDate,
            endDate: customRange.endDate,
            action: actionFilter,
            channel: channelFilter,
        },
        { skip: !id }
    );

    const [resend, { isLoading: resending }] = useResendNotificationFailedMutation();

    useNotificationStatsSocket(id);

    const stats = useMemo<NotificationStats>(
        () => statsRes?.data ?? { ...EMPTY_STATS, id },
        [statsRes, id]
    );

    const kpis = useMemo<Analytics[]>(() => [
        { title: "Targeted", description: "Total audience", value: stats.target_count.toLocaleString(), type: "info" },
        { title: "Sent", description: "Queued at provider", value: stats.sent_count.toLocaleString(), type: "info" },
        { title: "Delivered", description: "Confirmed by channel", value: stats.delivered_count.toLocaleString(), type: "success" },
        { title: "Read", description: "Opened by user", value: stats.read_count.toLocaleString(), type: "warning" },
        { title: "Clicked", description: "Tapped link/card", value: stats.clicked_count.toLocaleString(), type: "warning" },
        { title: "Failed", description: "Provider error", value: stats.failed_count.toLocaleString(), type: "error" },
    ], [stats]);

    const events = useMemo<NotificationEvent[]>(
        () => eventsRes?.data?.data ?? [],
        [eventsRes]
    );

    const pagination = eventsRes?.data?.pagination;
    const totalPages = pagination?.total_pages ?? pagination?.total_pages ?? 0;
    const notification = notif?.data;
    const status = stats.status;
    const statusColor = STATUS_COLOR[status] ?? "default";
    const usedChannels: NotificationChannel[] =
        (notification?.delivery_methods as NotificationChannel[] | undefined) ??
        (Object.keys(stats.per_channel) as NotificationChannel[]);

    const handleResend = async () => {
        try {
            const res = await resend({ id }).unwrap();
            dispatch(showToast({ message: res?.message || "Resend queued", severity: "success" }));
        } catch (e: any) {
            const message = e?.data?.message ?? "Resend failed";
            const severity = e?.status === 422 ? "warning" : "error";
            dispatch(showToast({ message, severity }));
        }
    };

    const handleResetFilter = () => {
        setSearch("");
        setCustomRange({ startDate: "", endDate: "" });
        setDays(null);
        setActionFilter("");
        setChannelFilter("");
        setQp({ pageIndex: 1, pageSize: qp.pageSize });
    };

    const columns: ColumnDef<NotificationEvent>[] = useMemo(() => [
        {
            header: "User",
            accessorKey: "user_name",
            cell: ({ row }) => (
                <>
                    <Typography variant="body2" fontWeight={500}>{row.original.user_name || "—"}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.original.user_email || ""}</Typography>
                </>
            ),
        },
        {
            header: "Channel",
            accessorKey: "channel",
            cell: ({ row }) => (
                <Chip
                    label={CHANNEL_LABEL[row.original.channel]}
                    size="small"
                    variant="outlined"
                    icon={<Box component="span" sx={{ display: "inline-flex" }}>{CHANNEL_ICON[row.original.channel]}</Box>}
                />
            ),
        },
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
                <Chip
                    label={row.original.action}
                    size="small"
                    color={ACTION_COLOR[row.original.action]}
                    sx={{ textTransform: "capitalize" }}
                />
            ),
        },
        {
            header: "Reason",
            accessorKey: "reason",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {row.original.reason || (row.original.via ? `via ${row.original.via}` : "—")}
                </Typography>
            ),
        },
        {
            header: "Time",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDateTime(row.original.created_at)}
                </Typography>
            ),
        },
    ], []);

    if (loadingNotif) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress size={28} />
            </Box>
        );
    }

    return (
        <div className="notification__detail h-full flex flex-col overflow-auto px-1">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: "Notifications",
                            url: PATH.NOTIFICATION_MANAGEMENT.ROOT,
                        },
                        { title: notification?.name ?? "Detail" },
                    ]}
                    cta={
                        stats.failed_count > 0
                            ? {
                                label: resending
                                    ? "Resending..."
                                    : `Resend failed (${stats.failed_count})`,
                                icon: <Send2 size={16} />,
                            }
                            : undefined
                    }
                    handleOpenPopup={stats.failed_count > 0 ? handleResend : undefined}
                />
            </div>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Stack direction="row" gap={2} alignItems="flex-start" flexWrap="wrap">
                    {notification?.image_url && (
                        <Box
                            component="img"
                            src={notification.image_url}
                            alt=""
                            sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }}
                        />
                    )}
                    <Box flex={1} minWidth={0}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                            <Typography variant="h6" fontWeight={700}>
                                {notification?.name ?? "Notification"}
                            </Typography>
                            <Chip
                                label={status}
                                color={statusColor}
                                size="small"
                                sx={{ textTransform: "capitalize" }}
                            />
                        </Stack>
                        {notification?.description && (
                            <Box sx={{ color: "text.secondary", fontSize: 13, mb: 1 }}>
                                {renderHtml(notification.description)}
                            </Box>
                        )}
                        <Stack direction="row" gap={2} flexWrap="wrap">
                            {stats.sent_at && (
                                <Typography variant="caption" color="text.secondary">
                                    Sent: {formatDateTime(stats.sent_at)}
                                </Typography>
                            )}
                            {notification?.scheduled_date && (
                                <Typography variant="caption" color="text.secondary">
                                    Scheduled: {notification.scheduled_date} {notification.scheduled_time}
                                </Typography>
                            )}
                            {usedChannels.length > 0 && (
                                <Stack direction="row" gap={0.5} flexWrap="wrap">
                                    {usedChannels.map((c) => (
                                        <Chip
                                            key={c}
                                            label={CHANNEL_LABEL[c]}
                                            size="small"
                                            variant="outlined"
                                            icon={<Box component="span" sx={{ display: "inline-flex" }}>{CHANNEL_ICON[c]}</Box>}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            <Box
                className="dashboard__analytics rounded-lg mb-4"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                    {kpis.map((k) => (
                        <DashboardAnalyticsCard key={k.title} data={k} />
                    ))}
                </div>
            </Box>

            <Typography variant="h4" fontWeight={600} className="mb-1!">Send rate</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    {stats.send_started_at && stats.send_finished_at && (
                        <Typography variant="caption" color="text.secondary">
                            {formatTime(stats.send_started_at)} → {formatTime(stats.send_finished_at)}
                        </Typography>
                    )}
                </Stack>
                <TimelineStrip timeline={stats.timeline} />
            </Paper>

            {Object.keys(stats.per_channel).length > 0 && (
                <Box mb={2}>
                    <Typography fontWeight={600} mb={1} variant="h4">Per-channel breakdown</Typography>
                    <Stack gap={1.5}>
                        {(Object.keys(stats.per_channel) as NotificationChannel[]).map((c) => (
                            <ChannelRow key={c} channel={c} stats={stats.per_channel[c]} />
                        ))}
                    </Stack>
                </Box>
            )}

            <Typography fontWeight={600} mb={1} variant="h4">
                Events
            </Typography>
            <TableFilter
                search={search}
                setSearch={setSearch}
                customRange={customRange}
                setCustomRange={setCustomRange}
                setDays={setDays}
                handleResetFilter={handleResetFilter}
            />
            <Stack direction="row" gap={1} mb={1.5} flexWrap="wrap">
                <FilterDropdown<NotificationEventAction>
                    label="All actions"
                    value={actionFilter}
                    onChange={(v) => { setActionFilter(v); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                    options={[
                        { label: "Sent", value: "sent" },
                        { label: "Delivered", value: "delivered" },
                        { label: "Read", value: "read" },
                        { label: "Clicked", value: "clicked" },
                        { label: "Failed", value: "failed" },
                    ]}
                />
                <FilterDropdown<NotificationChannel>
                    label="All channels"
                    value={channelFilter}
                    onChange={(v) => { setChannelFilter(v); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                    options={[
                        { label: "Push", value: "push_notification" },
                        { label: "Email", value: "email_notification" },
                        { label: "SMS", value: "sms_notification" },
                        { label: "Notice Board", value: "notice_board" },
                    ]}
                />
            </Stack>

            {!loadingEvents && events.length === 0 ? (
                <Box className="table__wrapper flex-1 min-h-[260px]">
                    <EmptyRoute
                        title="No events yet"
                        message="Delivery, read, and click events will appear here once recipients start interacting with this notification."
                        icon={<NotificationIcon size={28} variant="Bold" color="#1D82F5" />}
                    />
                </Box>
            ) : (
                <>
                    <Box className="table__wrapper flex-1">
                        <CustomTable
                            data={events}
                            columns={columns}
                            loading={loadingEvents}
                        />
                    </Box>
                    <TablePagination
                        qp={qp}
                        setQp={setQp}
                        totalPages={totalPages}
                        totalRecords={pagination?.total}
                    />
                </>
            )}
        </div>
    );
}
