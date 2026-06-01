import { CheckCircle, CloudUpload, Description, ErrorOutline } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useGetAllRolesQuery } from "../../../../services/roleAndPermissionApi";
import {
    useImportUsersMutation,
    useLazyGetUserImportTemplateQuery,
    type UserImportResult,
} from "../../../../services/userApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";

interface Props {
    open: boolean;
    onClose: () => void;
}

const ACCEPTED = {
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".csv", ".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

export default function ImportUsersDialog({ open, onClose }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const [file, setFile] = useState<File | null>(null);
    const [defaultRoleId, setDefaultRoleId] = useState<number | "">("");
    const [sendResetLink, setSendResetLink] = useState(true);
    const [result, setResult] = useState<UserImportResult | null>(null);

    const { data: roles } = useGetAllRolesQuery({ pageIndex: 1, pageSize: 100 });
    const [fetchTemplate, { isFetching: templateLoading }] = useLazyGetUserImportTemplateQuery();
    const [importUsers, { isLoading: importing }] = useImportUsersMutation();

    const roleList = roles?.data?.data ?? [];

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: ACCEPTED,
        multiple: false,
        onDrop: (accepted) => accepted[0] && setFile(accepted[0]),
    });

    const reset = () => {
        setFile(null);
        setDefaultRoleId("");
        setSendResetLink(true);
        setResult(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleDownloadTemplate = async () => {
        try {
            const csv = await fetchTemplate().unwrap();
            const blob = new Blob([csv.data], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "user-import-template.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            dispatch(showToast({ message: "Unable to download template", severity: "error" }));
        }
    };

    const handleImport = async () => {
        if (!file) {
            dispatch(showToast({ message: "Please select a file to import", severity: "error" }));
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        if (defaultRoleId !== "") formData.append("default_role_id", String(defaultRoleId));
        formData.append("send_reset_link", sendResetLink ? "1" : "0");
        try {
            const res = await importUsers(formData).unwrap();
            setResult(res.data);
            dispatch(showToast({ message: res.message || "Users imported", severity: "success" }));
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to import users",
                    severity: "error",
                })
            );
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Import Users</DialogTitle>
            <DialogContent dividers>
                {result ? (
                    <Box className="flex flex-col gap-3">
                        <Alert
                            icon={<CheckCircle fontSize="inherit" />}
                            severity={result.errors.length ? "warning" : "success"}
                        >
                            {result.created} of {result.total} users imported successfully
                            {result.skipped ? `, ${result.skipped} skipped` : ""}.
                        </Alert>
                        <Box className="grid grid-cols-3 gap-2">
                            {[
                                { label: "Created", value: result.created },
                                { label: "Skipped", value: result.skipped },
                                { label: "Reset Links Sent", value: result.reset_links_sent },
                            ].map((stat) => (
                                <Box
                                    key={stat.label}
                                    sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2,
                                        p: 1.5,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="h5" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        {result.errors.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} className="mb-1!">
                                    Skipped rows
                                </Typography>
                                {result.errors.map((err) => (
                                    <Box
                                        key={err.row}
                                        className="flex items-center gap-1"
                                        sx={{ color: "warning.main" }}
                                    >
                                        <ErrorOutline fontSize="small" />
                                        <Typography variant="body2">
                                            Row {err.row}: {err.message}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box className="flex flex-col gap-4">
                        <Typography variant="body2" color="text.secondary">
                            Upload a CSV or Excel file of users. Each row needs basic info
                            (name, email, phone) and a role. New users receive a password
                            reset link by email.{" "}
                            <Link
                                component="button"
                                type="button"
                                onClick={handleDownloadTemplate}
                                disabled={templateLoading}
                            >
                                {templateLoading ? "Preparing..." : "Download import template"}
                            </Link>
                        </Typography>

                        <Box
                            {...getRootProps()}
                            sx={{
                                border: `1.5px dashed ${
                                    isDragActive ? theme.palette.primary.main : theme.palette.divider
                                }`,
                                borderRadius: 2,
                                p: 3,
                                textAlign: "center",
                                cursor: "pointer",
                                bgcolor: isDragActive ? "action.hover" : "transparent",
                            }}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <Box className="flex items-center justify-center gap-2">
                                    <Description color="primary" />
                                    <Typography variant="body2">{file.name}</Typography>
                                </Box>
                            ) : (
                                <Box className="flex flex-col items-center gap-1">
                                    <CloudUpload sx={{ color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Drag &amp; drop a file here, or click to browse
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Accepted formats: .csv, .xlsx
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <InputLabel sx={{ fontSize: 13 }}>
                                Default Role (applied to rows without a role)
                            </InputLabel>
                            <Select
                                fullWidth
                                size="small"
                                displayEmpty
                                value={defaultRoleId}
                                onChange={(e) => {
                                    const value = e.target.value as number | "";
                                    setDefaultRoleId(value === "" ? "" : Number(value));
                                }}
                            >
                                <MenuItem value="">
                                    <em>Use role from file only</em>
                                </MenuItem>
                                {roleList.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={sendResetLink}
                                    onChange={(e) => setSendResetLink(e.target.checked)}
                                />
                            }
                            label="Send password-reset link via email after import"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {result ? (
                    <Button variant="contained" onClick={handleClose}>
                        Done
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={importing || !file}
                        >
                            {importing ? "Importing..." : "Import Users"}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
