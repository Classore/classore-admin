import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";
import React from "react";
import {
	RiFileUploadLine,
	RiInformationLine,
	RiLink,
	RiLoaderLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { IconLabel, Progress, VideoPlayer } from "../shared";
import type { UpdateChapterModuleDto } from "@/queries";
import { embedUrl, validateUrl } from "@/lib";
import { AttachmentItem } from "./attachment-item";
import { useDrag, useFileHandler } from "@/hooks";
import { AddAttachment } from "./add-attachment";
import { UpdateChapterModule } from "@/queries";
import { queryClient } from "@/providers";
import { Button } from "../ui/button";
import type { ChapterModuleProps, ChapterProps, MakeOptional } from "@/types";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;
type Chapter = MakeOptional<ChapterProps, "createdOn">;

interface CourseCardProps {
	chapter: Chapter;
	index: number;
	module: ChapterModule | null;
	courseName?: string;
}

interface UseMutationProps {
	module_id: string;
	module: UpdateChapterModuleDto;
}

const url = process.env.NEXT_PUBLIC_API_URL;

export const ModuleCard = ({ chapter, module }: CourseCardProps) => {
	const abortController = React.useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(false);
	const socket = React.useRef<WebSocket | null>(null);
	const [open, setOpen] = React.useState({
		attachment: false,
		paste: false,
		video: false,
	});

	const hasVideo = Boolean(module?.video_array.length && module.video_array.length > 0);
	const moduleId = String(module?.id || "");

	const uploadChunk = async (chunkNumber: number, file: File, sequence: number): Promise<void> => {
		const chunkSize = 1024 * 1024 * 2;
		const start = chunkNumber * chunkSize;
		const end = Math.min(start + chunkSize, file.size);
		const chunk = file.slice(start, end);
		const formData = new FormData();

		const totalChunks = Math.ceil(file.size / chunkSize);
		const chunkBlob = new Blob([chunk], { type: file.type });
		formData.append("videos", chunkBlob, `${file.name}.part${chunkNumber}`);
		formData.append("sequence", sequence.toString());
		formData.append("chunkNumber", chunkNumber.toString());
		formData.append("totalChunks", totalChunks.toString());
		formData.append("totalSize", file.size.toString());
		formData.append("chunkSize", chunkSize.toString());
		formData.append("originalName", file.name);

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000);

			console.log(`Uploading chunk ${chunkNumber + 1}/${totalChunks}`, {
				start,
				end,
				size: chunk.size,
				type: file.type,
			});

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/learning/chapter-module/update-one/${moduleId}`,
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
		} catch (error) {
			console.error("Upload failed:", error);
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
			clearFiles();
			abortController.current = null;
		}
	};

	React.useEffect(() => {
		if (isLoading && moduleId) {
			const ws = new WebSocket(url);
			ws.onopen = () => {
				console.log("WebSocket connected");
			};
			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
			};
			ws.onclose = () => {
				console.log("WebSocket closed");
			};
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === `video_upload_status.${moduleId}`) {
					console.log("Video upload status:", data);
				}
			};
			socket.current = ws;
			return () => {
				ws.close();
				socket.current = null;
			};
		}
	}, [isLoading, moduleId]);

	const handleFiles = React.useCallback(
		(file: File) => {
			if (!module?.id) {
				toast.error("This module does not exist");
				return;
			}
			uploader(file, module.id, module.sequence);
		},
		[module, uploader]
	);

	const { getDragProps } = useDrag({
		items: module?.attachments ?? [],
		onReorder: () => {},
	});

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
		clearFiles();
	}, [clearFiles]);

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

	return (
		<div className="w-full space-y-4">
			<div className="flex w-full items-center justify-between">
				{chapter && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-neutral-500">CHAPTER {chapter.sequence + 1}</p>
						<h5
							className={`text-lg font-medium capitalize ${module?.title ? "text-black" : "text-neutral-300"}`}>
							{chapter.name}: {module?.title || "Input title 'e.g. Introduction to Algebra'"}
						</h5>
					</div>
				)}
				{hasVideo && (
					<label htmlFor="video-upload">
						<input
							disabled={isLoading || !module}
							ref={inputRef}
							type="file"
							className="sr-only hidden"
							id="video-upload"
							onChange={handleFileChange}
							accept="video/*"
							multiple={false}
						/>
						<button
							type="button"
							onClick={handleClick}
							className="flex items-center gap-x-2 rounded-lg border bg-white px-2 py-1.5 text-sm font-medium">
							Change Video {isLoading && <RiLoaderLine className="size-4 animate-spin" />}
						</button>
					</label>
				)}
			</div>
			{module && module.video_array?.length ? (
				<UploadVideoRenderer
					getDragProps={getDragProps}
					module={module}
					open={open.attachment}
					setOpen={(attachment) => setOpen({ ...open, attachment })}
				/>
			) : (
				<VideoUploadLabel
					handleCancelUpload={handleCancelUpload}
					handleClick={handleClick}
					handleDragEnter={handleDragEnter}
					handleDragLeave={handleDragLeave}
					handleDragOver={handleDragOver}
					handleDrop={handleDrop}
					handleFileChange={handleFileChange}
					inputRef={inputRef}
					isDragging={isDragging}
					isPending={isLoading}
					module={module}
					open={open.paste}
					setOpen={(paste) => setOpen({ ...open, paste })}
					uploadProgress={uploadProgress}
				/>
			)}
		</div>
	);
};

export const PasteLink = ({
	open,
	sequence,
	setOpen,
	disabled,
}: {
	open: boolean;
	sequence: number;
	setOpen: (open: boolean) => void;
	disabled?: boolean;
}) => {
	const [link, setLink] = React.useState("");

	const { isPending, mutate } = useMutation({
		mutationFn: ({ module_id, module }: UseMutationProps) => UpdateChapterModule(module_id, module),
		mutationKey: ["update-chapter-module"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] }).then(() => {
				setOpen(false);
			});
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to update module");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!link) {
			toast.error("Please enter a link");
			return;
		}
		let url = "";
		if (!module?.id) {
			toast.error("Please select a valid module");
			return;
		}
		if (link.startsWith("https://")) {
			url = link;
		} else {
			url = `https://${link}`;
		}
		const isValidUrl = validateUrl(url);
		if (!isValidUrl) {
			toast.error("Please enter a valid url");
			return;
		}
		const video_urls: string[] = [];
		video_urls.push(url);
		mutate({
			module_id: String(module?.id),
			module: { sequence, video_urls },
		});
	};

	React.useEffect(() => {
		if (open) {
			setLink("");
			queryClient.removeQueries({ queryKey: ["update-chapter-module"] });
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild disabled={disabled}>
				<Button className="w-fit" size="sm" variant="invert-outline">
					<RiLink /> Paste URL
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<form
					onSubmit={handleSubmit}
					className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiLink} />
					<div className="my-4 flex flex-col gap-y-4">
						<DialogTitle>Paste Video Link</DialogTitle>
						<div className="space-y-2">
							<div className="flex h-10 w-full items-center rounded-lg border border-neutral-300">
								<div className="flex h-full w-fit items-center rounded-l-lg border-r border-neutral-300 bg-neutral-100 px-3">
									<span className="text-sm font-medium text-neutral-500">https://</span>
								</div>
								<input
									type="text"
									value={link}
									onChange={(e) => setLink(e.target.value)}
									className="h-full flex-1 rounded-r-lg border-none bg-transparent px-3 text-sm outline-none transition-all duration-500 placeholder:text-neutral-400 focus:ring-primary-400"
									placeholder="drive.google.com/file/d/1abcdef12345GHIJKL67890/view?usp=sharing"
								/>
							</div>
							<div className="flex items-start gap-x-2 text-neutral-400">
								<RiInformationLine size={22} />
								<DialogDescription>
									Videos will be automatically be imported from the pasted link source
								</DialogDescription>
							</div>
						</div>
					</div>
					<hr />
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							type="button"
							disabled={isPending}
							onClick={() => setOpen(false)}
							className="w-fit"
							size="sm"
							variant="outline">
							Cancel
						</Button>
						<Button type="submit" disabled={isPending} className="w-fit" size="sm">
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Import Video Link"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

const VideoUploadLabel = ({
	handleCancelUpload,
	handleClick,
	handleDragEnter,
	handleDragLeave,
	handleDragOver,
	handleDrop,
	handleFileChange,
	inputRef,
	isDragging,
	isPending,
	module,
	open,
	setOpen,
	uploadProgress,
}: {
	handleCancelUpload: () => void;
	handleClick: () => void;
	handleDragEnter: (e: React.DragEvent<HTMLLabelElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
	handleDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	inputRef: React.RefObject<HTMLInputElement>;
	isDragging: boolean;
	isPending: boolean;
	module: ChapterModule | null;
	open: boolean;
	setOpen: (open: boolean) => void;
	uploadProgress: number;
}) => {
	return (
		<label
			htmlFor="video-upload"
			className="grid w-full place-items-center rounded-lg border bg-white py-8 transition-all duration-500 hover:drop-shadow-xl"
			draggable
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}>
			<input
				disabled={isPending || !module}
				ref={inputRef}
				type="file"
				className="sr-only hidden"
				id="video-upload"
				onChange={handleFileChange}
				accept="video/*"
				multiple={false}
			/>
			<div className="flex w-1/2 flex-col items-center gap-y-3 p-5">
				<div className="grid size-10 place-items-center">
					<RiUploadCloud2Line size={20} />
				</div>
				{isDragging ? (
					<p className="text-xs text-neutral-400">Drop files here</p>
				) : (
					<p className="text-xs text-neutral-400">
						<button onClick={handleClick} className="text-amber-500">
							Click to upload
						</button>{" "}
						or drag and drop video
					</p>
				)}
				<p className="text-center text-xs text-neutral-300">
					mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
				</p>
				<div className="relative my-4 h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
				<div className="flex items-center justify-center gap-x-4">
					<Button
						onClick={handleClick}
						disabled={isPending}
						className="w-fit"
						size="sm"
						variant="invert-outline">
						<RiUploadCloud2Line size={14} /> Upload Video
						{isPending && <RiLoaderLine className="animate-spin" />}
					</Button>
					{isPending && (
						<Button
							onClick={(e) => {
								e.preventDefault();
								handleCancelUpload();
							}}
							className="w-fit"
							size="sm"
							variant="destructive">
							Cancel Upload
						</Button>
					)}
					<PasteLink
						open={open}
						sequence={Number(module?.sequence)}
						setOpen={setOpen}
						disabled={isPending}
					/>
				</div>
				{uploadProgress > 0 && <Progress progress={uploadProgress} showLabel={true} />}
			</div>
		</label>
	);
};

const UploadVideoRenderer = ({
	getDragProps,
	module,
	open,
	setOpen,
}: {
	getDragProps: (index: number) => {
		draggable: boolean;
		onDragStart: () => void;
		onDragOver: (e: React.DragEvent) => void;
		onDragEnd: () => void;
		className: string;
	};
	module: ChapterModule;
	open: boolean;
	setOpen: (open: boolean) => void;
}) => {
	return (
		<div className="w-full space-y-4">
			<VideoPlayer src={embedUrl(module.video_array[0].secure_url)} moduleId={module.id} />
			<div className="w-full space-y-3 bg-white px-3">
				<div className="flex h-[52px] w-full items-center justify-between">
					<p className="text-sm font-medium">File Attachments</p>
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<button
								disabled
								type="button"
								onClick={() => setOpen(true)}
								className="flex items-center gap-x-1 rounded border border-neutral-400 bg-neutral-100 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-50">
								<RiFileUploadLine size={14} /> Upload Attachement
							</button>
						</DialogTrigger>
						<DialogContent className="w-[400px] p-1">
							<AddAttachment
								id={module.id}
								sequence={module.sequence}
								setFieldValue={() => {}}
								setOpen={setOpen}
								values={{
									attachments: [],
									attachment_urls: [],
									content: "",
									images: [],
									image_urls: [],
									sequence: 0,
									title: "",
									tutor: "",
									videos: [],
									video_urls: [],
								}}
							/>
						</DialogContent>
					</Dialog>
				</div>
				<div className="flex w-full flex-col gap-y-2">
					{module.attachments.map((attachment, index) => (
						<AttachmentItem key={index} attachment={attachment} {...getDragProps(index)} />
					))}
				</div>
			</div>
		</div>
	);
};
