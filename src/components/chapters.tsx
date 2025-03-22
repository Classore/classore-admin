import {
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiDraggable,
	RiEye2Line,
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
	GetSubject,
	PublishResource,
	UpdateChapter,
	UpdateChapterModuleSequence,
	type UpdateChapterModuleSequencePayload,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import type { HttpError } from "@/types";
import { AddChapter } from "./dashboard/add-chapter";
import { DeleteModal } from "./delete-modal";
import { PublishModal } from "./publish-modal";
import { Spinner } from "./shared";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { TiptapEditor } from "./ui/tiptap-editor";

const question_actions = [
	// { label: "up", icon: RiArrowUpLine },
	// { label: "down", icon: RiArrowDownLine },
	// { label: "duplicate", icon: RiFileCopyLine },
	{ label: "publish", icon: RiEye2Line },
	{ label: "delete", icon: RiDeleteBin6Line },
];

const {
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
	const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
	const [currentSequence, setCurrentSequence] = React.useState(0);
	const [currentLesson, setCurrentLesson] = React.useState("");
	const [isOpen, setIsOpen] = React.useState(false);
	const [current, setCurrent] = React.useState(0);
	const [openPublishModal, setOpenPublishModal] = React.useState(false);

	const chapters = useChapterStore((state) => state.chapters);
	const lessons = useChapterStore((state) => state.lessons);
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const currentChapter = React.useMemo(() => chapters[current], [chapters, current]);
	const container = React.useRef<HTMLFormElement>(null);
	const refs = React.useRef<(HTMLDivElement | null)[]>([]);

	// TODO: find a better way to do this
	const { isPending: isPendingModules } = useQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
		enabled: !!chapterId,
	});
	const { data: course } = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: () => GetSubject(courseId),
		enabled: !!courseId,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateChapterDto) => CreateChapter(payload),
		mutationKey: ["create-chapter"],
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
			window.location.reload();
		},
	});

	const { isPending: updateChapterIsPending, mutate: updateChapterMutate } = useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateChapterDto> }) =>
			UpdateChapter(id, payload),
		mutationKey: ["update-chapter"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
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

	// PUBLISH CHAPTER MUTATION
	const { mutate: publishMutate, isPending: publishPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			toast.success("Chapter published successfully!");
			queryClient.invalidateQueries({
				queryKey: ["get-subject"],
			});
			setOpenPublishModal(false);
		},
	});

	const { getDragProps } = useDrag({
		items: lessons,
		onReorder: (items) => setChapterLessons(items),
		onReady: (items) => {
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
		if (chapterId) {
			const currentChapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
			if (currentChapterIndex >= 0) {
				setCurrent(currentChapterIndex);
			}
		} else if (chapters.length > 0) {
			const chapterWithId = chapters.findIndex((chapter) => chapter.id);
			if (chapterWithId >= 0) {
				setCurrent(chapterWithId);
				if (onChapterIdChange) {
					onChapterIdChange(chapters[chapterWithId].id);
				}
			}
		}
	}, [chapterId, onChapterIdChange]);

	React.useEffect(() => {
		if (chapterId) {
			const currentChapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
			if (currentChapterIndex >= 0 && refs.current[currentChapterIndex]) {
				const chapterElement = refs.current[currentChapterIndex];
				chapterElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}
	}, [chapterId, chapters]);

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

		const chapter = course?.data.chapters.find((chapter) => chapter.id === id);
		if (!chapter) {
			toast.error("Chapter not found");
			return;
		}

		const payload: Partial<CreateChapterDto> = {
			name: currentChapter.name,
			content: currentChapter.content,
			sequence: currentChapter.sequence,
		};

		updateChapterMutate({
			id,
			payload,
		});
		// if (currentChapter.name !== chapter.name || currentChapter.content !== chapter.content) {
		// 	console.log("payload", payload);
		// }

		// toast.info("Chapter updated successfully")
	};

	const handleActions = (action: string) => {
		if (!chapterId) {
			toast.error("Please select a chapter");
			return;
		}

		switch (action) {
			case "delete":
				setOpenDeleteModal(true);
				setCurrentSequence(sequence - 1);
				break;
			case "publish":
				setOpenPublishModal(true);
				break;
			default:
				return;
		}
	};

	const selectChapter = (index: number, id: string | undefined) => {
		setCurrent(index);
		onChapterIdChange?.(id);
	};

	React.useEffect(() => {
		if (container.current) {
			container.current.scrollTo({
				top: container.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, []);

	const sequence = React.useMemo(() => {
		if (chapters && !!chapters.length) {
			return chapters[chapters.length - 1].sequence + 1;
		} else {
			return 1;
		}
	}, [chapters]);

	return (
		<>
			<div className="col-span-3 flex h-full flex-col gap-y-4 overflow-y-auto rounded-md bg-neutral-100 p-4">
				<div className="flex flex-1 items-center justify-between gap-2">
					<p className="text-xs uppercase tracking-widest">All chapters</p>

					<AddChapter courseId={courseId} sequence={sequence} />
				</div>

				{/* Chapter selection buttons - ONLY way to select a chapter */}
				{/* <ChapterList chapters={chapters} selectChapter={selectChapter} chapterId={chapterId} /> */}

				{/* chapters */}
				<ScrollArea className="flex h-full w-full items-start gap-x-4">
					<form
						ref={container}
						onSubmit={handleSubmit}
						className="flex flex-1 flex-col gap-4 transition-all duration-500">
						{chapters.map((chapter, index) => (
							<div
								key={index}
								onClick={() => selectChapter(index, chapter.id)}
								ref={(div) => {
									if (div) {
										refs.current[index] = div;
									}
								}}
								className={`rounded-md border bg-white ${chapterId === chapter.id ? "border-primary-400" : "border-neutral-200"}`}>
								<div className="flex flex-row items-center justify-between border-b border-b-neutral-200 px-4 py-3">
									<p className="text-xs uppercase tracking-widest">Chapter {chapter.sequence}</p>

									<div className="flex items-center">
										{question_actions.map(({ icon: Icon, label }, idx) => (
											<button
												title={label}
												type="button"
												key={idx}
												{...(label === "publish" ? { disabled: chapter.is_published === "YES" } : {})}
												onClick={() => handleActions(label)}
												className="group grid size-7 cursor-pointer place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100 disabled:cursor-not-allowed">
												<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
											</button>
										))}
									</div>
								</div>
								<div>
									<p
										className={`p-1 text-center text-[10px] font-bold uppercase ${chapter.is_published === "YES" ? "bg-green-50 text-green-400" : "bg-red-50 text-red-400"}`}>
										Chapter Status: {chapter.is_published === "YES" ? "Published" : "Unpublished"}
									</p>

									<div className="flex flex-col gap-4 p-5">
										<div className="flex flex-col items-center gap-2 border-b border-b-neutral-200">
											<div className="relative w-full">
												<RiFolderVideoLine className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
												<input
													type="text"
													value={chapter.name}
													onChange={(e) => {
														addChapterName(chapter.sequence, e.target.value);
													}}
													placeholder="Enter chapter title"
													className="w-full rounded-md border border-neutral-200 bg-transparent p-2 pl-8 text-sm outline-0 ring-0 first-letter:uppercase placeholder:text-neutral-300 focus:border-0 focus:ring-1 focus:ring-primary-300"
												/>
											</div>
											{/* <div className="relative w-full">
												<RiListOrdered className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
												<input
													type="number"
													value={chapter.sequence}
													onChange={(e) => {
														addChapterSequence(chapter.id, parseInt(e.target.value));
													}}
													placeholder="Enter chapter sequence"
													className="w-full rounded-md border border-neutral-200 bg-transparent p-2 pl-8 text-sm outline-0 ring-0 first-letter:uppercase placeholder:text-neutral-300 focus:border-0 focus:ring-1 focus:ring-primary-300"
												/>
											</div> */}

											<TiptapEditor
												value={chapter.content}
												onChange={(val) => {
													addChapterContent(chapter.sequence, val);
												}}
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
															key={idx}
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
											<div className="flex items-center justify-between gap-2">
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
														<span>Add new Lesson</span>
													</button>
												</div>
												{/* <button
										disabled={isPending || chapterId !== chapter.id || updateChapterIsPending}
										onClick={() => handleUpdate(chapter.id)}
										type="button"
										className="flex items-center justify-center gap-1 rounded-md bg-primary-100 px-4 py-1.5 text-sm text-primary-300 transition-colors hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-50">
										Publish
									</button> */}
											</div>
										) : (
											<Button type="submit" className="w-40 text-sm font-medium">
												{isPending ? <RiLoaderLine className="size-6 animate-spin" /> : "Save Chapter"}
											</Button>
										)}
									</div>
								</div>
							</div>
						))}
					</form>
				</ScrollArea>
			</div>

			<DeleteModal
				title="Delete Chapter"
				description="Are you sure you want to delete this chapter from this course?"
				isOpen={openDeleteModal}
				setIsOpen={setOpenDeleteModal}
				onConfirm={() => {
					if (!chapterId) {
						removeChapter(currentSequence);
						setCurrent(current - 1);
						setOpenDeleteModal(false);
						return;
					}

					mutateAsync({ ids: [chapterId], model_type: "CHAPTER" }).then(() => {
						removeChapter(currentSequence);
						setCurrent(current - 1);
					});
				}}
			/>
			<PublishModal
				open={openPublishModal}
				setOpen={setOpenPublishModal}
				isPending={publishPending}
				type="chapter"
				onConfirm={() => {
					publishMutate({
						id: String(chapterId),
						model_type: "CHAPTER",
					});
				}}
				hasTrigger={false}
			/>
		</>
	);
};
