import { toast } from "sonner";
import React from "react";
import { RiAddLine } from "@remixicon/react";

import type { CreateChapterDto, CreateLessonDto } from "@/queries";
import { CourseCardFilled } from "./course-card-filled";
import { CourseCard } from "./course-card";
import { generateUuid } from "@/lib";

export const CreateCourse = () => {
	const [chapters, setChapters] = React.useState<CreateChapterDto[]>([
		{
			name: "",
			content: "",
			id: generateUuid(),
			images: [],
			lessons: [
				{
					id: generateUuid(),
					chapterId: "",
					content: "",
					files: [],
					name: "",
					video: null,
				},
			],
			sequence: 1,
			subjectId: "",
			videos: [],
		},
	]);

	const deleteChapter = (id: string) => {
		if (chapters.length === 1) {
			toast.error("Cannot delete the last chapter");
			return;
		}
		setChapters((prev) => prev.filter((chapter) => chapter.id !== id));
	};

	const duplicateChapter = (id: string) => {
		const chapter = chapters.find((chapter) => chapter.id === id);
		if (!chapter) return;
		setChapters((prev) => [...prev, { ...chapter, id: generateUuid() }]);
	};

	const moveChapter = (id: string, direction: "up" | "down") => {
		const index = chapters.findIndex((chapter) => chapter.id === id);
		if (index === -1) return;
		if (direction === "up" && index === 0) {
			toast.error("Cannot move the first chapter up");
			return;
		}
		if (direction === "down" && index === chapters.length - 1) {
			toast.error("Cannot move the last chapter down");
			return;
		}

		setChapters((prev) => {
			const newChapters = [...prev];
			const targetIndex = direction === "up" ? index - 1 : index + 1;
			[newChapters[index], newChapters[targetIndex]] = [
				newChapters[targetIndex],
				newChapters[index],
			];
			return newChapters;
		});
	};

	const handleAddNewChapter = () => {
		setChapters((prev) => [
			...prev,
			{
				name: "",
				content: "",
				id: generateUuid(),
				images: [],
				lessons: [
					{
						chapterId: "",
						id: generateUuid(),
						content: "",
						files: [],
						name: "",
						video: null,
					},
				],
				sequence: 1,
				subjectId: "",
				videos: [],
			},
		]);
	};

	const handleChapterChange = (
		chapterId: string,
		field: "name" | "content",
		value: string
	) => {
		setChapters((prev) =>
			prev.map((chapter) =>
				chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
			)
		);
	};

	const handleAddLesson = (chapterId: string) => {
		setChapters((prev) =>
			prev.map((chapter) => {
				if (chapter.id === chapterId) {
					const newLesson: CreateLessonDto = {
						chapterId: "",
						content: "",
						id: generateUuid(),
						files: [],
						name: "",
						video: null,
					};
					return { ...chapter, lessons: [...chapter.lessons, newLesson] };
				}
				return chapter;
			})
		);
	};

	const handleDeleteLesson = (chapterId: string, lessonId: string) => {
		setChapters((prev) =>
			prev.map((chapter) => {
				if (chapter.id === chapterId) {
					if (chapter.lessons.length === 1) {
						toast.error("Cannot delete the last lesson");
						return chapter;
					}
					return {
						...chapter,
						lessons: chapter.lessons.filter((lesson) => lesson.id !== lessonId),
					};
				}
				return chapter;
			})
		);
	};

	const handleLessonChange = (
		chapterId: string,
		lessonId: string,
		field: "title" | "content" | "video" | "files",
		value: any
	) => {
		setChapters((prev) =>
			prev.map((chapter) => {
				if (chapter.id === chapterId) {
					return {
						...chapter,
						lessons: chapter.lessons.map((lesson) =>
							lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
						),
					};
				}
				return chapter;
			})
		);
	};

	return (
		<div className="flex w-full gap-x-2">
			<div className="w-[44%] space-y-3 rounded-lg bg-neutral-100 p-3">
				<div className="flex w-full items-center justify-between">
					<p className="text-xs font-medium text-neutral-400">ALL CHAPTERS</p>
					<button
						onClick={handleAddNewChapter}
						className="flex items-center gap-x-0.5 rounded bg-white px-2 py-1.5 text-xs text-neutral-400">
						<RiAddLine size={16} /> Add New Chapter
					</button>
				</div>
				<div className="flex flex-col gap-y-4">
					{chapters.map((chapter, index) => (
						<CourseCard
							key={chapter.id}
							chapter={chapter}
							index={index + 1}
							onDelete={deleteChapter}
							onDuplicate={duplicateChapter}
							onMove={moveChapter}
							onChapterChange={handleChapterChange}
							onAddLesson={handleAddLesson}
							onDeleteLesson={handleDeleteLesson}
							onLessonChange={handleLessonChange}
						/>
					))}
				</div>
			</div>
			<div className="w-full flex-1 space-y-3 rounded-lg bg-neutral-100 p-3">
				{chapters.map((chapter, index) => (
					<CourseCardFilled chapter={chapter} index={index + 1} key={chapter.id} />
				))}
			</div>
		</div>
	);
};
