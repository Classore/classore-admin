import { endpoints } from "@/config"
import { axios } from "@/lib"
import type {
	AdminProps,
	HttpResponse,
	Node,
	PaginatedResponse,
	PaginationProps,
	PaginatedRoleProps,
	RoleProps,
	WaitlistUserProps,
} from "@/types"

export interface SignInDto {
	email: string
	password: string
}

export interface CreateAdminDto {
	email: string
	first_name: string
	last_name: string
	password: string
	phone_number: string
	role: string
}

export interface CreateRoleDto {
	name: string
	admin_read: "NO" | "YES"
	admin_write: "NO" | "YES"
	student_read: "NO" | "YES"
	student_write: "NO" | "YES"
	transactions_read: "NO" | "YES"
	transactions_write: "NO" | "YES"
	tutor_read: "NO" | "YES"
	tutor_write: "NO" | "YES"
	videos_read: "NO" | "YES"
	videos_write: "NO" | "YES"
	waitlist_read: "NO" | "YES"
	waitlist_write: "NO" | "YES"
}

const SignInMutation = async (payload: SignInDto) => {
	return axios
		.post<HttpResponse<AdminProps>>(endpoints().auth.signin, payload)
		.then((res) => res.data)
}

const CreateAdminMutation = async (payload: CreateAdminDto) => {
	return axios
		.post<HttpResponse<AdminProps>>(endpoints().auth.create, payload)
		.then((res) => res.data)
}

const CreateRoleMutation = async (payload: CreateRoleDto) => {
	return axios
		.post<HttpResponse<Node & RoleProps>>(endpoints().auth.create_role, payload)
		.then((res) => res.data)
}

const GetRolesQuery = async (params: PaginationProps) => {
	return axios
		.get<HttpResponse<PaginatedResponse<PaginatedRoleProps>>>(endpoints().auth.get_roles, { params })
		.then((res) => res.data)
}

const GetWaitlistQuery = async (
	params: PaginationProps & { role?: "PARENT" | "STUDENT" | (string & {}) }
) => {
	type Key = keyof typeof params
	const query = Object.keys(params)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key as Key] as string)}`)
		.filter(
			(key) =>
				params[key as Key] !== null && params[key as Key] !== undefined && params[key as Key] !== ""
		)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key as Key] as string)}`)
		.join("&")
	return axios
		.get<HttpResponse<PaginatedResponse<WaitlistUserProps>>>(`${endpoints().waitlist.get}?${query}`)
		.then((res) => res.data)
}

export { CreateAdminMutation, CreateRoleMutation, GetRolesQuery, GetWaitlistQuery, SignInMutation }
