import {
	ALLOWED_VIDEO_TYPES,
	API_URL,
	MAX_CANCEL_TIMEOUT,
	MAX_RETRIES,
	MAX_TIMEOUT,
} from "@/constants";
import { Logger, embedUrl, generateUuid, getFileChunks, validateFile } from "@/lib";
import {
	RiDeleteBin5Line,
	RiRefreshLine,
	RiUploadCloud2Line,
	RiVideoAddLine,
} from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import * as React from "react";
import { type Socket, io } from "socket.io-client";
import { toast } from "sonner";
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

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const isDev = process.env.NODE_ENV === "development";

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const queryClient = useQueryClient();
	const [uploadStatus, setUploadStatus] = React.useState<VideoUploadStatus>({
		status: "",
		progress: 0,
		chunk: undefined,
	});

	// const abortController = useRef<AbortController | null>(new AbortController());
	// Using this to cleanup video element i will be creating later to get the duration
	const videoRef = React.useRef<{
		element: HTMLVideoElement | null;
		cleanup: () => void;
	}>({ element: null, cleanup: () => {} });

	const socket = React.useRef<Socket | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const isRunningRef = React.useRef(false);

	const [retryCount, setRetryCount] = React.useState(0);
	const [isUploading, setIsUploading] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [previewUrl, setPreviewUrl] = React.useState("");
	const [open, setOpen] = React.useState(false);

	const upload_id = React.useMemo(() => generateUuid(), []);
	const hasVideo = Boolean(video_array.length > 0);

	React.useEffect(() => {
		const url = isDev
			? process.env.NEXT_PUBLIC_WSS_URL
			: "wss://classore-be-june-224829194037.europe-west1.run.app";
		socket.current = io(url, {
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

	const handleCancelUpload = React.useCallback(() => {
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

	const uploadChunk = React.useCallback(
		async (chunks: Chunk[], file: File, duration: number): Promise<void> => {
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
				const timeoutSignal = AbortSignal.timeout(MAX_TIMEOUT);

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
						signal: AbortSignal.any([timeoutSignal, controller.signal]),
					});

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
					Logger.error(`Chunk ${chunk.index_number} upload failed:`, error);
					if (error instanceof Error) {
						if (error.name === "AbortError") {
							toast.error("Request was aborted");
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
		[moduleId, upload_id]
	);

	const uploadChunkWithRetry = React.useCallback(
		async (chunks: Chunk[], file: File, duration: number): Promise<void> => {
			while (retryCount < MAX_RETRIES) {
				try {
					return await uploadChunk(chunks, file, duration);
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
		async (file: File, moduleId: string, duration: number) => {
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
			uploadChunkWithRetry(chunks, file, duration);
		},
		[uploadChunkWithRetry]
	);

	const handleFileChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files?.length) return;
			videoRef.current.cleanup();

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

			if (error) {
				toast.error(error.message, {
					description: "Please try again.",
				});
				return;
			}

			const objectURL = URL.createObjectURL(selectedFile);
			setPreviewUrl(objectURL);

			const video = document.createElement("video");
			video.src = objectURL;
			video.preload = "metadata";

			video.addEventListener("loadedmetadata", () => {
				const duration = video.duration;
				uploader(selectedFile, moduleId, duration);
			});

			videoRef.current = {
				element: video,
				cleanup: () => {
					video.removeEventListener("loadedmetadata", () => {});
					if (video.parentNode) {
						video.parentNode.removeChild(video);
					}
				},
			};
		},
		[isUploading, moduleId, uploader]
	);

	const handleFileRemove = React.useCallback(() => {
		URL.revokeObjectURL(previewUrl);
		setPreviewUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl]);

	// cleanup on unmount
	React.useEffect(() => {
		return () => {
			videoRef.current.cleanup();
		};
	}, []);

	const video = video_array[0];
	const uploadedVideo = typeof video === "string" ? video : "";

	return (
		<div className="w-full space-y-2">
			<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
				<strong>Note:</strong> Uploaded videos may take a while before being visible. It will go through
				three stages: <strong>uploading</strong>, <strong>processing</strong>, and{" "}
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

			{isLoading ? (
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
							<VideoPlayer src={previewUrl} className="h-full w-full rounded-lg" />
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
