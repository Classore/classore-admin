import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	SubscriptionProps,
} from "@/types";

interface SubscriptionResponse {
	data: {
		total_earnings: number;
		national_exams: number;
		international_exams: number;
		cancelled: number;
		logs: PaginatedResponse<SubscriptionProps>;
	};
}

const GetSubscriptions = async (
	params: PaginationProps & { search?: string; sort_by?: string; txn_status?: string }
) => {
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
		.get<HttpResponse<SubscriptionResponse>>(endpoints().payments.all, { params })
		.then((res) => res.data);
};

export { GetSubscriptions };
