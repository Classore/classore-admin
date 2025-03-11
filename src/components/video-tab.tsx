import { convertNumberToWord } from "@/lib";
import { useChapterStore } from "@/store/z-store/chapter";
import { RiArrowLeftSLine } from "@remixicon/react";
import { VideoUploader } from "./video-uploader";

interface Props {
	chapterId: string | undefined;
	lessonTab: string;
	setCurrentTab: (tab: string) => void;
}

export const VideoTab = ({ lessonTab, setCurrentTab }: Props) => {
	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === lessonTab);

	if (!lesson) return null;

	return (
		<div className="col-span-4 space-y-2 rounded-md bg-neutral-100 p-4">
			<div className="flex w-full items-center justify-between">
				<p className="text-xs uppercase tracking-widest">
					Lesson {lesson && convertNumberToWord(lesson?.sequence)} - Chapter{" "}
					{lesson && convertNumberToWord(lesson?.chapter_sequence)}
				</p>
				<button
					type="button"
					onClick={() => setCurrentTab("lesson")}
					className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
					<RiArrowLeftSLine className="size-4" />
					<span>Back to Lesson</span>
				</button>
			</div>

			{/* UPLOAD VIDEO */}
			<VideoUploader
				moduleId={lesson.lesson_chapter}
				sequence={lesson.sequence}
				video_array={lesson.videos.map((video) => video)}
			/>
		</div>
	);
};
