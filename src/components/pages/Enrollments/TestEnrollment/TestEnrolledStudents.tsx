import { Box, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { Add } from "iconsax-reactjs";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useArchiveStudentFromTestMutation, useGetEnrolledStudentsByTestQuery } from "../../../../services/questionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { TransactionResponse } from "../../../../types/transaction";
import { formatDate } from "../../../../utils/dateFormat";
import ActionIconVisible from "../../../molecules/Action/ActionIconVisible";
import TabController from "../../../molecules/TabController";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";
import EnrollStudentToTestForm from "./EnrollStudentToTestForm";

export default function TestEnrolledStudents({ id }: { id: number }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
    const [open, setOpen] = useState(false);
    const [openTrashConfirmation, setOpenTrashConfirmation] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetEnrolledStudentsByTestQuery({
        ...qp,
        type: activeTab,
        search: debouncedSearch,
        id: Number(id),
    });

    const [removeUser, { isLoading: removingUser }] = useArchiveStudentFromTestMutation();

    const handleUserRemoval = async (transactionId: number) => {
        try {
            const response = await removeUser({ id: Number(id), transactionId }).unwrap();
            dispatch(showToast({
                message: response?.message || "User Archived Successfully",
                severity: "success",
            }));
        } catch (e: any) {
            dispatch(showToast({
                message: e?.data?.message || "Unable to archive student",
                severity: "error",
            }));
        }
    };

    const users = data?.data?.data || [];

    const columns = useMemo<ColumnDef<TransactionResponse>[]>(() => [
        {
            header: () => <Typography variant="subtitle2">SN</Typography>,
            accessorKey: "sno",
            cell: ({ row }) => (
                <Typography variant="subtitle2">{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
            ),
            size: 80,
        },
        {
            header: "Student Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Typography variant="subtitle2" className="capitalize">{row.original.name || "N/A"}</Typography>
            ),
        },
        {
            header: "Added By",
            accessorKey: "added_by",
            cell: ({ row }) => (
                <Typography variant="subtitle2" className="capitalize">{row.original.added_by || "N/A"}</Typography>
            ),
        },
        {
            header: "Contact No.",
            accessorKey: "contact",
            cell: ({ row }) => (
                <Typography variant="subtitle2">{row.original.contact || "N/A"}</Typography>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            cell: ({ row }) => (
                <Typography variant="subtitle2">{row.original.email || "N/A"}</Typography>
            ),
        },
        {
            header: "Payment Mode",
            accessorKey: "payment_method",
            cell: ({ row }) => (
                <Typography variant="subtitle2" className="capitalize">{row.original.payment_method || "N/A"}</Typography>
            ),
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography variant="subtitle2">{formatDate(row.original?.created_at || "")}</Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onTrash={() => {
                        setSelectedTransactionId(Number(row.original.id));
                        setOpenTrashConfirmation(true);
                    }}
                    activeTab={activeTab}
                    trashing={removingUser}
                />
            ),
        },
    ], [qp, activeTab, removingUser]);

    return (
        <div className="user__root">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: t("menus.enrollment.root"),
                            icon: (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 2C6.38 2 4.25 4.13 4.25 6.75C4.25 9.32 6.26 11.4 8.88 11.49C8.96 11.48 9.04 11.48 9.1 11.49C9.12 11.49 9.13 11.49 9.15 11.49C9.16 11.49 9.16 11.49 9.17 11.49C11.73 11.4 13.74 9.32 13.75 6.75C13.75 4.13 11.62 2 9 2Z" fill="#1D82F5" />
                                    <path d="M14.08 14.1499C11.29 12.2899 6.73999 12.2899 3.92999 14.1499C2.65999 14.9999 1.95999 16.1499 1.95999 17.3799C1.95999 18.6099 2.65999 19.7499 3.91999 20.5899C5.31999 21.5299 7.15999 21.9999 8.99999 21.9999C10.84 21.9999 12.68 21.5299 14.08 20.5899C15.34 19.7399 16.04 18.5999 16.04 17.3599C16.03 16.1299 15.34 14.9899 14.08 14.1499Z" fill="#1D82F5" />
                                    <path d="M19.99 7.3401C20.15 9.2801 18.77 10.9801 16.86 11.2101C16.85 11.2101 16.85 11.2101 16.84 11.2101H16.81C16.75 11.2101 16.69 11.2101 16.64 11.2301C15.67 11.2801 14.78 10.9701 14.11 10.4001C15.14 9.4801 15.73 8.1001 15.61 6.6001C15.54 5.7901 15.26 5.0501 14.84 4.4201C15.22 4.2301 15.66 4.1101 16.11 4.0701C18.07 3.9001 19.82 5.3601 19.99 7.3401Z" fill="#1D82F5" />
                                    <path d="M21.99 16.5899C21.91 17.5599 21.29 18.3999 20.25 18.9699C19.25 19.5199 17.99 19.7799 16.74 19.7499C17.46 19.0999 17.88 18.2899 17.96 17.4299C18.06 16.1899 17.47 14.9999 16.29 14.0499C15.62 13.5199 14.84 13.0999 13.99 12.7899C16.2 12.1499 18.98 12.5799 20.69 13.9599C21.61 14.6999 22.08 15.6299 21.99 16.5899Z" fill="#1D82F5" />
                                </svg>
                            ),
                        },
                    ]}
                    cta={{ icon: <Add />, label: t("menus.enrollment.create_enrollment") }}
                    handleOpenPopup={() => setOpen(true)}
                />
                <TabController
                    options={[
                        { label: "Active Students", value: "active" },
                        { label: "Archived Students", value: "archived" },
                    ]}
                    setActiveTab={(val: "active" | "archived") => setActiveTab(val)}
                    currentActive={activeTab}
                />
                <TableFilter search={search} setSearch={setSearch} />
            </div>

            {!users.length && !isLoading ? (
                <EmptyRoute
                    title="No Users Found"
                    message="Start adding users to manage enrollments. Use the button above to enroll your first student."
                />
            ) : (
                <Box className="table__wrapper">
                    <CustomTable loading={isLoading} data={users} columns={columns} />
                </Box>
            )}

            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />

            <EnrollStudentToTestForm open={open} setOpen={setOpen} id={id} />

            <ConfirmationDialog
                open={openTrashConfirmation}
                setOpen={setOpenTrashConfirmation}
                title="Archive User"
                description="Are you sure you want to archive this student? This action can be reverted later."
                onSave={() => {
                    if (!selectedTransactionId) return;
                    handleUserRemoval(selectedTransactionId);
                    setOpenTrashConfirmation(false);
                    setSelectedTransactionId(null);
                }}
                icon={(
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                        <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14Z" fill="#1D82F5" />
                    </svg>
                )}
            />
        </div>
    );
}
