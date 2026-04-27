import { Box, Checkbox, Stack, Typography } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { Add } from 'iconsax-reactjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PATH } from '../../../../../routes/PATH';
import { useDeleteTestMutation, useGetAllIndividualTestQuery } from '../../../../../services/questionApi';
import { showToast } from '../../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../../store/hook';
import { useCourseFilter } from '../../../../../store/useCourseFilter';
import type { TestProps } from '../../../../../types/question';
import StatusPill from '../../../../atoms/StatusPill';
import Actions from '../../../../molecules/Action';
import CustomTable from '../../../../molecules/Table';
import TablePagination from '../../../../molecules/Table/Pagination';
import ConfirmationDialog from '../../../../organism/ConfirmationDialog';
import EmptyRoute from '../../../../organism/EmptyRoute';
import { CourseFilter } from '../../../../organism/Filter/CourseFilter';
import PageHeader from '../../../../organism/PageHeader';
import TableFilter, { type LayoutProps } from '../../../../organism/TableFilter';
import TestGridLayout from '../allTest/TestGridLayout';

export default function AllIndividualTestListing() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [layout, setLayout] = useState<LayoutProps>('table');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [testsToDelete, setTestsToDelete] = useState<string[]>([]);
    const [customRange, setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [days, setDays] = useState<number | null>(null);
    const {
        selections,
        megaCategories,
        categories,
        subCategories,
        positions,
        loadingMegaCategory,
        handleCategoryChange,
        handleApplyFilter,
        resetFilters,
        getCategoryFilterParams,
        filterDialogOpen,
        setFilterDialogOpen
    } = useCourseFilter();

    const categoryFilter = getCategoryFilterParams();

    const { data, isLoading } = useGetAllIndividualTestQuery({
        ...qp, search: search, ...customRange,
        days,
        categoryFilter: { ...categoryFilter },
    });
    const [deleteTest, { isLoading: deleting }] = useDeleteTestMutation();


    const tests = data?.data?.data || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(tests.map((test) => test.id || ''));
            setSelectedRows(allIds);
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

    const isAllSelected = tests.length > 0 && selectedRows.size === tests.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < tests.length;

    const openDeleteConfirmation = (selectedCourseIds: string[]) => {
        setTestsToDelete(selectedCourseIds);
        setOpenConfirm(true);
    };

    const handleQuestionDeletion = async () => {
        try {
            const response = await deleteTest({
                body: testsToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Course deleted successfully",
                    severity: "success",
                })
            );
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setTestsToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete course.",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    }

    const columns = useMemo<ColumnDef<TestProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    < Typography fontWeight={500} >S.No.</Typography >
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
                    < Typography fontWeight={500} >  {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography >
                </Stack >
            ),
            size: 80,
        },
        {
            header: "Test Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize max-w-[450px]">
                    {row.original.name || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Test Type",
            accessorKey: "Test Type",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.test_type || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Result Status",
            accessorKey: "has_published",
            cell: ({ row }) => (
                <StatusPill variant={row.original.has_published ? 'success' : "error"} status={row.original.has_published ? "Published" : "Not Published"} />
            ),
        },
        {
            header: "No. of Questions",
            accessorKey: "questions",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.total_questions || "N/A"}
                </Typography>
            ),
        },
        {
            header: "No. of Students",
            accessorKey: "no_of_students",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.no_of_students || 0}
                </Typography>
            ),
        },
        {
            header: "Duration",
            accessorKey: "duration",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.duration.hours} Hrs {row.original.duration?.minutes} Mins
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    editUrl={PATH.TEST_QUESTION_MANAGEMENT.TEST.EDIT_TEST.ROOT(Number(row.original.id))}
                    viewUrl={PATH.TEST_QUESTION_MANAGEMENT.TEST.VIEW_TEST.ROOT(Number(row.original.id))}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, deleting, qp])


    const handleResetFilter = () => {
        setCustomRange({ startDate: "", endDate: "" });
        setSearch("");
        setDays(null);
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
        resetFilters();
    };
    return (
        <div className='test__list__root h-full flex flex-col justify-between' >
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: t("menus.test_question_management.test.root"),
                            icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 4.85018V16.7402C22 17.7102 21.21 18.6002 20.24 18.7202L19.93 18.7602C18.29 18.9802 15.98 19.6602 14.12 20.4402C13.47 20.7102 12.75 20.2202 12.75 19.5102V5.60018C12.75 5.23018 12.96 4.89018 13.29 4.71018C15.12 3.72018 17.89 2.84018 19.77 2.68018H19.83C21.03 2.68018 22 3.65018 22 4.85018Z" fill="#1D82F5" />
                                <path d="M10.7102 4.71018C8.88023 3.72018 6.11023 2.84018 4.23023 2.68018H4.16023C2.96023 2.68018 1.99023 3.65018 1.99023 4.85018V16.7402C1.99023 17.7102 2.78023 18.6002 3.75023 18.7202L4.06023 18.7602C5.70023 18.9802 8.01023 19.6602 9.87023 20.4402C10.5202 20.7102 11.2402 20.2202 11.2402 19.5102V5.60018C11.2402 5.22018 11.0402 4.89018 10.7102 4.71018ZM5.00023 7.74018H7.25023C7.66023 7.74018 8.00023 8.08018 8.00023 8.49018C8.00023 8.91018 7.66023 9.24018 7.25023 9.24018H5.00023C4.59023 9.24018 4.25023 8.91018 4.25023 8.49018C4.25023 8.08018 4.59023 7.74018 5.00023 7.74018ZM8.00023 12.2402H5.00023C4.59023 12.2402 4.25023 11.9102 4.25023 11.4902C4.25023 11.0802 4.59023 10.7402 5.00023 10.7402H8.00023C8.41023 10.7402 8.75023 11.0802 8.75023 11.4902C8.75023 11.9102 8.41023 12.2402 8.00023 12.2402Z" fill="#1D82F5" />
                            </svg>
                            ),
                        }
                    ]}
                    cta={
                        {
                            icon: <Add />,
                            url: PATH.TEST_QUESTION_MANAGEMENT.TEST.CREATE_TEST.ROOT,
                            label: t("messages.empty_states.test.action"),
                        }
                    }
                />

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={openDeleteConfirmation}
                    layout={layout}
                    onFilter={() => setFilterDialogOpen(true)}
                    setLayout={setLayout}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    setDays={setDays}
                    handleResetFilter={handleResetFilter}
                />
            </div>

            {!isLoading && !tests.length ?
                <EmptyRoute
                    title='Test Not Found'
                    message='Oops your test is empty. Please add question to help student gain knowlegde.'
                    icon={(
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 4.84969V16.7397C22 17.7097 21.21 18.5997 20.24 18.7197L19.93 18.7597C18.29 18.9797 15.98 19.6597 14.12 20.4397C13.47 20.7097 12.75 20.2197 12.75 19.5097V5.59969C12.75 5.22969 12.96 4.88969 13.29 4.70969C15.12 3.71969 17.89 2.83969 19.77 2.67969H19.83C21.03 2.67969 22 3.64969 22 4.84969Z" fill="#1D82F5" />
                            <path d="M10.7102 4.70969C8.88023 3.71969 6.11023 2.83969 4.23023 2.67969H4.16023C2.96023 2.67969 1.99023 3.64969 1.99023 4.84969V16.7397C1.99023 17.7097 2.78023 18.5997 3.75023 18.7197L4.06023 18.7597C5.70023 18.9797 8.01023 19.6597 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.21969 11.0402 4.88969 10.7102 4.70969ZM5.00023 7.73969H7.25023C7.66023 7.73969 8.00023 8.07969 8.00023 8.48969C8.00023 8.90969 7.66023 9.23969 7.25023 9.23969H5.00023C4.59023 9.23969 4.25023 8.90969 4.25023 8.48969C4.25023 8.07969 4.59023 7.73969 5.00023 7.73969ZM8.00023 12.2397H5.00023C4.59023 12.2397 4.25023 11.9097 4.25023 11.4897C4.25023 11.0797 4.59023 10.7397 5.00023 10.7397H8.00023C8.41023 10.7397 8.75023 11.0797 8.75023 11.4897C8.75023 11.9097 8.41023 12.2397 8.00023 12.2397Z" fill="#1D82F5" />
                        </svg>
                    )}
                /> : (
                    <>
                        <Box className="table__wrapper h-full overflow-auto">
                            {layout === "table" ? <CustomTable
                                columns={columns}
                                data={tests || []}
                                loading={isLoading}
                            /> : <TestGridLayout data={tests || []}
                                loading={isLoading} />}
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
                title={"Delete Course"}
                description={"Are you sure you want to delete the selected user(s)? This action cannot be undone."}
                onSave={handleQuestionDeletion}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>
                )}
            />
            <CourseFilter
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                megaCategories={megaCategories}
                categories={categories}
                subCategories={subCategories}
                positions={positions}
                selections={selections}
                onChange={handleCategoryChange}
                loadingMegaCategory={loadingMegaCategory}
                onApplyFilter={handleApplyFilter}
                onResetFilter={handleResetFilter}
            />
        </div>
    )
}
