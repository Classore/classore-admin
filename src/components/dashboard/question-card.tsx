import {
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiEdit2Line,
	RiImageAddLine,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useFileHandler } from "@/hooks";
import { queryClient } from "@/providers";
import { DeleteEntities } from "@/queries";
import { useQuizStore, type QuestionDto } from "@/store/z-store/quiz";
import type { HttpError } from "@/types";
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { OptionItem } from "./courses/option-item";
import { EditQuestionModal } from "./edit-question";

interface Props {
	chapterId: string;
	moduleId: string;
	onDelete: (sequence: number) => void;
	onDuplicate: (sequence: number) => void;
	onReorder: (sequence: number, direction: "up" | "down") => void;
	question: QuestionDto;
	// onUpdateQuestions: (question: QuestionDto) => void
}

const question_types = [
	{ label: "Multiple Choice", value: "MULTICHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Short Answer", value: "FILL_IN_THE_GAP", icon: RiAlignLeft },
	{ label: "Yes/No", value: "YES_OR_NO", icon: RiContrastLine },
];

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	// { label: "duplicate", icon: RiFileCopyLine },
	{ label: "edit", icon: RiEdit2Line },
	{ label: "delete", icon: RiDeleteBin6Line },
];

export const QuestionCard = ({ chapterId, moduleId, question }: Props) => {
	const {
		addQuestionContent,
		handleTypeChange,
		isQuestionSelected,
		removeQuestion,
		addImagesToQuestion,
		removeImageFromQuestion,
		toggleQuestionSelection,
	} = useQuizStore();

	const [open, setOpen] = React.useState(false);

	const { mutate } = useMutation({
		mutationFn: (ids: string[]) => DeleteEntities({ ids, model_type: "QUESTION" }),
		onSuccess: () => {
			toast.success("Questions deleted successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Failed to delete questions";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-questions"] });
		},
	});

	const {
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileChange,
		handlePaste,
		handleRemoveFile,
		inputRef,
		isDragging,
	} = useFileHandler({
		onValueChange: (files) => {
			addImagesToQuestion(chapterId, moduleId, question.sequence_number, files);
		},
		fileType: "image",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
			maxFiles: 4,
			maxSize: 5 * 1024 * 1024, // 1MB
			minFiles: 1,
		},
	});

	const handleDelete = (chapterId: string, moduleId: string, question: QuestionDto) => {
		removeQuestion(chapterId, moduleId, question.sequence_number);
		if (question.id) {
			const ids = [question.id];
			mutate(ids);
		}
	};

	return (
		<>
			<div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
				<div className="flex h-7 w-full items-center justify-between">
					<div className="flex items-center gap-x-1.5">
						<input
							type="checkbox"
							className="border-neutral- size-4 cursor-pointer rounded-sm border ring-0 focus:ring-0 active:ring-0"
							checked={isQuestionSelected(chapterId, moduleId, question.sequence_number)}
							onChange={() => toggleQuestionSelection(chapterId, moduleId, question.sequence_number)}
						/>
						{/* <RiQuestionLine className="size-5 text-neutral-400" /> */}
						<p className="text-xs text-neutral-400">QUESTION {question.sequence_number}</p>
					</div>
					<div className="flex items-center gap-x-2">
						<Select
							value={question.question_type}
							onValueChange={(value) =>
								handleTypeChange(value, chapterId, moduleId, question.sequence_number)
							}>
							<SelectTrigger className="h-7 w-40 text-xs">
								<SelectValue placeholder="Select a type" />
							</SelectTrigger>
							<SelectContent>
								{question_types.map(({ label, value, icon: Icon }, index) => (
									<SelectItem key={index} value={value}>
										<div className="flex items-center gap-x-1">
											<Icon className="size-4 text-neutral-400" />
											<p className="text-xs">{label}</p>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="flex items-center">
							{question_actions.map(({ icon: Icon, label }, index) => (
								<button
									type="button"
									title={label}
									key={index}
									onClick={() => {
										if (label === "delete") {
											handleDelete(chapterId, moduleId, question);
											return;
										}
										if (label === "edit") {
											setOpen(true);
											return;
										}
									}}
									className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
									<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="relative flex flex-col gap-2">
					<Textarea
						value={question.content}
						onChange={(e) =>
							addQuestionContent(chapterId, moduleId, question.sequence_number, e.target.value)
						}
						className={`h-44 w-full md:text-sm ${isDragging ? "border-primary-400" : ""}`}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onPaste={handlePaste}
					/>

					<label className="absolute bottom-2 right-2 ml-auto">
						<input
							ref={inputRef}
							onChange={handleFileChange}
							type="file"
							accept="image/*"
							multiple
							max={4}
							className="peer sr-only"
						/>

						<div className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
							<RiImageAddLine className="size-4" />
							<span>Upload Image</span>
						</div>
					</label>
				</div>

				{question.images.length ? (
					<ul className="grid grid-cols-4 gap-2">
						{question.images.map((image, index) => {
							const source = typeof image === "string" ? image : URL.createObjectURL(image);

							return (
								<li key={index} className="relative">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img alt="" className="size-32 rounded-md border object-cover" src={source} />
									{source.startsWith("blob") ? (
										<button
											type="button"
											onClick={() => {
												removeImageFromQuestion(chapterId, moduleId, question.sequence_number, index);
												if (image instanceof File) {
													handleRemoveFile(image);
												}
											}}
											className="absolute right-2 top-2 rounded bg-red-50 p-1 text-red-400 transition-colors hover:bg-red-500 hover:text-red-100">
											<RiDeleteBinLine className="size-4" />
										</button>
									) : null}
								</li>
							);
						})}
					</ul>
				) : null}

				{question.question_type === "MULTICHOICE" && (
					<div className="space-y-3">
						<p className="text-sm text-neutral-400">Options</p>
						<OptionItem chapterId={chapterId} moduleId={moduleId} question={question} />
					</div>
				)}

				{question.question_type === "YES_OR_NO" && (
					<div className="space-y-3">
						<p className="text-sm text-neutral-400">Options</p>
						<div className="w-full space-y-2">
							<OptionItem chapterId={chapterId} moduleId={moduleId} question={question} />
						</div>
					</div>
				)}
				{question.question_type === "FILL_IN_THE_GAP" && (
					<div className="space-y-3">
						<p className="text-sm text-neutral-400">Options</p>
						<div className="w-full space-y-2">
							<OptionItem chapterId={chapterId} moduleId={moduleId} question={question} />
						</div>
					</div>
				)}
			</div>

			<EditQuestionModal
				chapterId={chapterId}
				moduleId={moduleId}
				open={open}
				setOpen={setOpen}
				question={question}
			/>
		</>
	);
};
