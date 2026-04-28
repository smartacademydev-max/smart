import { useTheme } from "@mui/material";
import React from "react";
import { useBrandSettings } from "../../../hooks/useBrandSettings";

export default function SingleFormAuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const theme = useTheme();
	const { brandName, logoDarkUrl, logoUrl } = useBrandSettings();
	const isDark = theme.palette.mode === "dark";
	const logoSrc = !isDark
		? (logoDarkUrl || "/logo-dark.svg")
		: (logoUrl || "/logo.svg");

	return (
		<>
			<img src={logoSrc} alt={brandName} width={132} height={70} className="mb-8" />
			{children}
		</>
	);
}
