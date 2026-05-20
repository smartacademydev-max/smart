"use client";

import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { CloseCircle, Status } from "iconsax-reactjs";
import { useState } from "react";
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

    const [pdfLoading, setPdfLoading] = useState(false);

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
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "85vh",
                    p: "16px 24px",
                    gap: 1.5,
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center shrink-0">
                    <Typography variant="h6" className="capitalize" fontWeight={"600"}>{mediaName}</Typography>
                    <IconButton
                        color="error"
                        onClick={() => dispatch(closePreviewPdf())}
                    >
                        <CloseCircle variant="Bold" />
                    </IconButton>
                </div>

                {/* PDF viewer — fills remaining height */}
                <Box sx={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: 1 }}>
                    {pdfLoading && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                    {mediaUrl && (
                        <iframe
                            key={mediaUrl}
                            src={mediaUrl}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                display: "block",
                            }}
                            onLoad={() => setPdfLoading(false)}
                            onLoadStart={() => setPdfLoading(true)}
                        />
                    )}
                </Box>

                {/* Footer */}
                <div className="flex gap-2 justify-end shrink-0">
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
                        onClick={handleMediaStatusChange}
                        startIcon={<Status />}
                        sx={{ border: (theme) => `1px solid ${theme.palette.separator.dark}` }}
                    >
                        <Typography variant="subtitle1">Mark Downloadable</Typography>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}