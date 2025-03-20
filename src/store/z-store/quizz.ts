import { toast } from "sonner";
import { createPersistMiddleware } from "../middleware";
import type { QuestionTypeProps } from "@/types";

export type Option = {
	content: string;
	is_correct: "YES" | "NO";
	sequence_number: number;
	images?: File[];
};

export type QuestionDto = {
	content: string;
	images: File[];
	options: Option[];
	question_type: QuestionTypeProps;
	sequence: number;
	sequence_number: number;
	id?: string;
};

interface QuizStore {
	addImagesToQuestion: (chapterId: string, moduleId: string, id: number, images: File[]) => void;
	addOption: (chapterId: string, moduleId: string, id: number) => void;
	addOptionContent: (
		chapterId: string,
		moduleId: string,
		id: number,
		content: string,
		option_id: number
	) => void;
	addQuestion: (chapterId: string, moduleId: string) => void;
	addQuestionContent: (chapterId: string, moduleId: string, id: number, content: string) => void;
	duplicateQuestion: (chapterId: string, moduleId: string, id: number) => void;
	getQuestionErrors: (question: QuestionDto) => string[];
	handleTypeChange: (
		question_type: QuestionTypeProps,
		chapterId: string,
		moduleId: string,
		id: number
	) => void;
	questions: Record<string, Record<string, QuestionDto[]>>;
	removeImageFromQuestion: (
		chapterId: string,
		moduleId: string,
		id: number,
		image_id: number
	) => void;
	removeOption: (chapterId: string, moduleId: string, id: number, option_id: number) => void;
	removeQuestion: (chapterId: string, moduleId: string, id: number) => void;
	reorderQuestion: (
		chapterId: string,
		moduleId: string,
		index: number,
		direction: "up" | "down"
	) => void;
	resetModule: (chapterId: string, moduleId: string) => void;
	setCorrectOption: (chapterId: string, moduleId: string, id: number, option_id: number) => void;
	setQuestions: (chapterId: string, moduleId: string, questions: QuestionDto[]) => void;
	submitQuestions: (chapterId: string, moduleId: string) => Promise<boolean>;
	updateQuestions: (chapterId: string, moduleId: string, questions: QuestionDto[]) => void;
	selected: QuestionDto[];
	toggleSelected: (question: QuestionDto) => void;
}

const MAX_IMAGES_PER_QUESTION = 5;
const MAX_OPTIONS_PER_QUESTION = 4;
const MIN_OPTIONS_PER_QUESTION = 1;
const MAX_QUESTION_CONTENT_LENGTH = 1000;
const MAX_OPTION_CONTENT_LENGTH = 500;
const MAX_IMAGE_SIZE_MB = 5;

const getEmptyQuestion = (sequence: number): QuestionDto => ({
	content: "",
	images: [],
	options: [],
	question_type: "SINGLE_CHOICE",
	sequence,
	sequence_number: sequence,
	id: "",
});

const getEmptyOption = (sequence: number): Option => ({
	content: "",
	is_correct: "NO",
	sequence_number: sequence,
	images: [],
});

const validateImageSize = (file: File): boolean => {
	const sizeInMB = file.size / (1024 * 1024);
	return sizeInMB <= MAX_IMAGE_SIZE_MB;
};

const resequenceQuestions = (questions: QuestionDto[]): QuestionDto[] => {
	return questions.map((q, idx) => ({
		...q,
		sequence: idx + 1,
		sequence_number: idx + 1,
	}));
};

const resequenceOptions = (options: Option[]): Option[] => {
	return options.map((opt, idx) => ({
		...opt,
		sequence_number: idx + 1,
	}));
};

