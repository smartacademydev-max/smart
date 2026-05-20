export interface GlobalDiscount {
	enabled: boolean;
	percentage: number;
	label: string;
}

export interface AppControls {
	screen_protection: boolean;
	maintenance_mode: boolean;
	single_device_login: boolean;
	otp_limit: number;
	global_discount: GlobalDiscount;
	watermark_message: string;
}

export const WATERMARK_VARIABLES: { key: string; label: string }[] = [
	{ key: "name", label: "User's name" },
	{ key: "phone", label: "User's phone" },
	{ key: "email", label: "User's email" },
];

export interface AppControlsResponse {
	data: AppControls;
	message: string;
	status: string;
}
