import { Box, Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../../store/hook";

import { useDeleteTestCategoryMutation, useGetAllTestCategoryQuery } from "../../../../../../services/questionApi";
import type { TestCategory } from "../../../../../../types/question";
import ActionIconVisible from "../../../../../molecules/Action/ActionIconVisible";
import CustomTable from "../../../../../molecules/Table";
import TablePagination from "../../../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../../organism/EmptyRoute";
import PageHeader from "../../../../../organism/PageHeader";
import TableFilter from "../../../../../organism/TableFilter";
import TestCategoryManagementForm from "../TestCategoryManagementForm";

export default function AllTestCategory() {

    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [position, setPosition] = React.useState<TestCategory>({
        name: "",
        slug: "",
        image: null,
        image_url: "",
        description: ""
    });
    const [search, setSearch] = React.useState<string>("");

    const [qp, setQp] = React.useState({
        pageIndex: 1,
        pageSize: 20,
    });
    const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
    const [testCategoryToDelete, setTestCategoryToDelete] = React.useState<string[]>([]);
    const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
    const [selectedRows, setSelectedRows] = React.useState<Set<number | string>>(new Set());

    const { data, isLoading } = useGetAllTestCategoryQuery({ pageIndex: qp.pageIndex, pageSize: qp.pageSize, search: debouncedSearch });
    const [deleteTestCategory] = useDeleteTestCategoryMutation();

    const testCategories = data?.data?.data || [];

    const handleTestCategoryDelete = async () => {
        try {
            const response = await deleteTestCategory({ body: testCategoryToDelete }).unwrap();

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
                    message: e?.data?.message || "Failed to delete test category",
                })
            );
        }
    };


    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(testCategories.map((_, index) => index));
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


    const isAllSelected = testCategories.length > 0 && selectedRows.size === testCategories.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < testCategories.length;

    const openDeleteConfirmation = (selectedPositionIds: string[]) => {
        setTestCategoryToDelete(selectedPositionIds);
        setOpenConfirmDelete(true);
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const handlePositionEdit = (positionData: TestCategory) => {
        setPosition({
            id: positionData.id,
            name: positionData.name,
            slug: positionData.slug,
            image: positionData.image,
            image_url: positionData.image_url,
            description: positionData?.description || ""
        });
    };

    const columns = useMemo<ColumnDef<TestCategory>[]>(() => [
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
                    <div className="flex items-center gap-1">
                        <Box className="image__wrapper aspect-1/1 rounded-sm overflow-hidden w-12 flex items-center justify-center text-3xl" sx={{
                            background: (theme) => theme.palette.primary.main,
                            color: (theme) => theme.palette.primary.contrastText
                        }}>
                            {row.original?.image_url ? <img src={row.original.image_url} alt="" className="max-w-12 object-cover" /> : row.original.name.split("")[0]}
                        </Box>
                        < Typography fontWeight={500} > {row.original.name}</Typography >
                    </div>
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
            header: "Description",
            accessorKey: "description",
            cell: ({ row }) => (
                <Typography fontWeight={400} >
                    {row.original.description || "N/A"}
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
                        title: t("menus.test_question_management.test.root"),
                    },
                    { title: t("menus.test_question_management.test.test_category.root"), },
                ]}
            />
            <div className="category__wrapper flex flex-col gap-8.5 md:grid md:grid-cols-12">
                <div className="md:col-span-3 lg:col-span-4">
                    <TestCategoryManagementForm
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
                            title="Test Category not found"
                            message="Start defining category to manage system. Use the button below to create one."
                        />
                    ) : (
                        <div className="position__listing">
                            <CustomTable
                                data={testCategories}
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
                        title="Delete Test Category"
                        description="Are you sure you want to delete this test category?"
                        setOpen={setOpenConfirmDelete}
                        onSave={handleTestCategoryDelete}
                    />
                </div>
            </div>
        </div>
    )
}
