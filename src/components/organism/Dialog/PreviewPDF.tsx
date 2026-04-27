"use client";

import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { CloseCircle, Status } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUseChangeMediaStatusMutation } from "../../../services/mediaApi";
import { closePreviewPdf } from "../../../slice/previewPdfSlice";
import { showToast } from "../../../slice/toastSlice";
import type { RootState } from "../../../store/store";

export default function PreviewPDF() {
    const dispatch = useDispatch();
    const { open, mediaUrl, mediaName, mediaId } = useSelector(
        (state: RootState) => state.previewPdf
    );

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);

    useEffect(() => {
        if (!mediaUrl || !open) {
            setBlobUrl(null);
            setPdfError(false);
            return;
        }

        let objectUrl: string | null = null;
        setPdfLoading(true);
        setPdfError(false);
        setBlobUrl(null);

        fetch(mediaUrl)
            .then(res => {
                if (!res.ok) throw new Error("Fetch failed");
                return res.blob();
            })
            .then(blob => {
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch(() => setPdfError(true))
            .finally(() => setPdfLoading(false));

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [mediaUrl, open]);

    const [changeStatus] = useUseChangeMediaStatusMutation();

    const handleMediaStatusChange = async () => {
        try {
            const response = await changeStatus({
                media_ids: [Number(mediaId)]
            }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || "Media Availabe For Download Successfully",
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to mark media for Download",
                    severity: "error"
                })
            )
        }
    }


    return (
        <Dialog
            open={open}
            onClose={() => dispatch(closePreviewPdf())}
            maxWidth="lg"
            fullWidth
        >
            <DialogContent sx={{ position: "relative", height: "80vh" }}>
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="capitalize" fontWeight={"600"}>{mediaName}</Typography>
                    <IconButton
                        color="error"
                        onClick={() => dispatch(closePreviewPdf())}
                    >
                        <CloseCircle variant="Bold" />
                    </IconButton>
                </div>

                {pdfLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="calc(100% - 120px)">
                        <CircularProgress />
                    </Box>
                )}

                {pdfError && (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="calc(100% - 120px)" gap={2}>
                        <Typography color="text.secondary">Unable to load PDF preview.</Typography>
                        {mediaUrl && (
                            <Button variant="outlined" onClick={() => window.open(mediaUrl, "_blank")}>
                                Open in new tab
                            </Button>
                        )}
                    </Box>
                )}

                {blobUrl && (
                    <iframe
                        src={blobUrl}
                        width="100%"
                        height="calc(100% - 100px)"
                        style={{ border: "none" }}
                    />
                )}

                <div className="text-end mt-4 flex gap-2 justify-end">
                    <Button
                        sx={{
                            background: (theme) => theme.palette.separator.dark,
                            color: (theme) => theme.palette.text.middle,
                        }}
                        variant="contained"
                        onClick={() => dispatch(closePreviewPdf())}
                    >
                        <Typography variant="subtitle1" color="text.dark">Cancel</Typography>
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!mediaId}
                        onClick={handleMediaStatusChange} startIcon={<Status />} sx={{
                            border: (theme) => `1px solid ${theme.palette.separator.dark}`
                        }}
                    >
                        <Typography variant="subtitle1" >{"Mark Downloadable"}</Typography>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}