import { Box, Checkbox, Stack, Tooltip, Typography } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHasPermission } from '../../../../hooks/useHasPermission';
import { useDownloadCsvMutation } from '../../../../services/activityApi';
import { useDeleteTransactionMutation, useGetAllTransactionsQuery } from '../../../../services/transactionApi';
import { showToast } from '../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../store/hook';
import { useCourseFilter } from '../../../../store/useCourseFilter';
import { DeviceFilter, paymentOptions, TransactionStatusFilter, type DeviceType, type Status } from '../../../../types';
import type { EnrollmentType, TransactionResponse } from '../../../../types/transaction';
import { formatDate } from '../../../../utils/dateFormat';
import { formatAmount, sameAmount } from '../../../../utils/itemPrice';
import { getTransactionReadStatusVariant } from '../../../../utils/statusMap';
import { isPaymentComplete, isRefundable } from '../../../../utils/transactionState';
import StatusPill from '../../../atoms/StatusPill';
import Actions from '../../../molecules/Action';
import TabController from '../../../molecules/TabController';
import CustomTable from '../../../molecules/Table';
import TablePagination from '../../../molecules/Table/Pagination';
import ConfirmationDialog from '../../../organism/ConfirmationDialog';
import EmptyRoute from '../../../organism/EmptyRoute';
import { CourseFilter } from '../../../organism/Filter/CourseFilter';
import InstallmentScheduleDialog from '../../../organism/InstallmentScheduleDialog';
import InvoiceDialog from '../../../organism/InvoiceDialog';
import PageHeader from '../../../organism/PageHeader';
import RefundDialog from '../../../organism/RefundDialog';
import TableFilter from '../../../organism/TableFilter';
import TransactionManagementForm from '../TransactionManagementForm';

interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void
}
export default function AllTransaction({ open, setOpen }: Props) {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [customRange, setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [days, setDays] = useState<number | null>(null);

    const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("course");
    const [paymentType, setPaymentType] = useState<"all" | "installment" | "paid">("all");
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string[]>([]);
    const [installmentPurchaseId, setInstallmentPurchaseId] = useState<number | null>(null);
    const [refundTarget, setRefundTarget] = useState<TransactionResponse | null>(null);
    const [invoiceTarget, setInvoiceTarget] = useState<TransactionResponse | null>(null);

    const canRefund = useHasPermission("add_refunds");

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
        setFilterDialogOpen,
        device,
        status,
        paymentMethod
    } = useCourseFilter();

    const categoryFilter = getCategoryFilterParams();

    const { data, isLoading, isFetching } = useGetAllTransactionsQuery({
        ...qp,
        search,
        categoryFilter: { ...categoryFilter },
        device_type: device.join(",") as DeviceType,
        status: status.join(",") as Status,
        days,
        payment_method: paymentMethod.join(","),
        payment_type: paymentType === "all" ? "" : paymentType,
        module_type: enrollmentType,
        ...customRange
    });

    const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();
    const [downloadTransactions, { isLoading: downloading }] = useDownloadCsvMutation();

    const transactions = data?.data?.data || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(transactions.map((course) => course.id || ''));
            setSelectedRows(allIds);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: number | string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedRows(newSelected);
    };

    const isAllSelected = transactions.length > 0 && selectedRows.size === transactions.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < transactions.length;

    const openDeleteConfirmation = (selectedCourseIds: string[]) => {
        setTransactionToDelete(selectedCourseIds);
        setOpenConfirm(true);
    };

    const handleCourseDeletion = async () => {
        try {
            const response = await deleteTransaction({
                body: transactionToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Transaction deleted successfully",
                    severity: "success",
                })
            );
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setTransactionToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete transaction.",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    }

    const handleEdit = (transaction: TransactionResponse) => {
        setSelectedTransaction(transaction);
        setOpen(true);
    };

    const handleCreate = () => {
        setSelectedTransaction(null);
        setOpen(true);
    };

    const handleFormOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setSelectedTransaction(null);
        setOpen(nextOpen);
    };

    const columns = useMemo<ColumnDef<TransactionResponse>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    <Typography variant='subtitle2'>SN</Typography>
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
                    <Typography variant='subtitle2'>  {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
          
            header: "Student Name",
            accessorKey: "name",
            cell: ({ row }) => (
               
                <Stack component="span" sx={{ display: "inline-flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}>
                    <Typography variant='subtitle2' className="capitalize">
                        {row.original.name || "N/A"}
                    </Typography>
                    <Typography variant='caption' color="text.secondary" className="capitalize">
                        Added by {row.original.added_by || "N/A"}
                    </Typography>
                </Stack>
            ),
        },
        {
            header: enrollmentType === "course" ? "Course Name" : enrollmentType === "test" ? "Test Name" : "Bundle Name",
            accessorKey: "course_name",
            cell: ({ row }) => (
                <Tooltip title={row.original.course_name} arrow>
                   
                    <Typography variant='subtitle2' className="capitalize line-clamp-2" sx={{ maxWidth: 220 }}>
                        {row.original.course_name || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Contact No.",
            accessorKey: "contact",
            cell: ({ row }) => (
                <Typography variant='subtitle2' className="">
                    {row.original.contact || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Sold Price",
            accessorKey: "sold_price",
            cell: ({ row }) => {
                const sold = row.original.sold_price;
                const original = row.original.original_price;
                if (sold == null) return <Typography variant='subtitle2'>N/A</Typography>;
                return (
                 
                    <Stack component="span" sx={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                        <Typography variant='subtitle2'>{t("messages.npr")} {formatAmount(sold)}</Typography>
                        {original != null && !sameAmount(original, sold) && (
                            <Typography variant='caption' color="text.secondary">
                                <del>{t("messages.npr")} {formatAmount(original)}</del>
                            </Typography>
                        )}
                    </Stack>
                );
            },
        },
        {
           
            header: "Invoice / Transaction",
            accessorKey: "invoice_id",
            cell: ({ row }) => (
                <Stack component="span" sx={{ display: "inline-flex", flexDirection: "column", gap: "2px", alignItems: "flex-start", maxWidth: 230 }}>
                    <Tooltip title={row.original.invoice_id || ""} arrow>
                        <Typography variant='subtitle2' className="line-clamp-1">
                            <Box component="span" color="text.secondary">Invoice: </Box>
                            {row.original.invoice_id || "N/A"}
                        </Typography>
                    </Tooltip>
                    <Tooltip title={row.original.transaction_id || ""} arrow>
                        <Typography variant='caption' className="line-clamp-1">
                            <Box component="span" color="text.secondary">Txn / Bill: </Box>
                            {row.original.transaction_id || "N/A"}
                        </Typography>
                    </Tooltip>
                </Stack>
            ),
        },
        {
            header: "Payment Mode",
            accessorKey: "payment_method",
            cell: ({ row }) => (
                <Typography variant='subtitle2' className="capitalize">
                    {row.original.payment_method || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const { status, is_refunded, refunded_amount } = row.original;
                
                const partiallyRefunded = !is_refunded && Number(refunded_amount ?? 0) > 0;

                if (partiallyRefunded) {
                    return (
                        <Tooltip title={`${t("messages.npr")} ${formatAmount(refunded_amount)} refunded so far`} arrow>
                            <span><StatusPill status="Partially Refunded" variant="error" /></span>
                        </Tooltip>
                    );
                }
                return <StatusPill status={status} variant={getTransactionReadStatusVariant(status)} />;
            },
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => {
                return (
                    <Typography variant='subtitle2' className="capitalize">
                        {formatDate(row.original?.created_at || "")}
                    </Typography>
                )
            },
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    onEdit={() => handleEdit(row.original)}
                    onView={() => handleEdit(row.original)}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                    onManageInstallment={row.original.is_installment ? () => setInstallmentPurchaseId(Number(row.original.id)) : undefined}
                    
                    onRefund={canRefund && isRefundable(row.original) ? () => setRefundTarget(row.original) : undefined}
                   
                    onInvoice={isPaymentComplete(row.original) ? () => setInvoiceTarget(row.original) : undefined}
                    file={row.original?.image_url || undefined}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, deleting, navigate, qp, enrollmentType, canRefund]);


    const handleResetFilter = () => {
        resetFilters();
        setCustomRange({ startDate: "", endDate: "" });
        setSearch("");
        setDays(null);
        setPaymentType("all");
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
    }

    const handleDownload = async () => {
        try {
            const blob = await downloadTransactions({ type: "transactions" }).unwrap();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = "transactions.csv";
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to download Activity",
                    severity: "error"
                })
            )
        }
    }

    return (
        <div className='transaction__root h-full flex flex-col justify-between'>
            <div className="page__top">
                <PageHeader
                    breadcrumb={[{
                        title: t("menus.transaction_management.root"),
                        icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.17 6.63953C18.74 4.46953 17.13 3.51953 14.89 3.51953H6.10996C3.46996 3.51953 1.70996 4.83953 1.70996 7.91953V13.0695C1.70996 15.2895 2.61996 16.5895 4.11996 17.1495C4.33996 17.2295 4.57996 17.2995 4.82996 17.3395C5.22996 17.4295 5.65996 17.4695 6.10996 17.4695H14.9C17.54 17.4695 19.3 16.1495 19.3 13.0695V7.91953C19.3 7.44953 19.26 7.02953 19.17 6.63953ZM5.52996 11.9995C5.52996 12.4095 5.18996 12.7495 4.77996 12.7495C4.36996 12.7495 4.02996 12.4095 4.02996 11.9995V8.99953C4.02996 8.58953 4.36996 8.24953 4.77996 8.24953C5.18996 8.24953 5.52996 8.58953 5.52996 8.99953V11.9995ZM10.5 13.1395C9.03996 13.1395 7.85996 11.9595 7.85996 10.4995C7.85996 9.03953 9.03996 7.85953 10.5 7.85953C11.96 7.85953 13.14 9.03953 13.14 10.4995C13.14 11.9595 11.96 13.1395 10.5 13.1395ZM16.96 11.9995C16.96 12.4095 16.62 12.7495 16.21 12.7495C15.8 12.7495 15.46 12.4095 15.46 11.9995V8.99953C15.46 8.58953 15.8 8.24953 16.21 8.24953C16.62 8.24953 16.96 8.58953 16.96 8.99953V11.9995Z" fill="#1D82F5" />
                            <path d="M22.2998 10.9183V16.0683C22.2998 19.1483 20.5398 20.4783 17.8898 20.4783H9.10977C8.35977 20.4783 7.68977 20.3683 7.10977 20.1483C6.63977 19.9783 6.22977 19.7283 5.89977 19.4083C5.71977 19.2383 5.85977 18.9683 6.10977 18.9683H14.8898C18.5898 18.9683 20.7898 16.7683 20.7898 13.0783V7.91832C20.7898 7.67832 21.0598 7.52832 21.2298 7.70832C21.9098 8.42832 22.2998 9.47832 22.2998 10.9183Z" fill="#1D82F5" />
                        </svg>
                        )
                    }]}
                    cta={{
                        label: t("messages.empty_states.transaction_management.action"),
                    }}
                    handleOpenPopup={handleCreate}
                />
                <TabController
                    currentActive={enrollmentType}
                    setActiveTab={(val) => {
                        setEnrollmentType(val);
                        setQp({ pageIndex: 1, pageSize: 8 });
                        setSearch("");
                    }}
                    options={[
                        { label: "Course", value: "course" },
                        { label: "Test", value: "test" },
                        { label: "Bundle", value: "bundle" },
                    ]}
                />
                <TabController
                    size="sm"
                    currentActive={paymentType}
                    setActiveTab={(val) => {
                        setPaymentType(val);
                        setQp({ pageIndex: 1, pageSize: 8 });
                    }}
                    options={[
                        { label: "All Payments", value: "all" },
                        { label: "Full Payment", value: "paid" },
                        { label: "Installment", value: "installment" },
                    ]}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={openDeleteConfirmation}
                    onFilter={() => setFilterDialogOpen(true)}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    setDays={setDays}
                    handleResetFilter={handleResetFilter}
                    onDownload={handleDownload}
                    donwloading={downloading}
                />
            </div>
            {
                !isLoading && !transactions.length ? <EmptyRoute
                    title="No Transaction Found"
                    message={`We couldn't find any transactions matching "${search}".`}
                /> : (
                    <>
                        <Box className="table__wrapper h-full overflow-auto">
                            <CustomTable
                                data={transactions}
                                columns={columns}
                                loading={isLoading || isFetching}
                            />
                        </Box>

                        <TablePagination
                            qp={qp}
                            setQp={setQp}
                            totalPages={data?.data?.pagination?.total_pages || 0}
                        />
                    </>
                )
            }


            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title={"Delete Transaction"}
                description={"Are you sure you want to delete the selected transaction(s)? This action cannot be undone."}
                onSave={handleCourseDeletion}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>
                )}
            />

            <TransactionManagementForm
                open={open}
                setOpen={handleFormOpenChange}
                transactionId={selectedTransaction?.id}
            />

            <InstallmentScheduleDialog
                purchaseId={installmentPurchaseId}
                onClose={() => setInstallmentPurchaseId(null)}
                moduleType={enrollmentType}
            />

            <InvoiceDialog
                transaction={invoiceTarget}
                moduleType={enrollmentType}
                onClose={() => setInvoiceTarget(null)}
            />

            <RefundDialog
                purchaseId={refundTarget ? Number(refundTarget.id) : null}
                moduleType={enrollmentType}
                studentName={refundTarget?.name}
                itemName={refundTarget?.course_name}
                isInstallment={Boolean(refundTarget?.is_installment)}
                onClose={() => setRefundTarget(null)}
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
                onResetFilter={resetFilters}
                status={TransactionStatusFilter || []}
                deviceType={DeviceFilter || []}
                paymentMethod={paymentOptions || []}
            />

        </div>
    )
}
