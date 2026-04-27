import { Box, Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { Add } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../../routes/PATH";
import { useDeleteOmrFormatMutation, useGetAllOmrFormatQuery } from "../../../../../services/questionApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import type { OmrFormatProps } from "../../../../../types/question";
import { formatDateCustom } from "../../../../../utils/dateFormat";
import Actions from "../../../../molecules/Action";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../organism/EmptyRoute";
import PageHeader from "../../../../organism/PageHeader";
import TableFilter from "../../../../organism/TableFilter";

export default function AllOmrFormats() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [formatsToDelete, setFormatsToDelete] = useState<number[]>([]);

    const { data, isLoading } = useGetAllOmrFormatQuery({ ...qp, search });
    const [deleteFormat, { isLoading: deleting }] = useDeleteOmrFormatMutation();

    const formats = data?.data?.data || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(formats.map((f) => f.id as number)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        const next = new Set(selectedRows);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        setSelectedRows(next);
    };

    const isAllSelected = formats.length > 0 && selectedRows.size === formats.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < formats.length;

    const openDeleteConfirmation = (ids: number[]) => {
        setFormatsToDelete(ids);
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await deleteFormat({ body: formatsToDelete }).unwrap();
            dispatch(showToast({ message: res.message || "Format deleted successfully", severity: "success" }));
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setFormatsToDelete([]);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to delete format.", severity: "error" }));
            setOpenConfirm(false);
        }
    };

    const columns = useMemo<ColumnDef<OmrFormatProps>[]>(() => [
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
                        checked={selectedRows.has(row.original.id as number)}
                        onChange={(e) => handleSelectRow(row.original.id as number, e.target.checked)}
                        color="primary"
                    />
                    <Typography fontWeight={500}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
            header: "Format Title",
            accessorKey: "title",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize max-w-[400px]">
                    {row.original.title || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Created At",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography>
                    {formatDateCustom(row.original.created_at || "", { shortMonth: true }) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    onEdit={() => navigate(PATH.OMR.FORMAT.EDIT.ROOT(row.original.id))}
                    onDelete={() => openDeleteConfirmation([row.original.id as number])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, deleting, qp]);

    return (
        <div className="all__omr__formats h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[{ title: "OMR Formats" }]}
                    handleOpenPopup={() => navigate(PATH.OMR.FORMAT.CREATE.ROOT)}
                    cta={{ icon: <Add />, label: "Add Format" }}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={(ids) => openDeleteConfirmation(ids.map(Number))}
                />
            </div>

            {!isLoading && !formats.length ? (
                <EmptyRoute
                    title="No OMR Formats Found"
                    message="No OMR formats created yet. Create a format to configure popup instructions and images."
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full overflow-auto">
                        <CustomTable columns={columns} data={formats} loading={isLoading} />
                    </Box>
                    <TablePagination
                        qp={qp}
                        setQp={setQp}
                        totalPages={data?.data?.pagination?.total_pages || 0}
                    />
                </>
            )}

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete OMR Format"
                description="Are you sure you want to delete the selected format(s)? This action cannot be undone."
                onSave={handleDelete}
            />
        </div>
    );
}
