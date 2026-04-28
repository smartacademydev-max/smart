import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
    Box, Checkbox, Chip, Stack, Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Add, Ticket } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import {
    useDeleteCouponCodesMutation,
    useGetAllCouponCodesQuery,
    useGetCouponCodesAnalyticsQuery,
} from "../../../services/referralApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { COUPON_DISCOUNT_TYPE_LABELS, type CouponCodeProps, type CouponDiscountType } from "../../../types/referral";
import Actions from "../../molecules/Action";
import TabController from "../../molecules/TabController";
import CustomTable from "../../molecules/Table";
import TablePagination from "../../molecules/Table/Pagination";
import DashboardAnalyticsCard from "../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../organism/Cards/DashboardAnalyticsCard/Loading";
import ConfirmationDialog from "../../organism/ConfirmationDialog";
import EmptyRoute from "../../organism/EmptyRoute";
import PageHeader from "../../organism/PageHeader";
import TableFilter from "../../organism/TableFilter";
import CouponCodeFormModal from "./CouponCodeFormModal";

const TYPE_TABS: { label: string; value: CouponDiscountType | "" }[] = [
    { label: "All", value: "" },
    { label: "Percentage", value: "percentage" },
    { label: "Fixed Amount", value: "fixed" },
];

export default function CouponCodesPage() {
    const dispatch = useAppDispatch();

    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [discountType, setDiscountType] = useState<CouponDiscountType | "">("");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [openConfirm, setOpenConfirm] = useState(false);
    const [toDelete, setToDelete] = useState<number[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [editCoupon, setEditCoupon] = useState<CouponCodeProps | null>(null);

    const { data, isLoading } = useGetAllCouponCodesQuery({ ...qp, search, discount_type: discountType });
    const [deleteCoupons, { isLoading: deleting }] = useDeleteCouponCodesMutation();
    const { data: analyticsData, isLoading: analyticsLoading } = useGetCouponCodesAnalyticsQuery();

    const coupons = data?.data?.data || [];
    const isAllSelected = coupons.length > 0 && selectedRows.size === coupons.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < coupons.length;

    const handleSelectAll = (checked: boolean) =>
        setSelectedRows(checked ? new Set(coupons.map((c) => c.id)) : new Set());

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        if (checked) next.add(id);
        else next.delete(id);
        setSelectedRows(next);
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        dispatch(showToast({ message: "Coupon code copied!", severity: "success" }));
    };

    const openDeleteConfirm = (ids: number[]) => { setToDelete(ids); setOpenConfirm(true); };

    const handleDelete = async () => {
        try {
            const res = await deleteCoupons({ ids: toDelete }).unwrap();
            dispatch(showToast({ message: res.message || "Deleted.", severity: "success" }));
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setToDelete([]);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to delete.", severity: "error" }));
            setOpenConfirm(false);
        }
    };

    const columns = useMemo<ColumnDef<CouponCodeProps>[]>(() => [
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
            header: "Code",
            accessorKey: "code",
            cell: ({ row }) => (
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={700} sx={{
                        bgcolor: "action.hover", px: 1, py: 0.25, borderRadius: 1,
                    }}>
                        {row.original.code}
                    </Typography>
                    <ContentCopyIcon
                        sx={{ fontSize: 14, cursor: "pointer", color: "text.secondary", "&:hover": { color: "primary.main" } }}
                        onClick={() => handleCopyCode(row.original.code)}
                    />
                </Stack>
            ),
        },
        {
            header: "Type",
            accessorKey: "discount_type",
            cell: ({ row }) => (
                <Chip
                    label={COUPON_DISCOUNT_TYPE_LABELS[row.original.discount_type]}
                    size="small"
                    variant="outlined"
                    color={row.original.discount_type === "percentage" ? "info" : "warning"}
                />
            ),
        },
        {
            header: "Discount",
            accessorKey: "discount_value",
            cell: ({ row }) => (
                <Typography variant="body2" fontWeight={600}>
                    {row.original.discount_type === "percentage"
                        ? `${row.original.discount_value}%`
                        : `Rs. ${row.original.discount_value}`}
                </Typography>
            ),
        },
        {
            header: "Usage",
            accessorKey: "used_count",
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.used_count}
                    {row.original.usage_limit ? ` / ${row.original.usage_limit}` : ""}
                </Typography>
            ),
        },
        {
            header: "Expiry",
            accessorKey: "expiry_date",
            cell: ({ row }) => (
                <Typography variant="body2" color={
                    row.original.expiry_date && dayjs(row.original.expiry_date).isBefore(dayjs())
                        ? "error.main"
                        : "text.secondary"
                }>
                    {row.original.expiry_date ? dayjs(row.original.expiry_date).format("MMM D, YYYY") : "—"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: ({ row }) => (
                <Chip
                    label={row.original.is_active ? "Active" : "Inactive"}
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
                    onEdit={() => { setEditCoupon(row.original); setOpenForm(true); }}
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
                        title: "Coupon Codes",
                        icon: <Ticket color="#1D82F5" />,
                    }]}
                    cta={{ icon: <Add />, url: "", label: "Create Coupon" }}
                    handleOpenPopup={() => { setEditCoupon(null); setOpenForm(true); }}
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

                <TabController
                    size="sm"
                    currentActive={discountType}
                    setActiveTab={(val) => { setDiscountType(val as CouponDiscountType | ""); setQp((p) => ({ ...p, pageIndex: 1 })); }}
                    options={TYPE_TABS}
                />

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={(ids) => openDeleteConfirm(ids.map(Number))}
                    handleResetFilter={() => { setSearch(""); setDiscountType(""); setQp({ pageIndex: 1, pageSize: 8 }); }}
                />
            </div>

            {!isLoading && !coupons.length ? (
                <EmptyRoute
                    title="No Coupon Codes"
                    message="Create a coupon code to offer discounts to your users."
                    icon={<Ticket color="#1D82F5" size={24} />}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        <CustomTable data={coupons} columns={columns} loading={isLoading} />
                    </Box>
                    <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
                </>
            )}

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete Coupon Code"
                description="Are you sure you want to delete the selected coupon(s)? This action cannot be undone."
                onSave={handleDelete}
                icon={<Ticket color="#1D82F5" size={24} />}
            />

            <CouponCodeFormModal open={openForm} setOpen={setOpenForm} editData={editCoupon} />
        </div>
    );
}
