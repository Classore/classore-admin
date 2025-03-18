import React from "react";
import type { QuestionDto } from "@/store/z-store/quizz";

interface QuestionContextProps {
	selected: QuestionDto[];
	onSelect: (question: QuestionDto) => void;
	isSelected: (question: QuestionDto) => boolean;
}

const defaultContextProps: QuestionContextProps = {
	selected: [],
	onSelect: () => {},
	isSelected: () => false,
};

const QuestionContext = React.createContext<QuestionContextProps>(defaultContextProps);

export const QuestionProvider: React.FC<React.PropsWithChildren & {}> = (props) => {
	const { children } = props;
	const [selected, setSelected] = React.useState<QuestionDto[]>([]);

	const onSelect = React.useCallback(
		(question: QuestionDto) => {
			console.log(question);
			const existingQuestion = selected.find((q) => q.sequence === question.sequence);

			if (existingQuestion) {
				setSelected(selected.filter((q) => q.id !== question.id));
			} else {
				setSelected((prev) => [...prev, question]);
			}
		},
		[selected]
	);

	const isSelected = React.useCallback(
		(question: QuestionDto) => selected.some((q) => q.sequence === question.sequence),
		[selected]
	);

	const contextValue = React.useMemo(
		() => ({
			selected,
			onSelect,
			isSelected,
		}),
		[selected, isSelected, onSelect]
	);

	return <QuestionContext.Provider value={contextValue}>{children}</QuestionContext.Provider>;
};

export const useQuestionContext = () => {
	const ctx = React.useContext(QuestionContext);
	if (!ctx) {
		throw new Error("useQuestionContext must be used within a QuestionContextProvider");
	}
	return ctx;
};
