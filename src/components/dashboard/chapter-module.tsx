import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileUploadLine,
	RiLoaderLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import { CreateChapterModule, type CreateChapterModuleDto } from "@/queries";
import type { ChapterModuleProps, MakeOptional } from "@/types";
import { queryClient } from "@/providers";
import { useFileHandler } from "@/hooks";
import { Button } from "../ui/button";
import { Editor } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

interface Props {
	chapter_id: string;
	index: number;
	isSelectedChapter: boolean;
	module: ChapterModule;
	onDelete: (module: ChapterModule) => void;
	onSelectModule: (module: ChapterModule) => void;
	className?: string;
	draggabele?: boolean;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragEnd: (e: React.DragEvent) => void;
}

interface UseMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}

export const ChapterModule = ({
	chapter_id,
	index,
	isSelectedChapter,
	module,
	onDelete,
	onSelectModule,
	...rest
}: Props) => {
	const [open, setOpen] = React.useState({ attachment: false, content: false });

	const initialValues: CreateChapterModuleDto = {
		attachments: [],
		content: module.content || "",
		images: [],
		sequence: module.sequence || index,
		title: module.title || "",
		videos: [],
		tutor: "",
	};

	const { isPending, mutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) =>
			CreateChapterModule(chapter_id, module),
		mutationKey: ["create-chapter-module"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to create module");
		},
	});

	const { handleChange, handleSubmit, values, setFieldValue } = useFormik({
		initialValues,
		enableReinitialize: true,
		onSubmit: (values) => {
			if (!chapter_id) {
				toast.error("Chapter ID is required");
				return;
			}
			if (!values.title || !values.content) {
				toast.error("Title and content are required");
				return;
			}
			console.log({ chapter_id, module: values });
			mutate({ chapter_id, module: values });
		},
	});

	const {
		handleClick,
		handleFileChange,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		inputRef,
		isDragging,
	} = useFileHandler({
		onValueChange: (files) => {
			setFieldValue("attachments", [...values.attachments, ...files]);
		},
		fileType: "document",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			maxFiles: 10,
			maxSize: 1000000, // 1MB
			minFiles: 1,
		},
	});

	const handleAddVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const file = e.target.files[0];
		setFieldValue("videos", [...values.videos, file]);
	};

	const isExistingModule = Boolean(module.id && module.title);
	const isCurrentModule = isSelectedChapter && module.sequence === index;

	return (
		<form onSubmit={handleSubmit} className="w-full" {...rest}>
			<div
				onClick={() => onSelectModule(module)}
				className={`w-full space-y-3 rounded-lg border p-3 ${
					isCurrentModule ? "border-primary-400 bg-primary-100" : "border-transparent"
				}`}>
				<div className="flex h-6 w-full items-center justify-between gap-x-1">
					<div className="flex flex-1 items-center gap-x-1">
						<button type="button" className="size-6 cursor-grab">
							<RiDraggable size={16} className="text-neutral-400" />
						</button>
						<input
							type="text"
							name="title"
							value={isExistingModule ? module.title : values.title}
							onChange={handleChange}
							disabled={isExistingModule || isPending}
							className="h-6 flex-1 rounded border border-neutral-400 bg-transparent px-1 text-xs outline-0 ring-0 transition-all duration-500 focus:border focus:border-primary-400 focus:outline-0 focus:ring-0 disabled:bg-transparent"
							placeholder="Lesson title"
						/>
					</div>
					{!isExistingModule && (
						<button
							onClick={() => onDelete(module)}
							type="button"
							disabled={isPending}
							className="grid size-7 place-items-center rounded-md border hover:bg-neutral-50 disabled:cursor-not-allowed">
							<RiDeleteBin6Line size={16} className="text-red-400" />
						</button>
					)}
				</div>
				<div className="flex w-full flex-wrap items-center gap-1">
					<Sheet open={open.content} onOpenChange={(content) => setOpen({ ...open, content })}>
						<SheetTrigger asChild>
							<button
								type="button"
								onClick={() => setOpen({ ...open, content: true })}
								className={`flex items-center gap-x-1 rounded px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isCurrentModule ? "bg-white" : "bg-neutral-200"}`}>
								<RiAddLine size={14} /> Add Content
							</button>
						</SheetTrigger>
						<SheetContent className="w-[600px] max-w-[75%] space-y-4">
							<div className="space-y-0.5">
								<SheetTitle>Add Content</SheetTitle>
								<SheetDescription>
									You can add content to this lesson by typing, or pasting the text below.
								</SheetDescription>
							</div>
							<div className="space-y-4">
								<Editor
									onValueChange={(value) => setFieldValue("content", value)}
									defaultValue={values.content}
									size="md"
									className="h-[75vh] w-full"
								/>
								<div className="flex w-full items-center justify-end">
									<Button
										className="w-fit"
										onClick={() => setOpen({ ...open, content: false })}
										size="sm">
										Save
									</Button>
								</div>
							</div>
						</SheetContent>
					</Sheet>
					<label
						htmlFor="video-upload"
						className={`flex cursor-pointer items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isCurrentModule ? "bg-white" : "bg-neutral-200"}`}>
						<input
							type="file"
							name="video"
							id="video-upload"
							className="sr-only hidden"
							multiple={false}
							accept="video/*"
							onChange={handleAddVideo}
						/>
						<RiUploadCloud2Line size={14} /> Upload Video
					</label>
					<Dialog
						open={open.attachment}
						onOpenChange={(attachment) => setOpen({ ...open, attachment })}>
						<DialogTrigger asChild>
							<button
								type="button"
								onClick={() => setOpen({ ...open, attachment: true })}
								className={`flex items-center gap-x-1 rounded px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isCurrentModule ? "bg-white" : "bg-neutral-200"}`}>
								<RiFileUploadLine size={14} /> Upload Attachement
							</button>
						</DialogTrigger>
						<DialogContent className="w-[400px] p-1">
							<div className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
								<DialogTitle>Upload Attachment</DialogTitle>
								<DialogDescription hidden>Upload attachment to this lesson</DialogDescription>
								<label
									htmlFor="file-upload"
									className="relative flex w-full flex-col place-items-center gap-y-3 rounded-lg border border-dashed bg-white p-5"
									draggable
									onDragEnter={handleDragEnter}
									onDragLeave={handleDragLeave}
									onDragOver={handleDragOver}
									onDrop={handleDrop}>
									<input
										ref={inputRef}
										type="file"
										id="file-upload"
										className="sr-only"
										multiple
										accept="*"
										onChange={handleFileChange}
									/>
									<RiUploadCloud2Line size={18} />
									{isDragging ? (
										<p className="text-xs text-neutral-400">Drop files here</p>
									) : (
										<p className="text-xs text-neutral-400">
											<span className="text-amber-500">Click to upload</span> or drag and drop
											attachments here
										</p>
									)}
									<p className="text-center text-xs text-neutral-300">doc, docx, and pdf</p>
									<div className="relative my-4 h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
									<Button
										onClick={handleClick}
										className="w-[250px]"
										size="sm"
										variant="invert-outline">
										<RiUploadCloud2Line /> Upload Attachment
									</Button>
								</label>
								<div className="flex w-full items-center justify-end gap-x-4">
									<Button
										onClick={() => setOpen({ ...open, attachment: true })}
										className="w-fit"
										size="sm"
										variant="outline">
										Cancel
									</Button>
									<Button className="w-fit" size="sm">
										Save Uploads
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
					<button
						type="button"
						onClick={() => {}}
						className={`flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isCurrentModule ? "bg-white" : "bg-neutral-200"}`}>
						<RiAddLine size={14} /> Add Quiz
					</button>
				</div>
				{values.title && values.content && (
					<button
						type="submit"
						className="flex items-center gap-x-1 rounded bg-primary-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-primary-500">
						{isPending ? <RiLoaderLine size={16} className="animate-spin" /> : "Save Lesson"}
					</button>
				)}
			</div>
		</form>
	);
};
