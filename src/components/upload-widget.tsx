import { RiLoaderLine, RiUploadCloud2Line } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import React, { useState, useRef } from "react";

import { UpdateChapterModule, type UpdateChapterModuleDto } from "@/queries";
import type { CloudinaryAssetResponse } from "@/types";
import { PasteLink } from "./dashboard/module-card";
import { queryClient } from "@/providers";
import { Button } from "./ui/button";

interface Props {
	moduleId: string;
	sequence: number;
	video_url: string;
}

export const UploadWidget = ({ moduleId, sequence, video_url }: Props) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const processedResultsRef = useRef(new Set());

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (data: UpdateChapterModuleDto) => UpdateChapterModule(moduleId, data),
		mutationKey: ["add-video", moduleId],
		onSuccess: () => {
			toast.success("Video added successfully");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const processUploadedVideo = (files: CloudinaryAssetResponse[]) => {
		if (!files?.length) return null;

		const uploaded = files[0];
		const uploadInfo = uploaded?.uploadInfo;

		return {
			sequence,
			video_urls: [
				{
					derived_url: String(uploadInfo?.playback_url),
					duration: Number(uploadInfo?.duration),
					secure_url: String(uploadInfo?.secure_url),
				},
			],
		};
	};

	const handleUpload = (results: any) => {
		if (!results.info || typeof results.info === "string") return;

		const files = results.info.files as unknown as CloudinaryAssetResponse[];
		const payload = processUploadedVideo(files);

		if (payload) {
			mutateAsync(payload);
		}
	};

	return (
		<>
			{video_url ? (
				<div className="w-full space-y-4">
					<div className="aspect-video w-full">
						<video
							src={video_url}
							id="videoPlayer"
							className="h-full w-full rounded-lg"
							width="640"
							height="360"
							controls>
							Your browser does not support the video tag.
						</video>
					</div>
				</div>
			) : (
				<CldUploadWidget
					uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
					onSuccess={handleUpload}>
					{({ close, isLoading, open, results }) => {
						const resultId = results?.info ? JSON.stringify(results.info).slice(0, 100) : null;

						if (
							resultId &&
							results?.info &&
							typeof results.info !== "string" &&
							!processedResultsRef.current.has(resultId)
						) {
							processedResultsRef.current.add(resultId);

							setTimeout(() => {
								if (!results.info || typeof results.info === "string") return;
								if (!results.info.files) return;
								const files = results.info.files as unknown as CloudinaryAssetResponse[];
								const payload = processUploadedVideo(files);

								if (payload) {
									mutateAsync(payload).then(() => {
										close();
									});
								}
							}, 0);
						}

						return (
							<div className="grid aspect-video w-full place-items-center rounded-lg border bg-white">
								<div className="flex flex-col items-center gap-y-6">
									<div className="grid size-10 place-items-center rounded-md bg-neutral-100">
										<RiUploadCloud2Line size={20} />
									</div>
									<div className="text-center text-sm">
										<p className="font-medium">
											<span className="text-secondary-300">Click to upload</span> video
										</p>
										<p className="text-center text-xs text-neutral-400">mp4, webm, ogg, mkv (max. 200MB)</p>
									</div>
									<div className="relative h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']" />
									<div className="flex items-center gap-x-4">
										<Button
											className="w-fit"
											disabled={isLoading || isPending}
											type="button"
											size="sm"
											variant="invert-outline"
											onClick={() => open()}>
											<RiUploadCloud2Line /> Upload Video{" "}
											{(isLoading || isPending) && <RiLoaderLine className="animate-spin text-primary-400" />}
										</Button>
										<PasteLink
											open={isModalOpen}
											sequence={sequence}
											setOpen={setIsModalOpen}
											disabled={isLoading || isPending}
										/>
									</div>
								</div>
							</div>
						);
					}}
				</CldUploadWidget>
			)}
		</>
	);
};
