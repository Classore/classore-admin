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
	questions: Record<string, Record<string, QuestionDto[]>>;
	selectedQuestions: Record<string, Record<string, number[]>>;
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

	// New functions for multi-select and delete
	toggleQuestionSelection: (chapterId: string, moduleId: string, id: number) => void;
	selectAllQuestions: (chapterId: string, moduleId: string) => void;
	deselectAllQuestions: (chapterId: string, moduleId: string) => void;
	deleteSelectedQuestions: (chapterId: string, moduleId: string) => void;
	isQuestionSelected: (chapterId: string, moduleId: string, id: number) => boolean;
	getSelectedCount: (chapterId: string, moduleId: string) => number;
}

const CONSTANTS = {
	MAX_IMAGES: 5,
	MAX_OPTIONS: 4,
	MIN_OPTIONS: 1,
	MAX_QUESTION_LENGTH: 1000,
	MAX_OPTION_LENGTH: 500,
	MAX_IMAGE_SIZE_MB: 5,
} as const;

const createEmptyQuestion = (sequence: number): QuestionDto => ({
	content: "",
	images: [],
	options: [],
	question_type: "SINGLE_CHOICE",
	sequence,
	sequence_number: sequence,
	id: "",
});

const createEmptyOption = (sequence: number): Option => ({
	content: "",
	is_correct: "NO",
	sequence_number: sequence,
	images: [],
});

const resequenceItems = <T extends { sequence_number: number; sequence?: number }>(
	items: T[]
): T[] =>
	items.map((item, idx) => ({
		...item,
		sequence_number: idx + 1,
		...(item.sequence !== undefined && { sequence: idx + 1 }),
	}));

const validateImageSize = (file: File): boolean =>
	file.size / (1024 * 1024) <= CONSTANTS.MAX_IMAGE_SIZE_MB;

