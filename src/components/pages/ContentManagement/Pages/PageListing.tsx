import { Checkbox, Stack, Typography } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { PATH } from '../../../../routes/PATH';
import { useDeletePagesMutation, useGetAllPagesQuery } from '../../../../services/pageApi';
import { showToast } from '../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../store/hook';
import type { GeneralPageProps } from '../../../../types/page';
import { formatDateForDisplay } from '../../../../utils/dateFormat';
import Actions from '../../../molecules/Action';
import CustomTable from '../../../molecules/Table';
import TablePagination from '../../../molecules/Table/Pagination';
import ConfirmationDialog from '../../../organism/ConfirmationDialog';
import EmptyRoute from '../../../organism/EmptyRoute';
import TableFilter from '../../../organism/TableFilter';

export default function PageListing() {
    const dispatch = useAppDispatch();
    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [openConfirm, setOpenConfirm] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<string[]>([]);
    const { data, isLoading } = useGetAllPagesQuery({ ...qp, search })

    const [deletePage, { isLoading: deleting }] = useDeletePagesMutation();


    const roles = data?.data?.data || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(roles.map((_, index) => index));
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


    const isAllSelected = roles.length > 0 && selectedRows.size === roles.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < roles.length;

    const openDeleteConfirmation = (selectedRoleIds: string[]) => {
        setPageToDelete(selectedRoleIds);
        setOpenConfirm(true);
    };

    const handleRoleDelete = async () => {
        try {
            const response = await deletePage({ page_ids: pageToDelete }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Role deleted successfully",
                    severity: "success",
                })
            );

            setSelectedRows(new Set());
            setOpenConfirm(false);
            setPageToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete Role",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const columns = useMemo<ColumnDef<GeneralPageProps>[]>(() => [
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
                    < Typography fontWeight={500} >
                        {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}
                    </Typography >
                </Stack >
            ),
            size: 80,
        },
        {
            header: "Title",
            accessorKey: "heading",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">{row.original.heading}</Typography>
            ),
        },
        {
            header: "Slug",
            accessorKey: "slug",
            cell: ({ row }) => (
                <Typography >{row.original.slug}</Typography>
            ),
        },

        {
            header: "Created At",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography fontWeight={500}>
                    {formatDateForDisplay(row.original.created_at)}
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    editUrl={PATH.CONTENT_MANAGEMENT.PAGES.EDIT_PAGE.ROOT(row.original.id?.toString() || "")}
                    viewUrl={PATH.CONTENT_MANAGEMENT.PAGES.EDIT_PAGE.ROOT(row.original.id?.toString() || "")}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, qp])



    if (!isLoading && !data?.data?.data?.length) {
        return <EmptyRoute
            title='No Pages Found'
            message='Start adding Page to include additional details and clarity.'
            icon={<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.587 2.66602H10.4137C5.56033 2.66602 2.66699 5.55935 2.66699 10.4127V21.5727C2.66699 26.4393 5.56033 29.3327 10.4137 29.3327H21.5737C26.427 29.3327 29.3203 26.4393 29.3203 21.586V10.4127C29.3337 5.55935 26.4403 2.66602 21.587 2.66602ZM21.0003 20.9993H11.0003C10.4537 20.9993 10.0003 20.546 10.0003 19.9993C10.0003 19.4527 10.4537 18.9993 11.0003 18.9993H21.0003C21.547 18.9993 22.0003 19.4527 22.0003 19.9993C22.0003 20.546 21.547 20.9993 21.0003 20.9993ZM21.0003 12.9993H11.0003C10.4537 12.9993 10.0003 12.546 10.0003 11.9993C10.0003 11.4527 10.4537 10.9993 11.0003 10.9993H21.0003C21.547 10.9993 22.0003 11.4527 22.0003 11.9993C22.0003 12.546 21.547 12.9993 21.0003 12.9993Z" fill="#1D82F5" />
            </svg>
            }
            cta={{
                label: "Create Page",
                url: PATH.CONTENT_MANAGEMENT.PAGES.CREATE_PAGE.ROOT
            }}
        />
    }
    return (
        <>
            <TableFilter
                search={debouncedSearch}
                setSearch={setSearch}
                selectedRows={selectedRows}
                handleRoleDelete={openDeleteConfirmation}
            />

            <CustomTable
                loading={isLoading}
                data={roles}
                columns={columns}
            />

            {data?.data?.pagination && data?.data?.pagination?.total_pages > 1 && <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />}

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete Page"
                description="Are you sure you want to delete the selected page(s)? This action cannot be undone."
                onSave={handleRoleDelete}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>
                )}
            />
        </>
    )
}
