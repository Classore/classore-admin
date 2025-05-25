import { endpoints } from "@/config";
import { api } from "@/lib";
import type {
	AdminOneProps,
	HttpResponse,
	Node,
	PaginatedResponse,
	PaginationProps,
	PaginatedRoleProps,
	RoleProps,
	WaitlistUserProps,
} from "@/types";

export interface SignInDto {
	email: string;
	password: string;
}

export interface CreateAdminDto {
	email: string;
	first_name: string;
	last_name: string;
	password: string;
	phone_number: string;
	role: string;
}

export interface CreateRoleDto {
	name: string;
	admin_read: "NO" | "YES";
	admin_write: "NO" | "YES";
	student_read: "NO" | "YES";
	student_write: "NO" | "YES";
	transactions_read: "NO" | "YES";
	transactions_write: "NO" | "YES";
	tutor_read: "NO" | "YES";
	tutor_write: "NO" | "YES";
	videos_read: "NO" | "YES";
	videos_write: "NO" | "YES";
	waitlist_read: "NO" | "YES";
	waitlist_write: "NO" | "YES";
	marketer_read: "NO" | "YES";
	marketer_write: "NO" | "YES";
}

export interface UpdateAdminDto {
	isBlocked?: "YES" | "NO";
	isDeleted?: "YES" | "NO";
}

export type RoleResponse = HttpResponse<PaginatedResponse<PaginatedRoleProps>>;

const SignInMutation = async (payload: SignInDto) => {
	return api
		.post<HttpResponse<AdminOneProps>>(endpoints().auth.signin, payload)
		.then((res) => res.data);
};

const CreateAdminMutation = async (payload: CreateAdminDto) => {
	return api
		.post<HttpResponse<AdminOneProps>>(endpoints().auth.create, payload)
		.then((res) => res.data);
};

const CreateRoleMutation = async (payload: CreateRoleDto) => {
	return api
		.post<HttpResponse<Node & RoleProps>>(endpoints().auth.create_role, payload)
		.then((res) => res.data);
};

const GetRolesQuery = async (params?: PaginationProps) => {
	return api
		.get<HttpResponse<PaginatedResponse<PaginatedRoleProps>>>(endpoints().auth.get_roles, { params })
		.then((res) => res.data);
};

const UpdateAdmin = async (id: string, payload: UpdateAdminDto) => {
	return api
		.put<HttpResponse<string>>(endpoints(id).auth.update_admin, payload)
		.then((res) => res.data);
};

const UpdateRole = async (id: string, payload: CreateRoleDto) => {
	return api
		.put<HttpResponse<Node & RoleProps>>(endpoints(id).auth.update_role, payload)
		.then((res) => res.data);
};

const UpdatePassword = async (payload: { old_password: string; new_password: string }) => {
	return api
		.put<HttpResponse<string>>(endpoints().auth.change_password, payload)
		.then((res) => res.data);
};

const GetWaitlistQuery = async ({
	limit,
	page,
	role,
	search,
}: PaginationProps & {
	role?: "PARENT" | "STUDENT" | (string & {});
	search?: string;
}) => {
	const params = role ? { limit, page, role, search } : { limit, page, search };
	return api
		.get<HttpResponse<PaginatedResponse<WaitlistUserProps>>>(endpoints().waitlist.get, { params })
		.then((res) => res.data);
};

const DeleteWaitlistUser = async (id: string) => {
	return api
		.put<HttpResponse<WaitlistUserProps>>(endpoints().auth.delete_entity, { id, type: "WAITLIST" })
		.then((res) => res.data);
};

export {
	UpdatePassword,
	CreateAdminMutation,
	CreateRoleMutation,
	DeleteWaitlistUser,
	GetRolesQuery,
	GetWaitlistQuery,
	SignInMutation,
	UpdateAdmin,
	UpdateRole,
};
