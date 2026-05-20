import BuildIcon from "@mui/icons-material/Build";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SecurityIcon from "@mui/icons-material/Security";
import SmsIcon from "@mui/icons-material/Sms";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	OutlinedInput,
	Paper,
	Stack,
	Switch,
	Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useGetControlsQuery, useUpdateControlsMutation } from "../../../services/controlsApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { WATERMARK_VARIABLES } from "../../../types/controls";


interface ControlCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	action: React.ReactNode;
}

function ControlCard({ icon, title, description, action }: ControlCardProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 2,
				p: "20px 24px",
				borderRadius: 2,
			}}
		>
			<Stack direction="row" alignItems="center" gap={2}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						bgcolor: "primary.light",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "primary.main",
						flexShrink: 0,
					}}
				>
					{icon}
				</Box>
				<Box>
					<Typography variant="subtitle1" fontWeight={600}>
						{title}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{description}
					</Typography>
				</Box>
			</Stack>
			<Box sx={{ flexShrink: 0 }}>{action}</Box>
		</Paper>
	);
}


export default function ControlsRoot() {
	const dispatch = useAppDispatch();
	const { data, isLoading } = useGetControlsQuery();
	const [updateControls] = useUpdateControlsMutation();

	const [otpDraft, setOtpDraft] = useState<number | null>(null);
	const [savingOtp, setSavingOtp] = useState(false);

	const [watermarkDraft, setWatermarkDraft] = useState<string | null>(null);
	const [savingWatermark, setSavingWatermark] = useState(false);
	const watermarkRef = useRef<HTMLTextAreaElement | null>(null);

	const controls = data?.data;
	const otpLimit = otpDraft ?? controls?.otp_limit ?? 5;
	const watermarkMessage = watermarkDraft ?? controls?.watermark_message ?? "";

	const handleToggle = async (
		key: "screen_protection" | "maintenance_mode" | "single_device_login",
		value: boolean
	) => {
		try {
			await updateControls({ [key]: value }).unwrap();
			dispatch(showToast({ message: "Controls updated", severity: "success" }));
		} catch {
			dispatch(showToast({ message: "Failed to update controls", severity: "error" }));
		}
	};

	const handleSaveOtpLimit = async () => {
		if (otpDraft === null) return;
		setSavingOtp(true);
		try {
			await updateControls({ otp_limit: otpDraft }).unwrap();
			setOtpDraft(null);
			dispatch(showToast({ message: "OTP limit updated", severity: "success" }));
		} catch {
			dispatch(showToast({ message: "Failed to update OTP limit", severity: "error" }));
		} finally {
			setSavingOtp(false);
		}
	};

	const insertVariable = (key: string) => {
		const token = `{{${key}}}`;
		const el = watermarkRef.current;
		const current = watermarkMessage;
		if (!el) {
			setWatermarkDraft(current + token);
			return;
		}
		const start = el.selectionStart ?? current.length;
		const end = el.selectionEnd ?? current.length;
		const next = current.slice(0, start) + token + current.slice(end);
		setWatermarkDraft(next);
		requestAnimationFrame(() => {
			el.focus();
			const pos = start + token.length;
			el.setSelectionRange(pos, pos);
		});
	};

	const handleSaveWatermark = async () => {
		if (watermarkDraft === null) return;
		setSavingWatermark(true);
		try {
			await updateControls({ watermark_message: watermarkDraft }).unwrap();
			setWatermarkDraft(null);
			dispatch(showToast({ message: "Watermark updated", severity: "success" }));
		} catch {
			dispatch(showToast({ message: "Failed to update watermark", severity: "error" }));
		} finally {
			setSavingWatermark(false);
		}
	};

	useEffect(() => {
		if (watermarkDraft !== null && controls?.watermark_message === watermarkDraft) {
			setWatermarkDraft(null);
		}
	}, [controls?.watermark_message, watermarkDraft]);

	if (isLoading) {
		return (
			<Box display="flex" alignItems="center" justifyContent="center" height="100%">
				<CircularProgress size={28} />
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" height="100%" overflow="hidden">
			<Box flex={1} overflow="auto">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
						{/* Screen Protection */}
						<ControlCard
							icon={<SecurityIcon fontSize="small" />}
							title="Screen Protection"
							description="Block screenshots and screen recording across the mobile app."
							action={
								<Switch
									checked={controls?.screen_protection ?? false}
									onChange={(e) => handleToggle("screen_protection", e.target.checked)}
								/>
							}
						/>

						{/* Maintenance Mode */}
						<ControlCard
							icon={<BuildIcon fontSize="small" />}
							title="Maintenance Mode"
							description="Take the app offline for users and display a maintenance screen."
							action={
								<Switch
									checked={controls?.maintenance_mode ?? false}
									onChange={(e) => handleToggle("maintenance_mode", e.target.checked)}
								/>
							}
						/>

						{/* Single Device Login */}
						<ControlCard
							icon={<PhoneIphoneIcon fontSize="small" />}
							title="Single Device Login"
							description="Restrict users to one active device. When off, device reset requests are not required."
							action={
								<Switch
									checked={controls?.single_device_login ?? false}
									onChange={(e) => handleToggle("single_device_login", e.target.checked)}
								/>
							}
						/>

						{/* OTP Limit */}
						<Paper
							variant="outlined"
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 2,
								p: "20px 24px",
								borderRadius: 2,
							}}
						>
							<Stack direction="row" alignItems="center" gap={2} flex={1}>
								<Box
									sx={{
										width: 44,
										height: 44,
										borderRadius: 2,
										bgcolor: "primary.light",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "primary.main",
										flexShrink: 0,
									}}
								>
									<SmsIcon fontSize="small" />
								</Box>
								<Box flex={1}>
									<Typography variant="subtitle1" fontWeight={600}>
										OTP Limit
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Maximum number of OTP requests a user can make per day.
									</Typography>
								</Box>
							</Stack>

							<OutlinedInput
								fullWidth
								type="number"
								size="small"
								value={otpLimit}
								inputProps={{ min: 1, max: 100 }}
								onChange={(e) =>
									setOtpDraft(Math.min(100, Math.max(1, Number(e.target.value))))
								}
							/>
							<Button
								variant="contained"
								size="small"
								disabled={savingOtp || otpDraft === null}
								onClick={handleSaveOtpLimit}
								startIcon={savingOtp ? <CircularProgress size={14} color="inherit" /> : undefined}
								sx={{ height: 40 }}
							>
								Save
							</Button>
						</Paper>
					</div>

					{/* Watermark Message */}
					<Paper
						variant="outlined"
						sx={{ p: "20px 24px", borderRadius: 2 }}
					>
						<Stack direction="row" alignItems="center" gap={2}>
							<Box
								sx={{
									width: 44,
									height: 44,
									borderRadius: 2,
									bgcolor: "primary.light",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "primary.main",
									flexShrink: 0,
								}}
							>
								<WallpaperIcon fontSize="small" />
							</Box>
							<Box>
								<Typography variant="subtitle1" fontWeight={600}>
									Watermark Message
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Text shown as the protective watermark over course content in the user app.
								</Typography>
							</Box>
						</Stack>

						<Box mt={2}>
							<Typography variant="caption" color="text.secondary" display="block" mb={1}>
								Click a variable to insert it at your cursor:
							</Typography>
							<Stack direction="row" gap={1} flexWrap="wrap" mb={1.5}>
								{WATERMARK_VARIABLES.map((v) => (
									<Chip
										key={v.key}
										label={`{{${v.key}}}`}
										size="small"
										variant="outlined"
										color="primary"
										onClick={() => insertVariable(v.key)}
										sx={{ fontFamily: "monospace", cursor: "pointer" }}
									/>
								))}
							</Stack>

							<OutlinedInput
								fullWidth
								multiline
								minRows={3}
								inputRef={watermarkRef}
								value={watermarkMessage}
								onChange={(e) => setWatermarkDraft(e.target.value)}
								placeholder="e.g. Citizen Life Insurance"
							/>

							<Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.5} gap={2}>
								<Typography variant="caption" color="text.secondary">
									Placeholders are replaced with each user's own details when the watermark is shown.
								</Typography>
								<Button
									variant="contained"
									size="small"
									disabled={savingWatermark || watermarkDraft === null}
									onClick={handleSaveWatermark}
									startIcon={savingWatermark ? <CircularProgress size={14} color="inherit" /> : undefined}
									sx={{ height: 40, flexShrink: 0 }}
								>
									Save
								</Button>
							</Stack>
						</Box>
					</Paper>
				</div>
			</Box>
		</Box>
	);
}
