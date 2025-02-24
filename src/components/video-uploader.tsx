import { RiDeleteBin5Line, RiUploadCloud2Line } from "@remixicon/react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import React from "react";

import { PasteLink } from "./dashboard/module-card";
import { Progress, VideoPlayer } from "./shared";
import { embedUrl, generateUuid } from "@/lib";
import { queryClient } from "@/providers";
import { useFileHandler } from "@/hooks";
import { Button } from "./ui/button";

interface Props {
	moduleId: string;
	sequence: number;
	video_array: (File | string)[];
}

const url = process.env.NEXT_PUBLIC_API_URL;

export const VideoUploader = ({ moduleId, sequence, video_array }: Props) => {
	const abortController = React.useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(false);
	const [previewUrl, setPreviewUrl] = React.useState("");
	const [open, setOpen] = React.useState(false);

	const hasVideo = Boolean(video_array.length && video_array.length > 0);
	const upload_id = React.useMemo(() => generateUuid(), []);

	const uploadChunk = async (chunkNumber: number, file: File, sequence: number): Promise<void> => {
		const chunkSize = 1024 * 1024 * 5;
		const start = chunkNumber * chunkSize;
		const end = Math.min(start + chunkSize, file.size);
		const chunk = file.slice(start, end);
		const formData = new FormData();

		const totalChunks = Math.ceil(file.size / chunkSize);
		const chunkBlob = new Blob([chunk], { type: file.type });
		formData.append("videos", chunkBlob, `${file.name}.part${chunkNumber}`);
		formData.append("file", chunkBlob, `${file.name}.part${chunkNumber}`);
		formData.append("upload_id", upload_id);
		formData.append("sequence", sequence.toString());
		formData.append("chunk_index", chunkNumber.toString());
		formData.append("total_chunks", totalChunks.toString());

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

			console.log(`Uploading chunk ${chunkNumber + 1}/${totalChunks}`, {
				start,
				end,
				size: chunk.size,
				type: file.type,
			});

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/learning/chunk_uploads/${moduleId}`,
				{
					method: "PUT",
					body: formData,
					headers: {
						Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
						Accept: "application/json",
					},
					signal: controller.signal,
				}
			);

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
			clearFiles();
			setPreviewUrl("");
			setUploadProgress(0);
			throw error;
		}
	};

	const uploader = async (file: File, moduleId: string, sequence: number) => {
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

		const chunkSize = 2 * 1024 * 1024; // 2MB chunks
		const totalChunks = Math.ceil(file.size / chunkSize);

		try {
			setIsLoading(true);
			abortController.current = new AbortController();

			console.log("Starting chunked upload:", {
				fileName: file.name,
				fileSize: file.size,
				totalChunks,
				chunkSize,
			});

			for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
				if (abortController.current?.signal.aborted) {
					throw new Error("Upload cancelled");
				}
				await uploadChunk(chunkNumber, file, sequence);
			}

			setUploadProgress(100);
			toast.success("File upload completed");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error(error instanceof Error ? error.message : "Upload failed");
			clearFiles();
			setPreviewUrl("");
			setUploadProgress(0);
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
			clearFiles();
			abortController.current = null;
		}
	};

	const handleFiles = React.useCallback(
		(file: File) => {
			if (!moduleId) {
				toast.error("This module does not exist");
				return;
			}
			uploader(file, moduleId, sequence);
		},
		[module, moduleId, sequence, uploader]
	);

	const {
		clearFiles,
		handleClick,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleDragEnter,
		handleFileChange,
		inputRef,
		isDragging,
	} = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			if (file) {
				setPreviewUrl(URL.createObjectURL(file));
				handleFiles(file);
			}
		},
		fileType: "video",
		validationRules: {
			allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
			maxSize: 1024 * 1024 * 1024 * 5, // 500MB
			maxFiles: 1,
			minFiles: 1,
		},
		onError: (error) => {
			toast.error(error);
		},
	});

	const handleCancelUpload = React.useCallback(() => {
		if (abortController.current) {
			abortController.current.abort();
			setUploadProgress(0);
			toast.info("Upload cancelled");
		}
		// clearFiles();
	}, []);

	const handleRemoveFile = () => {
		// clearFiles();
		setPreviewUrl("");
		toast.success("Video removed successfully");
	};

	React.useEffect(() => {
		if (previewUrl) {
			console.info("Preview URL:", previewUrl);
		}
	}, [previewUrl]);

	React.useEffect(() => {
		if (hasVideo && isLoading) {
			const toastId = moduleId;
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
	}, [handleCancelUpload, hasVideo, isLoading, moduleId, uploadProgress]);

	const video = video_array[0];
	const uploadedVideo = video instanceof File ? "" : video;

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
										src={url}
										id="videoPlayer"
										className="h-full w-full rounded-lg"
										width="640"
										height="360"
										controls>
										Your browser does not support the video tag.
									</video>

									<button
										onClick={handleRemoveFile}
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
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							className="grid aspect-video w-full place-items-center border border-neutral-200 bg-white py-4">
							<input
								type="file"
								className="sr-only hidden"
								id="video-upload"
								accept="video/*"
								multiple={false}
								ref={inputRef}
								onChange={handleFileChange}
							/>
							<div className="flex flex-col items-center gap-y-6 p-5">
								<div className="grid size-10 place-items-center rounded-md bg-neutral-100">
									<RiUploadCloud2Line size={20} />
								</div>
								{!isDragging ? (
									<div className="text-center text-sm">
										<p className="font-medium">
											<span className="text-secondary-300">Click to upload</span> or drag and drop video
										</p>
										<p className="text-center text-xs text-neutral-400">
											mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
										</p>
									</div>
								) : (
									<div className="text-center text-sm">
										<p className="font-medium">Drop file here</p>
									</div>
								)}

								<div className="relative h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
								<div className="flex items-center justify-center gap-x-4">
									<Button onClick={handleClick} className="w-fit" size="sm" variant="invert-outline">
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
