import { RiAddLine, RiArrowLeftDoubleLine, RiDeleteBinLine, RiDraggable } from "@remixicon/react";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { Spinner } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrag } from "@/hooks";
import { convertNumberToWord } from "@/lib";
import {
	DeleteEntities,
	GetChapterModules,
	UpdateChapterModuleSequence,
	type DeleteEntitiesPayload,
	type UpdateChapterModuleSequencePayload,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import { Lesson } from "./lesson";

type ModulesProps = {
	setSection: React.Dispatch<React.SetStateAction<string>>;
	section: string;
	activeChapterId: string;
};

const { setChapterLessons, addLesson, removeLesson } = chapterActions;

export const Modules = ({ setSection, section, activeChapterId }: ModulesProps) => {
	const queryClient = useQueryClient();
	const chapters = useChapterStore((state) => state.chapters);
	const lessons = useChapterStore((state) => state.lessons);

	const [currentLesson, setCurrentLesson] = React.useState("");
	const [isOpen, setIsOpen] = React.useState(false);
	const [activeLessonId, setActiveLessonId] = React.useState("");

	const { data: modules, isLoading } = useQuery({
		queryKey: ["get-modules", { chapterId: activeChapterId }],
		queryFn: activeChapterId ? () => GetChapterModules({ chapter_id: activeChapterId }) : skipToken,
	});

	// UPDATE LESSON SEQUENCE
	const { mutate: updateModuleSequenceMutate } = useMutation({
		mutationFn: (payload: UpdateChapterModuleSequencePayload) => UpdateChapterModuleSequence(payload),
		mutationKey: ["update-chapter-module-sequence"],
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
	});
	const { getDragProps } = useDrag({
		items: lessons,
		onReorder: (items) => setChapterLessons(items),
		onReady: (items) => {
			updateModuleSequenceMutate({
				chapter_id: String(activeChapterId),
				updates: items.map((item, index) => ({
					module_id: item.id,
					sequence: index + 1,
				})),
			});
		},
	});

	// DELETE LESSON
	const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
		mutationFn: (payload: DeleteEntitiesPayload & { _chapterSequence: number; _lessonSequence: number }) => {
			const { ids, model_type } = payload;
			return DeleteEntities({ ids, model_type });
		},
		mutationKey: ["delete-entities"],
		onSuccess: (_data, variables) => {
			// Only remove from store after confirmed server deletion
			removeLesson(variables._chapterSequence, variables._lessonSequence);
			setActiveLessonId("");
			setIsOpen(false);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
			import("sonner").then(({ toast }) => toast.success("Lesson deleted successfully"));
		},
		onError: () => {
			setIsOpen(false);
			import("sonner").then(({ toast }) => toast.error("Failed to delete lesson. Please try again."));
		},
	});

	const chapter = chapters.find((chapter) => chapter.id === activeChapterId);
	React.useEffect(() => {
		if (modules) {
			const chapterLessons = modules.data.data.map((lesson) => ({
				id: lesson.chapter_module_id,
				chapter_sequence: Number(chapter?.sequence),
				sequence: lesson.chapter_module_sequence,
				title: lesson.chapter_module_title,
				content: lesson.chapter_module_content,
				videos: lesson.chapter_module_video_array.map((video) => video.secure_url),
				images: lesson.chapter_module_images,
				attachments: lesson.chapter_module_attachments,
				image_urls: [],
				video_urls: [],
				attachment_urls: [],
				tutor: lesson.chapter_module_tutor,
				lesson_chapter: lesson.chapter_module_id,
				is_published: lesson.chapter_module_is_published,
			}));

			setChapterLessons(chapterLessons);
		}
	}, [chapter?.sequence, modules]);

	// if (!chapter) return;

	return (
		<article
			className={`${section === "lessons" ? "col-[span_15_/_span_15]" : "col-span-1"} rounded-md bg-neutral-100 p-3 transition-all`}>
			<header
				className={`flex items-center justify-between transition-all ${section !== "lessons" ? "writing-vertical-lr gap-3" : "writing-horizontal-tb"}`}>
				<p className="text-xs uppercase tracking-widest">
					Chapter {chapter?.sequence && convertNumberToWord(chapter?.sequence)} - Lessons
				</p>

				<div className="ml-auto flex items-center gap-3">
					{section === "lessons" ? (
						<button
							type="button"
							onClick={() => addLesson(chapter?.sequence || 0)}
							className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200">
							<RiAddLine className="size-4" />
							<span>Add New Lesson</span>
						</button>
					) : null}
					<button
						type="button"
						className={`grid size-6 place-items-center rounded bg-neutral-300 text-neutral-400 transition-all hover:bg-primary-400 hover:text-white ${section !== "lessons" ? "rotate-180" : "-rotate-0"}`}
						onClick={() => setSection("lessons")}>
						<RiArrowLeftDoubleLine className="size-5" />
					</button>
				</div>
			</header>

			{isLoading ? (
				<div className="pt-2">
					<Spinner variant="primary" />
				</div>
			) : lessons.length ? (
				<>
					<div className={`${section !== "lessons" ? "hidden" : "mt-4 grid grid-cols-10 gap-3"} `}>
						<ScrollArea className="col-span-4 h-[500px] overflow-y-auto">
							<div className="flex flex-col gap-1.5 self-start">
								{lessons.map((lesson, index) => (
									<button
										onClick={() => setActiveLessonId(lesson.id)}
										{...getDragProps(index)}
										key={lesson.id}
										className={`flex w-full cursor-pointer items-center gap-x-2 rounded-md border px-2 py-2.5 text-sm text-neutral-500 ${activeLessonId === lesson.id ? "border-primary-400 bg-primary-50" : "border-neutral-200 bg-white"}`}>
										<RiDraggable className="size-4" />
										<p className="flex-1 text-left capitalize">
											{lesson.title || `Lesson ${convertNumberToWord(lesson.sequence)}`}
										</p>

										<div>
											{isOpen && currentLesson === lesson.id ? (
												<div className="flex items-center gap-1 text-xs">
													<button
														type="button"
														className="rounded bg-neutral-50 px-2 py-1"
														onClick={(e) => {
															e.stopPropagation();
															setIsOpen(false);
														}}>
														Cancel
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															if (lesson?.lesson_chapter) {
																deleteMutate({
																	ids: [lesson.id],
																	model_type: "CHAPTER_MODULE",
																	_chapterSequence: chapter?.sequence || 0,
																	_lessonSequence: lesson.sequence,
																});
															} else {
																// Lesson was never saved to backend — just remove locally
																removeLesson(chapter?.sequence || 0, lesson.sequence);
																setActiveLessonId("");
																setIsOpen(false);
															}
														}}
														disabled={isDeleting}
														type="button"
														className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 font-medium text-white disabled:opacity-60">
														{isDeleting ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Confirm"}
													</button>
												</div>
											) : (
												<button
													onClick={(e) => {
														e.stopPropagation();
														setCurrentLesson(lesson.id);
														setIsOpen(true);
													}}
													type="button"
													className="ml-auto rounded border border-neutral-200 bg-neutral-50 p-1 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
													<RiDeleteBinLine className="size-4" />
												</button>
											)}
										</div>
									</button>
								))}
							</div>
						</ScrollArea>

						<Lesson activeLessonId={activeLessonId} chapterId={activeChapterId} />
					</div>
				</>
			) : (
				<p
					className={`${section !== "lessons" ? "hidden" : "block pt-4 text-center text-xs text-neutral-500"}`}>
					{activeChapterId
						? 'This chapter currently has no lesson(s). Click "Add new lesson" to add lesson'
						: "Please select a chapter to explore its lessons"}
				</p>
			)}
		</article>
	);
};
