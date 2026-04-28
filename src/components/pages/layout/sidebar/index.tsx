import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import * as React from "react";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import { Link, useLocation } from "react-router-dom";
import { useBrandSettings } from "../../../../hooks/useBrandSettings";
import CustomAppbar from "../appbar";
import PrimaryMenu from "./PrimaryMenu";

const DRAWER_EXPANDED = 340;
const DRAWER_COLLAPSED = 72;

interface Props {
	window?: () => Window;
	children: React.ReactNode;
}

export default function ResponsiveDrawer(props: Props) {
	const { window } = props;
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const [collapsed, setCollapsed] = React.useState(() => {
		try { return localStorage.getItem("sidebar_collapsed") === "true"; }
		catch { return false; }
	});

	const location = useLocation();
	const pathname = location.pathname;
	const theme = useTheme();
	const { brandName, logoDarkUrl, logoUrl, favIconUrl ,companyName} = useBrandSettings();
	const isDark = theme.palette.mode === "dark";
	const logoSrc = !isDark
		? (logoDarkUrl || "/logo.svg")
		: (logoUrl || "/logo.svg");
	const faviconSrc = favIconUrl || "/favicon.ico";

	const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

	const handleToggleCollapse = () => {
		const next = !collapsed;
		setCollapsed(next);
		try { localStorage.setItem("sidebar_collapsed", String(next)); } catch { /* noop */ }
	};

	const handleDrawerClose = () => {
		setIsClosing(true);
		setMobileOpen(false);
	};

	const handleDrawerTransitionEnd = () => {
		setIsClosing(false);
	};

	const handleDrawerToggle = () => {
		if (!isClosing) {
			setMobileOpen(!mobileOpen);
		}
	};

	React.useEffect(() => {
		if (mobileOpen) handleDrawerClose();
	}, [pathname]);

	const drawer = (
		<div className="min-h-screen overflow-hidden flex flex-col">
			<Toolbar
				sx={{
					padding: collapsed
						? "20px 8px 16px"
						: { xs: "32px 32px 16px", "2xl": "32px 32px 56px" },
					justifyContent: "center",
					minHeight: collapsed ? "72px !important" : undefined,
				}}
			>
				{collapsed ? (
					<img
						src={faviconSrc}
						alt=""
						width={32}
						height={32}
						style={{ borderRadius: 6, objectFit: "contain" }}
					/>
				) : (
					<Link to="/">
						<img
							src={logoSrc}
							alt={brandName||companyName||"Company Logo"}
							width={137}
							height={73}
							className="max-w-[120px] mx-auto"
						/>
					</Link>
				)}
			</Toolbar>

			<PrimaryMenu collapsed={collapsed} />
		</div>
	);

	const container =
		window !== undefined ? () => window().document.body : undefined;

	return (
		<Box sx={{ display: "flex" }}>
			<CustomAppbar handleDrawerToggle={handleDrawerToggle} collapsed={collapsed} />
			<Box
				component="nav"
				sx={{
					width: { lg: drawerWidth },
					flexShrink: { lg: 0 },
					transition: "width 0.2s ease",
					position: "relative",
				}}
				aria-label="navigation"
			>
				{/* Collapse toggle — desktop only, right edge vertically centered */}
				<Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
					<IconButton
						size="small"
						onClick={handleToggleCollapse}
						sx={{
							display: { xs: "none", lg: "flex" },
							position: "absolute",
							right: -13,
							top: "50%",
							transform: "translateY(-50%)",
							zIndex: 1250,
							width: 26,
							height: 26,
							p: 0,
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							"&:hover": { bgcolor: "action.hover" },
						}}
					>
						{collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
					</IconButton>
				</Tooltip>

				{/* Mobile temporary drawer — always full width */}
				<Drawer
					container={container}
					variant="temporary"
					open={mobileOpen}
					onTransitionEnd={handleDrawerTransitionEnd}
					onClose={handleDrawerClose}
					sx={{
						display: { xs: "block", lg: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: DRAWER_EXPANDED,
							height: "100svh",
							backgroundColor: (t) => t.palette.background.sidebar,
						},
					}}
					slotProps={{ root: { keepMounted: true } }}
				>
					{drawer}
				</Drawer>

				{/* Desktop permanent drawer */}
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", lg: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							backgroundColor: (t) => t.palette.background.sidebar,
							transition: "width 0.2s ease",
							overflowX: "hidden",
						},
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					overflowX: "hidden",
					transition: "margin 0.2s ease",
				}}
			>
				<Toolbar sx={{ minHeight: "64px !important" }} />
				<Box
					className="content p-4 lg:p-6 overflow-y-auto flex flex-col"
					sx={{
						background:
							pathname === "/" || pathname === "/dashboard"
								? "transparent"
								: theme.palette.primary.contrastText,
						height: "calc(100vh - 64px)",
					}}
				>
					{props.children}
				</Box>
			</Box>
		</Box>
	);
}
