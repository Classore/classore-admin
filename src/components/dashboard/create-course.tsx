import { useMutation } from "@tanstack/react-query";
import { RiAddLine } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";

import type { ChapterProps, ChapterModuleProps, MakeOptional } from "@/types";
import { IsHttpError, httpErrorhandler } from "@/lib";
import { useCourseStore } from "@/store/z-store";
import { CourseCard } from "./course-card";
import { ModuleCard } from "./module-card";
import { DeleteChapter } from "@/queries";
import { QuizCard } from "./quiz-card";
import { TabPanel } from "../shared";

interface Props {
	existingChapters: Chapter[];
	subjectId: string;
}

type Chapter = MakeOptional<ChapterProps, "createdOn">;
type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

export const CreateCourse = ({ existingChapters, subjectId }: Props) => {
	const [module, setModule] = React.useState<ChapterModule | null>(null);
	const [sequence, setSequence] = React.useState(0);
	const [tab, setTab] = React.useState("video");
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

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (id: string) => DeleteChapter(id),
		mutationKey: ["delete-chapter"],
		onError: (error) => {
			const isHttpError = IsHttpError(error);
			if (isHttpError) {
				const { message } = httpErrorhandler(error);
				toast.error(message);
				return;
			} else {
				toast.error("Something went wrong");
			}
		},
	});

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
		setSequence((prev) => prev + 1);
	};

	const deleteChapter = (chapter: Chapter) => {
		if (chapters.length === 1) {
			toast.error("Cannot delete the last chapter");
			return;
		}

		if (chapter.id !== "") {
			mutateAsync(chapter.id).then(() => {
				setChapters((prev) => {
					const newChapters = prev
						.filter((ch) => ch.sequence !== chapter.sequence)
						.map((ch, idx) => ({
							...ch,
							sequence: idx,
						}));
					return newChapters;
				});
				if (sequence >= chapters.length - 1) {
					setSequence(Math.max(0, sequence - 1));
					toast.success("Chapter deleted successfully");
				}
			});
		} else {
			setChapters((prev) => {
				const newChapters = prev
					.filter((ch) => ch.sequence !== chapter.sequence)
					.map((ch, idx) => ({
						...ch,
						sequence: idx,
					}));
				return newChapters;
			});
			if (sequence >= chapters.length - 1) {
				setSequence(Math.max(0, sequence - 1));
				toast.success("Chapter deleted successfully");
			}
		}
	};

	const duplicateChapter = (sequence: number) => {
		const chapter = chapters.find((chapter) => chapter.sequence === sequence);
		if (!chapter) return;

		setChapters((prev) => {
			const newChapter = {
				...chapter,
				id: "",
				sequence: prev.length,
			};
			return [...prev, newChapter];
		});
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
			[newChapters[currentIndex], newChapters[targetIndex]] = [
				newChapters[targetIndex],
				newChapters[currentIndex],
			];
			return newChapters.map((chapter, idx) => ({
				...chapter,
				sequence: idx,
			}));
		});
		if (sequence === currentIndex) {
			setSequence(targetIndex);
		} else if (sequence === targetIndex) {
			setSequence(currentIndex);
		}
	};

	const { onSelectChapterModule } = useCourseStore();
	const onSelectModule = (module: ChapterModule) => {
		setModule(module);
		onSelectChapterModule(module);
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
							index={index}
							isPending={isPending}
							isSelected={index === sequence}
							lesson={module}
							onDelete={deleteChapter}
							onDuplicate={duplicateChapter}
							onMove={moveChapter}
							onSelectChapter={setSequence}
							onSelectModule={onSelectModule}
							setTab={setTab}
							subjectId={subjectId}
						/>
					))}
				</div>
			</div>
			<div className="h-full w-full flex-1 space-y-3 rounded-lg bg-neutral-100 p-3">
				<TabPanel selected={tab} value="video" innerClassName="overflow-y-auto">
					<ModuleCard chapter={chapters[sequence]} index={sequence} module={module} />
				</TabPanel>
				<TabPanel selected={tab} value="quiz" innerClassName="overflow-y-auto">
					<QuizCard chapter={chapters[sequence]} index={sequence} module={module} />
				</TabPanel>
			</div>
		</div>
	);
};
