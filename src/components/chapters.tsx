import { convertNumberToWord } from "@/lib";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import {
	RiAddLine,
	RiArrowDownLine,
	RiArrowUpLine,
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiDraggable,
	RiFileCopyLine,
	RiFolderVideoLine,
} from "@remixicon/react";
import * as React from "react";

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
} = chapterActions;

type ChaptersProps = {
	lessonTab: string;
	setLessonTab: React.Dispatch<React.SetStateAction<string>>;
};

export const Chapters = ({ setLessonTab, lessonTab }: ChaptersProps) => {
	const chapters = useChapterStore((state) => state.chapters);
	const lessons = useChapterStore((state) => state.lessons);

	return (
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
			<div className="flex flex-col gap-4">
				{chapters.map((chapter) => (
					<div key={chapter.sequence} className="rounded-md bg-white">
						<div className="flex flex-row items-center justify-between border-b border-b-neutral-200 px-4 py-3">
							<p className="text-xs uppercase tracking-widest">Chapter {chapter.sequence}</p>

							<div className="flex items-center">
								{question_actions.map(({ icon: Icon, label }, index) => (
									<button
										key={index}
										onClick={() => {
											if (label === "delete") {
												removeChapter(chapter.sequence);
												return;
											}
										}}
										className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
										<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
									</button>
								))}
							</div>
						</div>
						<div className="flex flex-col gap-2 p-5">
							<div>
								<div className="relative">
									<RiFolderVideoLine className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
									<input
										type="text"
										value={chapter.name}
										onChange={(e) => addChapterName(chapter.sequence, e.target.value)}
										placeholder="Enter chapter title"
										className="w-full rounded-t-md border border-neutral-200 bg-transparent p-2 pl-8 text-sm text-neutral-600 outline-0 ring-0 placeholder:text-neutral-300 focus:ring-0"
									/>
								</div>
								<textarea
									value={chapter.content}
									onChange={(e) => addChapterContent(chapter.sequence, e.target.value)}
									placeholder="Enter chapter summary"
									className="flex h-44 w-full resize-none rounded-b-md border border-t-0 border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-300 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>

							<div className="flex flex-col gap-2">
								{lessons
									.filter((lesson) => lesson.chapter_sequence === chapter.sequence)
									.map((lesson) => (
										<button
											key={lesson.sequence}
											onClick={() => setLessonTab(lesson.id)}
											className={`flex items-center gap-x-3 rounded-md border p-2 text-sm text-neutral-500 ${lesson.id === lessonTab ? "border-primary-400 bg-primary-50" : "border-neutral-200 bg-white"}`}>
											<RiDraggable className="size-4" />
											<p className="flex-1 truncate text-left capitalize">
												{lesson.title || `Lesson ${convertNumberToWord(lesson.sequence)}`}
											</p>

											<button
												onClick={(e) => {
													e.stopPropagation();
													setLessonTab("");
													removeLesson(chapter.sequence, lesson.sequence);
												}}
												type="button"
												className="ml-auto rounded border border-neutral-200 bg-neutral-50 p-1 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
												<RiDeleteBinLine className="size-4" />
											</button>
										</button>
									))}
							</div>

							<button
								onClick={() => addLesson(chapter.sequence)}
								type="button"
								className="mx-auto flex w-52 items-center justify-center gap-1 rounded-md border border-dotted border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200">
								<RiAddLine className="size-4" />
								<span>Add new Lesson</span>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
