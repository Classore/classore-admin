import type { TestQuestionDto } from "@/queries/test-center";
import { createPersistMiddleware } from "../middleware";

interface TestCenterStore {
	questions: TestQuestionDto[];
	addQuestion: (question: TestQuestionDto) => void;
	removeQuestion: (sequence: number) => void;
	addQuestionContent: (sequence: number, content: string) => void;
	handleTypeChange: (sequence: number, question_type: string) => void;
	addImagesToQuestion: (sequence: number, images: File[]) => void;
	removeImagesFromQuestion: (sequence: number, image: File) => void;
	addAudioToQuestion: (sequence: number, audio: File) => void;
	removeAudioFromQuestion: (sequence: number, audio: File) => void;
	addQuestionOption: (sequence: number) => void;
	addOptionContent: (sequence: number, option_sequence: number, content: string) => void;
	setCorrectOption: (sequence: number, option_sequence: number) => void;
	removeQuestionOption: (sequence: number, option_sequence: number) => void;
}

const initialState: TestCenterStore = {
	questions: [],
	addQuestion: () => {},
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
		question_type: "MUTILCHOICE",
		instruction: "",
		media: null,
		images: [],
	};
};

const useTestCenterStore = createPersistMiddleware<TestCenterStore>("test-center-store", (set) => ({
	...initialState,
	addQuestion: (question) =>
		set((state) => ({
			questions: [...state.questions, question],
		})),
	removeQuestion: (sequence: number) =>
		set((state) => ({
			questions: state.questions.filter((question) => question.sequence !== sequence),
		})),
}));

export { useTestCenterStore };
