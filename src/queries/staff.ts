import { useQuery } from "@tanstack/react-query";

import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	AdminProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	ViewAdminProps,
} from "@/types";

interface AdminResponse {
	admins: PaginatedResponse<AdminProps>;
	edit_access: number;
	super_admins: number;
	total_no_of_admins: number;
	view_only: number;
}

export type GetStaffsResponse = HttpResponse<AdminResponse>;

const GetStaffs = async (params: PaginationProps & { admin_role?: string; search?: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<HttpResponse<AdminResponse>>(endpoints().auth.get_admins, { params })
		.then((res) => res.data);
};

const getStaff = async (id: string) => {
	return axios
		.get<HttpResponse<ViewAdminProps[]>>(endpoints(id).auth.get_admin)
		.then((res) => res.data);
};
export const useGetStaff = (id: string) => {
	return useQuery({
		queryKey: ["get-admin", id],
		queryFn: () => getStaff(id),
		staleTime: Infinity,
		enabled: !!id,
		gcTime: Infinity,
	});
};

export { GetStaffs };
