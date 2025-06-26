import {
	ALLOWED_VIDEO_TYPES,
	API_URL,
	MAX_CANCEL_TIMEOUT,
	MAX_FILE_SIZE,
	MAX_RETRIES,
	MAX_TIMEOUT,
} from "@/constants";
import { getFileChunks, Logger, validateFile } from "@/lib";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

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

const isDev = process.env.NODE_ENV === "development";
const showNotification = (title: string, options: NotificationOptions) => {
	if ("Notification" in window && Notification.permission === "granted") {
		new Notification(title, options);
	}
};

type UseVideoUploadProps = {
	upload_id: string;
	id: string;
	model_type?: string;
};

export const useVideoUploader = ({ upload_id, id, model_type }: UseVideoUploadProps) => {
	const queryClient = useQueryClient();
	const [uploadStatus, setUploadStatus] = React.useState<VideoUploadStatus>({
		status: "",
		progress: 0,
		chunk: undefined,
	});
	const [retryCount, setRetryCount] = React.useState(0);
	const [isUploading, setIsUploading] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [previewUrl, setPreviewUrl] = React.useState("");

	// Using this to cleanup video element i will be creating later to get the duration
	const videoRef = React.useRef<{
		element: HTMLVideoElement | null;
		cleanup: () => void;
	}>({ element: null, cleanup: () => {} });
	const socket = React.useRef<Socket | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const isRunningRef = React.useRef(false);

	React.useEffect(() => {
		const url = isDev
			? process.env.NEXT_PUBLIC_WSS_URL
			: "wss://classore-be-june-224829194037.europe-west1.run.app/classore/v1";
		socket.current = io(url, {
			transports: ["websocket"],
		});
		socket.current.on("connect", () => {
			Logger.info("Socket connected");
		});
		socket.current.on("error", (error) => {
			Logger.error("Socket error", error);
		});
		socket.current.on(`video_upload_status.${id}`, (data) => {
			if (data) {
				setIsLoading(true);

				const parsedData = JSON.parse(data) as VideoUploadStatus;
				setUploadStatus(parsedData);

				Logger.info("Video upload status", parsedData);

				if (parsedData.status === "completed") {
					queryClient.invalidateQueries({ queryKey: ["get-modules"] });
					queryClient.invalidateQueries({ queryKey: ["get-subject"] });
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
			socket.current?.off(`video_upload_status.${id}`);
			socket.current?.disconnect();
		};
	}, [id, queryClient]);

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
						fetch(`${API_URL}/admin/learning/cancel_chunk_uploads/${id}`, {
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
				if (model_type) {
					formData.append("model_type", model_type);
				}

				try {
					setIsLoading(true);
					setIsUploading(true);

					const response = await fetch(`${API_URL}/admin/learning/chunk_uploads/${id}`, {
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
		[id, model_type, upload_id]
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
				uploader(selectedFile, id, duration);
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
		[isUploading, id, uploader]
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

	return {
		handleFileChange,
		handleFileRemove,
		handleCancelUpload,
		previewUrl,
		isUploading,
		isLoading,
		uploadStatus,
		fileInputRef,
		isRunningRef,
	};
};
