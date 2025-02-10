import type { AnswerProps, QuestionProps } from "@/types";
import { createPersistMiddleware } from "../middleware";

interface TestCenterStore {
	allowedTime: number;
	answers: AnswerProps[];
	courseId: string;
	courseName: string;
	examId: string;
	examName: string;
	onSelectanswer: (questionId: string, answerId: string) => void;
	questions: QuestionProps[];
	setQuestions: (questions: QuestionProps[]) => void;
}

const initialState: TestCenterStore = {
	allowedTime: 0,
	answers: [],
	courseId: "",
	courseName: "",
	examId: "",
	examName: "",
	onSelectanswer: () => {},
	questions: [],
	setQuestions: () => {},
};

const useTestCenterStore = createPersistMiddleware<TestCenterStore>(
	"classore-text-center",
	(set) => ({
		...initialState,
		onSelectanswer: (questionId, answerId) => {
			set((state) => {
				const answer = state.answers.find((answer) => answer.question_id === questionId);
				if (answer) {
					answer.answer_id = answerId;
					return { ...state };
				} else {
					return {
						...state,
						answers: [
							...state.answers,
							{
								answer: answerId,
								answer_id: answerId,
								question_id: questionId,
							},
						],
					};
				}
			});
		},
		setQuestions: (questions) => set({ questions }),
	})
);

export { useTestCenterStore };
