import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Link,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    ArrowRight,
    CloseCircle,
    ExportSquare,
    InfoCircle,
    Setting2,
    VideoCircle,
} from "iconsax-reactjs";
import type { ReactNode } from "react";

/**
 * External Zoom URLs surfaced from this guide. Kept as named constants so a
 * broken deep-link only has to change here — not across every step.
 *
 * Only stable Zoom pages: the Marketplace root and its Build App entry are
 * long-standing and the developer docs sit under the versioned `docs/` path
 * Zoom has kept consistent. If any of these 404s, prefer widening the link
 * (send the admin to the Marketplace home) over guessing a new URL.
 */
const ZOOM_URLS = {
    marketplaceHome: "https://marketplace.zoom.us/",
    buildApp: "https://marketplace.zoom.us/develop/create",
    manageApps: "https://marketplace.zoom.us/user/build",
    s2sDocs: "https://developers.zoom.us/docs/internal-apps/s2s-oauth/",
    sdkDocs: "https://developers.zoom.us/docs/meeting-sdk/auth/",
};

interface Step {
    /** Which credential this step ultimately fills, so the admin can back-map. */
    fills?: string[];
    title: string;
    body: ReactNode;
    /** Optional deep-link — "Open in Zoom" chip beneath the body. */
    link?: { url: string; label: string };
}

interface Section {
    /** Small-caps eyebrow above the section heading. */
    kicker: string;
    title: string;
    /**
     * ReactNode (not string) so subtitles can carry inline clickable links
     * back to the exact Zoom Marketplace page the admin needs to open.
     */
    subtitle: ReactNode;
    icon: ReactNode;
    tone: "primary" | "success";
    steps: Step[];
}

const SECTIONS: Section[] = [
    {
        kicker: "First app",
        title: "Server-to-Server OAuth",
        subtitle: (
            <>
                Lets the LMS create and manage meetings on the account's behalf.
                Build this app on{" "}
                <Link
                    href={ZOOM_URLS.buildApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 600 }}
                >
                    Zoom Marketplace → Develop → Build App → Server-to-Server OAuth
                </Link>
                . Its App Credentials tab gives you three values — Account ID,
                Client ID, Client Secret — that you paste into the matching
                fields on the Add Zoom Account form (Server App section).
            </>
        ),
        icon: <Setting2 size={18} variant="Bold" />,
        tone: "primary",
        steps: [
            {
                title: "Open the Zoom App Marketplace",
                body: "Sign in with the same Zoom account you want the LMS to host meetings from — usually the studio's admin account, not a personal one.",
                link: { url: ZOOM_URLS.marketplaceHome, label: "Open Zoom Marketplace" },
            },
            {
                title: "Develop → Build App → Server-to-Server OAuth",
                body: "In the top menu pick Develop, then Build App, then choose the Server-to-Server OAuth card. Give it any name (e.g. \"SMART LMS Server\") and create it.",
                link: { url: ZOOM_URLS.buildApp, label: "Go to Build App" },
            },
            {
                fills: ["Account ID", "Client ID", "Client Secret"],
                title: "Copy the three credentials",
                body: "Open the App Credentials tab. Copy Account ID, Client ID, and Client Secret. Paste them into the matching fields on the Add Zoom Account form.",
            },
            {
                title: "Add the scopes the LMS needs",
                body: (
                    <>
                        On the <strong>Scopes</strong> tab, add at least:{" "}
                        <code>meeting:read:admin</code>, <code>meeting:write:admin</code>,{" "}
                        <code>user:read:admin</code>. Missing scopes are the usual reason a
                        meeting fails to create later.
                    </>
                ),
            },
            {
                title: "Activate the app",
                body: "On the Activation tab click Activate your app. Without this the LMS's requests will be rejected as \"unauthorized\".",
                link: { url: ZOOM_URLS.s2sDocs, label: "Server-to-Server docs" },
            },
        ],
    },
    {
        kicker: "Second app",
        title: "Meeting SDK",
        subtitle: (
            <>
                Lets learners join those meetings inside the LMS instead of
                hopping to the Zoom app. Build this second app on the same{" "}
                <Link
                    href={ZOOM_URLS.buildApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 600 }}
                >
                    Marketplace → Develop → Build App → Meeting SDK
                </Link>
                . Its App Credentials tab gives you two values — SDK Key and
                SDK Secret — that you paste into the SDK App section of the
                Add Zoom Account form.
            </>
        ),
        icon: <VideoCircle size={18} variant="Bold" />,
        tone: "success",
        steps: [
            {
                title: "Back to Build App → Meeting SDK",
                body: "Same Marketplace, same Develop → Build App menu, this time pick the Meeting SDK card. Any name works (e.g. \"SMART LMS Player\").",
                link: { url: ZOOM_URLS.buildApp, label: "Go to Build App" },
            },
            {
                fills: ["SDK Key", "SDK Secret"],
                title: "Copy the two credentials",
                body: "Open the App Credentials tab. Copy SDK Key and SDK Secret and paste them into the matching fields on the Add Zoom Account form.",
            },
            {
                title: "Activate the app",
                body: "Same activation step as before. Without it the in-page player refuses to load.",
                link: { url: ZOOM_URLS.sdkDocs, label: "Meeting SDK docs" },
            },
        ],
    },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

