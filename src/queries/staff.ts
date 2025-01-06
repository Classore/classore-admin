import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	AdminProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
} from "@/types";

interface AdminResponse {
	admins: PaginatedResponse<AdminProps>;
	edit_access: number;
	super_admins: number;
	total_no_of_admins: number;
	view_only: number;
}

const GetStaffs = async (params: PaginationProps & { search?: string }) => {
	if (params) {
		for (const key in params) {
			if (
				!params[key as keyof typeof params] ||
				params[key as keyof typeof params] === undefined
			) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<HttpResponse<AdminResponse>>(endpoints().auth.get_admins, { params })
		.then((res) => res.data);
};

export { GetStaffs };
