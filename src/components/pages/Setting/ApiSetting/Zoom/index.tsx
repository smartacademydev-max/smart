import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    InputLabel,
    Link,
    OutlinedInput,
    Switch,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { Add, InfoCircle } from "iconsax-reactjs";
import { useState } from "react";
import {
    useCreateZoomAccountMutation,
    useDeleteZoomAccountMutation,
    useGetZoomAccountsQuery,
    useToggleZoomAccountMutation,
    useUpdateZoomAccountMutation,
} from "../../../../../services/settingApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import type { Theme } from "@mui/material/styles";
import type { ZoomAccount } from "../../../../../types/setting";
import Password from "../../../../atoms/Password";
import ActionIconVisible from "../../../../molecules/Action/ActionIconVisible";
import ZoomSetupGuide from "../../../../organism/ZoomSetupGuide";

function ZoomAccountDialog({ open, account, onClose }: { open: boolean; account: ZoomAccount | null; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [createAccount, { isLoading: creating }] = useCreateZoomAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateZoomAccountMutation();
    const [guideOpen, setGuideOpen] = useState(false);

    const isEdit = !!account;
    const isLoading = creating || updating;

    const formik = useFormik({
        initialValues: {
            email: account?.email ?? "",
            account_id: account?.account_id ?? "",
            client_id: account?.client_id ?? "",
            client_secret: account?.client_secret ?? "",
            sdk_key: account?.sdk_key ?? "",
            sdk_secret: account?.sdk_secret ?? "",
        },
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (isEdit) {
                    const requiredFields = ["email", "account_id", "client_id", "sdk_key"] as const;
                    const missing = requiredFields.filter((k) => !values[k]);
                    if (missing.length) {
                        dispatch(showToast({ message: "All fields are required", severity: "error" }));
                        return;
                    }
                    const payload: Parameters<typeof updateAccount>[0] = { id: account.id };
                    payload.name = values.email;
                    payload.email = values.email;
                    payload.account_id = values.account_id;
                    payload.client_id = values.client_id;
                    payload.sdk_key = values.sdk_key;
                    if (values.client_secret) payload.client_secret = values.client_secret;
                    if (values.sdk_secret) payload.sdk_secret = values.sdk_secret;
                    const res = await updateAccount(payload).unwrap();
                    dispatch(showToast({ message: res?.message || "Zoom account updated", severity: "success" }));
                } else {
                    const required = ["email", "account_id", "client_id", "client_secret", "sdk_key", "sdk_secret"] as const;
                    const missing = required.filter((k) => !values[k]);
                    if (missing.length) {
                        dispatch(showToast({ message: "All fields are required", severity: "error" }));
                        return;
                    }
                    const res = await createAccount({
                        name: values.email,
                        email: values.email,
                        account_id: values.account_id,
                        client_id: values.client_id,
                        client_secret: values.client_secret,
                        sdk_key: values.sdk_key,
                        sdk_secret: values.sdk_secret,
                    }).unwrap();
                    dispatch(showToast({ message: res?.message || "Zoom account added", severity: "success" }));
                }
                resetForm();
                onClose();
            } catch (e: any) {
                dispatch(showToast({ message: e?.data?.message || "Failed to save Zoom account", severity: "error" }));
            }
        },
    });

    const handleClose = () => { formik.resetForm(); onClose(); };

    const secretHint = isEdit ? <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 4 }}>(blank = keep existing)</span> : null;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" scroll="paper">
            <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <DialogTitle>{isEdit ? "Edit Zoom Account" : "Add Zoom Account"}</DialogTitle>
                <Divider />
                <DialogContent dividers className="flex flex-col gap-5!" sx={{ overflowY: "auto" }}>

                    {/* Guide CTA - placed at the top of the form because
                        setup is the hard part, not the paste. Reading order:
                        "here is help" then "now fill this in". */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: (theme: Theme) => theme.palette.primary.light,
                            border: (theme: Theme) => `1px solid ${theme.palette.primary.main}`,
                        }}
                    >
                        <InfoCircle size={18} variant="Bold" color="currentColor" style={{ color: "inherit", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ flex: 1, color: "primary.main", fontWeight: 500 }}>
                            First time? Zoom needs <strong>two apps</strong> configured — we walk you through both.
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            onClick={() => setGuideOpen(true)}
                            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5, flexShrink: 0 }}
                        >
                            Open setup guide
                        </Button>
                    </Box>

                    <ZoomSetupGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

                    <div>
                        <InputLabel className="required">Zoom Account Email</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            placeholder="host@example.com"
                        />
                    </div>

                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} className="uppercase tracking-wide">
                            Server App — Create &amp; Host Meetings
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}>
                            Copy from{" "}
                            <Link
                                href="https://marketplace.zoom.us/develop/create"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 600 }}
                            >
                                Zoom Marketplace → Develop → Build App → Server-to-Server OAuth
                            </Link>{" "}
                            → <strong>App Credentials</strong> tab.
                        </Typography>
                        <div className="grid grid-cols-1 gap-4 mt-3">
                            <div>
                                <InputLabel className="required">Account ID</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="account_id"
                                    value={formik.values.account_id}
                                    onChange={formik.handleChange}
                                    placeholder="Zoom Account ID"
                                />
                            </div>
                            <div>
                                <InputLabel className="required">Client ID</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="client_id"
                                    value={formik.values.client_id}
                                    onChange={formik.handleChange}
                                    placeholder="OAuth Client ID"
                                />
                            </div>
                            <div>
                                <InputLabel className="required">Client Secret {secretHint}</InputLabel>
                                <Password
                                    name="client_secret"
                                    value={formik.values.client_secret}
                                    onChange={formik.handleChange}
                                    placeholder={isEdit ? "Enter new Client Secret to replace" : "OAuth Client Secret"}
                                />
                            </div>
                        </div>
                    </Box>

                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} className="uppercase tracking-wide">
                            SDK App — Public Join
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}>
                            Copy from{" "}
                            <Link
                                href="https://marketplace.zoom.us/develop/create"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 600 }}
                            >
                                Zoom Marketplace → Develop → Build App → Meeting SDK
                            </Link>{" "}
                            → <strong>App Credentials</strong> tab.
                        </Typography>
                        <div className="grid grid-cols-1 gap-4 mt-3">
                            <div>
                                <InputLabel className="required">SDK Key</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="sdk_key"
                                    value={formik.values.sdk_key}
                                    onChange={formik.handleChange}
                                    placeholder="Meeting SDK Key"
                                />
                            </div>
                            <div>
                                <InputLabel className="required">SDK Secret {secretHint}</InputLabel>
                                <Password
                                    name="sdk_secret"
                                    value={formik.values.sdk_secret}
                                    onChange={formik.handleChange}
                                    placeholder={isEdit ? "Enter new SDK Secret to replace" : "Meeting SDK Secret"}
                                />
                            </div>
                        </div>
                    </Box>

                </DialogContent>
                <Divider />
                <DialogActions className="px-6! py-3!">
                    <Button onClick={handleClose} variant="outlined" disabled={isLoading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? "Saving..." : isEdit ? "Update" : "Add Account"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default function ZoomSettingRoot() {
    const dispatch = useAppDispatch();
    const { data } = useGetZoomAccountsQuery();
    const [toggleAccount] = useToggleZoomAccountMutation();
    const [deleteAccount, { isLoading: deleting }] = useDeleteZoomAccountMutation();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ZoomAccount | null>(null);
    const [guideOpen, setGuideOpen] = useState(false);

    const accounts = data?.data ?? [];

    const handleToggle = async (account: ZoomAccount) => {
        try {
            await toggleAccount(account.id).unwrap();
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Failed to update account status", severity: "error" }));
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await deleteAccount(id).unwrap();
            dispatch(showToast({ message: res?.message || "Zoom account removed", severity: "success" }));
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Failed to remove account", severity: "error" }));
        }
    };

    const openAdd = () => { setEditTarget(null); setDialogOpen(true); };
    const openEdit = (account: ZoomAccount) => { setEditTarget(account); setDialogOpen(true); };

    return (
        <div className="app__settings__page__root pb-4 lg:pb-6 flex flex-col h-full">
            <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                <Typography variant="h5">Zoom Accounts</Typography>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<InfoCircle size={16} variant="Bold" />}
                        onClick={() => setGuideOpen(true)}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Setup guide
                    </Button>
                    <Button variant="contained" startIcon={<Add size={18} />} onClick={openAdd}>
                        Add Account
                    </Button>
                </div>
            </div>
            <Divider className="mt-4! mb-4!" />

            <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                {accounts.length === 0 ? (
                    <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary" variant="body2">
                            No Zoom accounts configured. Add one to get started.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            First time setting up Zoom?{" "}
                            <Link
                                component="button"
                                onClick={() => setGuideOpen(true)}
                                sx={{ fontWeight: 600 }}
                            >
                                Open the step-by-step guide
                            </Link>
                            .
                        </Typography>
                    </Box>
                ) : (
                    <div className="flex flex-col gap-3">
                        {accounts.map((account) => (
                            <Box
                                key={account.id}
                                sx={{
                                    border: "1px solid",
                                    borderColor: account.is_active ? "primary.main" : "divider",
                                    borderRadius: 2,
                                    px: 3,
                                    py: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Box flex={1}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Typography variant="subtitle2" fontWeight={500}>
                                            {account.email}
                                        </Typography>
                                        <Chip
                                            label={account.is_active ? "Active" : "Inactive"}
                                            size="small"
                                            color={account.is_active ? "success" : "default"}
                                            variant="outlined"
                                        />
                                    </div>
                                    <Typography variant="caption" color="text.secondary">
                                        Account ID: {account.account_id} &nbsp;·&nbsp; SDK Key: {account.sdk_key}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={account.is_active}
                                    onChange={() => handleToggle(account)}
                                    size="small"
                                />
                                <ActionIconVisible
                                    onEdit={() => openEdit(account)}
                                    onDelete={() => handleDelete(account.id)}
                                    deleting={deleting}
                                />
                            </Box>
                        ))}
                    </div>
                )}
            </Box>

            <ZoomAccountDialog
                open={dialogOpen}
                account={editTarget}
                onClose={() => setDialogOpen(false)}
            />

            <ZoomSetupGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
        </div>
    );
}
