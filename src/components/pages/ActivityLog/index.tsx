import { Box, Button, Checkbox, Dialog, DialogContent, Divider, FormControlLabel, Tooltip, Typography } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useDownloadCsvMutation, useGetAllActivityQuery } from '../../../services/activityApi';
import { showToast } from '../../../slice/toastSlice';
import { useAppDispatch } from '../../../store/hook';
import { DeviceFilter, StatusFilter, type DeviceType, type Status } from '../../../types';
import { ActivityTypes, type ActivityProps, type ActivityType } from '../../../types/activity';
import SortableHeader from '../../molecules/SortableHeader';
import CustomTable from '../../molecules/Table';
import TablePagination from '../../molecules/Table/Pagination';
import EmptyRoute from '../../organism/EmptyRoute';
import PageHeader from '../../organism/PageHeader';
import TableFilter from '../../organism/TableFilter';

export default function ActivityRoot() {
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 20,
    });
    const [customRange, setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [sortBy, setSortBy] = useState<"asc" | "desc" | "">("");

    const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
    const [appliedActivityTypes, setAppliedActivityTypes] = useState<string[]>([]);
    const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType[]>([]);
    const [appliedDeviceType, setAppliedDeviceType] = useState<DeviceType[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<Status[]>([]);
    const [appliedStatus, setAppliedStatus] = useState<Status[]>([]);
    const [days, setDays] = useState<number | null>(null);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const { data, isLoading } = useGetAllActivityQuery({
        ...qp, search,
        ...customRange,
        days,
        type: appliedActivityTypes.join(",") as ActivityType,
        device_type: appliedDeviceType.join(",") as DeviceType,
        status: appliedStatus.join(",") as Status,
        sort_by: sortBy,
    });

    const [downloadActivity, { isLoading: downloading }] = useDownloadCsvMutation();


    const formatToNepalTime = (timestamp: string): string => {
        if (!timestamp) return "N/A";

        try {
            const date = new Date(timestamp);

            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }

            return new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kathmandu',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid Date";
        }
    };

    const columns = useMemo<ColumnDef<ActivityProps>[]>(() => [
        {
            header: "S.No.",
            accessorKey: "sn",
            cell: ({ row }) => (
                <Typography variant='subtitle2'>
                    {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}
                </Typography>
            )
        },
        {
            header: "Log",
            accessorKey: "log",
            cell: ({ row }) => (
                <Tooltip title={row.original.log} arrow>
                    <Typography className='line-clamp-1' variant='subtitle2'>{row.original.log || "N/A"}</Typography>
                </Tooltip>
            ),
        },
        {
            header: "Device",
            accessorKey: "device_type",
            cell: ({ row }) => (
                <Typography className='line-clamp-1'>{row.original.device_type || "N/A"}</Typography>
            ),
        },
        {
            header: "Username",
            accessorKey: "username",
            cell: ({ row }) => (
                <Typography variant='subtitle2'>{row.original.username || "N/A"}</Typography>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            cell: ({ row }) => (
                <Typography variant='subtitle2'>{row.original.email || "N/A"}</Typography>
            ),
        },
        {
            header: "Phone",
            accessorKey: "phone",
            cell: ({ row }) => (
                <Typography variant='subtitle2'>{row.original.phone || "N/A"}</Typography>
            ),
        },
        {
            header: "Type",
            accessorKey: "type",
            cell: ({ row }) => (
                <Typography variant='subtitle2'>{row.original.type || "N/A"}</Typography>
            ),
        },
        {
            header: ({ column }) => <SortableHeader
                column={column}
                label="Date"
                onSortChange={(order: "asc" | "desc") => {
                    setSortBy(order);
                    setQp((prev) => ({ ...prev, pageIndex: 1 }));
                }}
            />,
            accessorKey: "date",
            cell: ({ row }) => (
                <Typography variant='subtitle2' className='text-nowrap'>{formatToNepalTime(row.original.timestamp) || "N/A"}</Typography>
            ),
        },
    ], [qp]);

    const hasData = data?.data?.data && data.data.data.length > 0;
    const showEmptyState = !isLoading && !hasData;


    const handleActivityTypeChange = (type: string, checked: boolean) => {
        setSelectedActivityTypes((prev) =>
            checked ? [...prev, type] : prev.filter((t) => t !== type)
        );
    };
    const handleStatusChange = (type: Status, checked: boolean) => {
        setSelectedStatus((prev) =>
            checked ? [...prev, type] : prev.filter((t) => t !== type)
        );
    };
    const handleDeviceChange = (type: DeviceType, checked: boolean) => {
        setSelectedDeviceType((prev) =>
            checked ? [...prev, type] : prev.filter((t) => t !== type)
        );
    };

    const handleApplyFilter = () => {
        setAppliedActivityTypes(selectedActivityTypes);
        setAppliedDeviceType(selectedDeviceType);
        setAppliedStatus(selectedStatus);

        setQp((prev) => ({ ...prev, pageIndex: 1 }));
        setFilterDialogOpen(false);
    };

    const handleResetFilter = () => {
        setSelectedActivityTypes([]);
        setAppliedActivityTypes([]);

        setSelectedDeviceType([]);
        setAppliedDeviceType([]);

        setSelectedStatus([]);
        setAppliedStatus([]);

        setCustomRange({ startDate: "", endDate: "" });
        setSearch("");
        setDays(null);
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
        setFilterDialogOpen(false);
    };

    const handleDownload = async () => {
        try {
            const blob = await downloadActivity({ type: "activity_logs" }).unwrap();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = "activity_logs.csv";
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
        <div className='activity__root flex flex-col justify-start h-full overflow-hidden'>
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: "Activity Log",
                            icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM20 18c1.26-1.67 2-3.75 2-6s-.74-4.33-2-6M4 6c-1.26 1.67-2 3.75-2 6s.74 4.33 2 6M16.8 15.6c.75-1 1.2-2.25 1.2-3.6s-.45-2.6-1.2-3.6M7.2 8.4C6.45 9.4 6 10.65 6 12s.45 2.6 1.2 3.6" stroke="#1D82F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>)
                        }
                    ]}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={new Set<number | string>([])}
                    handleRoleDelete={() => { }}
                    onFilter={() => setFilterDialogOpen(true)}
                    customRange={customRange}
                    setCustomRange={setCustomRange}
                    setDays={setDays}
                    handleResetFilter={handleResetFilter}
                    onDownload={handleDownload}
                    donwloading={downloading}
                />
            </div>
            <Box className="table__wrapper h-full overflow-hidden">
                {showEmptyState ? (
                    <EmptyRoute
                        title="No Activity Found"
                        message="There are currently no logs available for this transaction. Please check back later or verify the transaction process."
                    />
                ) : (
                    <CustomTable
                        data={data?.data?.data || []}
                        loading={isLoading}
                        columns={columns}
                        maxHeight='calc(100% - 400px)'
                    />
                )}
            </Box>
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
            <Dialog open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                maxWidth="lg"
                fullWidth>
                <DialogContent>
                    <div className="filter__wrapper flex flex-col gap-6">
                        <div className="category__filter">
                            <Typography variant="h5">Filter</Typography>
                            <Divider />

                            {DeviceFilter.length > 0 && (
                                <div className="type__filter w-full pt-4 pb-4">
                                    <Typography variant="h6">Device Type</Typography>
                                    <Divider className="mb-3.5! mt-2!" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {DeviceFilter.map((type) => (
                                            <FormControlLabel
                                                className='items-center!'
                                                key={type.value}
                                                label={type.label}
                                                control={
                                                    <Checkbox
                                                        checked={selectedDeviceType.includes(type.value as DeviceType)}
                                                        onChange={(e) =>
                                                            handleDeviceChange(type.value as DeviceType, e.target.checked)
                                                        }

                                                    />
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {StatusFilter.length > 0 && (
                                <div className="type__filter w-full pt-4 pb-4">
                                    <Typography variant="h6">Status</Typography>
                                    <Divider className="mb-3.5! mt-2!" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {StatusFilter.map((status) => (
                                            <FormControlLabel
                                                key={status.value}
                                                label={status.label}
                                                control={
                                                    <Checkbox
                                                        checked={selectedStatus.includes(status.value as Status)}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                status.value as Status,
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}


                            {ActivityTypes.length > 0 && (
                                <div className="type__filter w-full pt-4 pb-4">
                                    <Typography variant="h6">Activity Type</Typography>
                                    <Divider className="mb-3.5! mt-2!" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {ActivityTypes.map((type) => (
                                            <FormControlLabel
                                                className='items-center!'
                                                key={type}
                                                label={<Typography className='capitalize!' color='text.middle'>{type}</Typography>}
                                                control={
                                                    <Checkbox
                                                        checked={selectedActivityTypes.includes(type)}
                                                        onChange={(e) =>
                                                            handleActivityTypeChange(type, e.target.checked)
                                                        }
                                                    />
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Divider />

                            {/* Action Footer */}
                            <div className="action__footer flex justify-end items-center gap-2 mt-4 lg:mt-6">
                                <Button onClick={handleResetFilter} className="font-medium!"
                                    sx={{
                                        background: (theme) => theme.palette.separator.dark,
                                        color: (theme) => theme.palette.text.middle
                                    }}>
                                    {appliedActivityTypes ? "Reset & Close Filter" : "Cancel"}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleApplyFilter}
                                    className="font-medium!"
                                >
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}