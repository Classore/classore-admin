import { endpoints } from "@/config";
import { axios } from "@/lib";
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

export type RoleResponse = HttpResponse<PaginatedResponse<PaginatedRoleProps>>;

const SignInMutation = async (payload: SignInDto) => {
	return axios
		.post<HttpResponse<AdminOneProps>>(endpoints().auth.signin, payload)
		.then((res) => res.data);
};

const CreateAdminMutation = async (payload: CreateAdminDto) => {
	return axios
		.post<HttpResponse<AdminOneProps>>(endpoints().auth.create, payload)
		.then((res) => res.data);
};

const CreateRoleMutation = async (payload: CreateRoleDto) => {
	return axios
		.post<HttpResponse<Node & RoleProps>>(endpoints().auth.create_role, payload)
		.then((res) => res.data);
};

const GetRolesQuery = async (params?: PaginationProps) => {
	return axios
		.get<HttpResponse<PaginatedResponse<PaginatedRoleProps>>>(endpoints().auth.get_roles, { params })
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
	return axios
		.get<HttpResponse<PaginatedResponse<WaitlistUserProps>>>(endpoints().waitlist.get, { params })
		.then((res) => res.data);
};

const DeleteWaitlistUser = async (id: string) => {
	return axios
		.put<HttpResponse<WaitlistUserProps>>(endpoints().auth.delete_entity, { id, type: "WAITLIST" })
		.then((res) => res.data);
};

export {
	CreateAdminMutation,
	CreateRoleMutation,
	DeleteWaitlistUser,
	GetRolesQuery,
	GetWaitlistQuery,
	SignInMutation,
};
