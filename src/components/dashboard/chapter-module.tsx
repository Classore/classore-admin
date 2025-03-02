import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiEdit2Line,
	RiFileUploadLine,
	RiLoaderLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../ui/sheet";
import { CreateChapterModule, UpdateChapterModule } from "@/queries";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import type { ChapterModuleProps, MakeOptional } from "@/types";
import { convertHTmlToMd, convertMdToHtml } from "@/lib";
import type { CreateChapterModuleDto } from "@/queries";
import { useQuizStore } from "@/store/z-store/quiz";
import { AddAttachment } from "./add-attachment";
import { DeleteLesson } from "./delete-lesson";
import { queryClient } from "@/providers";
import { Button } from "../ui/button";
import { Editor } from "../shared";

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

interface UseCreateMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}
interface UseUpdateMutationProps {
	module_id: string;
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
	const { addQuestion } = useQuizStore((state) => state.actions);
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
		mutationFn: ({ chapter_id, module }: UseCreateMutationProps) =>
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

	const { isPending: isUpdating, mutateAsync } = useMutation({
		mutationFn: ({ module_id, module }: UseUpdateMutationProps) =>
			UpdateChapterModule(module_id, module),
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

	const isExistingModule = Boolean(module.id && module.title);

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
			const content = convertHTmlToMd(values.content);
			const payload = {
				...values,
				content,
			};
			if (isExistingModule) {
				mutateAsync({ module_id: String(module.id), module: payload });
			} else {
				mutate({ chapter_id, module: payload });
			}
		},
	});

	const updateModule = () => {
		if (!module.id) {
			toast.error("Chapter ID is required");
			return;
		}
		const content = convertHTmlToMd(values.content);
		const payload = {
			...values,
			content,
		};
		mutateAsync({ module_id: module.id, module: payload });
	};

	const html = React.useMemo(() => {
		return convertMdToHtml(values.content || "");
	}, [values.content]);

	return (
		<form onSubmit={handleSubmit} className="w-full" {...rest}>
			<div
				onClick={() => onSelectModule(module)}
				className={`w-full space-y-3 rounded-lg border p-3 ${
					isSelected && isSelectedChapter ? "border-primary-400 bg-primary-100" : "border-neutral-400"
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
							disabled={isPending || isUpdating}
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
									defaultValue={html}
									size="md"
									className="h-[75vh] w-full"
								/>
								<div className="flex w-full items-center justify-end">
									<Button className="w-32" onClick={() => setOpen({ ...open, content: false })} size="sm">
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

					<Dialog open={open.attachment} onOpenChange={(attachment) => setOpen({ ...open, attachment })}>
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
						onClick={() => {
							setTab("quiz");
							addQuestion();
						}}
						className={`flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300 ${isSelected ? "bg-white" : "bg-neutral-200"}`}>
						<RiAddLine size={14} /> Add Quiz
					</button>
				</div>
				{values.title && values.content && !module.id && (
					<button
						type="submit"
						className="flex items-center gap-x-1 rounded bg-primary-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-primary-500">
						{isPending || isUpdating ? (
							<RiLoaderLine size={16} className="animate-spin" />
						) : (
							"Save Lesson"
						)}
					</button>
				)}
				{module.id && (
					<div className="flex items-center gap-x-4">
						<button
							type="button"
							onClick={updateModule}
							className="flex items-center gap-x-1 rounded bg-primary-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-primary-500">
							{isPending || isUpdating ? (
								<RiLoaderLine size={16} className="animate-spin" />
							) : (
								"Update Lesson"
							)}
						</button>
						<Dialog open={open.delete} onOpenChange={(value) => setOpen({ ...open, delete: value })}>
							<DialogTrigger asChild>
								<button
									type="button"
									className="flex items-center gap-x-1 rounded bg-red-400 px-3 py-1.5 text-xs capitalize text-white hover:bg-red-500">
									Delete Lesson
								</button>
							</DialogTrigger>
							<DialogContent className="w-[400px] p-1">
								<DeleteLesson lessonId={module.id} onClose={() => setOpen({ ...open, delete: false })} />
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>
		</form>
	);
};
