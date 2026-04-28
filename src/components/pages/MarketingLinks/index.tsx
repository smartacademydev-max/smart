import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
    Box, Checkbox, Chip, IconButton,
    Stack, Tooltip, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Add, Link1 } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useDeleteMarketingLinksMutation,
    useGetAllMarketingLinksQuery,
    useGetMarketingLinksAnalyticsQuery,
} from "../../../services/referralApi";
import DashboardAnalyticsCard from "../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../organism/Cards/DashboardAnalyticsCard/Loading";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { MARKETING_LINK_SOURCE_LABELS, type MarketingLinkProps } from "../../../types/referral";
import { PATH } from "../../../routes/PATH";
import Actions from "../../molecules/Action";
import CustomTable from "../../molecules/Table";
import TablePagination from "../../molecules/Table/Pagination";
import ConfirmationDialog from "../../organism/ConfirmationDialog";
import EmptyRoute from "../../organism/EmptyRoute";
import PageHeader from "../../organism/PageHeader";
import TableFilter from "../../organism/TableFilter";
import MarketingLinkFormModal from "./MarketingLinkFormModal";

export default function AllMarketingLinksPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [openConfirm, setOpenConfirm] = useState(false);
    const [toDelete, setToDelete] = useState<number[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [editLink, setEditLink] = useState<MarketingLinkProps | null>(null);

    const { data, isLoading } = useGetAllMarketingLinksQuery({ ...qp, search });
    const [deleteLinks, { isLoading: deleting }] = useDeleteMarketingLinksMutation();
    const { data: analyticsData, isLoading: analyticsLoading } = useGetMarketingLinksAnalyticsQuery();

    const links = data?.data?.data || [];
    const isAllSelected = links.length > 0 && selectedRows.size === links.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < links.length;

    const handleSelectAll = (checked: boolean) =>
        setSelectedRows(checked ? new Set(links.map((l) => l.id)) : new Set());

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        checked ? next.add(id) : next.delete(id);
        setSelectedRows(next);
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        dispatch(showToast({ message: "Tracking URL copied!", severity: "success" }));
    };

    const openDeleteConfirm = (ids: number[]) => { setToDelete(ids); setOpenConfirm(true); };

    const handleDelete = async () => {
        try {
            const res = await deleteLinks({ ids: toDelete }).unwrap();
            dispatch(showToast({ message: res.message || "Deleted.", severity: "success" }));
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setToDelete([]);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to delete.", severity: "error" }));
            setOpenConfirm(false);
        }
    };

    const columns = useMemo<ColumnDef<MarketingLinkProps>[]>(() => [
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
            header: "Campaign",
            accessorKey: "name",
            cell: ({ row }) => (
                <Stack gap={0.5}>
                    <Typography
                        variant="body2" fontWeight={600}
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(PATH.MARKETING_LINKS.DETAIL.ROOT(row.original.id))}
                    >
                        {row.original.name}
                    </Typography>
                    {row.original.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260 }}>
                            {row.original.description}
                        </Typography>
                    )}
                </Stack>
            ),
        },
        {
            header: "Source",
            accessorKey: "source",
            cell: ({ row }) => (
                <Chip
                    label={MARKETING_LINK_SOURCE_LABELS[row.original.source]}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            header: "Tracking URL",
            accessorKey: "tracking_url",
            cell: ({ row }) => (
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="caption" fontFamily="monospace" color="text.secondary"
                        noWrap sx={{ maxWidth: 180 }}>
                        {row.original.tracking_url}
                    </Typography>
                    <Tooltip title="Copy URL">
                        <IconButton size="small" onClick={() => handleCopyUrl(row.original.tracking_url)}>
                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
        {
            header: "Clicks",
            accessorKey: "clicks",
            cell: ({ row }) => <Typography variant="body2">{row.original.clicks}</Typography>,
        },
        {
            header: "Registrations",
            accessorKey: "registrations",
            cell: ({ row }) => <Typography variant="body2">{row.original.registrations}</Typography>,
        },
        {
            header: "Purchases",
            accessorKey: "purchases",
            cell: ({ row }) => <Typography variant="body2">{row.original.purchases}</Typography>,
        },
        {
            header: "Conv. Rate",
            accessorKey: "conversion_rate",
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={500}
                    color={row.original.conversion_rate >= 5 ? "success.main" : "text.secondary"}>
                    {row.original.conversion_rate.toFixed(1)}%
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: ({ row }) => (
                <Chip
                    label={row.original.is_active ? "Active" : "Paused"}
                    size="small"
                    color={row.original.is_active ? "success" : "default"}
                    variant="outlined"
                />
            ),
        },
        {
            header: "Created",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="body2" color="text.secondary">
                    {dayjs(row.original.created_at).format("MMM D, YYYY")}
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    onView={() => navigate(PATH.MARKETING_LINKS.DETAIL.ROOT(row.original.id))}
                    onEdit={() => { setEditLink(row.original); setOpenForm(true); }}
                    onDelete={() => openDeleteConfirm([row.original.id])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, qp, deleting]);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[{
                        title: "Marketing Links",
                        icon: <Link1 color="#1D82F5" />,
                    }]}
                    cta={{ icon: <Add />, url: "", label: "Create Link" }}
                    handleOpenPopup={() => { setEditLink(null); setOpenForm(true); }}
                />

                <div className="gap-4 grid grid-cols-2 2xl:grid-cols-4 2xl:gap-8 mb-8 px-2 pt-2">
                    {analyticsLoading
                        ? Array.from({ length: 4 }).map((_, i) => <DashboardAnalyticsLoading key={i} />)
                        : analyticsData?.data?.map((item) => (
                            <DashboardAnalyticsCard
                                key={item.title}
                                data={{
                                    title: item.title,
                                    value: item.value.toLocaleString(),
                                    description: item.description ?? "",
                                    type: item.type,
                                }}
                            />
                        ))}
                </div>

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={(ids) => openDeleteConfirm(ids.map(Number))}
                    handleResetFilter={() => { setSearch(""); setQp({ pageIndex: 1, pageSize: 8 }); }}
                />
            </div>

            {!isLoading && !links.length ? (
                <EmptyRoute
                    title="No Marketing Links"
                    message="Create a tracking link to start measuring your ad campaigns."
                    icon={<Link1 color="#1D82F5" size={24} />}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        <CustomTable data={links} columns={columns} loading={isLoading} />
                    </Box>
                    <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
                </>
            )}

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete Marketing Link"
                description="Are you sure you want to delete the selected link(s)? All tracking data will be lost."
                onSave={handleDelete}
                icon={<Link1 color="#1D82F5" size={24} />}
            />

            <MarketingLinkFormModal open={openForm} setOpen={setOpenForm} editData={editLink} />
        </div>
    );
}
