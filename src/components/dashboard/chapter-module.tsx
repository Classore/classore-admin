import {
	RiAddLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiEdit2Line,
	RiFileUploadLine,
	RiLoaderLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { toast } from "sonner";

import { convertHTmlToMd, convertMdToHtml, sanitize } from "@/lib";
import { queryClient } from "@/providers";
import { CreateChapterModule, type CreateChapterModuleDto } from "@/queries";
import type { ChapterModuleProps, MakeOptional } from "@/types";
import { Editor } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import { AddAttachment } from "./add-attachment";
import { DeleteLesson } from "./delete-lesson";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

interface Props {
	chapter_id: string;
	index: number;
	isSelected: boolean;
	isSelectedChapter: boolean;
	module: ChapterModule;
	onDelete: (module: ChapterModule) => void;
	onSelectModule: (module: ChapterModule) => void;
	className?: string;
	draggabele?: boolean;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragEnd: (e: React.DragEvent) => void;
	setTab: (tab: string) => void;
}

interface UseMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}

export const ChapterModule = ({
	chapter_id,
	index,
	isSelected,
	isSelectedChapter,
	module,
	onDelete,
	onSelectModule,
	setTab,
	...rest
}: Props) => {
	// const router = useRouter();
	// const courseId = router.query.courseId as string;

	const [isGrabbing, setIsGrabbing] = React.useState(false);
	const [open, setOpen] = React.useState({
		attachment: false,
		content: false,
		delete: false,
	});

	const initialValues: CreateChapterModuleDto = {
		attachments: [],
		attachment_urls: [],
		content: module.content || "",
		images: [],
		image_urls: [],
		sequence: module.sequence || index,
		title: module.title || "",
		videos: [],
		video_urls: [],
		tutor: "",
	};

	const { isPending, mutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) =>
			CreateChapterModule(chapter_id, module),
		mutationKey: ["create-chapter-module"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] }).then(() => {});
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
			const payload = {
				...values,
				content: sanitize(convertHTmlToMd(values.content)),
			};
			mutate({ chapter_id, module: payload });
		},
	});

	const isExistingModule = Boolean(module.id && module.title);

	return (
		<form onSubmit={handleSubmit} className="w-full" {...rest}>
			<div
				onClick={() => onSelectModule(module)}
				className={`w-full space-y-3 rounded-lg border p-3 ${
					isSelected && isSelectedChapter
						? "border-primary-400 bg-primary-100"
						: "border-neutral-400"
				}`}>
				<div className="flex h-6 w-full items-center justify-between gap-x-1">
					<div className="flex flex-1 items-center gap-x-1">
						<button
							onMouseDown={() => setIsGrabbing(true)}
							onMouseUp={() => setIsGrabbing(false)}
							onMouseLeave={() => setIsGrabbing(false)}
							type="button"
							className={`size-6 ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}>
							<RiDraggable size={16} className="text-neutral-400" />
						</button>
						{isExistingModule ? (
							<p className="text-xs capitalize">{module.title}</p>
						) : (
							<input
								type="text"
								name="title"
								value={isExistingModule ? module.title : values.title}
								onChange={handleChange}
								disabled={isExistingModule || isPending}
								className="flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1.5 text-xs outline-0 ring-0 transition-all duration-500 focus:border-2 focus:border-primary-400 focus:outline-0 focus:ring-0 disabled:bg-transparent"
								placeholder="Lesson title"
							/>
						)}
					</div>
					{isExistingModule ? (
						<button
							onClick={() => {}}
							type="button"
							className="grid size-7 place-items-center rounded-md border border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed">
							<RiEdit2Line size={16} className="text-neutral-400" />
						</button>
					) : (
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
								className={`flex items-center gap-x-1 rounded px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isSelected ? "bg-white" : "bg-neutral-200"}`}>
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
									defaultValue={convertMdToHtml(values.content)}
									size="md"
									className="h-[75vh] w-full"
								/>
								<div className="flex w-full items-center justify-end">
									<Button
										className="w-32"
										onClick={() => setOpen({ ...open, content: false })}
										size="sm">
										Save
									</Button>
								</div>
							</div>
						</SheetContent>
					</Sheet>

					<button
						type="button"
						onClick={() => setTab("video")}
						className={`flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isSelected ? "bg-white" : "bg-neutral-200"}`}>
						<RiUploadCloud2Line size={14} /> Upload Video
					</button>

					<Dialog
						open={open.attachment}
						onOpenChange={(attachment) => setOpen({ ...open, attachment })}>
						<DialogTrigger asChild>
							<button
								type="button"
								onClick={() => setOpen({ ...open, attachment: true })}
								className={`flex items-center gap-x-1 rounded px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isSelected ? "bg-white" : "bg-neutral-200"}`}>
								<RiFileUploadLine size={14} /> Upload Attachment
							</button>
						</DialogTrigger>
						<DialogContent className="w-[400px] p-1">
							<AddAttachment
								id={module.id}
								sequence={module.sequence}
								setFieldValue={setFieldValue}
								setOpen={(attachment) => setOpen({ ...open, attachment })}
								values={values}
							/>
						</DialogContent>
					</Dialog>
					<button
						type="button"
						onClick={() => setTab("quiz")}
						className={`flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isSelected ? "bg-white" : "bg-neutral-200"}`}>
						<RiAddLine size={14} /> Add Quiz
					</button>
				</div>
				{values.title && values.content && !module.id && (
					<button
						type="submit"
						className="flex items-center gap-x-1 rounded bg-primary-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-primary-500">
						{isPending ? <RiLoaderLine size={16} className="animate-spin" /> : "Save Lesson"}
					</button>
				)}
				{module.id && (
					<Dialog
						open={open.delete}
						onOpenChange={(value) => setOpen({ ...open, delete: value })}>
						<DialogTrigger asChild>
							<button
								type="button"
								className="flex items-center gap-x-1 rounded bg-red-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-red-500">
								Delete Lesson
							</button>
						</DialogTrigger>
						<DialogContent className="w-[400px] p-1">
							<DeleteLesson
								lessonId={module.id}
								onClose={() => setOpen({ ...open, delete: false })}
							/>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</form>
	);
};
