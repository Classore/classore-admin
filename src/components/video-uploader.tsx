import { RiDeleteBin5Line, RiUploadCloud2Line } from "@remixicon/react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";

import { embedUrl, generateUuid, validateFile } from "@/lib";
import { PasteLink } from "./dashboard/module-card";
import { Progress, VideoPlayer } from "./shared";
import { queryClient } from "@/providers";
import { Button } from "./ui/button";

interface Props {
	moduleId: string;
	sequence: number;
	video_array: (File | string)[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"];

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const abortController = useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);

	const hasVideo = Boolean(video_array.length > 0);
	const upload_id = useMemo(() => generateUuid(), []);

	const uploadChunk = async (chunkNumber: number, file: File, sequence: number): Promise<void> => {
		const start = chunkNumber * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, file.size);
		const chunk = file.slice(start, end);
		const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

		const formData = new FormData();
		const chunkBlob = new Blob([chunk], { type: file.type });

		formData.append("file", chunkBlob, `${file.name}.part${chunkNumber}`);
		formData.append("upload_id", upload_id);
		formData.append("sequence", sequence.toString());
		formData.append("chunk_index", chunkNumber.toString());
		formData.append("total_chunks", totalChunks.toString());

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

			console.log(`Uploading chunk ${chunkNumber + 1}/${totalChunks}`, {
				start,
				end,
				size: chunk.size,
				type: file.type,
			});

			const token = Cookies.get("CLASSORE_ADMIN_TOKEN");
			if (!token) throw new Error("Authentication token missing");

			const response = await fetch(`${API_URL}/admin/learning/chunk_uploads/${moduleId}`, {
				method: "PUT",
				body: formData,
				headers: {
					Authorization: `Bearer ${token}`,
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
			console.log(`Chunk ${chunkNumber + 1} uploaded successfully:`, data);

			setUploadProgress(Math.round(((chunkNumber + 1) / totalChunks) * 100));
		} catch (error) {
			console.error(`Chunk ${chunkNumber + 1} upload failed:`, error);
			setPreviewUrl("");
			setUploadProgress(0);
			throw error;
		}
	};

	const uploader = useCallback(
		async (file: File) => {
			if (!file) {
				toast.error("No file selected");
				return;
			}

			if (!moduleId) {
				toast.error("Invalid module ID");
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
				abortController.current = new AbortController();

				console.log("Starting chunked upload:", {
					fileName: file.name,
					fileSize: file.size,
					totalChunks,
					chunkSize: CHUNK_SIZE,
				});

				// Use Promise.all with a limited concurrency to upload chunks
				const concurrencyLimit = 3; // Upload 3 chunks at a time

				for (let i = 0; i < totalChunks; i += concurrencyLimit) {
					if (abortController.current?.signal.aborted) {
						throw new Error("Upload cancelled");
					}

					const chunkPromises = [];
					for (let j = 0; j < concurrencyLimit && i + j < totalChunks; j++) {
						chunkPromises.push(uploadChunk(i + j, file, sequence));
					}

					await Promise.all(chunkPromises);
				}

				setUploadProgress(100);
				toast.success("File upload completed");
				queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			} catch (error) {
				console.error("Upload failed:", error);
				toast.error(error instanceof Error ? error.message : "Upload failed");
				setPreviewUrl("");
				setUploadProgress(0);
			} finally {
				setIsLoading(false);
				abortController.current = null;
			}
		},
		[moduleId, sequence, upload_id]
	);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files?.length) return;

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
					uploader(selectedFile);
				};
				reader.readAsDataURL(selectedFile);
			} else {
				toast.error(error.message, {
					description: "Please try again.",
				});
			}
		},
		[uploader]
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
