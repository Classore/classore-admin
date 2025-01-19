import { RiAddLine } from "@remixicon/react";
import React from "react";

import type { ChapterProps, ChapterModuleProps, MakeOptional } from "@/types";
import type { CreateQuestionDto } from "@/queries";
import { QuestionCard } from "./question-card";
import { capitalize } from "@/lib";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;
type Chapter = MakeOptional<ChapterProps, "createdOn">;

interface QuizProps {
	chapter: Chapter;
	index: number;
	module: ChapterModule | null;
}

export const QuizCard = ({ chapter, module }: QuizProps) => {
	const [questions, setQuestions] = React.useState<CreateQuestionDto[]>([
		{ content: "", images: [], options: [], question_type: "", sequence: 0 },
	]);

	const handleAddQuestion = () => {
		setQuestions((prev) => [
			...prev,
			{ content: "", images: [], options: [], question_type: "", sequence: 0 },
		]);
	};

	const handleDeleteQuestion = (index: number) => {
		setQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	const handleReorder = (sequence: number, direction: "up" | "down") => {
		const updatedQuestions = [...questions];
		const currentIndex = updatedQuestions.findIndex(
			(question) => question.sequence === sequence
		);
		const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (targetIndex >= 0 && targetIndex < updatedQuestions.length) {
			const [movedQuestion] = updatedQuestions.splice(currentIndex, 1);
			updatedQuestions.splice(targetIndex, 0, movedQuestion);
			setQuestions(updatedQuestions);
		}
	};

	const handleUpdatequestions = (question: CreateQuestionDto) => {
		const updatedQuestions = [...questions];
		const index = updatedQuestions.findIndex((q) => q.sequence === question.sequence);
		if (index !== -1) {
			updatedQuestions[index] = question;
			setQuestions(updatedQuestions);
		}
	};

	const handleDuplicateQuestion = (sequence: number) => {
		const questionToDuplicate = questions.find((q) => q.sequence === sequence);
		if (questionToDuplicate) {
			const duplicatedQuestion: CreateQuestionDto = {
				...questionToDuplicate,
				sequence: questions.length,
			};
			setQuestions((prev) => [...prev, duplicatedQuestion]);
		}
	};

	return (
		<div className="w-full space-y-4">
			<div className="flex w-full items-center justify-between">
				<div className="space-y-2">
					<p className="text-xs font-medium text-neutral-500">
						CHAPTER {chapter.sequence + 1}
					</p>
					<h5
						className={`text-lg font-medium capitalize ${module?.title ? "text-black" : "text-neutral-300"}`}>
						{chapter.name}:{" "}
						{`${capitalize(module?.title)} (Quiz)` ||
							"Input title 'e.g. Introduction to Algebra'"}
					</h5>
				</div>
				<div className="flex items-center gap-x-2">
					<button className="grid size-7 place-items-center rounded border bg-white"></button>
					<button className="grid size-7 place-items-center rounded border bg-white"></button>
				</div>
			</div>
			<div className="flex w-full items-center justify-between rounded-lg bg-white p-3">
				<p className="text-xs text-neutral-400">ALL QUESTIONS</p>
				<button
					onClick={handleAddQuestion}
					className="flex items-center gap-x-2 rounded-md border border-neutral-400 bg-neutral-100 px-1 py-0.5 text-xs text-neutral-400">
					<RiAddLine className="size-5" />
					Add New Question
				</button>
			</div>
			<div className="flex w-full flex-col gap-y-2">
				{questions.map((question, index) => (
					<QuestionCard
						key={index}
						onDelete={handleDeleteQuestion}
						onDuplicate={handleDuplicateQuestion}
						onReorder={handleReorder}
						onUpdateQuestions={handleUpdatequestions}
						question={question}
					/>
				))}
			</div>
		</div>
	);
};
