import { Box, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useBrandSettings } from "../../../hooks/useBrandSettings";

export default function AuthLayout() {
	const { brandName, logoDarkUrl, logoUrl } = useBrandSettings();

	return (
		<Box className="lg:grid lg:grid-cols-2 lg:gap-10 2xl:gap-20">
			<div className="auth__image__wrapper col-span-1 hidden lg:flex lg:flex-col">
				<div className="flex items-center gap-3 mb-[104px]">
					<img
						src={logoDarkUrl || logoUrl}
						alt={brandName}
						width={132}
						height={70}
					/>
					{brandName && (
						<Typography variant="h5" fontWeight={700} sx={{ color: "text.primary" }}>
							{brandName}
						</Typography>
					)}
				</div>
				<img
					src="/auth-image.png"
					alt=""
					width={430}
					height={302}
					className="pl-14 pr-[26px]"
				/>
			</div>
			<div className="auth__form__wrapper col-span-1">
				<Outlet />
			</div>
		</Box>
	);
}
