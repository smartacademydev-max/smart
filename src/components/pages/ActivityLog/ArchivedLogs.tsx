import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { ArchiveBox } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import {
    useDeleteActivityLogBackupMutation,
    useDownloadActivityLogBackupMutation,
    useGetActivityLogBackupsQuery,
    type BackupFile,
} from "../../../services/activityApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import ActionIconVisible from "../../molecules/Action/ActionIconVisible";
import CustomTable from "../../molecules/Table";
import EmptyRoute from "../../organism/EmptyRoute";
import PageHeader from "../../organism/PageHeader";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ArchivedLogs() {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetActivityLogBackupsQuery();
    const [downloadBackup, { isLoading: downloading }] = useDownloadActivityLogBackupMutation();
    const [deleteBackup, { isLoading: deleting }] = useDeleteActivityLogBackupMutation();
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const handleDownload = async (filename: string) => {
        try {
            const blob = await downloadBackup({ filename }).unwrap();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to download backup", severity: "error" }));
        }
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) return;
        try {
            const res = await deleteBackup({ filename: pendingDelete }).unwrap();
            dispatch(showToast({ message: res.message || "Backup deleted successfully", severity: "success" }));
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to delete backup", severity: "error" }));
        } finally {
            setPendingDelete(null);
        }
    };

    const columns = useMemo<ColumnDef<BackupFile>[]>(() => [
        {
            header: "S.No.",
            accessorKey: "sn",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>{row.index + 1}</Typography>
            ),
        },
        {
            header: "Filename",
            accessorKey: "filename",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={500}>{row.original.filename}</Typography>
            ),
        },
        {
            header: "Size",
            accessorKey: "size_bytes",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400}>{formatBytes(row.original.size_bytes)}</Typography>
            ),
        },
        {
            header: "Last Modified",
            accessorKey: "last_modified",
            cell: ({ row }) => (
                <Typography variant="subtitle2" fontWeight={400} className="text-nowrap">
                    {row.original.last_modified}
                </Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onDownload={() => handleDownload(row.original.filename)}
                    onDelete={() => setPendingDelete(row.original.filename)}
                    deleting={deleting}
                />
            ),
        },
    ], [downloading, deleting]);

    const hasData = data?.data && data.data.length > 0;
    const showEmptyState = !isLoading && !hasData;

    return (
        <div className="archived__logs flex flex-col justify-start h-full overflow-hidden">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: "Archived Logs",
                            icon: <ArchiveBox size={24} color="#1D82F5" />,
                        },
                    ]}
                />
            </div>
            <Box className="table__wrapper h-full overflow-hidden">
                {showEmptyState ? (
                    <EmptyRoute
                        title="No Archived Logs Found"
                        message="There are no backup files available at the moment."
                    />
                ) : (
                    <CustomTable
                        data={data?.data || []}
                        loading={isLoading}
                        columns={columns}
                        maxHeight="calc(100% - 200px)"
                    />
                )}
            </Box>

            <Dialog
                open={!!pendingDelete}
                onClose={() => setPendingDelete(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Backup</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{" "}
                        <strong>{pendingDelete}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setPendingDelete(null)}
                        sx={{
                            background: (theme) => theme.palette.separator.dark,
                            color: (theme) => theme.palette.text.middle,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