const useQuizStore = createPersistMiddleware<QuizStore>("quiz-store", (set, get) => ({
	questions: {},
	selected: [],

	getQuestionErrors: (question: QuestionDto): string[] => {
		const errors: string[] = [];

		if (!question.content.trim()) {
			errors.push("Question content is required");
		}

		if (question.content.length > MAX_QUESTION_CONTENT_LENGTH) {
			errors.push(`Question content must not exceed ${MAX_QUESTION_CONTENT_LENGTH} characters`);
		}

		if (question.options.length < MIN_OPTIONS_PER_QUESTION) {
			errors.push(`Question must have at least ${MIN_OPTIONS_PER_QUESTION} options`);
		}

		if (question.options.length > MAX_OPTIONS_PER_QUESTION) {
			errors.push(`Question cannot have more than ${MAX_OPTIONS_PER_QUESTION} options`);
		}

		if (!question.options.some((opt) => opt.is_correct === "YES")) {
			errors.push("Question must have at least one correct option");
		}

		if (
			question.question_type === "SINGLE_CHOICE" &&
			question.options.filter((opt) => opt.is_correct === "YES").length > 1
		) {
			errors.push("Single choice questions can only have one correct option");
		}

		question.options.forEach((opt, idx) => {
			if (!opt.content.trim()) {
				errors.push(`Option ${idx + 1} content is required`);
			}
			if (opt.content.length > MAX_OPTION_CONTENT_LENGTH) {
				errors.push(
					`Option ${idx + 1} content must not exceed ${MAX_OPTION_CONTENT_LENGTH} characters`
				);
			}
		});

		if (question.images.length > MAX_IMAGES_PER_QUESTION) {
			errors.push(`Question cannot have more than ${MAX_IMAGES_PER_QUESTION} images`);
		}

		return errors;
	},

	setQuestions: (chapterId, moduleId, questions) =>
		set((state) => ({
			questions: {
				...state.questions,
				[chapterId]: {
					...state.questions[chapterId],
					[moduleId]: resequenceQuestions(questions),
				},
			},
		})),

	addQuestion: (chapterId, moduleId) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const newSequence = currentQuestions.length + 1;

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: [...currentQuestions, getEmptyQuestion(newSequence)],
					},
				},
			};
		}),

	duplicateQuestion: (chapterId, moduleId, id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const questionToDuplicate = currentQuestions.find((q) => q.sequence === id);

			if (!questionToDuplicate) return state;

			const newQuestion: QuestionDto = {
				...questionToDuplicate,
				sequence: currentQuestions.length + 1,
				sequence_number: currentQuestions.length + 1,
				options: questionToDuplicate.options.map((opt) => ({
					...opt,
					images: [...(opt.images || [])],
				})),
				images: [...questionToDuplicate.images],
			};

			const updatedQuestions = [...currentQuestions, newQuestion];

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: resequenceQuestions(updatedQuestions),
					},
				},
			};
		}),

	removeQuestion: (chapterId, moduleId, id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const updatedQuestions = currentQuestions.filter((q) => q.sequence !== id);

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: resequenceQuestions(updatedQuestions),
					},
				},
			};
		}),

	handleTypeChange: (question_type, chapterId, moduleId, id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const optionTemplates: Record<QuestionTypeProps, Option[]> = {
				MULTICHOICE: [{ content: "", is_correct: "NO", sequence_number: 1 }],
				FILL_IN_THE_GAP: [{ content: "", is_correct: "YES", sequence_number: 1 }],
				YES_OR_NO: [
					{ content: "True", is_correct: "YES", sequence_number: 1 },
					{ content: "False", is_correct: "NO", sequence_number: 2 },
				],
			};

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) =>
							q.sequence === id
								? { ...q, question_type, options: optionTemplates[question_type] || [] }
								: q
						),
					},
				},
			};
		}),

	addOption: (chapterId, moduleId, id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const targetQuestion = currentQuestions.find((q) => q.sequence === id);

			if (!targetQuestion || targetQuestion.options.length >= MAX_OPTIONS_PER_QUESTION) {
				toast.error(`Cannot add more than ${MAX_OPTIONS_PER_QUESTION} options`);
				return state;
			}

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) => {
							if (q.sequence === id) {
								const newSequence = q.options.length + 1;
								return {
									...q,
									options: resequenceOptions([...q.options, getEmptyOption(newSequence)]),
								};
							}
							return q;
						}),
					},
				},
			};
		}),

	removeOption: (chapterId, moduleId, id, option_id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const targetQuestion = currentQuestions.find((q) => q.sequence === id);

			if (!targetQuestion || targetQuestion.options.length <= MIN_OPTIONS_PER_QUESTION) {
				toast.error(`Cannot have fewer than ${MIN_OPTIONS_PER_QUESTION} options`);
				return state;
			}

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) => {
							if (q.sequence === id) {
								const updatedOptions = q.options.filter((opt) => opt.sequence_number !== option_id);
								return { ...q, options: resequenceOptions(updatedOptions) };
							}
							return q;
						}),
					},
				},
			};
		}),

	setCorrectOption: (chapterId, moduleId, id, option_id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) => {
							if (q.sequence === id) {
								return {
									...q,
									options: q.options.map((opt) => ({
										...opt,
										is_correct:
											q.question_type === "SINGLE_CHOICE"
												? opt.sequence_number === option_id
													? "YES"
													: "NO"
												: opt.sequence_number === option_id
													? opt.is_correct === "YES"
														? "NO"
														: "YES"
													: opt.is_correct,
									})),
								};
							}
							return q;
						}),
					},
				},
			};
		}),

	addOptionContent: (chapterId, moduleId, id, content, option_id) =>
		set((state) => {
			if (content.length > MAX_OPTION_CONTENT_LENGTH) {
				toast.error(`Option content cannot exceed ${MAX_OPTION_CONTENT_LENGTH} characters`);
				return state;
			}

			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) => {
							if (q.sequence === id) {
								return {
									...q,
									options: q.options.map((opt) =>
										opt.sequence_number === option_id ? { ...opt, content } : opt
									),
								};
							}
							return q;
						}),
					},
				},
			};
		}),

	addQuestionContent: (chapterId, moduleId, id, content) =>
		set((state) => {
			if (content.length > MAX_QUESTION_CONTENT_LENGTH) {
				toast.error(`Question content cannot exceed ${MAX_QUESTION_CONTENT_LENGTH} characters`);
				return state;
			}

			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) => (q.sequence === id ? { ...q, content } : q)),
					},
				},
			};
		}),

	addImagesToQuestion: (chapterId, moduleId, id, images) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const targetQuestion = currentQuestions.find((q) => q.sequence === id);

			if (!targetQuestion) return state;

			const totalImages = targetQuestion.images.length + images.length;
			if (totalImages > MAX_IMAGES_PER_QUESTION) {
				toast.error(`Cannot add more than ${MAX_IMAGES_PER_QUESTION} images to a question`);
				return state;
			}

			const validImages = Array.from(images).filter(validateImageSize);
			if (validImages.length !== images.length) {
				toast.error(`Some images exceed the maximum size of ${MAX_IMAGE_SIZE_MB}MB`);
			}

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) =>
							q.sequence === id ? { ...q, images: [...q.images, ...validImages] } : q
						),
					},
				},
			};
		}),

	removeImageFromQuestion: (chapterId, moduleId, id, image_id) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: currentQuestions.map((q) =>
							q.sequence === id ? { ...q, images: q.images.filter((_, idx) => idx !== image_id) } : q
						),
					},
				},
			};
		}),

	reorderQuestion: (chapterId, moduleId, index, direction) =>
		set((state) => {
			const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
			const targetIndex = direction === "up" ? index - 1 : index + 1;

			if (targetIndex < 0 || targetIndex >= currentQuestions.length) return state;

			const newQuestions = [...currentQuestions];
			[newQuestions[index], newQuestions[targetIndex]] = [
				newQuestions[targetIndex],
				newQuestions[index],
			];

			return {
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: resequenceQuestions(newQuestions),
					},
				},
			};
		}),

	resetModule: (chapterId, moduleId) =>
		set((state) => ({
			questions: {
				...state.questions,
				[chapterId]: {
					...state.questions[chapterId],
					[moduleId]: [],
				},
			},
		})),

	submitQuestions: async (chapterId, moduleId) => {
		const questions = get().questions[chapterId]?.[moduleId] || [];
		return questions.length > 0;
	},
	updateQuestions: (chapterId, moduleId, questions) => {
		set((state) => ({
			questions: {
				...state.questions,
				[chapterId]: {
					...state.questions[chapterId],
					[moduleId]: resequenceQuestions(questions),
				},
			},
		}));
	},
	toggleSelected: (question) => {
		set((state) => {
			if (state.selected.includes(question)) {
				return {
					selected: state.selected.filter((q) => q !== question),
				};
			} else {
				return {
					selected: [...state.selected, question],
				};
			}
		});
	},
}));

export { useQuizStore };
