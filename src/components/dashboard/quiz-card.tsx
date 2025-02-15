import { RiArrowLeftSLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ChapterModuleProps, ChapterProps, MakeOptional } from "@/types";
import { useQuizStore, type QuestionDto } from "@/store/z-store/quiz";
import { QuestionCard } from "./question-card";
import { CreateQuestions } from "@/queries";
import { Button } from "../ui/button";
import { Spinner } from "../shared";
import { capitalize } from "@/lib";

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
	const questions = useQuizStore((state) => state.questions);
	const { addQuestion } = useQuizStore((state) => state.actions);

	const { isPending, mutate } = useMutation({
		mutationFn: ({ module_id, questions }: UseMutationProps) => CreateQuestions(module_id, questions),
		onSuccess: () => {
			toast.success("Questions created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create questions");
			console.error(error);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (questions.length === 0) {
			toast.error("At least one question is required");
			return;
		}
		if (questions.some((question) => question.content === "")) {
			toast.error("All questions must have content");
			return;
		}
		if (questions.some((question) => question.question_type === "")) {
			toast.error("All questions must have a type");
			return;
		}
		if (
			questions.some(
				(question) => question.question_type === "MULTICHOICE" && question.options.length !== 4
			)
		) {
			toast.error("Multiple options questions must have 4 options");
			return;
		}
		if (
			questions.some((question) =>
				question.options.some(
					(option) => question.question_type !== "FILL_IN_THE_GAP" && option.content === ""
				)
			)
		) {
			toast.error("All options must have content");
			return;
		}
		if (
			questions.some(
				(question) =>
					(question.question_type === "MULTICHOICE" || question.question_type === "YES_OR_NO") &&
					question.options.every((option) => option.is_correct !== "YES")
			)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}
		const payload: UseMutationProps = {
			module_id: String(module?.id),
			questions: questions.map((question, index) => ({
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
				{questions.map((question, index) => (
					<QuestionCard key={index} question={question} />
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
					onClick={addQuestion}>
					Add Question
				</Button>
			</div>
		</form>
	);
};
