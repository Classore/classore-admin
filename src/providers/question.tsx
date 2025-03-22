import type { QuestionDto } from "@/store/z-store/quiz";
import React from "react";

interface QuestionContextProps {
	selected: QuestionDto[];
	onSelect: (question: QuestionDto) => void;
	onDelete: (questions: QuestionDto[]) => void;
	isSelected: (question: QuestionDto) => boolean;
}

const defaultContextProps: QuestionContextProps = {
	selected: [],
	onSelect: () => {},
	onDelete: () => {},
	isSelected: () => false,
};

const QuestionContext = React.createContext<QuestionContextProps>(defaultContextProps);

export const QuestionProvider: React.FC<React.PropsWithChildren & {}> = (props) => {
	const { children } = props;
	const [selected, setSelected] = React.useState<QuestionDto[]>([]);

	const onSelect = React.useCallback(
		(question: QuestionDto) => {
			const existingQuestion = selected.find(
				(q) => q.sequence === question.sequence || question.id === q.id
			);

			if (existingQuestion) {
				setSelected(selected.filter((q) => q.id !== question.id && q.sequence !== question.sequence));
			} else {
				setSelected((prev) => [...prev, question]);
			}
		},
		[selected]
	);

	const onDelete = React.useCallback((questions: QuestionDto[]) => {
		setSelected((prev) => prev.filter((q) => !questions.includes(q)));
	}, []);

	const isSelected = React.useCallback(
		(question: QuestionDto) =>
			selected.some((q) => q.sequence === question.sequence || question.id === q.id),
		[selected]
	);

	const contextValue = React.useMemo(
		() => ({
			selected,
			onSelect,
			onDelete,
			isSelected,
		}),
		[selected, onSelect, onDelete, isSelected]
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
