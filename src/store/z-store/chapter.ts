import { create } from "zustand";

type Chapter = {
	name: string;
	content: string;
	sequence: number;
};

type Lesson = {
	id: string;
	chapter_sequence: number;
	title: string;
	content: string;
	sequence: number;
	videos: File | null;
	images: File[];
	attachments: File[];
	image_urls: string[];
	video_urls: string[];
	attatchment_urls: string[];
};

type ChapterState = {
	chapters: Chapter[];
	lessons: Lesson[];
};

type ChapterActions = {
	addChapter: () => void;
	removeChapter: (sequence: number) => void;
	addChapterName: (sequence: number, name: string) => void;
	addChapterContent: (sequence: number, content: string) => void;
	setValues: (values: Chapter[]) => void;

	// chapter lessons
	addLesson: (chapter_sequence: number) => void;
	removeLesson: (chapter_sequence: number, sequence: number) => void;
	addLessonTitle: (sequence: number, title: string, chapter_sequence: number) => void;
	addLessonContent: (sequence: number, content: string, chapter_sequence: number) => void;
	addLessonVideo: (sequence: number, videos: File, chapter_sequence: number) => void;
	removeLessonVideo: (sequence: number, chapter_sequence: number) => void;
	// updateVideo: (sequence: number, videos: File, chapter_sequence: string) => void;
	addLessonAttachments: (
		sequence: number,
		attachments: File[],
		chapter_sequence: number
	) => void;
	removeLessonAttachment: (
		sequence: number,
		attachment_index: number,
		chapter_sequence: number
	) => void;
};

const useChapterStore = create<ChapterState>(() => ({
	chapters: [
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
			chapters: [
				...state.chapters,
				{
					name: "",
					content: "",
					sequence: state.chapters.length + 1,
				},
			],
		}));
	},
	removeChapter: (sequence: number) => {
		useChapterStore.setState((state) => {
			// First, filter out the chapter to be removed
			const filteredChapters = state.chapters.filter(
				(chapter) => chapter.sequence !== sequence
			);

			// Then resequence the remaining chapters
			const updatedChapters = filteredChapters.map((chapter) => {
				if (chapter.sequence > sequence) {
					return { ...chapter, sequence: chapter.sequence - 1 };
				}
				return chapter;
			});

			// Remove all lessons associated with this chapter and resequence lessons in later chapters
			const updatedLessons = state.lessons
				.filter((lesson) => lesson.chapter_sequence !== sequence)
				.map((lesson) => {
					if (lesson.chapter_sequence > sequence) {
						return { ...lesson, chapter_sequence: lesson.chapter_sequence - 1 };
					}
					return lesson;
				});

			return {
				chapters: updatedChapters,
				lessons: updatedLessons,
			};
		});
	},
	addChapterName: (sequence: number, name: string) => {
		useChapterStore.setState((state) => ({
			chapters: state.chapters.map((chapter) =>
				chapter.sequence === sequence ? { ...chapter, name } : chapter
			),
		}));
	},
	addChapterContent: (sequence: number, content: string) => {
		useChapterStore.setState((state) => ({
			chapters: state.chapters.map((chapter) =>
				chapter.sequence === sequence ? { ...chapter, content } : chapter
			),
		}));
	},
	setValues: (values: Chapter[]) => {
		useChapterStore.setState(() => ({
			chapters: values,
		}));
	},

	// LESSONS ACTIONS
	addLesson: (chapter_sequence: number) => {
		useChapterStore.setState((state) => {
			const chapterLessonLength = state.lessons.filter(
				(lesson) => lesson.chapter_sequence === chapter_sequence
			).length;

			return {
				lessons: [
					...state.lessons,
					{
						id: crypto.randomUUID(),
						chapter_sequence,
						title: "",
						content: "",
						sequence: chapterLessonLength + 1,
						videos: null,
						images: [],
						attachments: [],
						image_urls: [],
						video_urls: [],
						attatchment_urls: [],
					},
				],
			};
		});
	},
	removeLesson: (chapter_sequence: number, sequence: number) => {
		useChapterStore.setState((state) => {
			// First, filter out the lesson to be removed
			const filteredLessons = state.lessons.filter(
				(lesson) =>
					!(lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence)
			);

			// Then resequence the remaining lessons for this chapter
			const updatedLessons = filteredLessons.map((lesson) => {
				if (lesson.chapter_sequence === chapter_sequence && lesson.sequence > sequence) {
					return { ...lesson, sequence: lesson.sequence - 1 };
				}
				return lesson;
			});

			return { lessons: updatedLessons };
		});
	},
	addLessonTitle: (sequence: number, title: string, chapter_sequence: number) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, title }
					: lesson
			),
		}));
	},
	addLessonContent: (sequence: number, content: string, chapter_sequence: number) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, content }
					: lesson
			),
		}));
	},
	addLessonVideo: (sequence: number, video: File, chapter_sequence: number) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, videos: video }
					: lesson
			),
		}));
	},
	removeLessonVideo: (sequence: number, chapter_sequence: number) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, videos: null }
					: lesson
			),
		}));
	},
	addLessonAttachments: (
		sequence: number,
		attachments: File[],
		chapter_sequence: number
	) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, attachments: [...lesson.attachments, ...attachments] }
					: lesson
			),
		}));
	},
	removeLessonAttachment: (
		sequence: number,
		attachment_index: number,
		chapter_sequence: number
	) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? {
							...lesson,
							attachments: lesson.attachments.filter((_, idx) => idx !== attachment_index),
						}
					: lesson
			),
		}));
	},
};

export { chapterActions, useChapterStore };
