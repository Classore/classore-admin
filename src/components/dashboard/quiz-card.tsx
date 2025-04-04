import { RiArrowLeftSLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { capitalize } from "@/lib";
import { CreateQuestions, GetQuestions } from "@/queries";
import { useQuizStore, type QuestionDto } from "@/store/z-store/quiz";
import type { ChapterModuleProps, ChapterProps, MakeOptional } from "@/types";
import React from "react";
import { Spinner } from "../shared";
import { Button } from "../ui/button";
import { QuestionCard } from "./question-card";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;
type Chapter = MakeOptional<ChapterProps, "createdOn">;

type UseMutationProps = {
	module_id: string;
	questions: QuestionDto[];
};

interface QuizProps {
	chapter: Chapter;
	index: number;
	module: ChapterModule | null;
}

export const QuizCard = ({ chapter, module }: QuizProps) => {
	const { addQuestion, duplicateQuestion, questions, removeQuestion, reorderQuestion } =
		useQuizStore();

	const chapterId = chapter.id;
	const moduleId = String(module?.id);

	const {} = useQuery({
		queryKey: ["get-questions", moduleId],
		queryFn: () => GetQuestions({ module_id: moduleId, limit: 50, page: 1 }),
		enabled: !!moduleId,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: ({ module_id, questions }: UseMutationProps) => CreateQuestions(module_id, questions),
		onSuccess: () => {
			toast.success("Questions created successfully");
		},
		onError: () => {
			toast.error("Failed to create questions");
		},
	});

	const moduleQuestions = React.useMemo(() => {
		if (moduleId) {
			return questions[chapterId]?.[moduleId];
		}
		return [];
	}, [chapterId, moduleId, questions]);

	const handleAddQuestion = () => {
		if (!module?.id) {
			toast.error("Please select a valid module");
			return;
		}
		addQuestion(chapterId, String(module?.id));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!module?.id) {
			toast.error("Please select a valid module");
			return;
		}
		if (!moduleQuestions) {
			toast.error("No questions provided");
			return;
		}
		if (moduleQuestions?.length === 0) {
			toast.error("At least one question is required");
			return;
		}
		if (moduleQuestions?.some((question) => question.content === "")) {
			toast.error("All questions must have content");
			return;
		}
		if (moduleQuestions?.some((question) => question.question_type === "")) {
			toast.error("All questions must have a type");
			return;
		}
		if (
			moduleQuestions?.some(
				(question) => question.question_type === "MULTICHOICE" && question.options.length !== 4
			)
		) {
			toast.error("Multiple options questions must have 4 options");
			return;
		}
		if (
			moduleQuestions?.some((question) =>
				question.options.some(
					(option) => question.question_type !== "FILL_IN_THE_GAP" && option.content === ""
				)
			)
		) {
			toast.error("All options must have content");
			return;
		}
		if (
			moduleQuestions?.some(
				(question) =>
					(question.question_type === "MULTICHOICE" || question.question_type === "YES_OR_NO") &&
					question.options.every((option) => !option.is_correct)
			)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}
		const payload: UseMutationProps = {
			module_id: String(module?.id),
			questions: moduleQuestions?.map((question, index) => ({
				...question,
				sequence: index,
			})),
		};
		mutate(payload);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full space-y-4">
			<div className="flex w-full items-center justify-between">
				<div className="space-y-2">
					<p className="text-xs font-medium text-neutral-500">CHAPTER {chapter.sequence + 1}</p>
					<h5
						className={`text-lg font-medium capitalize ${module?.title ? "text-black" : "text-neutral-300"}`}>
						{chapter.name}:{" "}
						{`${capitalize(module?.title)} (Quiz)` || "Input title 'e.g. Introduction to Algebra'"}
					</h5>
				</div>
				<div className="flex items-center gap-x-2">
					<button type="button" className="grid size-7 place-items-center rounded border bg-white">
						<RiArrowLeftSLine className="size-4" />
					</button>
					<button type="button" className="grid size-7 place-items-center rounded border bg-white">
						<RiArrowLeftSLine className="size-4 rotate-180" />
					</button>
				</div>
			</div>
			<div className="flex w-full items-center justify-between rounded-lg bg-white p-3">
				<p className="text-xs text-neutral-400">ALL QUESTIONS</p>
			</div>

			<div className="w-full space-y-2">
				{moduleQuestions?.map((question, index) => (
					<QuestionCard
						key={index}
						chapterId={chapterId}
						moduleId={String(module?.id)}
						onDelete={(sequence) => removeQuestion(chapterId, String(module?.id), sequence)}
						onDuplicate={(sequence) => duplicateQuestion(chapterId, String(module?.id), sequence)}
						onReorder={(sequence, direction) =>
							reorderQuestion(chapterId, String(module?.id), sequence, direction)
						}
						question={question}
					/>
				))}
			</div>

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
		</form>
	);
};
