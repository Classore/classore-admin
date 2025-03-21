import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	CastedUserProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	UserProps,
} from "@/types";

interface UsersResponse {
	users: PaginatedResponse<CastedUserProps>;
}

const GetUsers = async (params?: PaginationProps & { user_type?: string; sort_by?: string }) => {
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

export { GetUsers, GetUser };
