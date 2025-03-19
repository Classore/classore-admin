import { useDrag } from "@/hooks";
import { UpdateChapterSequence, type UpdateChapterSequencePayload } from "@/queries";
import { chapterActions, type Chapter } from "@/store/z-store/chapter";
import { RiDraggable } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ChapterList = {
	chapters: Chapter[];
	selectChapter: (index: number, id: string) => void;
	chapterId: string | undefined;
};

const { setChapters } = chapterActions;

export const ChapterList = ({ chapters, selectChapter, chapterId }: ChapterList) => {
	const queryClient = useQueryClient();

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

	return (
		<div className="flex flex-col gap-2">
			<p className="text-[10px] text-neutral-400">Drag to reorder each chapter</p>
			<div className="flex flex-wrap items-center gap-2">
				{chapters.map((chapter, index) => (
					<button
						{...getDragProps(index)}
						key={index}
						onClick={() => selectChapter(index, chapter.id)}
						className={`flex items-center gap-x-2 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize ${chapter.id === chapterId ? "bg-primary-100 font-semibold text-primary-400" : "bg-white text-neutral-400 hover:bg-primary-50"}`}>
						<RiDraggable className="size-4" />
						<p>
							{chapter.sequence} - {chapter.name}
						</p>
					</button>
				))}
			</div>
		</div>
	);
};
