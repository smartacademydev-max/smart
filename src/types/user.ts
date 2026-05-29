import type { Pagination } from "./roleAndPermission";

export type PermissionProps = string[];
export type Token = {
	access_token: string;
} | null;

export interface RegisterUserProps {
	id?: string;
	name: string;
	email: string;
	phone: string;
	role: { name: string, id: string } | null;
	password: string;
	password_confirmation: string;
	profile: File | null;
	thumbnail_url: string;
	designation: string;
	is_suspended?: boolean
	address?: string;
	enrolled_courses?: number;
	dob?: string | null;
	temporary_address?: string | null;
}

export const RegisterUserInitialData = {
	name: "",
	email: "",
	phone: "",
	role: {
		name: "",
		id: ""
	},
	password: "",
	password_confirmation: "",
	profile: null,
	thumbnail_url: "",
	designation: "",
	dob: null,
	address: "",
	temporary_address: null,
}

export interface LoginUserProps {
	email: string;
	password?: string;
	otp?: string;
}

export interface GlobalResponse {
	message: string;
	status: string;
}

export interface User extends RegisterUserProps {
	permissions: PermissionProps;
	// role: string[];
}

export interface UserResponse extends GlobalResponse {
	data: {
		user: User;
		token: Token;
	};
}


export interface UserList extends GlobalResponse {
	data: {
		data: RegisterUserProps[];
		pagination: Pagination;
	}
}