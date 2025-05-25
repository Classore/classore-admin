import { useQuery } from "@tanstack/react-query";

import { endpoints } from "@/config";
import { api } from "@/lib";
import type { HttpResponse, PaginatedResponse, PaginationProps, SubscriptionProps } from "@/types";

interface SubscriptionResponse {
	data: {
		total_earnings: number;
		national_exams: number;
		international_exams: number;
		cancelled: number;
		logs: PaginatedResponse<SubscriptionProps>;
	};
}

interface PaymentResponse {
	total_earnings: number;
	national_exams: number;
	international_exams: number;
	cancelled: number;
	logs: {
		data: {
			id: string;
			createdOn: Date;
			updatedOn: Date;
			user_id: string;
			narration: string;
			narration_id: string;
			amount: number;
			type: string;
			status: string;
			reference: string;
			currency: string;
			user_email: string;
			first_name: string;
			last_name: string;
			user_type: string;
		}[];
		meta: {
			page: number;
			take: number;
			itemCount: number;
			pageCount: number;
			hasPreviousPage: boolean;
			hasNextPage: boolean;
		};
	};
}

const getAllPayments = async (params: PaginationProps) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return api.get<HttpResponse<PaymentResponse>>(endpoints().payments.all, { params });
};
export const useGetAllPayments = (params: PaginationProps) => {
	return useQuery({
		queryKey: ["payments", params],
		queryFn: () => getAllPayments(params),
		staleTime: Infinity,
		gcTime: Infinity,
		select: (data) => data.data,
	});
};

const GetSubscriptions = async (
	params: PaginationProps & { search?: string; sort_by?: string; txn_status?: string }
) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return api
		.get<HttpResponse<SubscriptionResponse>>(endpoints().payments.all, { params })
		.then((res) => res.data);
};

export { GetSubscriptions };
