import { createPersistMiddleware } from "../middleware";
import type {
	TestCenterOptionProps,
	TestCenterQuestionProps,
	TestCenterSectionProps,
} from "@/types";

interface TestCenterStore {
	allowed_attempts: number;
	allowed_time: number;
	description: string;
	name: string;
	participants: number;
	pass_mark: number;
	sections: TestCenterSectionProps[];
	shuffle_questions: boolean;
	skip_questions: boolean;
	addSection: (section: TestCenterSectionProps) => void;
	removeSection: (sectionId: string) => void;
	addQuestion: (sectionId: string) => void;
	removeQuestion: (sectionId: string, sequence: number) => void;
	addQuestionContent: (sectionId: string, sequence: number, content: string) => void;
	removeQuestionContent: (sectionId: string, sequence: number) => void;
	addQuestionOption: (sectionId: string, sequence: number) => void;
	removeQuestionOption: (sectionId: string, sequence: number, sequence_number: number) => void;
	addOptionContent: (
		sectionId: string,
		sequence: number,
		sequence_number: number,
		content: string
	) => void;
	removeOptionContent: (sectionId: string, sequence: number) => void;
	addAudioToQuestion: (sectionId: string, sequence: number, audio: File) => void;
	removeAudioFromQuestion: (sectionId: string, sequence: number) => void;
	addImagesToQuestion: (sectionId: string, sequence: number, images: File[]) => void;
	removeImagesFromQuestion: (sectionId: string, sequence: number) => void;
	setCorrectOption: (sectionId: string, sequence: number, sequence_number: number) => void;
	handleTypeChange: (sectionId: string, sequence: number, type: string) => void;
	reorderQuestion: (sectionId: string, sequence: number, direction: "up" | "down") => void;
	resetSection: (sectionId: string) => void;
}

const initialState: TestCenterStore = {
	allowed_attempts: 0,
	allowed_time: 0,
	description: "",
	name: "",
	participants: 0,
	pass_mark: 0,
	sections: [],
	shuffle_questions: false,
	skip_questions: false,
	addSection: () => {},
	removeSection: () => {},
	addQuestion: () => {},
	removeQuestion: () => {},
	addQuestionContent: () => {},
	removeQuestionContent: () => {},
	addQuestionOption: () => {},
	removeQuestionOption: () => {},
	addOptionContent: () => {},
	removeOptionContent: () => {},
	addAudioToQuestion: () => {},
	removeAudioFromQuestion: () => {},
	addImagesToQuestion: () => {},
	removeImagesFromQuestion: () => {},
	setCorrectOption: () => {},
	handleTypeChange: () => {},
	reorderQuestion: () => {},
	resetSection: () => {},
};

const getEmptyOption = (sequence: number): TestCenterOptionProps => ({
	content: "",
	id: "",
	is_correct: "NO",
	questionId: "",
	sequence_number: sequence,
	createdOn: "",
});

const getEmptyQuestion = (sequence: number): TestCenterQuestionProps => ({
	content: "",
	id: "",
	createdOn: "",
	sequence: sequence,
	sequence_number: sequence,
	is_required: false,
	options: [],
	question_type: "MULTICHOICE",
	shuffled_options: false,
});

