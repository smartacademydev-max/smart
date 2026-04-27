import { Box, Checkbox, Stack, Typography, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { Add } from 'iconsax-reactjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PATH } from '../../../../routes/PATH';
import { useDeleteRoleMutation, useGetAllRolesQuery } from '../../../../services/roleAndPermissionApi';
import { showToast } from '../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../store/hook';
import type { RoleProps } from '../../../../types/roleAndPermission';
import { formatDateForDisplay } from '../../../../utils/dateFormat';
import Actions from '../../../molecules/Action';
import CustomTable from '../../../molecules/Table';
import TablePagination from '../../../molecules/Table/Pagination';
import ConfirmationDialog from '../../../organism/ConfirmationDialog';
import EmptyRoles from '../../../organism/EmptyRoute';
import PageHeader from '../../../organism/PageHeader';
import TableFilter from '../../../organism/TableFilter';

export default function AllRolesTable() {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = React.useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [qp, setQp] = React.useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [openConfirm, setOpenConfirm] = React.useState(false);
    const [rolesToDelete, setRolesToDelete] = React.useState<string[]>([]);

    const { data, isLoading } = useGetAllRolesQuery({ pageIndex: qp.pageIndex, pageSize: qp.pageSize, search: debouncedSearch });
    const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();


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
        setRolesToDelete(selectedRoleIds);
        setOpenConfirm(true);
    };

    const handleRoleDelete = async () => {
        try {
            const response = await deleteRole({
                body: rolesToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Role deleted successfully",
                    severity: "success",
                })
            );

            // Clear selection and close dialog
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setRolesToDelete([]);
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

    const columns = useMemo<ColumnDef<RoleProps>[]>(() => [
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
            header: "Role Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">{row.original.name}</Typography>
            ),
        },
        {
            header: "Members",
            accessorKey: "members",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.members || 0} Members
                </Typography>
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
                    editUrl={PATH.ROLES.EDIT_ROLE.ROOT(row.original.id?.toString() || "")}
                    viewUrl={PATH.ROLES.EDIT_ROLE.ROOT(row.original.id?.toString() || "")}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, theme, qp])



    console.log({
        rolesToDelete, selectedRows
    })
    return (
        <div className='roles__root h-full flex flex-col justify-start'>
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: t("menus.role_permission.root"),
                            icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 19 3.29 20.93 5.56 21.66C6.22 21.89 6.98 22 7.81 22H16.19C17.02 22 17.78 21.89 18.44 21.66C20.71 20.93 22 19 22 16.19V7.81C22 4.17 19.83 2 16.19 2ZM20.5 16.19C20.5 18.33 19.66 19.68 17.97 20.24C17 18.33 14.7 16.97 12 16.97C9.3 16.97 7.01 18.32 6.03 20.24H6.02C4.35 19.7 3.5 18.34 3.5 16.2V7.81C3.5 4.99 4.99 3.5 7.81 3.5H16.19C19.01 3.5 20.5 4.99 20.5 7.81V16.19Z" fill="#1D82F5" />
                                <path d="M12 8C10.02 8 8.42001 9.6 8.42001 11.58C8.42001 13.56 10.02 15.17 12 15.17C13.98 15.17 15.58 13.56 15.58 11.58C15.58 9.6 13.98 8 12 8Z" fill="#1D82F5" />
                            </svg>
                            ),
                            // url: PATH.ROLES.CREATE_ROLE.ROOT
                        }
                    ]}
                    cta={
                        {
                            icon: <Add />,
                            url: PATH.ROLES.CREATE_ROLE.ROOT,
                            label: t("messages.empty_states.roles.action"),
                        }
                    }
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={openDeleteConfirmation} // Changed to open dialog instead
                />
            </div>
            {!isLoading && !roles.length ? <EmptyRoles /> : <Box className="table__wrapper  overflow-auto flex flex-col justify-start">
                <CustomTable
                    loading={isLoading}
                    data={roles}
                    columns={columns}
                />
            </Box>}

            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title="Delete Role"
                description="Are you sure you want to delete the selected role(s)? This action cannot be undone."
                onSave={handleRoleDelete}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>
                )}
            />
        </div>
    )
}