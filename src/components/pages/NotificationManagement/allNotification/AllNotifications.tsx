import { Box, Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PATH } from "../../../../routes/PATH";
import { useDeleteNotificationMutation, useGetAllNotificationQuery, } from "../../../../services/notificationApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { useCourseFilter } from "../../../../store/useCourseFilter";
import type { CompletionStatus, DeliveryMethodsType, NotificationPayload, TargetStudentType } from "../../../../types/notification";
import { formatDateCustom } from "../../../../utils/dateFormat";
import { renderHtml } from "../../../../utils/renderHtml";
import Actions from "../../../molecules/Action";
import ScheduleNotification from "../../../molecules/Action/ScheduleNotification";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../organism/EmptyRoute";
import { CourseFilter } from "../../../organism/Filter/CourseFilter";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

export default function AllNotifications() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    })
    const [openConfirm, setOpenConfirm] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<string[]>([]);
    const [customRange, setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [days, setDays] = useState<number | null>(null);

    const {
        selections,
        loadingMegaCategory,
        handleCategoryChange,
        handleApplyFilter,
        resetFilters,
        filterDialogOpen,
        setFilterDialogOpen,
        status,
        paymentMethod,
        targetAudience
    } = useCourseFilter();


    const { data, isLoading } = useGetAllNotificationQuery({
        ...qp,
        search: search,
        ...customRange,
        days,
        status: status.join(",") as CompletionStatus,
        delivey_method: paymentMethod.join(",") as DeliveryMethodsType,
        target_audience: targetAudience.join(",") as TargetStudentType
    });

    const [deleteNotification, { isLoading: deleting }] = useDeleteNotificationMutation();


    const notifications = data?.data?.data || [];
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(notifications.map((notification) => notification.id || ""));
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

    const isAllSelected = notifications.length > 0 && selectedRows.size === notifications.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < notifications.length;

    const openDeleteConfirmation = (selectedCourseIds: string[]) => {
        setNotificationToDelete(selectedCourseIds);
        setOpenConfirm(true);
    };

    const handleQuestionDeletion = async () => {
        try {
            const response = await deleteNotification({
                body: notificationToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Notification deleted successfully",
                    severity: "success",
                })
            );
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setNotificationToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete notification.",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    }

    const columns = useMemo<ColumnDef<NotificationPayload>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    < Typography variant="subtitle2" >S.No.</Typography >
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
                    < Typography variant="subtitle2" > {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography >
                </Stack >
            ),
            size: 80,
        },
        {
            header: "Name of the notification",
            accessorKey: "name",
            cell: ({ row }) => (
                <Typography variant="subtitle2" className="capitalize max-w-[450px]">
                    {row.original.name || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Description",
            accessorKey: "description",
            cell: ({ row }) => (
                <Typography variant="subtitle2" className="capitalize line-clamp-1" >
                    {renderHtml(row.original.description) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Target",
            accessorKey: "target",
            cell: ({ row }) => (
                <Typography className="capitalize" variant="subtitle2">
                    {row.original.target_students.length
                        ? row.original.target_students.map((item) => item.split("_").join(" ")).join(", ")
                        : "N/A"}
                </Typography>
            ),
        },
        {
            header: "Delivery Method",
            accessorKey: "delivery_methods",
            cell: ({ row }) => (
                <Typography className="capitalize" variant="subtitle2">
                    {row.original.delivery_methods?.length
                        ? row.original.delivery_methods.map((item) => item.split("_").join(" ")).join(", ")
                        : "N/A"}
                </Typography>
            ),
        },
        {
            header: "Schedule Notification",
            accessorKey: "schedule_notification",
            cell: ({ row }) => (
                <>
                    <ScheduleNotification data={row.original} />
                    <Typography variant="caption">Last Sent: {formatDateCustom(row.original.updated_at || "", { shortMonth: true })}</Typography>
                </>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    editUrl={PATH.NOTIFICATION_MANAGEMENT.EDIT_NOTIFICATION.ROOT(Number(row.original.id))}
                    viewUrl={PATH.NOTIFICATION_MANAGEMENT.EDIT_NOTIFICATION.ROOT(Number(row.original.id))}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, qp])

    const handleResetFilter = () => {
        setCustomRange({ startDate: "", endDate: "" });
        setSearch("");
        setDays(null);
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
    };
    return (
        <div className="all__notification__root h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[{
                        title: t("menus.notification_management.root"),
                        icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.17 6.63953C18.74 4.46953 17.13 3.51953 14.89 3.51953H6.10996C3.46996 3.51953 1.70996 4.83953 1.70996 7.91953V13.0695C1.70996 15.2895 2.61996 16.5895 4.11996 17.1495C4.33996 17.2295 4.57996 17.2995 4.82996 17.3395C5.22996 17.4295 5.65996 17.4695 6.10996 17.4695H14.9C17.54 17.4695 19.3 16.1495 19.3 13.0695V7.91953C19.3 7.44953 19.26 7.02953 19.17 6.63953ZM5.52996 11.9995C5.52996 12.4095 5.18996 12.7495 4.77996 12.7495C4.36996 12.7495 4.02996 12.4095 4.02996 11.9995V8.99953C4.02996 8.58953 4.36996 8.24953 4.77996 8.24953C5.18996 8.24953 5.52996 8.58953 5.52996 8.99953V11.9995ZM10.5 13.1395C9.03996 13.1395 7.85996 11.9595 7.85996 10.4995C7.85996 9.03953 9.03996 7.85953 10.5 7.85953C11.96 7.85953 13.14 9.03953 13.14 10.4995C13.14 11.9595 11.96 13.1395 10.5 13.1395ZM16.96 11.9995C16.96 12.4095 16.62 12.7495 16.21 12.7495C15.8 12.7495 15.46 12.4095 15.46 11.9995V8.99953C15.46 8.58953 15.8 8.24953 16.21 8.24953C16.62 8.24953 16.96 8.58953 16.96 8.99953V11.9995Z" fill="#1D82F5" />
                            <path d="M22.2998 10.9183V16.0683C22.2998 19.1483 20.5398 20.4783 17.8898 20.4783H9.10977C8.35977 20.4783 7.68977 20.3683 7.10977 20.1483C6.63977 19.9783 6.22977 19.7283 5.89977 19.4083C5.71977 19.2383 5.85977 18.9683 6.10977 18.9683H14.8898C18.5898 18.9683 20.7898 16.7683 20.7898 13.0783V7.91832C20.7898 7.67832 21.0598 7.52832 21.2298 7.70832C21.9098 8.42832 22.2998 9.47832 22.2998 10.9183Z" fill="#1D82F5" />
                        </svg>
                        )
                    }]}
                    cta={{
                        label: t("messages.empty_states.notification_management.action"),
                        url: PATH.NOTIFICATION_MANAGEMENT.CREATE_NOTIFICATION.ROOT
                    }}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    onFilter={() => setFilterDialogOpen(true)}
                    handleRoleDelete={openDeleteConfirmation}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    setDays={setDays}
                    handleResetFilter={handleResetFilter}
                />
            </div>
            {!isLoading && !notifications.length ?
                <EmptyRoute
                    title='Notifications Not Found'
                    message='Oops your notifications is empty. Please add notifications to help student gain knowledge.'
                    icon={(
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 4.84969V16.7397C22 17.7097 21.21 18.5997 20.24 18.7197L19.93 18.7597C18.29 18.9797 15.98 19.6597 14.12 20.4397C13.47 20.7097 12.75 20.2197 12.75 19.5097V5.59969C12.75 5.22969 12.96 4.88969 13.29 4.70969C15.12 3.71969 17.89 2.83969 19.77 2.67969H19.83C21.03 2.67969 22 3.64969 22 4.84969Z" fill="#1D82F5" />
                            <path d="M10.7102 4.70969C8.88023 3.71969 6.11023 2.83969 4.23023 2.67969H4.16023C2.96023 2.67969 1.99023 3.64969 1.99023 4.84969V16.7397C1.99023 17.7097 2.78023 18.5997 3.75023 18.7197L4.06023 18.7597C5.70023 18.9797 8.01023 19.6597 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.21969 11.0402 4.88969 10.7102 4.70969ZM5.00023 7.73969H7.25023C7.66023 7.73969 8.00023 8.07969 8.00023 8.48969C8.00023 8.90969 7.66023 9.23969 7.25023 9.23969H5.00023C4.59023 9.23969 4.25023 8.90969 4.25023 8.48969C4.25023 8.07969 4.59023 7.73969 5.00023 7.73969ZM8.00023 12.2397H5.00023C4.59023 12.2397 4.25023 11.9097 4.25023 11.4897C4.25023 11.0797 4.59023 10.7397 5.00023 10.7397H8.00023C8.41023 10.7397 8.75023 11.0797 8.75023 11.4897C8.75023 11.9097 8.41023 12.2397 8.00023 12.2397Z" fill="#1D82F5" />
                        </svg>
                    )}
                /> : (
                    <>
                        <Box className="table__wrapper h-full overflow-auto">
                            <CustomTable
                                data={notifications || []}
                                columns={columns}
                                loading={isLoading}
                            />
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

                selections={selections}
                onChange={handleCategoryChange}
                loadingMegaCategory={loadingMegaCategory}
                onApplyFilter={handleApplyFilter}
                onResetFilter={resetFilters}
                status={[
                    { label: "Completed", value: "completed" },
                    { label: "Not Completed", value: "not_completed" },
                ]}
                paymentMethod={[
                    { label: "Push", value: "push_notification" },
                    { label: "Email", value: "email_notification" },
                    { label: "Notice Board", value: "notice_board" },
                    { label: "SMS", value: "sms_notification" },

                ]}
                targetAudience={[
                    { label: "Purchased", value: "purchased" },
                    { label: "Not Purchased", value: "not_purchased" },
                    { label: "Free Trial", value: "free_trial" },
                ]}
            />
        </div>
    )
}
