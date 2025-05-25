import { useMutation, useQuery } from "@tanstack/react-query";

import type { HttpError, HttpResponse, SettingConfig } from "@/types";
import { endpoints } from "@/config";
import { api } from "@/lib";

interface MutationProps<T> {
	onError?: (error: HttpError) => void;
	onSettled?: () => void;
	onSuccess?: (data: T) => void;
}

const getConfig = async () => {
	return api
		.get<HttpResponse<SettingConfig>>(endpoints().settings.get_config)
		.then((res) => res.data);
};
export const useGetConfig = () => {
	return useQuery({
		queryKey: ["get-config"],
		queryFn: getConfig,
		staleTime: Infinity,
		gcTime: Infinity,
	});
};

const updateConfig = async (payload: Partial<SettingConfig>) => {
	return api
		.put<HttpResponse<SettingConfig>>(endpoints().settings.update_config, payload)
		.then((res) => res.data.data);
};
export const useUpdateConfig = ({
	onError,
	onSettled,
	onSuccess,
}: MutationProps<Partial<SettingConfig>>) => {
	return useMutation({
		mutationKey: ["update-config"],
		mutationFn: updateConfig,
		onError,
		onSettled,
		onSuccess,
	});
};

// const updateAdminConfig = async(payload: any) => {
// 	return api.put(endpoints().settings.update_admin_config, payload)
// 		.then((res) => res.data.data)
// }
