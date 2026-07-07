import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useGetAllLinkedDevicesQuery, useLogoutFromLinkedDeviceMutation } from "../../../../services/settingApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { LinkedDeviceProps } from "../../../../types/setting";
import { formatDateTime } from "../../../../utils/dateFormat";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";

export default function LinkedDevices() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 10,
    })
    const { data, isLoading } = useGetAllLinkedDevicesQuery(qp);
    const [logout, { isLoading: loggingOut }] =
        useLogoutFromLinkedDeviceMutation();
    const [loggingOutId, setLoggingOutId] = useState<number | null>(null);
    const handleLogout = async (id: number) => {
        try {
            setLoggingOutId(id);
            await logout({ id }).unwrap();

            dispatch(
                showToast({
                    message: "User logged out successfully",
                    severity: "success",
                })
            );
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to sign out",
                    severity: "error",
                })
            );
        } finally {
            setLoggingOutId(null);
        }
    };

    const columns = useMemo<ColumnDef<LinkedDeviceProps>[]>(
        () => [
            {
                header: "Location & IP",
                accessorKey: "location_ip",
                cell: ({ row }) => (
                    <Stack className="gap-3">
                        <Box>
                            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.44 6H17.55C21.11 6 22 6.89 22 10.44V16.77C22 20.33 21.11 21.21 17.56 21.21H6.44C2.89 21.22 2 20.33 2 16.78V10.44C2 6.89 2.89 6 6.44 6Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 21.2188V25.9988" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2 17H22" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M7.5 26H16.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </Box>
                        <Box>
                            <Typography fontWeight={400} className="capitalize">
                                {row.original.location || "N/A"}
                            </Typography>
                            <Link to={`https://ip2location.com/demo/${row.original.ip}`} target="_blank">
                                <Typography fontWeight={400} variant="subtitle2" color="text.middle" sx={{
                                    "&:hover": {
                                        color: (theme) => theme.palette.primary.main
                                    }
                                }}>
                                    {row.original.ip || "N/A"}
                                </Typography>
                            </Link>
                        </Box>
                    </Stack>
                ),
            },
            {
                header: "OS",
                accessorKey: "os",
                cell: ({ row }) => (
                    <Typography fontWeight={500} className="capitalize">
                        {row.original.os || "N/A"}
                    </Typography>
                ),
            },
            {
                header: "Browser",
                accessorKey: "browser",
                cell: ({ row }) => (
                    <Typography fontWeight={500} className="capitalize">
                        {row.original.browser || "N/A"}
                    </Typography>
                ),
            },
            {
                header: "Last accessed",
                accessorKey: "last_accessed",
                cell: ({ row }) => (
                    <Typography fontWeight={500} className="capitalize">
                        {formatDateTime(row.original.updated_at || "")}
                    </Typography>
                ),
            },
            {
                header: "Action",
                accessorKey: "action",
                cell: ({ row }) => {
                    const isLoggingOut = loggingOutId === row.original.id;

                    return (
                        <Button
                            variant="text"
                            color="error"
                            disabled={isLoggingOut}
                            onClick={() =>
                                handleLogout(Number(row.original.id))
                            }
                        >
                            <Typography className="capitalize">
                                {isLoggingOut ? "Logging out..." : "Sign out"}
                            </Typography>
                        </Button>
                    )
                },
            },
        ],
        [loggingOut]
    );

    return (
        <div className="linked__devices__page__root">
            <Typography variant="h5">
                {t("messages.linked_devices")}
            </Typography>

            <Divider className="mt-4! mb-6!" />

            <CustomTable
                loading={isLoading}
                data={data?.data?.data || []}
                columns={columns}
            />
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
        </div>
    );
}