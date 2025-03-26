import { RiArrowLeftSLine, RiImportLine, RiLoaderLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { convertNumberToWord, quizQuestionFromXlsxToJSON } from "@/lib";
import { CreateQuestions, GetQuestions } from "@/queries";
import { useChapterStore } from "@/store/z-store/chapter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteQuestions } from "../delete-questions";
import { useQuizStore } from "@/store/z-store/quiz";
import type { QuestionDto } from "@/store/z-store";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "../question-card";
import { Spinner } from "@/components/shared";
import { queryClient } from "@/providers";
import { useFileHandler } from "@/hooks";
import type { HttpError } from "@/types";

interface Props {
	chapterId: string | undefined;
	activeLessonId: string;
	setCurrentTab: (tab: string) => void;
}

export const LessonQuiz = ({ chapterId, activeLessonId, setCurrentTab }: Props) => {
	const {
		addQuestion,
		duplicateQuestion,
		questions,
		removeQuestion,
		reorderQuestion,
		updateQuestions,
	} = useQuizStore();
	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === activeLessonId);
	const [scrollPosition, setScrollPosition] = React.useState(0);
	const ref = React.useRef<HTMLInputElement>(null);

	const handleScroll = () => {
		if (ref.current) {
			setScrollPosition(ref.current.scrollTop);
		}
	};

	React.useEffect(() => {
		if (ref.current) {
			ref.current.scrollTop = 0;
		}
	}, [activeLessonId]);

	React.useLayoutEffect(() => {
		if (ref.current && scrollPosition > 0) {
			ref.current.scrollTop = scrollPosition;
		}
	}, [scrollPosition, questions]);

	const { getSelectedCount } = useQuizStore();

	const selectCount = React.useMemo(() => {
		if (!chapterId || !activeLessonId) return 0;
		return getSelectedCount(chapterId, activeLessonId);
	}, [chapterId, activeLessonId, getSelectedCount]);

	const { handleClick, handleFileChange, inputRef } = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			quizQuestionFromXlsxToJSON(file, 0).then((questions) => {
				updateQuestions(String(chapterId), activeLessonId, questions);
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

	const { data: existingQuestions, isLoading } = useQuery({
		queryKey: ["get-questions", activeLessonId],
		queryFn: () =>
			GetQuestions({ chapter_id: chapterId, module_id: activeLessonId, limit: 100, page: 1 }),
		enabled: !!(chapterId && activeLessonId),
		select: (data) => ({
			questions: data.data.data.map((question) => {
				const q: QuestionDto = {
					content: question.question_content,
					images: question.question_images,
					options: question.options.map((option) => ({
						content: option.content,
						is_correct: option.is_correct,
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

	React.useEffect(() => {
		const questions = existingQuestions?.questions;
		if (questions && questions.length > 0) {
			updateQuestions(String(chapterId), activeLessonId, questions);
		}
	}, [activeLessonId, chapterId, existingQuestions, updateQuestions]);

	const { isPending, mutate } = useMutation({
		mutationKey: ["create-question"],
		mutationFn: (payload: QuestionDto[]) => CreateQuestions(activeLessonId, payload),
		onSuccess: (data) => {
			console.log(data);
			toast.success("Questions added successfully");
			queryClient.invalidateQueries({ queryKey: ["get-questions", activeLessonId] });
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
	});

	const moduleQuestions = React.useMemo(() => {
		if (chapterId && activeLessonId) {
			const existingQuestions = questions[chapterId]?.[activeLessonId];
			if (!existingQuestions || existingQuestions.length === 0) {
				addQuestion(chapterId, activeLessonId);
				return questions[chapterId]?.[activeLessonId];
			}
			return existingQuestions;
		}
		return [];
	}, [chapterId, activeLessonId, questions, addQuestion]);

	const handleAddQuestion = () => {
		if (!chapterId || !activeLessonId) {
			toast.error("Please select a chapter and module");
			return;
		}
		addQuestion(chapterId, activeLessonId);
	};

	const filterExistingQuestions = React.useCallback((questions: QuestionDto[]) => {
		return questions.filter((question) => !question.id);
	}, []);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!activeLessonId) {
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
					question.options.every((option) => !option.is_correct)
			)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}
		const newQuestions = filterExistingQuestions(moduleQuestions);
		mutate(newQuestions);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center gap-x-2">
				<p className="text-sm text-primary-400">Fetching quiz</p>{" "}
				<RiLoaderLine className="size-4 animate-spin text-primary-400" />
			</div>
		);
	}

	if (!lesson) return null;

	return (
		<ScrollArea className="h-full w-full" onScroll={handleScroll} ref={ref}>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md p-4">
				<div className="flex w-full items-center justify-between">
					<p className="text-xs uppercase tracking-widest">
						Lesson {convertNumberToWord(lesson.sequence)} - Chapter{" "}
						{convertNumberToWord(lesson.chapter_sequence)}
					</p>

					<div className="flex items-center gap-x-2">
						{selectCount > 0 && (
							<DeleteQuestions chapterId={String(chapterId)} moduleId={activeLessonId} />
						)}
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
								moduleId={activeLessonId}
								onDelete={(sequence) => removeQuestion(String(chapterId), activeLessonId, sequence)}
								onDuplicate={(sequence) => duplicateQuestion(String(chapterId), activeLessonId, sequence)}
								onReorder={(sequence, direction) =>
									reorderQuestion(String(chapterId), activeLessonId, sequence, direction)
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
