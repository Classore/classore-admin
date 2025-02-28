import React, { useState, useRef, useCallback, useEffect } from "react";
import { RiDeleteBin5Line, RiUploadCloud2Line } from "@remixicon/react";
import { type Socket, io } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { Logger, embedUrl, generateUuid, validateFile } from "@/lib";
import { PasteLink } from "./dashboard/module-card";
import { Progress, VideoPlayer } from "./shared";
import { queryClient } from "@/providers";
import { Button } from "./ui/button";

interface Props {
	moduleId: string;
	sequence: number;
	video_array: (File | string)[];
}

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"] as const;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 10MB

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const abortController = useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const socketRef = useRef<Socket | null>(null);
	const [open, setOpen] = useState(false);

	const hasVideo = video_array.length > 0;

	useEffect(() => {
		if (!moduleId) return;
		const socket = io("wss://classore-be-dev.up.railway.app", {
			transports: ["websocket"],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 10000,
		});

		socketRef.current = socket;
		socket.on("connect", () => {
			Logger.log("Socket connected");
		});
		socket.on("error", (error) => {
			Logger.error("Socket error", error);
		});
		socket.on(`video_upload_status.${moduleId}`, (data) => {
			Logger.log("Video upload status update:", data);
		});

		return () => {
			socket.off("connect");
			socket.off("error");
			socket.off(`video_upload_status.${moduleId}`);

			if (socket.connected) {
				socket.disconnect();
			}
			socketRef.current = null;
		};
	}, [moduleId]);

	const uploader = async (file: File) => {
		const total_chunks = Math.ceil(file.size / CHUNK_SIZE);
		const uploadId = generateUuid();
		let current_chunk = 0;

		setUploadProgress(0);
		setIsUploading(true);

		while (current_chunk < total_chunks) {
			const start = current_chunk * CHUNK_SIZE;
			const end = Math.min(start + CHUNK_SIZE, file.size);
			const chunk = file.slice(start, end);

			const formData = new FormData();
			formData.append("file", chunk, file.name);
			formData.append("upload_id", uploadId);
			formData.append("chunk_index", (current_chunk + 1).toString());
			formData.append("total_chunks", total_chunks.toString());

			try {
				Logger.info(`Uploading chunk ${current_chunk + 1} of ${total_chunks}`);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/admin/learning/chunk_uploads/${moduleId}`,
					{
						method: "PUT",
						body: formData,
						headers: {
							Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
						},
						signal: abortController.current?.signal,
					}
				);

				if (!response.ok) {
					throw new Error(`Error uploading chunk ${current_chunk + 1}`);
				}
				current_chunk++;
				setUploadProgress((current_chunk / total_chunks) * 100);
			} catch (error) {
				if (abortController.current?.signal.aborted) {
					Logger.error("Upload aborted");
					return;
				}
				Logger.error("Error uploading chunk", error);
				toast.error(`Error uploading chunk ${current_chunk + 1}`);
			} finally {
				setUploadProgress(0);
				setIsUploading(false);
				queryClient.invalidateQueries({
					queryKey: ["get-module", "get-modules", "get-subject", "get-subjects"],
				});
			}
		}
	};

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			try {
				if (!e.target.files?.length) return;
				if (isUploading) {
					toast.error("An upload is already in progress");
					e.target.value = "";
					return;
				}

				const selectedFile = e.target.files[0];
				const validationResult = validateFile(selectedFile, {
					fileType: "video",
					allowedMimeTypes: ALLOWED_VIDEO_TYPES,
					maxFileSize: MAX_FILE_SIZE,
					maxFiles: 1,
					minFiles: 1,
				});

				if (validationResult) {
					toast.error(validationResult.message, {
						description: "Please try again.",
					});
					e.target.value = "";
					return;
				}
				const objectUrl = URL.createObjectURL(selectedFile);
				setPreviewUrl(objectUrl);
				await uploader(selectedFile);
				URL.revokeObjectURL(objectUrl);
				e.target.value = "";
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Failed to process file";
				toast.error(errorMessage, {
					description: "Please try again.",
				});
				Logger.error("File processing error:", error);
			}
		},
		[isUploading, uploader]
	);

	const handleCancelUpload = useCallback(() => {
		if (abortController.current) {
			abortController.current.abort();
		}
		toast.info("Upload cancelled");
		setUploadProgress(0);
		setPreviewUrl("");
	}, []);

	const handleFileRemove = useCallback(() => {
		setPreviewUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const video = video_array[0];
	const uploadedVideo = typeof video === "string" ? video : "";

	return (
		<div className="w-full space-y-2">
			<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
				<strong>Note:</strong> Uploaded video and attachments may take a while before being visible.
				After saving this lesson, refresh the page (after 2mins) to see the uploaded video.
			</p>

			{hasVideo && uploadedVideo ? (
				<VideoPlayer moduleId={moduleId} src={embedUrl(uploadedVideo)} />
			) : (
				<div className="w-full rounded-lg bg-neutral-50">
					{previewUrl ? (
						<div className="h-full w-full space-y-3">
							<div className="space-y-4">
								<div className="relative aspect-video w-full rounded-lg border border-neutral-200">
									{isUploading && (
										<div className="absolute left-0 top-0 !z-[2] grid h-full w-full place-items-center rounded-lg bg-black/45">
											<button
												onClick={handleCancelUpload}
												className="rounded-md bg-red-500 px-3 py-1 text-sm text-white">
												Cancel Upload
											</button>
										</div>
									)}
									<video
										src={previewUrl}
										id="videoPlayer"
										className="h-full w-full rounded-lg"
										width="640"
										height="360"
										controls>
										Your browser does not support the video tag.
									</video>

									<button
										onClick={handleFileRemove}
										type="button"
										className="absolute right-2 top-2 z-50 rounded-md bg-white p-1"
										aria-label="Remove video">
										<RiDeleteBin5Line className="size-4" />
									</button>
								</div>
							</div>
							{uploadProgress > 0 && <Progress progress={uploadProgress} />}
						</div>
					) : (
						<label
							htmlFor="video-upload"
							className="grid aspect-video w-full place-items-center border border-neutral-200 bg-white py-4">
							<input
								type="file"
								className="sr-only hidden"
								id="video-upload"
								accept={ALLOWED_VIDEO_TYPES.join(",")}
								multiple={false}
								ref={fileInputRef}
								onChange={handleFileChange}
							/>
							<div className="flex flex-col items-center gap-y-6 p-5">
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
								<div className="flex items-center justify-center gap-x-4">
									<Button
										onClick={() => fileInputRef.current?.click()}
										className="w-fit"
										size="sm"
										variant="invert-outline"
										disabled={isUploading}>
										<RiUploadCloud2Line size={14} /> Upload Video
									</Button>
									<PasteLink open={open} sequence={sequence} setOpen={setOpen} disabled={isUploading} />
								</div>
							</div>
						</label>
					)}
				</div>
			)}
		</div>
	);
};
