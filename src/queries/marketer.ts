import { useQuery } from "@tanstack/react-query";

import type {
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	Period,
	ReferralProps,
	WithdrawalProps,
} from "@/types";
import { endpoints } from "@/config";
import { api } from "@/lib";

const getReferrals = async (params: PaginationProps & { timeLine?: Period }) => {
	return api
		.get<HttpResponse<ReferralProps[]>>(endpoints().marketer.get_referrals, { params })
		.then((res) => res.data);
};
export const useGetReferrals = (params: PaginationProps & { timeLine?: Period }) => {
	return useQuery({
		queryKey: ["get-referrals", params],
		queryFn: () => getReferrals(params),
		staleTime: Infinity,
		gcTime: Infinity,
	});
};

const getWithdrawals = async (params: PaginationProps) => {
	return api
		.get<
			HttpResponse<PaginatedResponse<WithdrawalProps>>
		>(endpoints().marketer.get_withdrawals, { params })
		.then((res) => res.data);
};
export const useGetWithdrawals = (params: PaginationProps) => {
	return useQuery({
		queryKey: ["get-withdrawals", params],
		queryFn: () => getWithdrawals(params),
		staleTime: Infinity,
		gcTime: Infinity,
	});
};
