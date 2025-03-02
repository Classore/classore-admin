import { RiDeleteBin5Line, RiUploadCloud2Line, RiVideoAddLine } from "@remixicon/react";
import Cookies from "js-cookie";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { toast } from "sonner";

import { Logger, embedUrl, generateUuid, getFileChunks, validateFile } from "@/lib";
import { queryClient } from "@/providers";
import { PasteLink } from "./dashboard/module-card";
import { Progress } from "./shared";
import { Button } from "./ui/button";

interface Props {
	moduleId: string;
	sequence: number;
	video_array: (File | string)[];
}

type Chunk = {
	index_number: number;
	start_size: number;
	end_size: number;
};

type VideoUploadStatus = {
	status: string;
	progress: number;
};

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const [processingProgress, setProcessingProgress] = useState(0);
	const abortController = useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [retryCount, setRetryCount] = React.useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState("");
	const socket = useRef<Socket | null>(null);
	const [open, setOpen] = useState(false);

	const upload_id = useMemo(() => generateUuid(), []);
	const hasVideo = Boolean(video_array.length > 0);

	useEffect(() => {
		socket.current = io(process.env.NEXT_PUBLIC_WSS_URL, {
			transports: ["websocket"],
		});
		socket.current.on("connect", () => {
			Logger.info("Socket connected");
		});
		socket.current.on("error", (error) => {
			Logger.error("Socket error", error);
		});
		socket.current.on(`video_upload_status.${moduleId}`, (data: VideoUploadStatus) => {
			toast.success(`Video upload progress: ${data.progress}%`);
			setProcessingProgress(data.progress);
			Logger.info("Video upload status", data);
		});

		return () => {
			socket.current?.off("connect");
			socket.current?.off("error");
			socket.current?.off(`video_upload_status.${moduleId}`);
			socket.current?.disconnect();
		};
	}, [moduleId]);

	React.useEffect(() => {
		Logger.log("processing progress", processingProgress);
	}, [processingProgress]);

	const uploadChunk = async (chunks: Chunk[], file: File): Promise<void> => {
		for (const chunk of chunks) {
			// const bytesUploaded = chunk.start_size + file.size;
			// const progress = (bytesUploaded / file.size) * 100;

			const formData = new FormData();
			const fileChunk = file.slice(chunk.start_size, chunk.end_size);

			const blob = new Blob([fileChunk], { type: file.type });

			formData.append("chunk_index", chunk.index_number.toString());
			formData.append("total_chunks", chunks.length.toString());
			formData.append("upload_id", upload_id);
			formData.append("file", blob);

			try {
				setIsLoading(true);
				setIsUploading(true);
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);
				const response = await fetch(`${API_URL}/admin/learning/chunk_uploads/${moduleId}`, {
					method: "PUT",
					body: formData,
					headers: {
						Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
						Accept: "application/json",
					},
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				Logger.success(`Chunk ${chunk.index_number} of ${chunks.length} uploaded:`, data);
				setUploadProgress(Math.round(chunk.index_number / chunks.length) / 100);
			} catch (error) {
				Logger.error(`Chunk ${chunk.index_number} upload failed:`, error);
				throw error;
			} finally {
				queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
				if (chunk.index_number === chunks.length) {
					setUploadProgress(100);
					setIsLoading(false);
					setIsUploading(false);
					setUploadProgress(0);
					setRetryCount(0);
					toast.success("File upload completed");
				}
			}
		}
	};

	const uploadChunkWithRetry = useCallback(
		async (chunks: Chunk[], file: File): Promise<void> => {
			while (retryCount < MAX_RETRIES) {
				try {
					return await uploadChunk(chunks, file);
				} catch (error) {
					setRetryCount((prev) => prev + 1);
					if (retryCount === MAX_RETRIES) {
						throw error;
					}
					await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
				}
			}
		},
		[retryCount, uploadChunk]
	);

	const uploader = React.useCallback(
		async (file: File, moduleId: string) => {
			if (!file || !moduleId) {
				toast.error("Please save this lesson before trying to upload a video");
				return;
			}

			const token = Cookies.get("CLASSORE_ADMIN_TOKEN");
			if (!token) {
				toast.error("Authentication token missing");
				return;
			}
			const chunks = getFileChunks(file.size);
			uploadChunkWithRetry(chunks, file);
		},
		[uploadChunkWithRetry]
	);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files?.length) return;

			if (isUploading) {
				toast.error("An upload is already in progress");
				return;
			}

			const selectedFile = e.target.files[0];
			const error = validateFile(selectedFile, {
				fileType: "video",
				allowedMimeTypes: ALLOWED_VIDEO_TYPES,
				maxFileSize: MAX_FILE_SIZE,
				maxFiles: 1,
				minFiles: 1,
			});

			if (!error) {
				const reader = new FileReader();
				reader.onload = () => {
					setPreviewUrl(reader.result as string);
					uploader(selectedFile, moduleId);
				};
				reader.onerror = () => {
					toast.error("Failed to read file");
				};
				reader.readAsDataURL(selectedFile);
				return () => {
					reader.abort();
				};
			} else {
				toast.error(error.message, {
					description: "Please try again.",
				});
			}
		},
		[isUploading, moduleId, uploader]
	);

	const handleCancelUpload = useCallback(() => {
		if (abortController.current) {
			abortController.current.abort();
			setUploadProgress(0);
			toast.info("Upload cancelled");
		}
		setPreviewUrl("");
	}, []);

	const handleFileRemove = useCallback(() => {
		setPreviewUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	useEffect(() => {
		const toastId = `upload-${moduleId}-${sequence}`;

		if (isLoading) {
			toast.loading("Uploading video", {
				description: (
					<div className="space-y-2">
						<p className="text-xs text-neutral-400">Please hold on while we upload your video</p>
						<Progress progress={uploadProgress} />
					</div>
				),
				duration: Infinity,
				id: toastId,
				action: {
					label: "Cancel",
					onClick: handleCancelUpload,
				},
				actionButtonStyle: {
					background: "red",
					color: "white",
					borderRadius: "8px",
					padding: "4px 8px",
					fontSize: "12px",
				},
			});
		} else {
			if (uploadProgress === 100) {
				toast.success("Upload completed successfully", { id: toastId });
			}
		}

		return () => {
			if (!isLoading && uploadProgress !== 100) {
				toast.dismiss(toastId);
			}
		};
	}, [isLoading, moduleId, sequence, uploadProgress, handleCancelUpload]);

	const video = video_array[0];
	const uploadedVideo = typeof video === "string" ? video : "";

	return (
		<div className="w-full space-y-2">
			<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
				<strong>Note:</strong> Uploaded video and attachments may take a while before being visible.
				After saving this lesson, refresh the page (after 2mins) to see the uploaded video.
			</p>

			{hasVideo && uploadedVideo ? (
				<video
					src={embedUrl(uploadedVideo)}
					id="videoPlayer"
					controlsList="nodownload"
					className="h-full w-full rounded-lg"
					width="640"
					height="360"
					controls>
					Your browser does not support the video tag.
				</video>
			) : (
				<div className="w-full rounded-lg bg-neutral-50">
					{previewUrl ? (
						<div className="h-full w-full space-y-3">
							<div className="space-y-4">
								<div className="relative aspect-video w-full rounded-lg border border-neutral-200">
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
										className="absolute right-2 top-2 z-50 rounded-md bg-white p-1">
										<RiDeleteBin5Line className="size-4" />
									</button>
								</div>
							</div>
							{uploadProgress > 0 && <Progress progress={uploadProgress} />}
						</div>
					) : (
						<label
							htmlFor="video-upload"
							draggable
							className="grid aspect-video w-full place-items-center border border-neutral-200 bg-white py-4">
							{moduleId ? (
								<>
									<input
										type="file"
										className="sr-only hidden"
										id="video-upload"
										accept="video/*"
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

										<div className="relative h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
										<div className="flex items-center justify-center gap-x-4">
											<Button
												onClick={() => fileInputRef.current?.click()}
												className="w-fit"
												size="sm"
												variant="invert-outline"
												disabled={isLoading}>
												<RiUploadCloud2Line size={14} /> Upload Video
											</Button>
											<PasteLink open={open} sequence={sequence} setOpen={setOpen} disabled={isLoading} />
										</div>
									</div>
								</>
							) : (
								<div className="flex flex-col items-center justify-center space-y-2">
									<RiVideoAddLine size={50} className="text-neutral-400" />

									<p className="text-center text-sm">
										You can only upload a video, add a quiz once the lesson has been saved. <br /> Please save
										the lesson first.
									</p>
								</div>
							)}
						</label>
					)}
				</div>
			)}
		</div>
	);
};
