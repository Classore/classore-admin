import { useMutation } from "@tanstack/react-query";
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
import type { UpdateChapterModuleDto } from "@/queries";
import { axios, embedUrl, validateUrl } from "@/lib";
import { AttachmentItem } from "./attachment-item";
import { IconLabel, VideoPlayer } from "../shared";
import { useDrag, useFileHandler } from "@/hooks";
import { AddAttachment } from "./add-attachment";
import { UpdateChapterModule } from "@/queries";
import { queryClient } from "@/providers";
import { Button } from "../ui/button";
import { endpoints } from "@/config";
import type {
	ChapterModuleProps,
	ChapterProps,
	HttpError,
	HttpResponse,
	MakeOptional,
} from "@/types";

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

export const ModuleCard = ({ chapter, module }: CourseCardProps) => {
	const abortController = React.useRef<AbortController | null>(null);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const [open, setOpen] = React.useState({
		attachment: false,
		paste: false,
		video: false,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: async ({ module, module_id }: UseMutationProps) => {
			const formData = new FormData();
			module.videos?.forEach((video) => {
				formData.append("videos", video);
			});
			formData.append("sequence", module.sequence.toString());
			abortController.current = new AbortController();
			try {
				const response = await axios.put<HttpResponse<string>>(
					endpoints(module_id).school.update_chapter_module,
					formData,
					{
						onUploadProgress: (e) => {
							const progress = Math.round((e.loaded * 100) / (e.total ?? e.loaded));
							setUploadProgress(progress);
						},
						signal: abortController.current.signal,
					}
				);

				if (response.status.toString().startsWith("2")) {
					queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
				}
				return response.data;
			} catch (error: unknown) {
				const {
					response: { data },
				} = error as HttpError;
				if (abortController.current.signal.aborted) {
					throw new Error("Upload cancelled");
				}
				clearFiles();
				const message = Array.isArray(data.message) ? data.message[0] : data.message;
				throw new Error(message ?? "Failed to upload video");
			}
		},
		mutationKey: ["update-chapter-module"],
		onSuccess: (data) => {
			setOpen({ ...open, paste: false });
			setUploadProgress(0);
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
		},
		onError: (error) => {
			if (error.message !== "Upload cancelled") {
				console.log(error);
				toast.error("Failed to update module");
			}
			setUploadProgress(0);
		},
	});

	const handleCancelUpload = () => {
		if (abortController.current) {
			abortController.current.abort();
			setUploadProgress(0);
			toast.info("Upload cancelled");
		}
		clearFiles();
	};

	const handleFiles = (file: File) => {
		if (!module?.id) {
			toast.error("This module does not exist");
			return;
		}
		const videos: File[] = [];
		videos.push(file);
		mutate({ module_id: module.id, module: { sequence: module.sequence, videos } });
	};

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

	const hasVideo = Boolean(module?.videos.length && module.videos.length > 0);

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
					<button className="flex items-center gap-x-2 rounded-md bg-white px-2 py-1.5 text-sm font-medium">
						Change Video
					</button>
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
					isPending={isPending}
					module={module}
					open={open.paste}
					setOpen={(paste) => setOpen({ ...open, paste })}
					uploadProgess={uploadProgress}
				/>
			)}
		</div>
	);
};

const PasteLink = ({
	module,
	open,
	setOpen,
	disabled,
}: {
	module: ChapterModule | null;
	open: boolean;
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
			module: { sequence: Number(module?.sequence), video_urls },
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
	uploadProgess,
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
	uploadProgess: number;
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
					<PasteLink module={module} open={open} setOpen={setOpen} disabled={isPending} />
				</div>
				<div className="flex h-1 w-full items-center rounded-2xl bg-neutral-200">
					<div
						style={{ width: `${uploadProgess}%` }}
						className={`h-full rounded-2xl bg-green-400 ${uploadProgess < 100 ? "animate-pulse" : ""}`}></div>
				</div>
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
			<VideoPlayer src={embedUrl(module.video_array[0].secure_url)} />
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
