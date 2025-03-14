import { toast } from "sonner";

import type { TestQuestionDto, TestOptionDto } from "@/queries/test-center";
import { createReportableStore } from "../middleware";

const MAX_AUDIO_SIZE_MB = 5;
const MAX_IMAGE_SIZE_MB = 1;

interface TestCenterStore {
	questions: TestQuestionDto[];
	addQuestion: (question: TestQuestionDto) => void;
	updateQuestions: (questions: TestQuestionDto[]) => void;
	removeQuestion: (sequence: number) => void;
	addQuestionContent: (sequence: number, content: string) => void;
	handleTypeChange: (sequence: number, question_type: TestQuestionDto["question_type"]) => void;
	addImagesToQuestion: (sequence: number, images: File[]) => void;
	removeImagesFromQuestion: (sequence: number, image: File) => void;
	addAudioToQuestion: (sequence: number, audio: File) => void;
	removeAudioFromQuestion: (sequence: number) => void;
	addQuestionOption: (sequence: number) => void;
	addOptionContent: (sequence: number, option_sequence: number, content: string) => void;
	setCorrectOption: (sequence: number, option_sequence: number) => void;
	removeQuestionOption: (sequence: number, option_sequence: number) => void;
}

const initialState: TestCenterStore = {
	questions: [],
	addQuestion: () => {},
	updateQuestions: () => {},
	removeQuestion: () => {},
	addQuestionContent: () => {},
	handleTypeChange: () => {},
	addImagesToQuestion: () => {},
	removeImagesFromQuestion: () => {},
	addAudioToQuestion: () => {},
	removeAudioFromQuestion: () => {},
	addOptionContent: () => {},
	addQuestionOption: () => {},
	setCorrectOption: () => {},
	removeQuestionOption: () => {},
};

export const getEmptyQuestion = (sequence: number): TestQuestionDto => {
	return {
		content: "",
		sequence: sequence,
		options: [],
		question_type: "",
		instruction: "",
		media: [],
		images: [],
	};
};

const getEmptyOption = (sequence: number): TestOptionDto => ({
	content: "",
	is_correct: "NO",
	sequence_number: sequence,
});

const validateImageSize = (file: File): boolean => {
	const sizeInMB = file.size / (1024 * 1024);
	return sizeInMB <= MAX_IMAGE_SIZE_MB;
};

const validateAudioSize = (file: File): boolean => {
	const sizeInMB = file.size / (1024 * 1024);
	return sizeInMB <= MAX_AUDIO_SIZE_MB;
};

const resequenceQuestions = (questions: TestQuestionDto[]): TestQuestionDto[] => {
	return questions.map((q, idx) => ({
		...q,
		sequence: idx + 1,
	}));
};

const resequenceOptions = (options: TestOptionDto[]): TestOptionDto[] => {
	return options.map((opt, idx) => ({
		...opt,
		sequence_number: idx + 1,
	}));
};

const useTestCenterStore = createReportableStore<TestCenterStore>((set) => ({
	...initialState,
	addQuestion: (question) =>
		set((state) => ({
			questions: [...state.questions, question],
		})),
	removeQuestion: (sequence: number) =>
		set((state) => {
			const updatedQuestions = state.questions.filter((question) => question.sequence !== sequence);
			return {
				questions: resequenceQuestions(updatedQuestions),
			};
		}),
	updateQuestions: (questions) => set({ questions }),
	addQuestionContent: (sequence: number, content: string) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.content = content;
			}
			return { questions: [...state.questions] };
		});
	},
	handleTypeChange: (sequence: number, question_type: TestQuestionDto["question_type"]) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.question_type = question_type;
				question.options = [];
			}
			return { questions: [...state.questions] };
		});
	},
	addAudioToQuestion: (sequence: number, audio: File) => {
		set((state) => {
			const question = state.questions[sequence];
			if (!validateAudioSize(audio)) {
				toast.error(`Audio size should be less than ${MAX_AUDIO_SIZE_MB} MB`);
				return { questions: [...state.questions] };
			}
			if (question) {
				question.media[0] = audio;
			}
			return { questions: [...state.questions] };
		});
	},
	removeAudioFromQuestion: (sequence: number) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.media = [];
			}
			return { questions: [...state.questions] };
		});
	},
	addImagesToQuestion: (sequence: number, images: File[]) => {
		set((state) => {
			const question = state.questions[sequence];

			// Validate each image before adding
			for (const image of images) {
				if (!validateImageSize(image)) {
					toast.error(`Image size should be less than ${MAX_IMAGE_SIZE_MB} MB`);
					return { questions: [...state.questions] };
				}
			}

			if (question) {
				question.images = [...question.images, ...images];
			}
			return { questions: [...state.questions] };
		});
	},
	removeImagesFromQuestion: (sequence: number, image: File) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.images = question.images.filter((img) => (img as File).name !== image.name);
			}
			return { questions: [...state.questions] };
		});
	},
	addOptionContent: (sequence: number, option_sequence: number, content: string) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				const option = question.options.find((opt) => opt.sequence_number === option_sequence);
				if (option) {
					option.content = content;
				}
			}
			return { questions: [...state.questions] };
		});
	},
	addQuestionOption: (sequence: number) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				if (!question.question_type) {
					toast.error("Please select a question type first");
					return { questions: [...state.questions] };
				}
				if (question.question_type === "SPEAKING" && question.options.length === 1) {
					toast.error("A speaking question can only have one option");
					return { questions: [...state.questions] };
				}
				if (question.question_type === "YES_OR_NO" && question.options.length === 2) {
					toast.error("A yes or no question can only have two options");
					return { questions: [...state.questions] };
				}
				if (
					(question.question_type === "MULTIPLE_CHOICE" || question.question_type === "LISTENING") &&
					question.options.length === 4
				) {
					toast.error("A multiple choice question can only have four options");
					return { questions: [...state.questions] };
				}

				const newOption = getEmptyOption(question.options.length + 1);
				question.options.push(newOption);
				question.options = resequenceOptions(question.options);
			}
			return { questions: [...state.questions] };
		});
	},
	removeQuestionOption: (sequence: number, option_sequence: number) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.options = question.options.filter(
					(option) => option.sequence_number !== option_sequence
				);
				question.options = resequenceOptions(question.options);
			}
			return { questions: [...state.questions] };
		});
	},
	setCorrectOption: (sequence: number, option_sequence: number) => {
		set((state) => {
			const question = state.questions[sequence];
			if (question) {
				question.options = question.options.map((option) => {
					if (option.sequence_number === option_sequence) {
						option.is_correct = "YES";
					} else {
						option.is_correct = "NO";
					}
					return option;
				});
			}
			return { questions: [...state.questions] };
		});
	},
}));

export { useTestCenterStore };
