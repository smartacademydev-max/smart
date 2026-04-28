import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
    Box, Checkbox, Chip, CircularProgress, IconButton,
    MenuItem, OutlinedInput, Paper, Select, Stack,
    Tooltip, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Link1 } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useGetMarketingLinkByIdQuery,
    useGetMarketingLinkActivityQuery,
} from "../../../../services/referralApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { MARKETING_LINK_SOURCE_LABELS, type MarketingLinkActivityProps, type MarketingLinkActivityAction } from "../../../../types/referral";
import { PATH } from "../../../../routes/PATH";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

const ACTION_OPTIONS: { label: string; value: MarketingLinkActivityAction | "" }[] = [
    { label: "All Activity", value: "" },
    { label: "Clicks", value: "click" },
    { label: "Registrations", value: "registration" },
    { label: "Purchases", value: "purchase" },
];

const actionColor: Record<MarketingLinkActivityAction, "default" | "info" | "success" | "primary"> = {
    click: "default",
    registration: "info",
    purchase: "success",
};

interface StatCardProps { label: string; value: string | number; highlight?: boolean }

function StatCard({ label, value, highlight }: StatCardProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}
                color={highlight ? "success.main" : "text.primary"}>
                {value}
            </Typography>
        </Paper>
    );
}

export default function MarketingLinkDetailPage() {
    const { id } = useParams<{ id: string }>();
    const linkId = Number(id);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 10 });
    const [action, setAction] = useState<MarketingLinkActivityAction | "">("");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    const { data: linkData, isLoading: linkLoading } = useGetMarketingLinkByIdQuery({ id: linkId });
    const { data: activityData, isLoading: activityLoading } = useGetMarketingLinkActivityQuery({
        id: linkId, ...qp, search, action,
    });

    const link = linkData?.data;
    const activities = activityData?.data?.data || [];
    const isAllSelected = activities.length > 0 && selectedRows.size === activities.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < activities.length;

    const handleSelectAll = (checked: boolean) =>
        setSelectedRows(checked ? new Set(activities.map((a) => a.id)) : new Set());
    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        checked ? next.add(id) : next.delete(id);
        setSelectedRows(next);
    };

    const handleCopyUrl = () => {
        if (link?.tracking_url) {
            navigator.clipboard.writeText(link.tracking_url);
            dispatch(showToast({ message: "Tracking URL copied!", severity: "success" }));
        }
    };

    const columns = useMemo<ColumnDef<MarketingLinkActivityProps>[]>(() => [
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
            cell: ({ row }) => row.original.user_id ? (
                <Stack gap={0.25}>
                    <Typography
                        variant="body2" fontWeight={500}
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(PATH.USER_MANAGEMENT.VIEW_USER.ROOT(String(row.original.user_id)))}
                    >
                        {row.original.user_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{row.original.user_email}</Typography>
                </Stack>
            ) : (
                <Typography variant="body2" color="text.disabled">Anonymous</Typography>
            ),
        },
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
                <Chip
                    label={row.original.action.charAt(0).toUpperCase() + row.original.action.slice(1)}
                    size="small"
                    color={actionColor[row.original.action]}
                    variant="outlined"
                />
            ),
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: ({ row }) => row.original.amount ? (
                <Typography variant="body2" fontWeight={500} color="success.main">
                    Rs. {row.original.amount.toLocaleString()}
                </Typography>
            ) : (
                <Typography variant="body2" color="text.disabled">—</Typography>
            ),
        },
        {
            header: "Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {dayjs(row.original.created_at).format("MMM D, YYYY · h:mm A")}
                </Typography>
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, qp]);

    if (linkLoading) {
        return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
    }

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        { title: "Marketing Links", url: PATH.MARKETING_LINKS.ROOT, icon: <Link1 color="#1D82F5" /> },
                        { title: link?.name ?? "Detail" },
                    ]}
                />

                {/* Link header card */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
                        <Stack gap={1}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Typography variant="h6" fontWeight={700}>{link?.name}</Typography>
                                <Chip
                                    label={link?.source ? MARKETING_LINK_SOURCE_LABELS[link.source] : ""}
                                    size="small" variant="outlined"
                                />
                                <Chip
                                    label={link?.is_active ? "Active" : "Paused"}
                                    size="small"
                                    color={link?.is_active ? "success" : "default"}
                                    variant="outlined"
                                />
                            </Stack>
                            {link?.description && (
                                <Typography variant="body2" color="text.secondary">{link.description}</Typography>
                            )}
                            <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                                <Typography variant="caption" fontFamily="monospace" color="primary.main"
                                    sx={{ wordBreak: "break-all" }}>
                                    {link?.tracking_url}
                                </Typography>
                                <Tooltip title="Copy URL">
                                    <IconButton size="small" onClick={handleCopyUrl}>
                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
                            Created {dayjs(link?.created_at).format("MMM D, YYYY")}
                        </Typography>
                    </Stack>
                </Paper>

                {/* Stats */}
                <Stack direction="row" flexWrap="wrap" gap={2} mb={3}>
                    <StatCard label="Total Clicks" value={link?.clicks ?? 0} />
                    <StatCard label="Registrations" value={link?.registrations ?? 0} />
                    <StatCard label="Purchases" value={link?.purchases ?? 0} />
                    <StatCard label="Conversion Rate" value={`${(link?.conversion_rate ?? 0).toFixed(1)}%`} highlight={(link?.conversion_rate ?? 0) >= 5} />
                    <StatCard label="Revenue Generated" value={`Rs. ${(link?.revenue_generated ?? 0).toLocaleString()}`} highlight />
                </Stack>

                {/* Activity filters */}
                <Stack direction="row" gap={2} mb={2} alignItems="center" flexWrap="wrap">
                    <Select
                        size="small"
                        value={action}
                        onChange={(e) => { setAction(e.target.value as MarketingLinkActivityAction | ""); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                        displayEmpty
                        sx={{ minWidth: 170 }}
                        input={<OutlinedInput />}
                    >
                        {ACTION_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </Stack>

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={() => {}}
                    handleResetFilter={() => { setSearch(""); setAction(""); setQp({ pageIndex: 1, pageSize: 10 }); }}
                />
            </div>

            <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                <CustomTable data={activities} columns={columns} loading={activityLoading} />
            </Box>
            <TablePagination qp={qp} setQp={setQp} totalPages={activityData?.data?.pagination?.total_pages || 0} />
        </div>
    );
}
