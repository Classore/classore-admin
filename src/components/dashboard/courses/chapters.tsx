import { DeleteModal } from "@/components/delete-modal";
import { PublishModal } from "@/components/publish-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { course_sections } from "@/config";
import { useDrag } from "@/hooks";
import { sanitize } from "@/lib";
import {
	DeleteEntities,
	GetChapterModules,
	PublishResource,
	UpdateChapterSequence,
	type DeleteEntitiesPayload,
	type UpdateChapterSequencePayload,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import type { HttpError } from "@/types";
import {
	RiArrowLeftDoubleLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiEdit2Line,
	RiEye2Line,
	RiMoreLine,
} from "@remixicon/react";
import { skipToken, useMutation, usePrefetchQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";
import { AddChapter } from "../add-chapter";
import { EditChapter } from "../edit-chapter";

type ChaptersProps = {
	setSection: React.Dispatch<React.SetStateAction<string>>;
	section: string;
	setActiveChapterId: React.Dispatch<React.SetStateAction<string>>;
	activeChapterId: string;
};

const { removeChapter, setChapters } = chapterActions;

export const Chapters = ({
	setSection,
	section,
	setActiveChapterId,
	activeChapterId,
}: ChaptersProps) => {
	const queryClient = useQueryClient();

	const router = useRouter();
	const courseId = router.query.course as string;

	const [chapterId, setChapterId] = React.useState("");
	const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
	const [openPublishModal, setOpenPublishModal] = React.useState(false);
	const [currentSequence, setCurrentSequence] = React.useState(0);
	const [openEditModal, setOpenEditModal] = React.useState(false);

	const chapters = useChapterStore((state) => state.chapters);

	const { isPending: isDeleting, mutateAsync: deleteMutateAsync } = useMutation({
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

	const { mutate: updateChapterSequenceMutate } = useMutation({
		mutationFn: (payload: UpdateChapterSequencePayload) => UpdateChapterSequence(payload),
		mutationKey: ["update-chapter-sequence"],
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
		},
	});

	const { getDragProps } = useDrag({
		items: chapters,
		onReorder: (items) => setChapters(items),
		onReady: (items) => {
			updateChapterSequenceMutate({
				subject_id: String(chapterId),
				updates: items.map((item, index) => ({
					chapter_id: item.id,
					sequence: index + 1,
				})),
			});
		},
	});

	const sequence = React.useMemo(() => {
		if (chapters && !!chapters.length) {
			return chapters[chapters.length - 1].sequence + 1;
		} else {
			return 1;
		}
	}, [chapters]);

	usePrefetchQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
	});

	return (
		<>
			<article
				className={`${course_sections[section as keyof typeof course_sections].chapter} w-full overflow-y-auto rounded-md bg-neutral-100 p-4 transition-all`}>
				<header
					className={`flex items-center justify-between transition-all ${section !== "chapters" ? "writing-vertical-lr gap-3" : "writing-horizontal-tb"}`}>
					<p className="text-xs uppercase tracking-widest">All chapters</p>

					<div className="flex items-center gap-4">
						{section === "chapters" && <AddChapter courseId={courseId} sequence={sequence} />}

						<button
							type="button"
							className={`grid size-6 place-items-center rounded bg-neutral-200 text-neutral-400 transition-all hover:bg-primary-400 hover:text-white ${section !== "chapters" ? "-rotate-180" : "-rotate-0"}`}
							onClick={() => setSection("chapters")}>
							<RiArrowLeftDoubleLine className="size-5" />
						</button>
					</div>
				</header>

				<div className={`mt-4 ${section !== "chapters" ? "hidden" : "flex flex-col gap-2"}`}>
					<p className="text-[10px] text-neutral-400">
						<strong>NB:</strong> Drag to reorder each chapter
					</p>

					<div className="grid grid-cols-2 gap-3">
						{chapters.map((chapter, index) => (
							<button
								onClick={() => {
									setActiveChapterId(chapter.id);
									setSection("lessons");
								}}
								key={chapter.id}
								{...getDragProps(index)}
								type="button"
								//
								className={`flex items-start gap-x-4 rounded-md border p-3 text-sm text-neutral-500 transition-all ${activeChapterId === chapter.id ? "border-primary-400 bg-primary-50" : "border-neutral-100 bg-white"}`}>
								<RiDraggable className="size-4 self-center" />

								<div className="flex flex-1 flex-col items-start justify-between gap-2">
									<div className="flex w-full items-center justify-between gap-2 text-left">
										<div>
											<p className="gap-3 text-left uppercase tracking-widest">
												<span className="truncate text-[10px]">Chapter {chapter.sequence}</span>{" "}
												<span
													className={`ml-1 flex-shrink rounded px-2 py-0.5 text-[8px] ${chapter.is_published === "YES" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
													{chapter.is_published === "YES" ? "Published" : "Unpublished"}
												</span>
											</p>
											<p className="font-medium capitalize">{chapter.name}</p>
										</div>

										<Popover>
											<PopoverTrigger asChild>
												<button
													onClick={(e) => e.stopPropagation()}
													type="button"
													className="rounded bg-neutral-100 px-1.5 py-0.5 transition-colors hover:bg-neutral-200">
													<RiMoreLine className="size-4" />
												</button>
											</PopoverTrigger>

											<PopoverContent className="flex flex-col gap-1">
												<button
													onClick={(e) => {
														e.stopPropagation();
														setChapterId(chapter.id);
														setOpenEditModal(true);
													}}
													type="button"
													className="flex items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-200">
													<RiEdit2Line className="size-3" />
													<span>Edit</span>
												</button>
												<button
													disabled={chapter.is_published === "YES"}
													onClick={(e) => {
														e.stopPropagation();
														setChapterId(chapter.id);
														setOpenPublishModal(true);
													}}
													type="button"
													className="flex items-center gap-1.5 rounded bg-purple-50 px-2 py-1 text-xs text-purple-600 transition-colors hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50">
													<RiEye2Line className="size-3" />
													<span>Publish</span>
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setChapterId(chapter.id);
														setOpenDeleteModal(true);
														setCurrentSequence(chapter.sequence);
													}}
													type="button"
													className="flex items-center gap-1.5 rounded bg-red-50 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-200">
													<RiDeleteBin6Line className="size-3" />
													<span>Delete</span>
												</button>
											</PopoverContent>
										</Popover>
									</div>

									<div
										dangerouslySetInnerHTML={{
											__html: sanitize(chapter?.content).replace(/\n/g, "<br />"),
										}}
										className="text-pretty text-left text-xs text-neutral-400"
									/>
								</div>
							</button>
						))}
					</div>
				</div>
			</article>

			<DeleteModal
				title="Delete Chapter"
				description="Are you sure you want to delete this chapter from this course?"
				isOpen={openDeleteModal}
				setIsOpen={setOpenDeleteModal}
				isDeleting={isDeleting}
				onConfirm={() => {
					if (!chapterId) {
						removeChapter(currentSequence);
						// setCurrent(current - 1);
						setOpenDeleteModal(false);
						return;
					}

					deleteMutateAsync({ ids: [chapterId], model_type: "CHAPTER" }).then(() => {
						removeChapter(currentSequence);
						// setCurrent(current - 1);
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
			<EditChapter
				chapterId={chapterId}
				sequence={sequence}
				open={openEditModal}
				setOpen={setOpenEditModal}
			/>
		</>
	);
};