/**
 * Step-by-step Zoom credentials setup, opened from the Zoom settings page,
 * the Add-Account dialog, and the Live-Class form. Both apps live in the same
 * Zoom Marketplace so the guide walks them one after the other rather than
 * making the admin switch contexts.
 */
export default function ZoomSetupGuide({ open, onClose }: Props) {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: "hidden",
                    },
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "flex-start", gap: 2, pt: 3, pb: 2 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <VideoCircle size={22} variant="Bold" />
                </Box>
                <Box flex={1}>
                    <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, display: "block", lineHeight: 1 }}>
                        Integration guide
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5, lineHeight: 1.25 }}>
                        Connecting Zoom to the LMS
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Two Zoom apps, six credentials. Ten minutes end to end. Keep this
                        window open on one side and the Zoom Marketplace on the other.
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" aria-label="Close">
                    <CloseCircle size={22} variant="Linear" />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Callout at the top explains why there are two apps — this is
                    the single most common source of confusion during setup. */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.25,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
                        mb: 3,
                    }}
                >
                    <InfoCircle
                        size={18}
                        variant="Bold"
                        color={theme.palette.info.main}
                        style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                        Zoom splits access into two apps on purpose: the{" "}
                        <strong>Server-to-Server OAuth</strong> app is the LMS acting as
                        the host, the <strong>Meeting SDK</strong> app is the learner's
                        browser joining the meeting. Both live in the same Zoom
                        Marketplace, so you can create them back-to-back.
                    </Typography>
                </Box>

                {SECTIONS.map((section, sIdx) => {
                    const toneColor = theme.palette[section.tone].main;
                    return (
                        <Box key={section.title} sx={{ mb: sIdx === SECTIONS.length - 1 ? 0 : 4 }}>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 1.5,
                                        flexShrink: 0,
                                        bgcolor: alpha(toneColor, 0.12),
                                        color: toneColor,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {section.icon}
                                </Box>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: toneColor,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            display: "block",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {section.kicker}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.25, mt: 0.25 }}>
                                        {section.title}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {section.subtitle}
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {section.steps.map((step, i) => (
                                    <Box
                                        key={step.title}
                                        sx={{
                                            display: "flex",
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 1,
                                                flexShrink: 0,
                                                bgcolor: alpha(toneColor, 0.14),
                                                color: toneColor,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {i + 1}
                                        </Box>
                                        <Box flex={1} sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
                                                {step.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5, lineHeight: 1.55 }}
                                            >
                                                {step.body}
                                            </Typography>

                                            {step.fills && step.fills.length > 0 && (
                                                <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "text.secondary",
                                                            alignSelf: "center",
                                                            mr: 0.5,
                                                        }}
                                                    >
                                                        Fills:
                                                    </Typography>
                                                    {step.fills.map((f) => (
                                                        <Chip
                                                            key={f}
                                                            label={f}
                                                            size="small"
                                                            sx={{
                                                                height: 22,
                                                                fontSize: 11,
                                                                fontWeight: 600,
                                                                bgcolor: alpha(toneColor, 0.1),
                                                                color: toneColor,
                                                                border: `1px solid ${alpha(toneColor, 0.24)}`,
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            )}

                                            {step.link && (
                                                <Button
                                                    component={Link}
                                                    href={step.link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={<ExportSquare size={14} />}
                                                    sx={{
                                                        mt: 1.25,
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        borderRadius: 1.5,
                                                        borderColor: alpha(toneColor, 0.4),
                                                        color: toneColor,
                                                        "&:hover": {
                                                            borderColor: toneColor,
                                                            bgcolor: alpha(toneColor, 0.08),
                                                        },
                                                    }}
                                                >
                                                    {step.link.label}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    );
                })}

                <Divider sx={{ my: 3 }} />

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    gap={2}
                >
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Already created the apps?
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Open the "Manage" list on Zoom to copy credentials from an existing app.
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href={ZOOM_URLS.manageApps}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        endIcon={<ArrowRight size={16} />}
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
                    >
                        Open my Zoom apps
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
