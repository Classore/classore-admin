import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	CastedUserProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	UserProps,
} from "@/types";

export const periods = [
	"LAST_7_DAYS",
	"THIS_MONTH",
	"LAST_6_MONTHS",
	"LAST_12_MONTHS",
	"LAST_2_YEARS",
] as const;
export type PeriodProps = (typeof periods)[number];

interface UsersResponse {
	users: PaginatedResponse<CastedUserProps>;
}

export interface EditUserPayload {
	isBlocked: "YES" | "NO";
	isDeleted: "YES" | "NO";
}

export interface UserFilters {
	is_blocked?: "YES" | "NO";
	is_deleted?: "YES" | "NO";
	search?: string;
	sort_by?: string;
	sort_order?: "ASC" | "DESC";
	timeline?: PeriodProps;
	user_type?: string;
}

const GetUsers = async (params?: PaginationProps & UserFilters & { user_type?: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<HttpResponse<UsersResponse>>(endpoints().users.all, { params })
		.then((res) => res.data);
};

const GetUser = async (id: string) => {
	return axios.get<HttpResponse<UserProps>>(endpoints(id).users.one).then((res) => res.data);
};

const EditUser = async (id: string, payload: EditUserPayload) => {
	return axios
		.put<HttpResponse<UserProps>>(endpoints(id).users.edit, payload)
		.then((res) => res.data);
};

export { EditUser, GetUsers, GetUser };
