import { RiArrowLeftSLine, RiImportLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

import { useFileHandler } from "@/hooks";
import { convertNumberToWord, quizQuestionFromXlsxToJSON } from "@/lib";
import { queryClient } from "@/providers";
import { CreateQuestions, GetQuestions } from "@/queries";
import type { QuestionDto } from "@/store/z-store";
import { useChapterStore } from "@/store/z-store/chapter";
import { useQuizStore } from "@/store/z-store/quiz";
import type { HttpError } from "@/types";
import { QuestionCard } from "./dashboard/question-card";
import { Spinner } from "./shared";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
	chapterId: string | undefined;
	lessonTab: string;
	setCurrentTab: (tab: string) => void;
}

export const Quiz = ({ chapterId, lessonTab, setCurrentTab }: Props) => {
	const {
		addQuestion,
		duplicateQuestion,
		questions,
		removeQuestion,
		reorderQuestion,
		updateQuestions,
	} = useQuizStore();
	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === lessonTab);
	const ref = React.useRef<HTMLDivElement>(null);
	const scrollPosition = React.useRef<number>(0);

	const handleScroll = () => {
		if (ref.current) {
			scrollPosition.current = ref.current.scrollTop;
		}
	};

	React.useEffect(() => {
		if (ref.current && scrollPosition.current) {
			ref.current.scrollTop = scrollPosition.current;
		}
	});

	React.useEffect(() => {
		const element = ref.current;
		if (element) {
			element.addEventListener("scroll", handleScroll);
			return () => element.removeEventListener("scroll", handleScroll);
		}
	}, []);

	const { handleClick, handleFileChange, inputRef } = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			quizQuestionFromXlsxToJSON(file, 0).then((questions) => {
				updateQuestions(String(chapterId), lessonTab, questions);
			});
		},
		fileType: "document",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes: [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
			],
			maxFiles: Infinity,
			maxSize: 10 * 1024 * 1024, // 10MB
			minFiles: 1,
		},
	});

	const {} = useQuery({
		queryKey: ["get-questions", lessonTab],
		queryFn: () => GetQuestions({ module_id: lessonTab, limit: 100, page: 1 }),
		enabled: !!chapterId,
		select: (data) => ({
			questions: data.data.data.map((question) => {
				const q: QuestionDto = {
					content: question.question_content,
					images: question.question_images,
					options: question.options.map((option) => ({
						content: option.content,
						is_correct: option.is_correct,
						sequence: option.sequence_number,
						sequence_number: option.sequence_number,
						images: option.images,
					})),
					question_type: question.question_question_type,
					sequence: question.question_sequence,
					sequence_number: question.question_sequence,
					id: question.question_id,
				};
				return q;
			}),
			meta: data.data.meta,
		}),
	});

	const { isPending, mutate } = useMutation({
		mutationKey: ["create-question"],
		mutationFn: (payload: QuestionDto[]) => CreateQuestions(lessonTab, payload),
		onSuccess: () => {
			toast.success("Questions added successfully");
			queryClient.invalidateQueries({ queryKey: ["get-questions", lessonTab] });
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
	});

	const moduleQuestions = React.useMemo(() => {
		if (chapterId && lessonTab) {
			const existingQuestions = questions[chapterId]?.[lessonTab];
			if (!existingQuestions || existingQuestions.length === 0) {
				addQuestion(chapterId, lessonTab);
				return questions[chapterId]?.[lessonTab];
			}
			return existingQuestions;
		}
		return [];
	}, [chapterId, lessonTab, questions, addQuestion]);

	const handleAddQuestion = () => {
		if (!chapterId || !lessonTab) {
			toast.error("Please select a chapter and module");
			return;
		}
		addQuestion(chapterId, lessonTab);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!lessonTab) {
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
				(question) => question.question_type === "MULTICHOICE" && question.options.length < 2
			)
		) {
			toast.error("Multiple options questions must have more than 1 option");
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
					question.options.every((option) => option.is_correct !== "YES")
			)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}
		mutate(moduleQuestions);
	};

	if (!lesson) return null;

	return (
		<ScrollArea ref={ref} onScroll={handleScroll} className="h-full w-full">
			<form onSubmit={handleSubmit} className="col-span-4 space-y-2 rounded-md bg-neutral-100 p-4">
				<div className="flex w-full items-center justify-between">
					<p className="text-xs uppercase tracking-widest">
						Lesson {convertNumberToWord(lesson.sequence)} - Chapter{" "}
						{convertNumberToWord(lesson.chapter_sequence)}
					</p>

					<div className="flex items-center gap-x-2">
						<label htmlFor="xlsx-upload">
							<input
								type="file"
								id="xlsx-upload"
								className="sr-only hidden"
								ref={inputRef}
								onChange={handleFileChange}
								accept=".xlsx"
							/>
							<button
								type="button"
								onClick={handleClick}
								className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
								<RiImportLine className="size-4" />
								<span>Import Questions</span>
							</button>
						</label>
						<button
							type="button"
							onClick={() => setCurrentTab("lesson")}
							className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
							<RiArrowLeftSLine className="size-4" />
							<span>Back to Lesson</span>
						</button>
					</div>
				</div>
				<div className="w-full space-y-2">
					<div className="w-full space-y-2">
						{moduleQuestions?.map((question, index) => (
							<QuestionCard
								key={index}
								chapterId={String(chapterId)}
								moduleId={lessonTab}
								onDelete={(sequence) => removeQuestion(String(chapterId), lessonTab, sequence)}
								onDuplicate={(sequence) => duplicateQuestion(String(chapterId), lessonTab, sequence)}
								onReorder={(sequence, direction) =>
									reorderQuestion(String(chapterId), lessonTab, sequence, direction)
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
				</div>
			</form>
		</ScrollArea>
	);
};
