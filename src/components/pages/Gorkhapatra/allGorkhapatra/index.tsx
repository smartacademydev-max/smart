import { Box, Button, Checkbox, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useChangeGorkhapatraStautsMutation, useDeleteGorkhapatraMutation, useGetAllGorkhapatraQuery } from "../../../../services/gorkhapatraApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { GorkhapatraProps } from "../../../../types/gorkhapatra";
import { formatDate } from "../../../../utils/dateFormat";
import { renderHtml } from "../../../../utils/renderHtml";
import { getPublishedStatus, type PublishedStatus } from "../../../../utils/statusMap";
import StatusPill from "../../../atoms/StatusPill";
import Actions from "../../../molecules/Action";
import TabController from "../../../molecules/TabController";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import GorkhapatraCard from "../../../organism/Cards/GorkhapatraCard";
import ConfirmationDialog from "../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import type { LayoutProps } from "../../../organism/TableFilter";
import TableFilter from "../../../organism/TableFilter";


export default function AllGorkhapatraRoot() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [openConfirm, setOpenConfirm] = useState(false);
    const [gorkhapatraToDelete, setGorkhapatraToDelete] = useState<string[]>([]);
    const [layout, setLayout] = useState<LayoutProps>("table");
    const [customRange, setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [days, setDays] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"" | "published" | "draft">("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetAllGorkhapatraQuery({
        ...qp,
        search: debouncedSearch,
        status: activeTab,
        days,
        ...customRange
    });

    const [deleteGorkhapatra, { isLoading: deleting }] = useDeleteGorkhapatraMutation();
    const [changeStatus] = useChangeGorkhapatraStautsMutation();

    const gorkhapatras = data?.data?.data || []
    const pagination = data?.data?.pagination;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(
                gorkhapatras
                    .filter((item) => item.id != null)
                    .map((item) => Number(item.id))
            );
            setSelectedRows(allIds);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: number | null, checked: boolean) => {
        // Guard against null ids
        if (id == null) return;

        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(Number(id));
        } else {
            newSelected.delete(Number(id));
        }
        setSelectedRows(newSelected);
    };

    const isAllSelected = gorkhapatras.length > 0 && selectedRows.size === gorkhapatras.filter(item => item.id != null).length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < gorkhapatras.filter(item => item.id != null).length;

    const openDeleteConfirmation = (selectedGorkhaptra: string[]) => {
        setGorkhapatraToDelete(selectedGorkhaptra);
        setOpenConfirm(true);
    };

    const handleGorkhapatraDeletion = async () => {
        try {
            const response = await deleteGorkhapatra({
                body: gorkhapatraToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Gorkhapatra deleted successfully",
                    severity: "success",
                })
            );
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setGorkhapatraToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete gorkhapatra.",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    }

    const handleGorkhapatraStatusChange = async (id: number | null) => {
        // Guard against null ids
        if (id == null) return;

        try {
            const response = await changeStatus({ body: [Number(id)] }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || "Course Published Successfully",
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to Publish Course",
                    severity: "error"
                })
            )
        }
    }

    const columns = useMemo<ColumnDef<GorkhapatraProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={row.original.id != null && selectedRows.has(Number(row.original.id))}
                        onChange={(e) => handleSelectRow(row.original.id || null, e.target.checked)}
                        color="primary"
                        disabled={row.original.id == null}
                    />
                    <Typography fontWeight={500}>  {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
            header: "Title",
            accessorKey: "title",
            cell: ({ row }) => (
                <Tooltip title={row.original.title} arrow>
                    <Typography fontWeight={500} variant="subtitle1" className="line-clamp-1">
                        {row.original.title || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Description",
            accessorKey: "description",
            cell: ({ row }) => (
                <Typography fontWeight={500} variant="subtitle1" className="line-clamp-1">
                    {renderHtml(row.original.description || "-")}
                </Typography>
            ),
        },
        {
            header: "Type",
            accessorKey: "type",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.type || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const variant = getPublishedStatus(row.original.status || "published" as PublishedStatus);

                return (
                    <Tooltip title={`Click to change status to ${row.original.status === "published" ? "Draft" : "Publish"}`}>
                        <Button
                            className="py-0.5! px-2! rounded-xl! capitalize!"
                            onClick={() => handleGorkhapatraStatusChange(Number(row.original.id))}
                        >
                            <StatusPill variant={variant} status={row.original.status || "published"} />
                        </Button>
                    </Tooltip>
                )
            },
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => {
                return (
                    <Typography fontWeight={500} className="capitalize">
                        {formatDate(row.original?.created_at || "")}
                    </Typography>
                )
            },
        },
        {
            header: "Views",
            accessorKey: "views",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.views}
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    editUrl={row.original.id != null ? PATH.GORKHAPATRA.EDIT_GORKHAPATRA.ROOT(row.original.id) : undefined}
                    viewUrl={row.original.id != null ? PATH.GORKHAPATRA.EDIT_GORKHAPATRA.ROOT(row.original.id) : undefined}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, deleting, navigate, qp])


    const handleResetFilter = () => {
        setCustomRange({ startDate: "", endDate: "" });
        setSearch("");
        setDays(null);
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
    };

    return (
        <div className="all__gorkhapatra__root h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: t("menus.gorkhapatra.root"),
                            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M16 6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20C17.4696 20 16.9609 19.7893 16.5858 19.4142C16.2107 19.0391 16 18.5304 16 18V5C16 4.73478 15.8946 4.48043 15.7071 4.29289C15.5196 4.10536 15.2652 4 15 4H5C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H18M8 8H12H8ZM8 12H12H8ZM8 16H12H8Z" fill="#1D82F5" />
                                <path d="M16 6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20M18 20C17.4696 20 16.9609 19.7893 16.5858 19.4142C16.2107 19.0391 16 18.5304 16 18V5C16 4.73478 15.8946 4.48043 15.7071 4.29289C15.5196 4.10536 15.2652 4 15 4H5C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5V17C4 17.7956 4.31607 18.5587 4.87868 19.1213C5.44129 19.6839 6.20435 20 7 20H18ZM8 8H12M8 12H12M8 16H12" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>,
                        },
                    ]}
                    cta={{
                        label: `${t("actions.create")} ${t("messages.gorkhapatra")}`,
                        url: PATH.GORKHAPATRA.CREATE_GORKHAPATRA.ROOT
                    }}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={openDeleteConfirmation}
                    layout={layout}
                    setLayout={setLayout}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    setDays={setDays}
                    handleResetFilter={handleResetFilter}
                />
                <TabController
                    options={[
                        { label: "All Gorkhapatra", value: "" },
                        { label: "Published", value: "published" },
                        { label: "Draft", value: "draft" }
                    ]}
                    currentActive={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>

            {
                !isLoading && !gorkhapatras.length ? <EmptyRoute
                    title={t("messages.empty_states.gorkhapatra.title")}
                    message={t("messages.empty_states.gorkhapatra.description")}
                /> : (
                    <>
                        <Box className="table__wrapper h-full" sx={{
                            overflow: "auto"
                        }}>
                            {layout === "table" ?
                                <>
                                    <CustomTable
                                        data={gorkhapatras}
                                        columns={columns}
                                        loading={isLoading}
                                    />
                                </> : <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                                    {gorkhapatras.map((gorkhapatra) => (
                                        <GorkhapatraCard
                                            data={gorkhapatra} key={gorkhapatra.title + gorkhapatra.id}
                                            editUrl={gorkhapatra.id != null ? PATH.GORKHAPATRA.EDIT_GORKHAPATRA.ROOT(gorkhapatra.id) : undefined}
                                            viewUrl={gorkhapatra.id != null ? PATH.GORKHAPATRA.EDIT_GORKHAPATRA.ROOT(gorkhapatra.id) : undefined}
                                            onDelete={() => openDeleteConfirmation([gorkhapatra.id?.toString() || ""])}
                                        />
                                    ))}
                                </div>
                            }
                        </Box>
                        <TablePagination
                            qp={qp}
                            setQp={setQp}
                            totalPages={pagination?.total_pages || 0}
                        />
                    </>
                )
            }
            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete Gorkhapatra"
                description={"Are you sure you want to delete gorkhapatra. This action cannot be undone."}
                onSave={handleGorkhapatraDeletion}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>)}
            />
        </div>
    )
}