import {
	RiAddLine,
	RiArrowDownLine,
	RiArrowUpLine,
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiDraggable,
	RiFileCopyLine,
	RiFolderVideoLine,
	RiLoaderLine,
} from "@remixicon/react";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";

import { useDrag } from "@/hooks";
import { convertNumberToWord } from "@/lib";
import { queryClient } from "@/providers";
import {
	CreateChapter,
	type CreateChapterDto,
	DeleteEntities,
	type DeleteEntitiesPayload,
	GetChapterModules,
	UpdateChapter,
	UpdateChapterModuleSequence,
	type UpdateChapterModuleSequencePayload,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import type { HttpError } from "@/types";
import { DeleteModal } from "./delete-modal";
import { Spinner } from "./shared";
import { Button } from "./ui/button";
import { TiptapEditor } from "./ui/tiptap-editor";

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

const {
	addChapter,
	removeChapter,
	addChapterName,
	addChapterContent,
	removeLesson,
	addLesson,
	setChapterLessons,
} = chapterActions;

type ChaptersProps = {
	lessonTab: string;
	chapterId?: string;
	courseName?: string;
	onChapterIdChange?: (chapterId: string | undefined) => void;
	setLessonTab: React.Dispatch<React.SetStateAction<string>>;
};

export const Chapters = ({
	chapterId,
	setLessonTab,
	lessonTab,
	onChapterIdChange,
}: ChaptersProps) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
	const [current, setCurrent] = React.useState(0);
	const [currentLesson, setCurrentLesson] = React.useState("");
	const [currentSequence, setCurrentSequence] = React.useState(0);

	const chapters = useChapterStore((state) => state.chapters);
	const lessons = useChapterStore((state) => state.lessons);
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const currentChapter = React.useMemo(() => chapters[current], [chapters, current]);

	// TODO: find a better way to do this
	const { isPending: isPendingModules } = useQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
		enabled: !!chapterId,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateChapterDto) => CreateChapter(payload),
		mutationKey: ["create-chapter"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			addChapter();
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
			addChapter();
		},
	});

	const { isPending: updateChapterIsPending, mutate: updateChapterMutate } = useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: CreateChapterDto }) =>
			UpdateChapter(id, payload),
		mutationKey: ["update-chapter"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
		},
	});

	const { isPending: isDeleting, mutateAsync } = useMutation({
		mutationFn: (payload: DeleteEntitiesPayload) => DeleteEntities(payload),
		mutationKey: ["delete-entities"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
		},
	});

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
			// This only runs when the user stops dragging (i.e after 3s)
			updateModuleSequenceMutate({
				chapter_id: String(chapterId),
				updates: items.map((item, index) => ({
					module_id: item.id,
					sequence: index + 1,
				})),
			});
		},
	});

	React.useEffect(() => {
		// This will notify the parent component when chapter.id changes
		const chapterWithId = chapters.find((chapter) => chapter.id);
		if (onChapterIdChange) {
			onChapterIdChange(chapterWithId?.id);
		}
	}, [chapters, onChapterIdChange]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentChapter) {
			toast.error("Please select a chapter");
			return;
		}

		const payload: CreateChapterDto = {
			name: currentChapter.name,
			sequence: currentChapter.sequence,
			content: currentChapter.content,
			images: [],
			subject_id: courseId,
			videos: [],
		};
		mutate(payload);
	};

	const handleUpdate = (id: string) => {
		if (!currentChapter) {
			toast.error("Please select a chapter");
			return;
		}

		const payload: CreateChapterDto = {
			name: currentChapter.name,
			sequence: currentChapter.sequence,
			content: currentChapter.content,
			images: [],
			subject_id: courseId,
			videos: [],
		};
		updateChapterMutate({
			id,
			payload,
		});
	};

	const handleActions = (action: string, sequence: number) => {
		if (!chapterId) {
			toast.error("Please select a chapter");
			return;
		}

		switch (action) {
			case "up":
				console.log("up");
				break;
			case "down":
				console.log("down");
				break;
			case "duplicate":
				console.log("duplicate");
				break;
			case "delete":
				setOpenDeleteModal(true);
				setCurrentSequence(sequence);
				break;
			default:
				return;
		}
	};

	return (
		<>
			<div className="col-span-3 flex max-h-fit flex-col gap-4 rounded-md bg-neutral-100 p-4">
				<div className="flex items-center justify-between gap-2">
					<p className="text-xs uppercase tracking-widest">All chapters</p>

					<button
						type="button"
						onClick={addChapter}
						className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200">
						<RiAddLine className="size-4" />
						<span>Add New Chapter</span>
					</button>
				</div>

				{/* chapters */}
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{chapters.map((chapter, index) => (
						<div
							key={chapter.id}
							onClick={() => {
								onChapterIdChange?.(chapter.id);
								setCurrent(index);
							}}
							className={`"rounded-md rounded border bg-white ${chapterId === chapter.id ? "border-primary-400" : ""}`}>
							<div className="flex flex-row items-center justify-between border-b border-b-neutral-200 px-4 py-3">
								<p className="text-xs uppercase tracking-widest">Chapter {chapter.sequence}</p>

								<div className="flex items-center">
									{question_actions.map(({ icon: Icon, label }, index) => (
										<button
											type="button"
											key={index}
											onClick={() => handleActions(label, chapter.sequence)}
											className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
											<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
										</button>
									))}
								</div>
							</div>
							<div className="flex flex-col gap-4 p-5">
								<div className="flex flex-col items-center gap-2 border-b border-b-neutral-200 pb-2">
									<div className="relative w-full">
										<RiFolderVideoLine className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
										<input
											type="text"
											value={chapter.name}
											onChange={(e) => addChapterName(chapter.sequence, e.target.value)}
											placeholder="Enter chapter title"
											className="w-full rounded-md border border-neutral-200 bg-transparent p-2 pl-8 text-sm outline-0 ring-0 first-letter:uppercase placeholder:text-neutral-300 focus:border-0 focus:ring-1 focus:ring-primary-300"
										/>
									</div>

									<TiptapEditor
										value={chapter.content}
										onChange={(val) => addChapterContent(chapter.sequence, val)}
									/>
								</div>

								<ul className="flex flex-col gap-2">
									{isPendingModules && chapter.id === chapterId ? (
										<li className="flex w-full items-center justify-center p-2">
											<Spinner variant="primary" />
											<p className="pl-2 text-xs">Getting chapter lessons...</p>
										</li>
									) : (
										lessons
											.filter((lesson) => lesson.chapter_sequence === chapter.sequence)
											.map((lesson, idx) => (
												<li
													key={lesson.sequence}
													onClick={() => setLessonTab(lesson.id)}
													{...getDragProps(idx)}
													className={`flex cursor-pointer items-center gap-x-3 rounded-md border p-2 text-sm text-neutral-500 ${lesson.id === lessonTab ? "border-primary-400 bg-primary-50" : "border-neutral-200 bg-white"}`}>
													<RiDraggable className="size-4" />
													<p className="flex-1 truncate text-left capitalize">
														{lesson.title || `Lesson ${convertNumberToWord(lesson.sequence)}`}
													</p>

													{isOpen && currentLesson === lesson.id ? (
														<div className="flex items-center gap-1 text-xs">
															<button
																type="button"
																className="rounded bg-neutral-100 px-2 py-1"
																onClick={(e) => {
																	e.stopPropagation();
																	setIsOpen(false);
																}}>
																Cancel
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setLessonTab("");
																	if (lesson?.lesson_chapter) {
																		// delete the data immediately and send the request in the background
																		mutateAsync({
																			ids: [lesson.id],
																			model_type: "CHAPTER_MODULE",
																		});
																	}
																	removeLesson(chapter.sequence, lesson.sequence);
																	setIsOpen(false);
																}}
																type="button"
																className="rounded bg-red-600 px-2 py-1 font-medium text-white">
																{isDeleting ? <RiLoaderLine className="animate-spin" /> : "Confirm"}
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
												</li>
											))
									)}
								</ul>

								{chapter.id ? (
									<div className="flex items-center gap-4 pt-4">
										<button
											disabled={isPending || chapterId !== chapter.id || updateChapterIsPending}
											onClick={() => handleUpdate(chapter.id)}
											type="button"
											className="flex items-center justify-center gap-1 rounded-md bg-primary-100 px-4 py-1.5 text-sm text-primary-300 transition-colors hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-50">
											{updateChapterIsPending ? (
												<RiLoaderLine className="size-4 animate-spin" />
											) : (
												"Update Chapter"
											)}
										</button>
										<button
											disabled={isPending || chapterId !== chapter.id || updateChapterIsPending}
											onClick={() => addLesson(chapter.sequence)}
											type="button"
											className="flex items-center justify-center gap-1 rounded-md bg-neutral-100 px-4 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50">
											<RiAddLine className="size-4" />
											<span>Add new Lesson</span>
										</button>
									</div>
								) : (
									<Button type="submit" className="w-40 text-sm font-medium">
										{isPending ? <RiLoaderLine className="size-6 animate-spin" /> : "Save Chapter"}
									</Button>
								)}
							</div>
						</div>
					))}
				</form>
			</div>

			<DeleteModal
				title="Delete Chapter"
				description="Are you sure you want to delete this chapter from this course?"
				isOpen={openDeleteModal}
				setIsOpen={setOpenDeleteModal}
				onConfirm={() => {
					if (!chapterId) return;

					mutateAsync({ ids: [chapterId], model_type: "CHAPTER" }).then(() => {
						removeChapter(currentSequence);
						setCurrent(current - 1);
					});
				}}
			/>
		</>
	);
};
