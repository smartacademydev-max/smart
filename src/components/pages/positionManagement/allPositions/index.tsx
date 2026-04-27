import { Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PATH } from "../../../../routes/PATH";
import { useDeletePositionMutation, useGetAllPositionQuery } from "../../../../services/positionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { positionProps } from "../../../../types/position";
import ActionIconVisible from "../../../molecules/Action/ActionIconVisible";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";
import PositionManagementForm from "../PositionManagementForm";

export default function AllPositions() {

    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [position, setPosition] = React.useState<positionProps>({
        name: "",
        slug: "",
    });
    const [search, setSearch] = React.useState<string>("");

    const [qp, setQp] = React.useState({
        pageIndex: 1,
        pageSize: 5,
    });
    const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
    const [positionsToDelete, setPositionsToDelete] = React.useState<string[]>([]);
    const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
    const [selectedRows, setSelectedRows] = React.useState<Set<number | string>>(new Set());

    const { data, isLoading } = useGetAllPositionQuery({ pageIndex: qp.pageIndex, pageSize: qp.pageSize, search: debouncedSearch });
    const [deletePosition] = useDeletePositionMutation();


    const positions = data?.data?.data || [];

    const handlePositionDelete = async () => {
        try {
            const response = await deletePosition({ body: positionsToDelete }).unwrap();

            dispatch(
                showToast({
                    severity: "success",
                    message: response.message || "Position deleted successfully",
                })
            );

            setOpenConfirmDelete(false);
        } catch (e: any) {
            dispatch(
                showToast({
                    severity: "error",
                    message: e?.data?.message || "Failed to delete position",
                })
            );
        }
    };


    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(positions.map((_, index) => index));
            setSelectedRows(allIndices);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (index: number | string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(index);
        } else {
            newSelected.delete(index);
        }
        setSelectedRows(newSelected);
    };


    const isAllSelected = positions.length > 0 && selectedRows.size === positions.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < positions.length;

    const openDeleteConfirmation = (selectedPositionIds: string[]) => {
        setPositionsToDelete(selectedPositionIds);
        setOpenConfirmDelete(true);
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const handlePositionEdit = (positionData: positionProps) => {
        setPosition({
            id: positionData.id,
            name: positionData.name,
            slug: positionData.slug,
        });
    };

    const columns = useMemo<ColumnDef<positionProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    < Typography fontWeight={500} >{t("menus.category_level_management.level_position.root")}</Typography >
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={selectedRows.has(row.original.id || '')}
                        onChange={(e) => handleSelectRow(row.original.id || '', e.target.checked)}
                        color="primary"
                    />
                    < Typography fontWeight={500} > {row.original.name}</Typography >
                </Stack >
            ),
            size: 80,
        },
        {
            header: "Slug",
            accessorKey: "slug",
            cell: ({ row }) => (
                <Typography fontWeight={500} >
                    {row.original.slug || ""}
                </Typography>
            ),
        },
        {
            header: () => (
                <Typography className="text-right">Actions</Typography>
            ),
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onEdit={() => handlePositionEdit(row.original)}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />

            ),
        },
    ], [search, isAllSelected, isSomeSelected, selectedRows]);
    return (
        <div className="all__position__root">
            <PageHeader
                breadcrumb={[
                    {
                        title: t("menus.category_level_management.root"),
                        url: PATH.CATEGORY_LEVEL_MANAGEMENT.ROOT,
                    },
                    { title: t("menus.category_level_management.level_position.root"), },
                ]}
            />
            <div className="category__wrapper flex flex-col gap-8.5 md:grid md:grid-cols-12">
                <div className="md:col-span-3 lg:col-span-4">
                    <PositionManagementForm
                        position={position}
                        setPosition={setPosition}
                    />
                </div>
                <div className="md:col-span-9 lg:col-span-8">
                    <TableFilter
                        search={search}
                        setSearch={(value) => setSearch(value)}
                        handleRoleDelete={openDeleteConfirmation}
                        categoryLayout={true}
                        selectedRows={selectedRows}
                        title={t("menus.category_level_management.level_position.root")}
                    />
                    {!isLoading && !data?.data?.data?.length ? (
                        <EmptyRoute
                            title="Position not found"
                            message="Start defining category to manage system. Use the button below to create one."
                        />
                    ) : (
                        <div className="position__listing">
                            <CustomTable
                                data={positions}
                                columns={columns}
                                loading={isLoading}
                            />
                        </div>)}

                    <TablePagination
                        qp={qp}
                        setQp={setQp}
                        totalPages={data?.data?.pagination?.total_pages || 0}
                    />
                    <ConfirmationDialog
                        open={openConfirmDelete}
                        title="Delete Position"
                        description="Are you sure you want to delete this position?"
                        setOpen={setOpenConfirmDelete}
                        onSave={handlePositionDelete}
                    />
                </div>
            </div>
        </div>
    )
}
