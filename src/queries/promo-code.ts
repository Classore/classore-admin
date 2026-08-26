import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { HttpResponse } from "@/types";
import { endpoints } from "@/config";
import { api } from "@/lib";

// ============================================================
// TYPES
// ============================================================

export interface PromoCodeProps {
	id: string;
	code: string;
	influencer: string;
	percentageDiscount: number;
	useCount: number;
	isActive: boolean;   // GET response uses camelCase
	createdBy: string;
	createdOn: string;
	updatedOn: string;
}

export interface CreatePromoCodeDto {
	code: string;
	influencer: string;
	percentageDiscount: number;
	useCount: number;
	is_Active: boolean;  // POST body uses snake_case per backend validation
}

export interface UpdatePromoCodeDto {
	code?: string;
	influencer?: string;
	percentageDiscount?: number;
	useCount?: number;
	is_Active?: boolean; // PATCH body uses snake_case per backend validation
}

// ============================================================
// FUNCTIONS
// ============================================================

const CreatePromoCode = async (userId: string, payload: CreatePromoCodeDto) => {
	return api
		.post<HttpResponse<PromoCodeProps>>(endpoints(userId).promo_codes.create, payload)
		.then((res) => res.data);
};

const GetAllPromoCodes = async (userId: string) => {
	return api
		.get<HttpResponse<PromoCodeProps[]>>(endpoints(userId).promo_codes.all)
		.then((res) => res.data);
};

const DeletePromoCode = async (promoCodeId: string, userId: string) => {
	return api
		.delete<HttpResponse<null>>(endpoints(userId).promo_codes.delete(promoCodeId))
		.then((res) => res.data);
};

const UpdatePromoCode = async (
	promoCodeId: string,
	userId: string,
	payload: UpdatePromoCodeDto
) => {
	return api
		.patch<HttpResponse<PromoCodeProps>>(endpoints(userId).promo_codes.update(promoCodeId), payload)
		.then((res) => res.data);
};

// ============================================================
// HOOKS
// ============================================================

export const useGetAllPromoCodes = (userId: string) => {
	return useQuery({
		queryKey: ["promo-codes", userId],
		queryFn: () => GetAllPromoCodes(userId),
		enabled: !!userId,
		staleTime: Infinity,
		gcTime: Infinity,
		select: (data) => data.data,
	});
};

export const useCreatePromoCode = (userId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["create-promo-code"],
		mutationFn: (payload: CreatePromoCodeDto) => CreatePromoCode(userId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["promo-codes", userId] });
		},
	});
};

export const useUpdatePromoCode = (userId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["update-promo-code"],
		mutationFn: ({ promoCodeId, payload }: { promoCodeId: string; payload: UpdatePromoCodeDto }) =>
			UpdatePromoCode(promoCodeId, userId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["promo-codes", userId] });
		},
	});
};

export const useDeletePromoCode = (userId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["delete-promo-code"],
		mutationFn: (promoCodeId: string) => DeletePromoCode(promoCodeId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["promo-codes", userId] });
		},
	});
};

export { CreatePromoCode, GetAllPromoCodes, DeletePromoCode, UpdatePromoCode };
