import { useMutation, useQuery } from "@tanstack/react-query";
import { RiArrowLeftSLine } from "@remixicon/react";
import React, { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { CreateQuestions, GetQuestions, type GetQuestionsResponse } from "@/queries";
import { QuestionCard } from "./dashboard/question-card";
import { useQuizStore } from "@/store/z-store/quizz";
import type { QuestionDto } from "@/store/z-store";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import { Button } from "./ui/button";
import { Spinner } from "./shared";

interface Props {
	chapterId: string | undefined;
	lessonTab: string;
	setCurrentTab: (tab: string) => void;
}

const validateQuestions = (questions: QuestionDto[]) => {
	if (!questions?.length) {
		return "At least one question is required";
	}
	if (questions.some((q) => !q.content)) {
		return "All questions must have content";
	}
	if (questions.some((q) => !q.question_type)) {
		return "All questions must have a type";
	}
	if (questions.some((q) => q.question_type === "MULTICHOICE" && q.options.length !== 4)) {
		return "Multiple options questions must have 4 options";
	}
	if (
		questions.some((q) =>
			q.options.some((opt) => q.question_type !== "FILL_IN_THE_GAP" && !opt.content)
		)
	) {
		return "All options must have content";
	}
	if (
		questions.some(
			(q) =>
				(q.question_type === "MULTICHOICE" || q.question_type === "YES_OR_NO") &&
				q.options.every((opt) => opt.is_correct !== "YES")
		)
	) {
		return "Multiple choice and boolean questions must have a correct answer";
	}
	return null;
};

const QuestionList = React.memo(
	({
		questions,
		chapterId,
		moduleId,
		onDelete,
		onDuplicate,
		onReorder,
	}: {
		questions: QuestionDto[];
		chapterId: string;
		moduleId: string;
		onDelete: (sequence: number) => void;
		onDuplicate: (sequence: number) => void;
		onReorder: (sequence: number, direction: "up" | "down") => void;
	}) => (
		<div className="w-full space-y-2">
			{questions.map((question, index) => (
				<QuestionCard
					key={`question-${index}`}
					chapterId={chapterId}
					moduleId={moduleId}
					onDelete={onDelete}
					onDuplicate={onDuplicate}
					onReorder={onReorder}
					question={question}
				/>
			))}
		</div>
	)
);

QuestionList.displayName = "QuestionList";

export const Quiz = ({ chapterId, lessonTab, setCurrentTab }: Props) => {
	const {
		addQuestion,
		duplicateQuestion,
		questions,
		removeQuestion,
		reorderQuestion,
		setQuestions,
	} = useQuizStore();

	const { data: fetchedQuestions, isLoading } = useQuery({
		queryKey: ["get-questions", lessonTab],
		queryFn: () => GetQuestions({ module_id: lessonTab, limit: 100, page: 1 }),
		enabled: !!chapterId && !!lessonTab,
		select: useCallback(
			(data: GetQuestionsResponse): QuestionDto[] =>
				data.data.data.map((q) => ({
					content: q.question_content,
					images: q.question_images,
					options: q.options.map((opt) => ({
						content: opt.content,
						is_correct: opt.is_correct,
						sequence_number: opt.sequence_number,
						images: opt.images,
					})),
					question_type: q.question_question_type,
					sequence: q.question_sequence,
					sequence_number: q.question_sequence,
				})),
			[]
		),
	});

	const { isPending, mutate } = useMutation({
		mutationKey: ["create-question"],
		mutationFn: (payload: QuestionDto[]) => CreateQuestions(lessonTab, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["get-questions", lessonTab] });
			toast.success("Quiz saved successfully");
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			toast.error(Array.isArray(message) ? message[0] : message);
		},
	});

	// Memoize handlers to prevent recreation on each render
	const handleDeleteQuestion = useCallback(
		(sequence: number) => {
			if (chapterId && lessonTab) {
				removeQuestion(chapterId, lessonTab, sequence);
			}
		},
		[chapterId, lessonTab, removeQuestion]
	);

	const handleDuplicateQuestion = useCallback(
		(sequence: number) => {
			if (chapterId && lessonTab) {
				duplicateQuestion(chapterId, lessonTab, sequence);
			}
		},
		[chapterId, lessonTab, duplicateQuestion]
	);

	const handleReorderQuestion = useCallback(
		(sequence: number, direction: "up" | "down") => {
			if (chapterId && lessonTab) {
				reorderQuestion(chapterId, lessonTab, sequence, direction);
			}
		},
		[chapterId, lessonTab, reorderQuestion]
	);

	// Simplified and memoized question derivation
	const moduleQuestions = useMemo(() => {
		if (!chapterId || !lessonTab) return [];

		const existingQuestions = questions[chapterId]?.[lessonTab];

		if (fetchedQuestions && !existingQuestions) {
			// Only set questions once when fetchedQuestions become available
			setQuestions(chapterId, lessonTab, fetchedQuestions);
			return fetchedQuestions;
		}

		return existingQuestions || [];
	}, [chapterId, lessonTab, questions, fetchedQuestions, setQuestions]);

	const handleAddQuestion = useCallback(() => {
		if (!chapterId || !lessonTab) {
			toast.error("Please select a chapter and module");
			return;
		}
		addQuestion(chapterId, lessonTab);
	}, [chapterId, lessonTab, addQuestion]);

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!lessonTab) {
				toast.error("Please select a valid module");
				return;
			}

			const validationError = validateQuestions(moduleQuestions);
			if (validationError) {
				toast.error(validationError);
				return;
			}

			mutate(moduleQuestions);
		},
		[lessonTab, moduleQuestions, mutate]
	);

	const handleBackToLesson = useCallback(() => {
		setCurrentTab("lesson");
	}, [setCurrentTab]);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="col-span-4 space-y-2 rounded-md bg-neutral-100 p-4">
			<div className="flex w-full items-center justify-between">
				<p className="text-xs uppercase tracking-widest">Lesson - chapter</p>
				<button
					type="button"
					onClick={handleBackToLesson}
					className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
					<RiArrowLeftSLine className="size-4" />
					<span>Back to Lesson</span>
				</button>
			</div>
			<div className="w-full space-y-2">
				{chapterId && lessonTab && moduleQuestions.length > 0 && (
					<QuestionList
						questions={moduleQuestions}
						chapterId={chapterId}
						moduleId={lessonTab}
						onDelete={handleDeleteQuestion}
						onDuplicate={handleDuplicateQuestion}
						onReorder={handleReorderQuestion}
					/>
				)}
				<div className="flex items-center gap-2">
					<Button disabled={isPending} className="w-32" size="sm" type="submit">
						{isPending ? <Spinner /> : "Save Quiz"}
					</Button>
					<Button
						disabled={isPending}
						className="w-32"
						variant="outline"
						size="sm"
						type="button"
						onClick={handleAddQuestion}>
						Add Question
					</Button>
				</div>
			</div>
		</form>
	);
};