const useQuizStore = createPersistMiddleware<QuizStore>("quiz-store", (set, get) => {
	return {
		questions: {},
		selectedQuestions: {},

		setQuestions: (chapterId, moduleId, questions) =>
			set((state) => ({
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: resequenceItems(questions),
					},
				},
			})),

		addQuestion: (chapterId, moduleId) =>
			set((state) => {
				const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]: [...currentQuestions, createEmptyQuestion(currentQuestions.length + 1)],
						},
					},
				};
			}),

		addQuestionContent: (chapterId, moduleId, id, content) =>
			set((state) => {
				if (content.length > CONSTANTS.MAX_QUESTION_LENGTH) {
					toast.error(`Question content cannot exceed ${CONSTANTS.MAX_QUESTION_LENGTH} characters`);
					return state;
				}

				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]:
								state.questions[chapterId]?.[moduleId]?.map((q) =>
									q.sequence === id ? { ...q, content } : q
								) || [],
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

				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]: resequenceItems([...currentQuestions, newQuestion]),
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
							[moduleId]: resequenceItems(updatedQuestions),
						},
					},
					selectedQuestions: {
						...state.selectedQuestions,
						[chapterId]: {
							...state.selectedQuestions[chapterId],
							[moduleId]: (state.selectedQuestions[chapterId]?.[moduleId] || []).filter(
								(seq) => seq !== id
							),
						},
					},
				};
			}),

		handleTypeChange: (question_type, chapterId, moduleId, id) =>
			set((state) => {
				const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
				const optionTemplates: Record<QuestionTypeProps, Option[]> = {
					MULTICHOICE: [createEmptyOption(1)],
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

				if (!targetQuestion || targetQuestion.options.length >= CONSTANTS.MAX_OPTIONS) {
					toast.error(`Cannot add more than ${CONSTANTS.MAX_OPTIONS} options`);
					return state;
				}

				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]: currentQuestions.map((q) => {
								if (q.sequence === id) {
									return {
										...q,
										options: resequenceItems([...q.options, createEmptyOption(q.options.length + 1)]),
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

				if (!targetQuestion || targetQuestion.options.length <= CONSTANTS.MIN_OPTIONS) {
					toast.error(`Cannot have fewer than ${CONSTANTS.MIN_OPTIONS} options`);
					return state;
				}

				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]: currentQuestions.map((q) => {
								if (q.sequence === id) {
									return {
										...q,
										options: resequenceItems(q.options.filter((opt) => opt.sequence_number !== option_id)),
									};
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
				if (content.length > CONSTANTS.MAX_OPTION_LENGTH) {
					toast.error(`Option content cannot exceed ${CONSTANTS.MAX_OPTION_LENGTH} characters`);
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

		addImagesToQuestion: (chapterId, moduleId, id, images) =>
			set((state) => {
				const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
				const targetQuestion = currentQuestions.find((q) => q.sequence === id);

				if (!targetQuestion) return state;

				const totalImages = targetQuestion.images.length + images.length;
				if (totalImages > CONSTANTS.MAX_IMAGES) {
					toast.error(`Cannot add more than ${CONSTANTS.MAX_IMAGES} images to a question`);
					return state;
				}

				const validImages = Array.from(images).filter(validateImageSize);
				if (validImages.length !== images.length) {
					toast.error(`Some images exceed the maximum size of ${CONSTANTS.MAX_IMAGE_SIZE_MB}MB`);
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
							[moduleId]: resequenceItems(newQuestions),
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
				selectedQuestions: {
					...state.selectedQuestions,
					[chapterId]: {
						...state.selectedQuestions[chapterId],
						[moduleId]: [],
					},
				},
			})),

		submitQuestions: async (chapterId, moduleId) => {
			const questions = get().questions[chapterId]?.[moduleId] || [];
			return questions.length > 0;
		},

		updateQuestions: (chapterId, moduleId, questions) =>
			set((state) => ({
				questions: {
					...state.questions,
					[chapterId]: {
						...state.questions[chapterId],
						[moduleId]: resequenceItems(questions),
					},
				},
			})),
		getQuestionErrors: (question: QuestionDto): string[] => {
			const errors: string[] = [];
			const { MAX_QUESTION_LENGTH, MAX_OPTION_LENGTH, MIN_OPTIONS, MAX_OPTIONS, MAX_IMAGES } =
				CONSTANTS;

			if (!question.content.trim()) {
				errors.push("Question content is required");
			}

			if (question.content.length > MAX_QUESTION_LENGTH) {
				errors.push(`Question content must not exceed ${MAX_QUESTION_LENGTH} characters`);
			}

			if (question.options.length < MIN_OPTIONS) {
				errors.push(`Question must have at least ${MIN_OPTIONS} options`);
			}

			if (question.options.length > MAX_OPTIONS) {
				errors.push(`Question cannot have more than ${MAX_OPTIONS} options`);
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
				if (opt.content.length > MAX_OPTION_LENGTH) {
					errors.push(`Option ${idx + 1} content must not exceed ${MAX_OPTION_LENGTH} characters`);
				}
			});

			if (question.images.length > MAX_IMAGES) {
				errors.push(`Question cannot have more than ${MAX_IMAGES} images`);
			}

			return errors;
		},

		// New functions for multi-select and delete
		toggleQuestionSelection: (chapterId, moduleId, id) =>
			set((state) => {
				const currentSelected = state.selectedQuestions[chapterId]?.[moduleId] || [];
				const isSelected = currentSelected.includes(id);

				return {
					selectedQuestions: {
						...state.selectedQuestions,
						[chapterId]: {
							...state.selectedQuestions[chapterId],
							[moduleId]: isSelected
								? currentSelected.filter((seq) => seq !== id)
								: [...currentSelected, id],
						},
					},
				};
			}),

		selectAllQuestions: (chapterId, moduleId) =>
			set((state) => {
				const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
				const allSequences = currentQuestions.map((q) => q.sequence);

				return {
					selectedQuestions: {
						...state.selectedQuestions,
						[chapterId]: {
							...state.selectedQuestions[chapterId],
							[moduleId]: allSequences,
						},
					},
				};
			}),

		deselectAllQuestions: (chapterId, moduleId) =>
			set((state) => ({
				selectedQuestions: {
					...state.selectedQuestions,
					[chapterId]: {
						...state.selectedQuestions[chapterId],
						[moduleId]: [],
					},
				},
			})),

		deleteSelectedQuestions: (chapterId, moduleId) =>
			set((state) => {
				const currentQuestions = state.questions[chapterId]?.[moduleId] || [];
				const selectedSequences = state.selectedQuestions[chapterId]?.[moduleId] || [];

				if (selectedSequences.length === 0) {
					toast.info("No questions selected");
					return state;
				}

				const updatedQuestions = currentQuestions.filter(
					(q) => !selectedSequences.includes(q.sequence)
				);

				toast.success(`${selectedSequences.length} question(s) deleted`);

				return {
					questions: {
						...state.questions,
						[chapterId]: {
							...state.questions[chapterId],
							[moduleId]: resequenceItems(updatedQuestions),
						},
					},
					selectedQuestions: {
						...state.selectedQuestions,
						[chapterId]: {
							...state.selectedQuestions[chapterId],
							[moduleId]: [],
						},
					},
				};
			}),

		isQuestionSelected: (chapterId, moduleId, id) => {
			const selected = get().selectedQuestions[chapterId]?.[moduleId] || [];
			return selected.includes(id);
		},

		getSelectedCount: (chapterId, moduleId) => {
			return (get().selectedQuestions[chapterId]?.[moduleId] || []).length;
		},
	};
});

export { useQuizStore };
