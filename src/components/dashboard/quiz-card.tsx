import { RiAddLine, RiArrowLeftSLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { capitalize } from "@/lib";
import type { CreateQuestionDto } from "@/queries";
import { CreateQuestions } from "@/queries";
import { useQuizStore } from "@/store/z-store/quiz";
import type { ChapterModuleProps, ChapterProps, MakeOptional } from "@/types";
import { Button } from "../ui/button";
import { QuestionCard } from "./question-card";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;
type Chapter = MakeOptional<ChapterProps, "createdOn">;

type UseMutationProps = {
	module_id: string;
	payload: CreateQuestionDto[];
};

interface QuizProps {
	chapter: Chapter;
	index: number;
	module: ChapterModule | null;
}

export const QuizCard = ({ chapter, module }: QuizProps) => {
	const questions = useQuizStore((state) => state.questions);
	const { addQuestion } = useQuizStore((state) => state.actions);

	console.log("questions", questions);

	const {} = useMutation({
		mutationFn: ({ module_id, payload }: UseMutationProps) =>
			CreateQuestions(module_id, payload),
		onSuccess: () => {
			toast.success("Questions created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create questions");
			console.error(error);
		},
	});

	// React.useEffect(() => {
	// 	addQuestion();
	// }, []);

	const handleSubmit = () => {
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
				(question) =>
					question.question_type === "MULTICHOICE" && question.options.length !== 4
			)
		) {
			toast.error("Multiple options questions must have 4 options");
			return;
		}
		if (
			questions.some((question) => question.options.some((option) => option.content === ""))
		) {
			toast.error("All options must have content");
			return;
		}
		if (
			questions.some(
				(question) =>
					(question.question_type === "MULTICHOICE" || question.question_type === "BOOLEAN") &&
					question.options.every((option) => option.is_correct !== "YES")
			)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}
		const payload: UseMutationProps = {
			module_id: String(module?.id),
			payload: questions.map((question, index) => ({
				...question,
				sequence: index,
			})),
		};

		console.log(payload);
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
					<button className="grid size-7 place-items-center rounded border bg-white">
						<RiArrowLeftSLine className="size-4" />
					</button>
					<button className="grid size-7 place-items-center rounded border bg-white">
						<RiArrowLeftSLine className="size-4 rotate-180" />
					</button>
				</div>
			</div>
			<div className="flex w-full items-center justify-between rounded-lg bg-white p-3">
				<p className="text-xs text-neutral-400">ALL QUESTIONS</p>
				<button
					onClick={addQuestion}
					className="flex items-center gap-x-2 rounded-md border border-neutral-400 bg-neutral-100 px-1 py-0.5 text-xs text-neutral-400">
					<RiAddLine className="size-5" />
					Add New Question
				</button>
			</div>

			<div className="w-full space-y-2">
				{questions.map((question, index) => (
					<QuestionCard key={index} question={question} />
				))}
			</div>
			{/* {hasValidQuestions && (
			)} */}
			<div className="flex items-center gap-2">
				<Button className="w-32" size="sm" onClick={handleSubmit}>
					Save Quiz
				</Button>
				<Button className="w-32" variant="outline" size="sm" onClick={addQuestion}>
					Add Question
				</Button>
			</div>
		</div>
	);
};
