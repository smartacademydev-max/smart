export interface GlobalDiscount {
	enabled: boolean;
	percentage: number;
	label: string;
}

export interface AppControls {
	screen_protection: boolean;
	maintenance_mode: boolean;
	global_discount: GlobalDiscount;
	otp_limit: number;
}

export interface AppControlsResponse {
	data: AppControls;
	message: string;
	status: string;
}
