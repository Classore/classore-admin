import type { QuestionTypeProps } from "@/types";
import { create } from "zustand";

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
		// moveQuestionUp: (index: number) => void;
		// moveQuestionDown: (index: number) => void;
		// submitQuestions: () => void;
	};
};

export const useQuizStore = create<InitialState & QuizOptions>((set) => ({
	questions: [],

	actions: {
		addQuestion: () => {
			set((state) => {
				const newQuestion: QuestionDto = {
					content: "",
					images: [],
					options: [],
					question_type: "",
					sequence: state.questions.length + 1,
					sequence_number: state.questions.length + 1,
				};
				return { questions: [...state.questions, newQuestion] };
			});
		},
		removeQuestion: (id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.filter(
					(question) => question.sequence !== id
				);
				return { questions: updatedQuestions };
			});
		},
		handleTypeChange: (question_type: QuestionTypeProps, id: number) => {
			set((state) => {
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence_number === id) {
						switch (question_type) {
							case "MULTICHOICE":
								question.options = [{ content: "", is_correct: "NO", sequence_number: 1 }];
								break;
							case "BOOLEAN":
								question.options = [
									{ content: "True", is_correct: "YES", sequence_number: 1 },
									{ content: "False", is_correct: "NO", sequence_number: 2 },
								];
								break;
							case "SHORTANSWER":
								question.options = [{ content: "", is_correct: "NO", sequence_number: 1 }];
								break;
							case "SINGLECHOICE":
								question.options = [{ content: "", is_correct: "NO", sequence_number: 1 }];
							default:
								question.options = [];
						}

						return { ...question, question_type };
					}

					return question;
				});

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
					if (question.sequence_number === id) {
						// if (question.options.length === 1) {
						// 	toast.error("At least one option is required");
						// 	return;
						// }

						const updatedOptions = question.options.filter(
							(option) => option.sequence_number !== option_id
						);
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
								return { ...option, is_correct: "YES" };
							}
							return { ...option, is_correct: "NO" };
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
				const updatedQuestions = state.questions.map((question) => {
					if (question.sequence_number === id) {
						const updatedOptions = question.options.map((option) => {
							if (option.sequence_number === option_id) {
								return { ...option, content };
							}
							return option;
						});

						return { ...question, options: updatedOptions };
					}
					return question;
				});

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
						const updatedImages = question.images.filter((image, index) => index !== image_id);
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
