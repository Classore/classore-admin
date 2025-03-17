import { toast } from "sonner";
import { create } from "zustand";

export type Chapter = {
	// if chapter has this "id", then it means its coming from the backend, i.e user can update chapter and add lesson
	id: string;
	name: string;
	content: string;
	sequence: number;
	is_published: "NO" | "YES";
};

export type Lesson = {
	id: string;
	chapter_sequence: number;
	// if lesson has this "lesson_chapter", then it means its coming from the backend, i.e user can update the module/lesson
	lesson_chapter: string;
	title: string;
	content: string;
	sequence: number;
	videos: (File | string)[];
	images: (File | string)[];
	attachments: (File | string)[];
	image_urls: string[];
	video_urls: string[];
	attachment_urls: string[];
	tutor: string;
	is_published: "NO" | "YES";
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
	setChapters: (chapters: Chapter[]) => void;
	reorderChapter: (chapterId: string, direction: "up" | "down") => void;
	updateChapters: (chapters: Chapter[]) => void;

	// chapter lessons
	setChapterLessons: (lessons: Lesson[]) => void;
	addLesson: (chapter_sequence: number) => void;
	removeLesson: (chapter_sequence: number, sequence: number) => void;
	addLessonTitle: (sequence: number, title: string, chapter_sequence: number) => void;
	addLessonContent: (sequence: number, content: string, chapter_sequence: number) => void;
	addLessonVideo: (sequence: number, videos: (File | string)[], chapter_sequence: number) => void;
	removeLessonVideo: (sequence: number, chapter_sequence: number) => void;
	// updateVideo: (sequence: number, videos: File, chapter_sequence: string) => void;
	addLessonAttachments: (
		sequence: number,
		attachments: (File | string)[],
		chapter_sequence: number
	) => void;
	removeLessonAttachment: (
		sequence: number,
		attachment_index: number,
		chapter_sequence: number
	) => void;
	addLessonTutor: (sequence: number, tutor: string, chapter_sequence: number) => void;
};

const useChapterStore = create<ChapterState>(() => ({
	chapters: [
		{
			id: "",
			name: "",
			content: "",
			sequence: 1,
			is_published: "NO",
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
					id: "",
					name: "",
					content: "",
					sequence: state.chapters.length + 1,
					is_published: "NO",
				},
			],
		}));
	},
	removeChapter: (sequence: number) => {
		useChapterStore.setState((state) => {
			// First, filter out the chapter to be removed
			const filteredChapters = state.chapters.filter((chapter) => chapter.sequence !== sequence);

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
	setChapters: (chapters: Chapter[]) => {
		useChapterStore.setState(() => ({
			chapters,
		}));
	},
	reorderChapter: (chapterId: string, direction: "up" | "down") => {
		useChapterStore.setState((state) => {
			const chapters = [...state.chapters];
			const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);

			if (chapterIndex === -1) {
				toast.error("Chapter not found");
				return state;
			}

			const targetIndex = direction === "up" ? chapterIndex - 1 : chapterIndex + 1;

			if (targetIndex < 0 || targetIndex >= chapters.length) {
				toast.error("Cannot move chapter further");
				return state;
			}

			[chapters[chapterIndex], chapters[targetIndex]] = [
				chapters[targetIndex],
				chapters[chapterIndex],
			];

			return { chapters };
		});
	},
	updateChapters: (chapters) => {
		useChapterStore.setState((state) => ({
			chapters: [...state.chapters, ...chapters],
			lessons: state.lessons,
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
						lesson_chapter: "",
						title: "",
						content: "",
						sequence: chapterLessonLength + 1,
						videos: [],
						images: [],
						tutor: "",
						attachments: [],
						image_urls: [],
						video_urls: [],
						attachment_urls: [],
						is_published: "NO",
					},
				],
			};
		});
	},
	removeLesson: (chapter_sequence: number, sequence: number) => {
		useChapterStore.setState((state) => {
			// First, filter out the lesson to be removed
			const filteredLessons = state.lessons.filter(
				(lesson) => !(lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence)
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
	addLessonVideo: (sequence: number, video: (File | string)[], chapter_sequence: number) => {
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
					? { ...lesson, videos: [] }
					: lesson
			),
		}));
	},
	addLessonAttachments: (
		sequence: number,
		attachments: (File | string)[],
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
	removeLessonAttachment: (sequence: number, attachment_index: number, chapter_sequence: number) => {
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
	setChapterLessons: (lessons: Lesson[]) => {
		useChapterStore.setState({ lessons });
	},
	addLessonTutor: (sequence: number, tutor: string, chapter_sequence: number) => {
		useChapterStore.setState((state) => ({
			lessons: state.lessons.map((lesson) =>
				lesson.chapter_sequence === chapter_sequence && lesson.sequence === sequence
					? { ...lesson, tutor }
					: lesson
			),
		}));
	},
};

export { chapterActions, useChapterStore };
