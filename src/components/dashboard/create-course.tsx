import { useQuery } from "@tanstack/react-query";
import { RiAddLine } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";

import type { ChapterProps, ChapterModuleProps, MakeOptional } from "@/types";
import { GetChapterModules } from "@/queries";
import { CourseCard } from "./course-card";
import { ModuleCard } from "./module-card";

interface Props {
	existingChapters: Chapter[];
	subjectId: string;
}

type Chapter = MakeOptional<ChapterProps, "createdOn">;
type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

export const CreateCourse = ({ existingChapters, subjectId }: Props) => {
	const [sequence, setSequence] = React.useState(() => {
		return existingChapters.length > 0 ? existingChapters.length - 1 : 0;
	});
	const [module, setModule] = React.useState<ChapterModule | null>(null);
	const [chapters, setChapters] = React.useState<Chapter[]>(() => {
		const initialChapters = existingChapters.map((chapter, idx) => ({
			...chapter,
			sequence: idx,
			subject_id: subjectId,
		}));

		initialChapters.push({
			content: "",
			id: "",
			images: [],
			name: "",
			sequence: initialChapters.length,
			subject_id: subjectId,
			videos: [],
		});

		return initialChapters;
	});

	const { data } = useQuery({
		queryKey: ["get-modules", chapters[sequence].id],
		queryFn: () => GetChapterModules({ chapter_id: chapters[sequence].id }),
		enabled: !!chapters[sequence].id,
	});

	const modules: ChapterModule[] = React.useMemo(() => {
		if (data) {
			return data?.data.data.map((chapter) => {
				const mod = {
					attachments: [],
					chapter: chapter.chapter_module_chapter,
					content: chapter.chapter_module_content,
					id: chapter.chapter_module_id,
					images: chapter.chapter_module_images,
					sequence: chapter.chapter_module_sequence,
					title: chapter.chapter_module_title,
					tutor: chapter.chapter_module_tutor,
					videos: chapter.chapter_module_videos,
				};

				return mod;
			});
		}
		return [];
	}, [data]);

	const addChapter = () => {
		setChapters((prev) => {
			const newChapter: Chapter = {
				content: "",
				id: "",
				images: [],
				name: "",
				sequence: prev.length,
				subject_id: subjectId,
				videos: [],
			};
			return [...prev, newChapter];
		});
		// Set sequence to the newly added chapter
		setSequence((prev) => prev + 1);
	};

	const deleteChapter = (chapter: Chapter) => {
		if (chapters.length === 1) {
			toast.error("Cannot delete the last chapter");
			return;
		}

		setChapters((prev) => {
			const newChapters = prev
				.filter((ch) => ch.sequence !== chapter.sequence)
				.map((ch, idx) => ({
					...ch,
					sequence: idx,
				}));
			return newChapters;
		});

		// Adjust sequence after deletion
		if (sequence >= chapters.length - 1) {
			setSequence(Math.max(0, sequence - 1));
		}
	};

	const duplicateChapter = (sequence: number) => {
		const chapter = chapters.find((chapter) => chapter.sequence === sequence);
		if (!chapter) return;

		setChapters((prev) => {
			const newChapter = {
				...chapter,
				id: "", // Reset ID for the duplicate
				sequence: prev.length,
			};
			return [...prev, newChapter];
		});
		// Set sequence to the newly duplicated chapter
		setSequence(chapters.length);
	};

	const moveChapter = (sequence: number, direction: "up" | "down") => {
		const currentIndex = chapters.findIndex((chapter) => chapter.sequence === sequence);
		if (currentIndex === -1) return;

		const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

		if (targetIndex < 0 || targetIndex >= chapters.length) {
			toast.error(`Cannot move chapter ${direction}`);
			return;
		}

		setChapters((prev) => {
			const newChapters = [...prev];
			// Swap the chapters
			[newChapters[currentIndex], newChapters[targetIndex]] = [
				newChapters[targetIndex],
				newChapters[currentIndex],
			];
			// Update sequences
			return newChapters.map((chapter, idx) => ({
				...chapter,
				sequence: idx,
			}));
		});

		// Update selected sequence if we're moving the current chapter
		if (sequence === currentIndex) {
			setSequence(targetIndex);
		} else if (sequence === targetIndex) {
			setSequence(currentIndex);
		}
	};

	return (
		<div className="flex h-full w-full gap-x-2">
			<div className="h-full w-[44%] space-y-3 overflow-hidden rounded-lg bg-neutral-100 p-3">
				<div className="flex w-full items-center justify-between">
					<p className="text-xs font-medium text-neutral-400">ALL CHAPTERS</p>
					<button
						onClick={addChapter}
						className="flex items-center gap-x-0.5 rounded bg-white px-2 py-1.5 text-xs text-neutral-400">
						<RiAddLine size={16} /> Add New Chapter
					</button>
				</div>
				<div
					className={`h-full w-full space-y-4 overflow-y-auto ${chapters.length > 1 ? "pb-10" : ""}`}>
					{chapters.map((chapter, index) => (
						<CourseCard
							key={`${chapter.id}-${index}`}
							addChapter={addChapter}
							chapter={chapter}
							existingModules={modules}
							index={index}
							isSelected={sequence === index}
							onDelete={deleteChapter}
							onDuplicate={duplicateChapter}
							onMove={moveChapter}
							onSelectChapter={setSequence}
							onSelectModule={setModule}
							subjectId={subjectId}
						/>
					))}
				</div>
			</div>
			<div className="h-full w-full flex-1 space-y-3 rounded-lg bg-neutral-100 p-3">
				<ModuleCard chapter={chapters[sequence]} index={sequence} module={module} />
			</div>
		</div>
	);
};