const useTestCenterStore = createPersistMiddleware<TestCenterStore>("test-center", (set) => ({
	...initialState,
	addSection: (section) => {
		set((state) => ({
			sections: [...state.sections, section],
		}));
	},
	removeSection: (sectionId) => {
		set((state) => ({
			sections: state.sections.filter((section) => section.id !== sectionId),
		}));
	},
	addQuestion: (sectionId) => {
		set((state) => ({
			sections: state.sections.map((section) => {
				const question = getEmptyQuestion(section.questions.length);
				return section.id === sectionId
					? { ...section, questions: [...section.questions, question] }
					: section;
			}),
		}));
	},
	removeQuestion: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.filter((question) => question.sequence !== sequence),
						}
					: section
			),
		}));
	},
	addQuestionContent: (sectionId, sequence, content) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence ? { ...question, content } : question
							),
						}
					: section
			),
		}));
	},
	removeQuestionContent: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence ? { ...question, content: "" } : question
							),
						}
					: section
			),
		}));
	},
	addQuestionOption: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) => {
				const option = getEmptyOption(section.questions.length);
				return section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence
									? { ...question, options: [...question.options, option] }
									: question
							),
						}
					: section;
			}),
		}));
	},
	removeQuestionOption: (sectionId, sequence, sequence_number) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence
									? {
											...question,
											options: question.options.filter((option) => option.sequence_number !== sequence_number),
										}
									: question
							),
						}
					: section
			),
		}));
	},
	addOptionContent: (sectionId, sequence, sequence_number, content) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence
									? {
											...question,
											options: question.options.map((option) =>
												option.sequence_number === sequence_number ? { ...option, content } : option
											),
										}
									: question
							),
						}
					: section
			),
		}));
	},
	removeOptionContent: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence
									? {
											...question,
											options: question.options.map((option) =>
												option.sequence_number === sequence ? { ...option, content: "" } : option
											),
										}
									: question
							),
						}
					: section
			),
		}));
	},
	addAudioToQuestion: (sectionId, sequence, audio) => {
		set((state) => {
			const section = state.sections.find((section) => section.id === sectionId);
			if (!section) return state;
			const question = section.questions.find((question) => question.sequence === sequence);
			if (!question) return state;
			return {
				sections: state.sections.map((sect) =>
					sect.id === sectionId
						? {
								...section,
								questions: section.questions.map((que) =>
									que.sequence === sequence ? { ...que, audio: URL.createObjectURL(audio) } : que
								),
							}
						: sect
				),
			};
		});
	},
	removeAudioFromQuestion: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence ? { ...question, audio: "" } : question
							),
						}
					: section
			),
		}));
	},
	addImagesToQuestion: (sectionId, sequence, images) => {
		set((state) => {
			const section = state.sections.find((section) => section.id === sectionId);
			if (!section) return state;
			const question = section.questions.find((question) => question.sequence === sequence);
			if (!question) return state;
			return {
				sections: state.sections.map((sect) => {
					if (sect.id === sectionId) {
						return {
							...sect,
							questions: sect.questions.map((que) =>
								que.sequence === sequence
									? {
											...que,
											images: [...(que.images || []), ...images.map((image) => URL.createObjectURL(image))],
										}
									: que
							),
						};
					}
					return sect;
				}),
			};
		});
	},
	removeImagesFromQuestion: (sectionId, sequence) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence ? { ...question, images: [] } : question
							),
						}
					: section
			),
		}));
	},
	setCorrectOption: (sectionId, sequence, sequence_number) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence
									? {
											...question,
											options: question.options.map((option) =>
												option.sequence_number === sequence_number ? { ...option, is_correct: "YES" } : option
											),
										}
									: question
							),
						}
					: section
			),
		}));
	},
	handleTypeChange: (sectionId, sequence, type) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId
					? {
							...section,
							questions: section.questions.map((question) =>
								question.sequence === sequence ? { ...question, question_type: type } : question
							),
						}
					: section
			),
		}));
	},
	reorderQuestion: (sectionId, sequence, direction) => {
		set((state) => {
			const section = state.sections.find((section) => section.id === sectionId);
			if (!section) return state;
			const questionIndex = section.questions.findIndex((question) => question.sequence === sequence);
			if (questionIndex === -1) return state;
			const newIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1;
			if (newIndex < 0 || newIndex >= section.questions.length) return state;
			const newQuestions = [...section.questions];
			[newQuestions[questionIndex], newQuestions[newIndex]] = [
				newQuestions[newIndex],
				newQuestions[questionIndex],
			];
			return {
				sections: state.sections.map((sect) =>
					sect.id === sectionId ? { ...sect, questions: newQuestions } : sect
				),
			};
		});
	},
	resetSection: (sectionId) => {
		set((state) => ({
			sections: state.sections.map((section) =>
				section.id === sectionId ? { ...section, questions: [] } : section
			),
		}));
	},
}));

export { getEmptyOption, getEmptyQuestion, useTestCenterStore };
