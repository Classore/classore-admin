import {
	RiDeleteBin5Line,
	RiRefreshLine,
	RiUploadCloud2Line,
	RiVideoAddLine,
} from "@remixicon/react";
import Cookies from "js-cookie";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { toast } from "sonner";

import { Logger, embedUrl, generateUuid, getFileChunks, validateFile } from "@/lib";
import { useQueryClient } from "@tanstack/react-query";
import { PasteLink } from "./dashboard";
import { VideoPlayer } from "./shared";
import { UploadProgress } from "./shared/upload-progress";
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
	chunk?: string;
};

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;
const MAX_CANCEL_TIMEOUT = 60000; // 60 seconds

const UPLOAD_STATUS = {
	chunk: "Uploading...",
	uploading: "Processing...",
	transcoding_in_progress: "Transcoding...",
	completed: "Completed",
};

const showNotification = (title: string, options: NotificationOptions) => {
	if ("Notification" in window && Notification.permission === "granted") {
		new Notification(title, options);
	}
};

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const queryClient = useQueryClient();
	const [uploadStatus, setUploadStatus] = useState<VideoUploadStatus>({
		status: "",
		progress: 0,
		chunk: undefined,
	});

	// const abortController = useRef<AbortController | null>(new AbortController());
	const socket = useRef<Socket | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isRunningRef = useRef(false);

	const [retryCount, setRetryCount] = React.useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState("");
	const [open, setOpen] = useState(false);
	const [duration, setDuration] = useState(0);

	const upload_id = useMemo(() => generateUuid(), []);
	const hasVideo = Boolean(video_array.length > 0);

	React.useEffect(() => {
		socket.current = io(process.env.NEXT_PUBLIC_WSS_URL, {
			transports: ["websocket"],
		});
		socket.current.on("connect", () => {
			Logger.info("Socket connected");
		});
		socket.current.on("error", (error) => {
			Logger.error("Socket error", error);
		});
		socket.current.on(`video_upload_status.${moduleId}`, (data) => {
			if (data) {
				setIsLoading(true);

				const parsedData = JSON.parse(data) as VideoUploadStatus;
				setUploadStatus(parsedData);

				Logger.info("Video upload status", parsedData);

				if (parsedData.status === "completed") {
					queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
					setIsLoading(false);
					setIsUploading(false);
					setRetryCount(0);
					setUploadStatus({
						status: "",
						progress: 0,
						chunk: undefined,
					});
					toast.success("Video upload completed!");
					showNotification("Video Upload Completed", {
						body: "Your video has been uploaded, processed and is ready to use.",
						icon: "./public/meta/favicon-32x32.png",
					});
					return;
				}
			}
		});

		return () => {
			socket.current?.off("connect");
			socket.current?.off("error");
			socket.current?.off(`video_upload_status.${moduleId}`);
			socket.current?.disconnect();
		};
	}, [moduleId, queryClient]);

	React.useEffect(() => {
		console.log("uploadStatus", uploadStatus);
	}, [uploadStatus]);

	const handleCancelUpload = useCallback(() => {
		isRunningRef.current = false;
		setIsLoading(false);
		setIsUploading(false);
		setRetryCount(0);
		setUploadStatus({
			status: "",
			progress: 0,
			chunk: undefined,
		});
		toast.info("Upload cancelled");
		setPreviewUrl("");
	}, []);

	const uploadChunk = useCallback(
		async (chunks: Chunk[], file: File): Promise<void> => {
			isRunningRef.current = true;

			for (const chunk of chunks) {
				if (!isRunningRef.current) {
					setTimeout(() => {
						fetch(`${API_URL}/admin/learning/cancel_chunk_uploads/${moduleId}`, {
							method: "GET",
							headers: {
								Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
								Accept: "application/json",
							},
						});
					}, MAX_CANCEL_TIMEOUT);
					break;
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);

				const formData = new FormData();
				const fileChunk = file.slice(chunk.start_size, chunk.end_size);

				const blob = new Blob([fileChunk], { type: file.type });

				formData.append("chunk_index", chunk.index_number.toString());
				formData.append("total_chunks", chunks.length.toString());
				formData.append("upload_id", upload_id);
				formData.append("file", blob);
				formData.append("duration", duration.toString());

				try {
					setIsLoading(true);
					setIsUploading(true);

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
					setUploadStatus({
						status: "chunk",
						progress: Math.round((chunk.index_number / chunks.length) * 100),
						chunk: `${chunk.index_number} of ${chunks.length}`,
					});
				} catch (error) {
					clearTimeout(timeoutId);
					Logger.error(`Chunk ${chunk.index_number} upload failed:`, error);
					if (error instanceof Error) {
						if (error.name === "AbortError") {
							console.log("Request was aborted");
						}
					}

					isRunningRef.current = false;
					setIsLoading(false);
					setIsUploading(false);
					setRetryCount(0);
					setUploadStatus({
						status: "",
						progress: 0,
						chunk: undefined,
					});
					// handleCancelUpload();
					return;
				}
			}

			isRunningRef.current = false;
		},
		[moduleId, upload_id, duration]
	);

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
				const objectURL = URL.createObjectURL(selectedFile);
				setPreviewUrl(objectURL);
				uploader(selectedFile, moduleId);
			} else {
				toast.error(error.message, {
					description: "Please try again.",
				});
			}
		},
		[isUploading, moduleId, uploader]
	);

	const handleFileRemove = useCallback(() => {
		URL.revokeObjectURL(previewUrl);
		setPreviewUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl]);

	const video = video_array[0];
	const uploadedVideo = typeof video === "string" ? video : "";

	return (
		<div className="w-full space-y-2">
			<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
				<strong>Note:</strong> Uploaded videos may take a while before being visible. It will go through
				three stages: <strong>upload</strong>, <strong>processing</strong>, and{" "}
				<strong>transcoding</strong>. We will show you the progress of each stage.
			</p>

			<div>
				<input
					type="file"
					className="sr-only hidden"
					id="video-upload"
					accept="video/*"
					disabled={isUploading || isLoading}
					multiple={false}
					ref={fileInputRef}
					onChange={handleFileChange}
				/>
				<button
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading || isLoading || !hasVideo}
					type="button"
					className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400 disabled:cursor-not-allowed">
					<RiRefreshLine className="size-4" />
					<span>Change video</span>
				</button>
			</div>

			{!hasVideo && isLoading ? (
				<UploadProgress
					progress={uploadStatus.progress}
					title={UPLOAD_STATUS[uploadStatus.status as keyof typeof UPLOAD_STATUS]}
					subtitle={
						uploadStatus.chunk
							? `${uploadStatus.chunk} - ${uploadStatus.progress}%`
							: `${uploadStatus.progress}%`
					}
					rightComp={
						isRunningRef.current && isUploading ? (
							<button className="ml-2 text-xs" type="button" onClick={handleCancelUpload}>
								Cancel
							</button>
						) : null
					}
				/>
			) : null}

			<div className="w-full rounded-lg bg-neutral-50">
				{previewUrl ? (
					<div className="h-full w-full">
						<div className="relative aspect-video w-full rounded-lg border border-neutral-200">
							<VideoPlayer
								src={previewUrl}
								onReady={(duration) => setDuration(duration ?? 0)}
								className="h-full w-full rounded-lg"
							/>
							<button
								onClick={() => {
									handleFileRemove();
									if (isUploading) {
										handleCancelUpload();
									}
								}}
								type="button"
								className="absolute right-2 top-2 z-50 rounded-md bg-white p-1">
								<RiDeleteBin5Line className="size-4" />
							</button>
						</div>
					</div>
				) : hasVideo && uploadedVideo ? (
					<div className="aspect-video">
						<VideoPlayer src={embedUrl(uploadedVideo)} className="h-full w-full rounded-lg" />
					</div>
				) : (
					<label
						htmlFor="video-upload"
						draggable
						className="has-disabled:cursor-not-allowed grid aspect-video w-full place-items-center border border-neutral-200 bg-white py-4">
						{moduleId ? (
							<>
								<input
									type="file"
									className="sr-only hidden"
									id="video-upload"
									accept="video/*"
									disabled={isUploading || isLoading}
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
		</div>
	);
};
