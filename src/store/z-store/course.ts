import type { ChapterProps, ChapterModuleProps, CourseProps, MakeOptional, Maybe } from "@/types";
import { createReportableStore } from "../middleware";

type Chapter = MakeOptional<ChapterProps, "createdOn">;
type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

interface CourseStore {
	course: Maybe<CourseProps>;
	chapter: Maybe<Chapter>;
	chapterModule: Maybe<ChapterModule>;
	onSelectCourse: (course: CourseProps) => void;
	onSelectChapter: (chapter: Chapter) => void;
	onSelectChapterModule: (module: ChapterModule) => void;
}

const initialState: CourseStore = {
	course: null,
	chapter: null,
	chapterModule: null,
	onSelectCourse: () => {},
	onSelectChapter: () => {},
	onSelectChapterModule: () => {},
};

const useCourseStore = createReportableStore<CourseStore>((set) => ({
	...initialState,
	onSelectCourse: (course) => set({ course }),
	onSelectChapter: (chapter) => set({ chapter }),
	onSelectChapterModule: (chapterModule) => set({ chapterModule }),
}));

export { useCourseStore };
