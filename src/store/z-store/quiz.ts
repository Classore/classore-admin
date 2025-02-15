import { create } from "zustand";
import { toast } from "sonner";

import type { QuestionTypeProps } from "@/types";

type Option = {
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
};

type InitialState = {
	questions: QuestionDto[];
};

type QuizOptions = {
	actions: {
		addQuestion: () => void;
		removeQuestion: (id: number) => void;
		handleTypeChange: (question_type: QuestionTypeProps, id: number) => void;
		addOption: (id: number) => void;
		removeOption: (id: number, option_id: number) => void;
		setCorrectOption: (id: number, option_id: number) => void;
		addOptionContent: (id: number, content: string, option_id: number) => void;
		addQuestionContent: (id: number, content: string) => void;

		addImagesToQuestion: (id: number, images: File[]) => void;
		removeImageFromQuestion: (id: number, image_id: number) => void;
		setQuestions: (questions: QuestionDto[]) => void;
		// moveQuestionUp: (index: number) => void;
		// moveQuestionDown: (index: number) => void;
		// submitQuestions: () => void;
	};
};

export const useQuizStore = create<InitialState & QuizOptions>((set) => ({
	questions: [],

	actions: {
		setQuestions: (questions: QuestionDto[]) =>
			set((state) => ({ questions: [...state.questions, ...questions] })),
		addQuestion: () => {
			set((state) => {
				const newQuestion: QuestionDto = {
					content: "",
					images: [],
					options: [],
					question_type: "MULTICHOICE",
					sequence: state.questions.length + 1,
					sequence_number: state.questions.length + 1,
				};
				return { questions: [...state.questions, newQuestion] };
			});
		},
		removeQuestion: (id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.filter((question) => question.sequence !== id);
				return { questions: updatedQuestions };
			});
		},
		handleTypeChange: (question_type: QuestionTypeProps, id: number) => {
			set((state) => {
				const questionIndex = state.questions.findIndex((question) => question.sequence_number === id);
				if (questionIndex === -1) {
					toast.error(`Question with id ${id} not found`);
					return state;
				}
				const optionTemplates: Record<QuestionTypeProps, Option[]> = {
					MULTICHOICE: [{ content: "", is_correct: "NO", sequence_number: 1 }],
					FILL_IN_THE_GAP: [{ content: "", is_correct: "YES", sequence_number: 1 }],
					YES_OR_NO: [
						{ content: "True", is_correct: "YES", sequence_number: 1 },
						{ content: "False", is_correct: "NO", sequence_number: 2 },
					],
				};
				const updatedQuestions = [...state.questions];
				updatedQuestions[questionIndex] = {
					...state.questions[questionIndex],
					question_type,
					options: optionTemplates[question_type] || [],
				};

				return { questions: updatedQuestions };
			});
		},

		addOption: (id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence_number === id) {
						const newOption: Option = {
							content: "",
							is_correct: "NO",
							sequence_number: question.options.length + 1,
						};
						return { ...question, options: [...question.options, newOption] };
					}
					return question;
				});

				return { questions: updatedQuestions };
			});
		},
		removeOption: (id: number, option_id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.options.length <= 1) {
						return question;
					}
					if (question.sequence_number === id) {
						const updatedOptions = question.options
							.filter((option) => option.sequence_number !== option_id)
							.map((option, index) => ({
								...option,
								sequence_number: index + 1,
							}));
						return { ...question, options: updatedOptions };
					}
					return question;
				});

				return { questions: updatedQuestions };
			});
		},
		setCorrectOption: (id: number, option_id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence_number === id) {
						const updatedOptions = question.options.map((option) => {
							if (option.sequence_number === option_id) {
								const updatedOption: Option = { ...option, is_correct: "YES" };
								return updatedOption;
							}
							const updatedOption: Option = { ...option, is_correct: "NO" };
							return updatedOption;
						});
						return { ...question, options: updatedOptions };
					}
					return question;
				});

				return { questions: updatedQuestions };
			});
		},
		addOptionContent: (id: number, content: string, option_id: number) => {
			set((state) => {
				const questionIndex = state.questions.findIndex((question) => question.sequence_number === id);
				if (questionIndex === -1) {
					toast.error("Question not found");
					return state;
				}
				const question = state.questions[questionIndex];
				const optionIndex = question.options.findIndex(
					(option) => option.sequence_number === option_id
				);

				if (optionIndex === -1) {
					toast.error("Option not found");
					return state;
				}
				const updatedQuestions = [...state.questions];
				updatedQuestions[questionIndex] = {
					...question,
					options: [
						...question.options.slice(0, optionIndex),
						{ ...question.options[optionIndex], content },
						...question.options.slice(optionIndex + 1),
					],
				};

				return { questions: updatedQuestions };
			});
		},

		addQuestionContent: (id: number, content: string) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence === id) {
						return { ...question, content };
					}
					return question;
				});
				return { questions: updatedQuestions };
			});
		},
		addImagesToQuestion: (id: number, images: File[]) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence === id) {
						return { ...question, images };
					}
					return question;
				});
				return { questions: updatedQuestions };
			});
		},
		removeImageFromQuestion: (id: number, image_id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence === id) {
						const updatedImages = question.images.filter((_, index) => index !== image_id);
						return { ...question, images: updatedImages };
					}
					return question;
				});
				return { questions: updatedQuestions };
			});
		},
		// submitQuestions: () => {
		// 	set((state) => {
		// 		return { questions: state.questions };
		// 	});
		// },
	},
}));
