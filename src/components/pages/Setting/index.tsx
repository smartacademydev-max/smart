import { ChevronLeft, ExpandLess, ExpandMore, MenuRounded } from "@mui/icons-material";
import {
    Box, Collapse, Drawer, IconButton, Typography,
    useMediaQuery, useTheme,
} from "@mui/material";
import {
    Book1,
    Card,
    Category, Devices, DirectboxNotif, Global,
    Lock, LoginCurve, MessageText1, Mobile, Profile, Setting2,
    Video, Wallet, Gift, ToggleOff,
} from "iconsax-reactjs";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import PageHeader from "../../organism/PageHeader";

const MENU_GROUPS = [
    {
        label: "General",
        key: "general",
        icon: Setting2,
        matchPrefix: PATH.SETTINGS.SYSTEM.ROOT,
        items: [
            { label: "Profile", url: PATH.SETTINGS.SYSTEM.PROFILE.ROOT, icon: Profile },
            { label: "Change Password", url: PATH.SETTINGS.SYSTEM.CHANGE_PASSWORD.ROOT, icon: Lock },
            { label: "Site Info", url: PATH.SETTINGS.SYSTEM.SITE_INFO.ROOT, icon: Global },
            { label: "SMTP", url: PATH.SETTINGS.SYSTEM.SMTP.ROOT, icon: DirectboxNotif },
            { label: "General", url: PATH.SETTINGS.SYSTEM.GENERAL.ROOT, icon: Setting2 },
            { label: "Linked Devices", url: PATH.SETTINGS.SYSTEM.LINKED_DEVICE.ROOT, icon: Devices },
            { label: "Email Templates", url: PATH.SETTINGS.SYSTEM.EMAIL_TEMPLATES.ROOT, icon: MessageText1 },
            { label: "Course Setting", url: PATH.SETTINGS.SYSTEM.COURSE_SETTING.ROOT, icon: Book1 },
            { label: "Login Type", url: PATH.SETTINGS.SYSTEM.LOGIN_TYPE.ROOT, icon: LoginCurve },
            { label: "Referral & Points", url: PATH.SETTINGS.SYSTEM.REFERRAL_CONFIG.ROOT, icon: Gift },
            { label: "Controls", url: PATH.SETTINGS.CONTROLS.ROOT, icon: ToggleOff },
        ],
    },
    {
        label: "API Settings",
        key: "api",
        icon: Category,
        matchPrefix: PATH.SETTINGS.API.ROOT,
        items: [
            { label: "Zoom Account", url: PATH.SETTINGS.API.ZOOM.ROOT, icon: Video },
            { label: "eSewa Payment", url: PATH.SETTINGS.API.ESEWA.ROOT, icon: Wallet },
            { label: "Khalti Payment", url: PATH.SETTINGS.API.KHALTI.ROOT, icon: Card },
            { label: "SMS Gateway", url: PATH.SETTINGS.API.SMS_GATEWAY.ROOT, icon: Mobile },
        ],
    },
];

export default function SettingRoot() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        general: true,
        api: false,
    });

    useEffect(() => {
        if (location.pathname.startsWith(PATH.SETTINGS.API.ROOT)) {
            setOpenGroups({ general: false, api: true });
        } else {
            setOpenGroups({ general: true, api: false });
        }
    }, []);

    const allItems = MENU_GROUPS.flatMap((g) => g.items);
    const activeItem = allItems.find((item) => location.pathname.startsWith(item.url));

    const toggleGroup = (key: string) =>
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleNavItem = (url: string) => {
        navigate(url);
        setMobileOpen(false);
    };

    const MenuNav = (
        <Box
            sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 1,
                width: 236,
                minWidth: 236,
                height: "fit-content",
            }}
        >
            {MENU_GROUPS.map((group, gi) => {
                const GroupIcon = group.icon;
                const isOpen = openGroups[group.key] ?? false;

                return (
                    <React.Fragment key={group.key}>
                        <Box
                            onClick={() => toggleGroup(group.key)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.5,
                                py: 0.875,
                                cursor: "pointer",
                                borderRadius: 0.5,
                                userSelect: "none",
                                "&:hover": { bgcolor: "action.hover" },
                            }}
                        >
                            <GroupIcon
                                size={15}
                                color={theme.palette.text.dark}
                                variant="Linear"
                            />
                            <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{
                                    flex: 1,
                                    color: "text.dark",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.07em",
                                    lineHeight: 1,
                                }}
                            >
                                {group.label}
                            </Typography>
                            {isOpen
                                ? <ExpandLess sx={{ fontSize: 15, color: "text.dark" }} />
                                : <ExpandMore sx={{ fontSize: 15, color: "text.dark" }} />
                            }
                        </Box>

                        <Collapse in={isOpen} timeout="auto">
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.url);
                                    const Icon = item.icon;
                                    return (
                                        <Box
                                            key={item.url}
                                            onClick={() => handleNavItem(item.url)}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                px: 1.5,
                                                py: 0.875,
                                                cursor: "pointer",
                                                borderRadius: 0.5,
                                                bgcolor: isActive ? "primary.main" : "transparent",
                                                color: isActive ? "primary.contrastText" : "text.middle",
                                                transition: "background-color 0.13s, color 0.13s",
                                                "&:hover": {
                                                    bgcolor: isActive ? "primary.main" : "action.hover",
                                                },
                                            }}
                                        >
                                            <Icon
                                                size={16}
                                                color={
                                                    isActive
                                                        ? theme.palette.primary.contrastText
                                                        : theme.palette.text.secondary
                                                }
                                                variant="Linear"
                                            />
                                            <Typography
                                                variant="body2"
                                                fontWeight={isActive ? 500 : 400}
                                                sx={{ color: "inherit", lineHeight: 1.4 }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </div>
                        </Collapse>

                        {gi < MENU_GROUPS.length - 1 && (
                            <Box sx={{ my: 1, height: "1px", bgcolor: "divider" }} />
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );

    return (
        <div className="setting__root flex flex-col h-full">
            <PageHeader
                breadcrumb={[
                    {
                        title: "Settings",
                        icon: <Setting2 color={theme.palette.primary.main} />,
                        url: PATH.SETTINGS.SYSTEM.PROFILE.ROOT,
                    },
                    ...(activeItem ? [{ title: activeItem.label }] : []),
                ]}
            />

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Desktop: permanent sidebar */}
                {!isMobile && (
                    <div className="shrink-0 overflow-y-auto" style={{ maxHeight: "100%" }}>
                        {MenuNav}
                    </div>
                )}

                {/* Mobile drawer */}
                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    variant="temporary"
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": { width: 268, p: 2 },
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <Typography variant="h6" fontWeight={600}>
                            Settings
                        </Typography>
                        <IconButton size="small" onClick={() => setMobileOpen(false)}>
                            <ChevronLeft />
                        </IconButton>
                    </div>
                    {MenuNav}
                </Drawer>

                {/* Content */}
                <div className="flex-1 overflow-auto min-w-0">
                    {/* Mobile menu trigger */}
                    {isMobile && (
                        <Box
                            onClick={() => setMobileOpen(true)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.5,
                                py: 1.25,
                                mb: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" },
                            }}
                        >
                            <MenuRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
                                {activeItem?.label ?? "Settings"}
                            </Typography>
                            <ExpandMore sx={{ fontSize: 18, color: "text.disabled" }} />
                        </Box>
                    )}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
