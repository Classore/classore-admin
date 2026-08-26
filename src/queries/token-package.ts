import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { endpoints } from "@/config";
import { api } from "@/lib";
import type { HttpError, HttpResponse } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type TokenPackage = {
	id: string;
	name: string;
	price: number;
	base_tokens: number;
	bonus_tokens: number;
	apple_product_id?: string | null;
	google_product_id?: string | null;
	is_active: boolean;
};

export type CreateTokenPackageDto = {
	name: string;
	price: number;
	base_tokens: number;
	bonus_tokens: number;
	apple_product_id?: string | null;
	google_product_id?: string | null;
	is_active: boolean;
};

export type UpdateTokenPackageDto = Partial<CreateTokenPackageDto>;

// ── GET ALL TOKEN PACKAGES ─────────────────────────────────────────────────

const getAllTokenPackages = async () => {
	return api
		.get<HttpResponse<TokenPackage[]>>(endpoints().token_payment.all)
		.then((res) => res.data);
};

const extractPackages = (res: any): TokenPackage[] => {
	if (!res) return [];

	let list: any[] = [];
	if (Array.isArray(res)) {
		list = res;
	} else if (Array.isArray(res?.data)) {
		list = res.data;
	} else if (Array.isArray(res?.data?.data)) {
		list = res.data.data;
	} else if (Array.isArray(res?.data?.token_packages)) {
		list = res.data.token_packages;
	} else if (Array.isArray(res?.data?.tokenPackages)) {
		list = res.data.tokenPackages;
	} else if (Array.isArray(res?.data?.packages)) {
		list = res.data.packages;
	} else if (Array.isArray(res?.data?.items)) {
		list = res.data.items;
	} else if (Array.isArray(res?.data?.results)) {
		list = res.data.results;
	} else if (Array.isArray(res?.token_packages)) {
		list = res.token_packages;
	} else if (Array.isArray(res?.tokenPackages)) {
		list = res.tokenPackages;
	} else if (Array.isArray(res?.packages)) {
		list = res.packages;
	} else if (Array.isArray(res?.items)) {
		list = res.items;
	} else if (Array.isArray(res?.results)) {
		list = res.results;
	} else if (typeof res === "object") {
		for (const key of Object.keys(res)) {
			if (Array.isArray(res[key])) {
				list = res[key];
				break;
			}
			if (res[key] && typeof res[key] === "object") {
				for (const subKey of Object.keys(res[key])) {
					if (Array.isArray(res[key][subKey])) {
						list = res[key][subKey];
						break;
					}
				}
				if (list.length > 0) break;
			}
		}
	}

	return list.map((pkg: any) => ({
		id: pkg.id || pkg._id || "",
		name: pkg.name || "",
		price: Number(pkg.price ?? 0),
		base_tokens: Number(pkg.base_tokens ?? pkg.baseTokens ?? 0),
		bonus_tokens: Number(pkg.bonus_tokens ?? pkg.bonusTokens ?? 0),
		apple_product_id: pkg.apple_product_id ?? pkg.appleProductId ?? null,
		google_product_id: pkg.google_product_id ?? pkg.googleProductId ?? null,
		is_active: Boolean(pkg.is_active ?? pkg.isActive ?? false),
	}));
};

export const useGetAllTokenPackages = () => {
	return useQuery({
		queryKey: ["token_packages"],
		queryFn: getAllTokenPackages,
		staleTime: 60 * 1000,
		select: extractPackages,
	});
};

// ── CREATE TOKEN PACKAGE ───────────────────────────────────────────────────

const createTokenPackage = async (payload: CreateTokenPackageDto) => {
	return api
		.post<HttpResponse<TokenPackage>>(endpoints().token_payment.create, payload)
		.then((res) => res.data);
};

export const useCreateTokenPackage = ({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: HttpError) => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["create_token_package"],
		mutationFn: createTokenPackage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["token_packages"] });
			onSuccess?.();
		},
		onError,
	});
};

// ── UPDATE TOKEN PACKAGE ───────────────────────────────────────────────────

const updateTokenPackage = async ({
	id,
	payload,
}: {
	id: string;
	payload: UpdateTokenPackageDto;
}) => {
	return api
		.patch<HttpResponse<TokenPackage>>(endpoints(id).token_payment.update, payload)
		.then((res) => res.data);
};

export const useUpdateTokenPackage = ({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: HttpError) => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update_token_package"],
		mutationFn: updateTokenPackage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["token_packages"] });
			onSuccess?.();
		},
		onError,
	});
};

// ── DELETE TOKEN PACKAGE ───────────────────────────────────────────────────

const deleteTokenPackage = async (id: string) => {
	return api
		.delete<HttpResponse<null>>(endpoints(id).token_payment.delete)
		.then((res) => res.data);
};

export const useDeleteTokenPackage = ({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: HttpError) => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["delete_token_package"],
		mutationFn: deleteTokenPackage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["token_packages"] });
			onSuccess?.();
		},
		onError,
	});
};
