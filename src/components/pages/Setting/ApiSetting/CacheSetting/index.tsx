import { Alert, Box, Button, Divider, Typography } from "@mui/material";
import { useState } from "react";
import ConfirmationDialog from "../../../../../components/organism/ConfirmationDialog";
import { useClearServerCacheMutation } from "../../../../../services/settingApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";

export default function CacheSettingRoot() {
    const dispatch = useAppDispatch();
    const [clearCache, { isLoading }] = useClearServerCacheMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleClear = async () => {
        try {
            const res = await clearCache().unwrap();
            dispatch(showToast({ message: res?.message || "Server cache cleared successfully", severity: "success" }));
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Failed to clear server cache", severity: "error" }));
        } finally {
            setConfirmOpen(false);
        }
    };

    return (
        <div className="app__settings__page__root pb-4 lg:pb-6">
            <Typography variant="h5">Server Cache</Typography>
            <Divider className="mt-4! mb-4!" />

            <Alert severity="info" className="mb-6!">
                Clearing the server cache forces the application to rebuild cached data on the next request. Use this after bulk imports, configuration changes, or when users report stale data.
            </Alert>

            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxWidth: 480,
                }}
            >
                <Typography variant="subtitle1" fontWeight={600}>
                    Clear All Cache
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Removes all cached data from the server. Subsequent requests will be slightly slower as data is rebuilt, but will reflect the latest state.
                </Typography>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => setConfirmOpen(true)}
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                >
                    Clear Cache
                </Button>
            </Box>

            <ConfirmationDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                onSave={handleClear}
                isLoading={isLoading}
                title="Clear Server Cache?"
                description="This will remove all cached data from the server. Are you sure you want to continue?"
            />
        </div>
    );
}
