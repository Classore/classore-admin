import { useMutation } from "@tanstack/react-query";
import React from "react";

import type { UpdateChapterModuleDto } from "@/queries";
import type { HttpResponse } from "@/types";
import { endpoints } from "@/config";
import { axios } from "@/lib";

interface UseMutationProps {
	module_id: string;
	module: UpdateChapterModuleDto;
}

export const useVideoUpload = () => {
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const videoRef = React.useRef(null);

	const { isPending } = useMutation({
		mutationFn: async ({ module, module_id }: UseMutationProps) => {
			const formData = new FormData();
			for (let i = 0; i < module.videos!.length; i++) {
				formData.append("videos", module.videos![i]);
			}

			return axios
				.put<HttpResponse<string>>(endpoints(module_id).school.update_chapter_module, formData, {
					onUploadProgress: (e) => {
						const progress = Math.round((e.loaded * 100) / (e.total ?? e.loaded));
						setUploadProgress(progress);
					},
				})
				.then((res) => res.data);
		},
	});

	return {
		isPending,
		uploadProgress,
		videoRef,
	};
};
