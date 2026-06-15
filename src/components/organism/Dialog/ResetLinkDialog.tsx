import {
    alpha,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Fade,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { CloseCircle, Copy, TickCircle } from "iconsax-reactjs";
import { useState } from "react";

interface ResetLinkDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    /** Full URL to copy. e.g. https://smart-user.vercel.app/reset-password?token=...&email=... */
    url: string;
    /** Optional — shows the user's email above the URL so admin knows whose link this is. */
    email?: string;
}

export default function ResetLinkDialog({ open, setOpen, url, email }: ResetLinkDialogProps) {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setOpen(false);
        setCopied(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                },
            }}
        >
            {/* Close */}
            <IconButton
                onClick={handleClose}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: theme.palette.text.middle,
                    "&:hover": {
                        bgcolor: alpha(theme.palette.text.middle, 0.1),
                    },
                }}
            >
                <CloseCircle size={20} />
            </IconButton>

            {/* Header */}
            <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                    Password Reset Link
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {email
                        ? `Share this link with ${email} to reset their password.`
                        : "Share this link with the user to reset their password."}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pb: 4, px: 3 }}>
                <Stack spacing={3}>
                    {/* URL Box */}
                    <Box
                        onClick={handleCopy}
                        sx={{
                            position: "relative",
                            bgcolor: theme.palette.gray.gray1,
                            border: `2px solid ${theme.palette.separator.dark}`,
                            borderRadius: 2,
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            "&:hover": {
                                borderColor: theme.palette.primary.main,
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "monospace",
                                color: theme.palette.text.dark,
                                wordBreak: "break-all",
                                userSelect: "all",
                                lineHeight: 1.5,
                            }}
                        >
                            {url}
                        </Typography>

                        {/* Copied Overlay */}
                        <Fade in={copied}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    bgcolor: alpha(theme.palette.success.main, 0.95),
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    gap: 1,
                                }}
                            >
                                <TickCircle size={40} variant="Bold" color="white" />
                                <Typography fontWeight={600} color="white">
                                    Copied!
                                </Typography>
                            </Box>
                        </Fade>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                        The link has also been emailed to the user. Use this only if you need to share it manually.
                    </Typography>

                    {/* Copy Button */}
                    <Button
                        fullWidth
                        size="large"
                        startIcon={
                            copied ? <TickCircle size={20} variant="Bold" /> : <Copy size={20} />
                        }
                        onClick={handleCopy}
                        sx={{
                            bgcolor: copied ? theme.palette.success.main : theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 16,
                            "&:hover": {
                                bgcolor: copied ? theme.palette.success.dark : theme.palette.primary.hover,
                                boxShadow: theme.shadows[8],
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        {copied ? "Copied to Clipboard!" : "Copy Reset Link"}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
