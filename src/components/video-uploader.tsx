import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_FILE_SIZE = 200 * 1024 * 1024;
const CHUNK_SIZE = 3 * 1024 * 1024;
const MAX_TIMEOUT = 60000;
const MAX_RETRIES = 3;

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
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
		socket.current = io(API_URL, {
			transports: ["websocket"],
		});
		socket.current.on("connect", () => {
			Logger.info("Socket connected");
		});
		socket.current.on("error", (error) => {
			Logger.error("Socket error", error);
		});
		socket.current.on(`video_upload_status.${moduleId}`, (data) => {
			Logger.info("Video upload status", data);
		});

		return () => {
			socket.current?.off("connect");
			socket.current?.off("error");
			socket.current?.off(`video_upload_status.${moduleId}`);
			socket.current?.disconnect();
		};
	}, []);

	const uploadChunk = async (chunkNumber: number, file: File): Promise<void> => {
		const start = chunkNumber * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, file.size);
		const chunk = file.slice(start, end);
		const formData = new FormData();

		const bytesUploaded = start + chunk.size;
		const progress = (bytesUploaded / file.size) * 100;

		const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
		const chunkBlob = new Blob([chunk], { type: file.type });

		formData.append("file", chunkBlob);
		formData.append("chunk_index", chunkNumber.toString());
		formData.append("total_chunks", totalChunks.toString());
		formData.append("upload_id", upload_id);

		Logger.info(`Uploading chunk ${chunkNumber} of ${totalChunks}`, {
			progress: Math.round(progress * 100) / 100,
			bytesUploaded,
			totalBytes: file.size,
			chunkNumber,
			totalChunks,
		});

		try {
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
			Logger.success(`Chunk ${chunkNumber} of ${totalChunks} uploaded:`, data);
			setUploadProgress(Math.round(progress * 100) / 100);
		} catch (error) {
			Logger.error(`Chunk ${chunkNumber} upload failed:`, error);
			throw error;
		} finally {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
		}
	};

	const uploadChunkWithRetry = async (chunkNumber: number, file: File): Promise<void> => {
		while (retryCount < MAX_RETRIES) {
			try {
				return await uploadChunk(chunkNumber, file);
			} catch (error) {
				setRetryCount((prev) => prev + 1);
				if (retryCount === MAX_RETRIES) {
					throw error;
				}
				await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
			}
		}
	};

	const uploader = React.useCallback(async (file: File, moduleId: string) => {
		if (!file || !moduleId) {
			toast.error("Invalid file or module ID");
			return;
		}

		const token = Cookies.get("CLASSORE_ADMIN_TOKEN");
		if (!token) {
			toast.error("Authentication token missing");
			return;
		}

		const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

		try {
			setIsLoading(true);
			setIsUploading(true);
			abortController.current = new AbortController();
			for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
				if (abortController.current?.signal.aborted) {
					throw new Error("Upload cancelled");
				}
				await uploadChunkWithRetry(chunkNumber, file);
			}
			setUploadProgress(100);
			toast.success("File upload completed");
		} catch (error) {
			Logger.error("Upload failed:", error);
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
			setIsLoading(false);
			setIsUploading(false);
			setUploadProgress(0);
			setRetryCount(0);
			abortController.current = null;
		}
	}, []);

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
		if (isLoading) {
			const toastId = `upload-${moduleId}-${sequence}`;
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

			return () => {
				toast.dismiss(toastId);
			};
		}
	}, [handleCancelUpload, isLoading, moduleId, sequence, uploadProgress]);

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
						</label>
					)}
				</div>
			)}
		</div>
	);
};
