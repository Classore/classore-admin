import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiArrowDownLine,
	RiArrowUpLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileCopyLine,
	RiFileUploadLine,
	RiFolderVideoLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import type { CreateChapterDto } from "@/queries";
import { Button } from "../ui/button";

interface CardProps {
	chapter: CreateChapterDto;
	index: number;
	onDelete: (id: string) => void;
	onDuplicate: (id: string) => void;
	onMove: (id: string, direction: "up" | "down") => void;
	onChapterChange: (id: string, field: "name" | "content", value: string) => void;
	onAddLesson: (chapterId: string) => void;
	onDeleteLesson: (chapterId: string, lessonId: string) => void;
	onLessonChange: (
		chapterId: string,
		lessonId: string,
		field: "title" | "content" | "video" | "files",
		value: any
	) => void;
}

const course_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

const lesson_actions = [
	{
		action: "upload-video",
		label: "upload video",
		icon: RiUploadCloud2Line,
		type: "input",
		accept: "video/*",
		multiple: false,
	},
	{
		action: "upload-file",
		label: "upload attachment",
		icon: RiFileUploadLine,
		type: "input",
		accept: "application/pdf",
		multiple: true,
	},
	{
		action: "add-quiz",
		label: "add quiz",
		icon: RiAddLine,
		type: "button",
	},
];

export const CourseCard = ({
	chapter,
	index,
	onDelete,
	onDuplicate,
	onMove,
	onChapterChange,
	onAddLesson,
	onDeleteLesson,
	onLessonChange,
}: CardProps) => {
	const fileInputRefs = React.useRef<Map<string, HTMLInputElement>>(new Map());

	const handleCourseAction = (label: string) => {
		switch (label) {
			case "up":
				onMove(chapter.id, "up");
				break;
			case "down":
				onMove(chapter.id, "down");
				break;
			case "duplicate":
				onDuplicate(chapter.id);
				break;
			case "delete":
				onDelete(chapter.id);
				break;
		}
	};

	const handleLessonAction = (action: string, lessonId: string) => {
		const inputRef = fileInputRefs.current.get(`${action}-${lessonId}`);
		if (inputRef && (action === "upload-video" || action === "upload-file")) {
			inputRef.click();
		}
	};

	const handleFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		action: string,
		lessonId: string
	) => {
		const files = event.target.files;
		if (!files) return;

		if (action === "upload-video" && files[0]) {
			onLessonChange(chapter.id, lessonId, "video", files[0]);
			toast.success("Video uploaded successfully");
		} else if (action === "upload-file") {
			const fileList = Array.from(files);
			onLessonChange(chapter.id, lessonId, "files", fileList);
			toast.success(`${fileList.length} file(s) uploaded successfully`);
		}
		event.target.value = "";
	};

	return (
		<div className="w-full rounded-lg bg-white">
			<div className="flex w-full items-center justify-between rounded-t-lg border-b px-4 py-3">
				<p className="text-xs font-medium text-neutral-400">CHAPTER {index}</p>
				<div className="flex items-center">
					{course_actions.map(({ icon: Icon, label }, i) => (
						<button
							key={i}
							onClick={() => handleCourseAction(label)}
							className="grid size-7 place-items-center border first:rounded-l-md last:rounded-r-md hover:bg-neutral-50">
							<Icon size={16} className="text-neutral-400" />
						</button>
					))}
				</div>
			</div>
			<div className="flex w-full flex-col items-center space-y-3 px-4 py-5">
				<div className="w-full rounded-lg border">
					<div className="flex h-10 w-full items-center gap-x-1.5 px-3 py-2.5">
						<RiFolderVideoLine className="size-5 text-neutral-400" />
						<input
							type="text"
							value={chapter.name}
							onChange={(e) => onChapterChange(chapter.id, "name", e.target.value)}
							className="h-full w-full border-0 p-0 text-sm outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0"
							placeholder="Input title 'e.g. Introduction to Algebra'"
						/>
					</div>
					<hr />
					<div className="flex h-20 w-full items-center px-3 py-2.5">
						<textarea
							value={chapter.content}
							onChange={(e) => onChapterChange(chapter.id, "content", e.target.value)}
							className="h-full w-full resize-none border-0 p-0 text-sm outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0"
							placeholder="Chapter Summary"
						/>
					</div>
				</div>
				<div className="w-full space-y-1.5">
					{chapter.lessons.map((lesson) => (
						<div key={lesson.id} className="w-full space-y-3 rounded-lg border p-3">
							<div className="flex h-6 w-full items-center justify-between gap-x-1">
								<div className="flex items-center gap-x-1">
									<button>
										<RiDraggable size={16} className="text-neutral-400" />
									</button>
									<input
										type="text"
										value={lesson.name}
										onChange={(e) => onLessonChange(chapter.id, lesson.id, "title", e.target.value)}
										className="h-full border-0 p-0 text-xs outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0"
										placeholder="Lesson title"
									/>
								</div>
								<button
									onClick={() => onDeleteLesson(chapter.id, lesson.id)}
									className="grid size-7 place-items-center rounded-md border hover:bg-neutral-50">
									<RiDeleteBin6Line size={16} className="text-neutral-400" />
								</button>
							</div>
							<div className="flex w-full items-center gap-x-1">
								{lesson_actions.map(
									({ accept, action, icon: Icon, label, multiple, type }, i) => {
										if (type === "input") {
											return (
												<label key={i} htmlFor={action}>
													<button
														onClick={() => handleLessonAction(action, lesson.id)}
														className="flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400 hover:bg-neutral-300">
														<Icon size={14} /> {label}
													</button>
													<input
														ref={(el) => {
															if (el) fileInputRefs.current.set(`${action}-${lesson.id}`, el);
														}}
														type="file"
														className="sr-only"
														accept={accept}
														multiple={multiple}
														onChange={(e) => handleFileChange(e, action, lesson.id)}
													/>
												</label>
											);
										} else {
											return (
												<button
													key={i}
													onClick={() => handleLessonAction(action, lesson.id)}
													className="flex items-center gap-x-1 rounded bg-neutral-200 px-2 py-1 text-xs capitalize text-neutral-400">
													<Icon size={14} /> {label}
												</button>
											);
										}
									}
								)}
							</div>
						</div>
					))}
				</div>
				<Button
					onClick={() => onAddLesson(chapter.id)}
					className="max-w-[250px]"
					size="sm"
					variant="invert-outline">
					<RiAddLine size={16} />
					Add New Lesson
				</Button>
			</div>
		</div>
	);
};
