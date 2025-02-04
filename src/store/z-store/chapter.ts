import { create } from "zustand";

type Chapter = {
	name: string;
	content: string;
	sequence: number;
};

type Lesson = {
	chapter_sequence: string;
	title: string;
	content: string;
	sequence: number;
	videos: File[];
	images: File[];
	attachments: File[];
	image_urls: string[];
	video_urls: string[];
	attatchment_urls: string[];
};

type ChapterState = {
	chapter: Chapter[];
	// lessons: Lesson[];
};

type ChapterActions = {
	addChapter: () => void;
	removeChapter: (sequence: number) => void;
	addChapterName: (sequence: number, name: string) => void;
	addChapterContent: (sequence: number, content: string) => void;
	setValues: (values: Chapter[]) => void;
};

// type LessonActions = {
// 	addLesson: (lesson: LineAndPositionSetting) => void;
// 	removeLesson: (sequence: number) => void;
// 	updateLesson: (sequence: number, lesson: Lesson) => void;

// 	addLessonValues: (sequence: number, lesson: Lesson) => void;

// 	addLessonTitle: (sequence: number, value: string) => void;
// 	addLessonContent: (sequence: number, value: string) => void;
// 	addVideo: (sequence: number, videos: File) => void;
// 	updateVideo: (sequence: number, videos: File) => void;
// 	addAttachments: (sequence: number, attachments: File[]) => void;
// 	removeAttachment: (sequence: number, attachment_id: number) => void;
// };

const useChapterStore = create<ChapterState>(() => ({
	chapter: [
		{
			name: "",
			content: "",
			sequence: 1,
		},
	],
	lessons: [],
}));

// actions
const chapterActions: ChapterActions = {
	addChapter: () => {
		useChapterStore.setState((state) => ({
			chapter: [
				...state.chapter,
				{
					name: "",
					content: "",
					sequence: state.chapter.length + 1,
				},
			],
		}));
	},
	removeChapter: (sequence: number) => {
		useChapterStore.setState((state) => ({
			chapter: state.chapter.filter((chapter) => chapter.sequence !== sequence),
		}));
	},
	// namae not updating when using with input
	addChapterName: (sequence: number, name: string) => {
		useChapterStore.setState((state) => ({
			chapter: state.chapter.map((chapter, idx) =>
				idx === sequence ? { ...chapter, name } : chapter
			),
		}));
	},
	addChapterContent: (sequence: number, content: string) => {
		useChapterStore.setState((state) => ({
			chapter: state.chapter.map((chapter, idx) =>
				idx === sequence ? { ...chapter, content } : chapter
			),
		}));
	},
	setValues: (values: Chapter[]) => {
		useChapterStore.setState(() => ({
			chapter: values,
		}));
	},
};

export { chapterActions, useChapterStore };
