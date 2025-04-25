import { useFileHandler } from "@/hooks";
import { UpdateQuestion } from "@/queries";
import { useQuizStore, type QuestionDto } from "@/store/z-store";
import type { HttpError } from "@/types";
import {
	RiAlignLeft,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBinLine,
	RiImageAddLine,
} from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { Spinner } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { OptionItem } from "./courses/option-item";

type EditQuestionProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	question: QuestionDto;
	chapterId: string;
	moduleId: string;
};

const question_types = [
	{ label: "Multiple Choice", value: "MULTICHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Short Answer", value: "FILL_IN_THE_GAP", icon: RiAlignLeft },
	{ label: "Yes/No", value: "YES_OR_NO", icon: RiContrastLine },
];

export const EditQuestionModal = ({
	open,
	setOpen,
	question,
	chapterId,
	moduleId,
}: EditQuestionProps) => {
	const queryClient = useQueryClient();
	const { addQuestionContent, handleTypeChange, addImagesToQuestion, removeImageFromQuestion } =
		useQuizStore();

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

	const { isPending, mutate } = useMutation({
		mutationKey: ["update-question"],
		mutationFn: (payload: QuestionDto) => UpdateQuestion(String(question.id), payload),
		onSuccess: () => {
			toast.success("Questions added successfully");
			queryClient.invalidateQueries({ queryKey: ["get-questions"] });
			setOpen(false);
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
	});

	const handleUpdate = () => {
		// if (moduleQuestions?.some((question) => question.content === "")) {
		// 	toast.error("All questions must have content");
		// 	return;
		// }
		if (question.question_type === "") {
			toast.error("All questions must have a type");
			return;
		}
		if (question.question_type === "MULTICHOICE" && question.options.length < 4) {
			toast.error("Multiple options questions must have a minimum of 4 options");
			return;
		}
		if (
			question.question_type !== "FILL_IN_THE_GAP" &&
			question.options.some((option) => option.content === "")
		) {
			toast.error("All options must have content");
			return;
		}
		if (
			(question.question_type === "MULTICHOICE" || question.question_type === "YES_OR_NO") &&
			question.options.every((option) => !option.is_correct)
		) {
			toast.error("Multiple choice and boolean questions must have a correct answer");
			return;
		}

		mutate(question);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<h1 className="text-lg font-medium">Update Question</h1>

				<div className="flex flex-col gap-4 rounded-md">
					<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
						<strong>Note:</strong> Uploaded images may take a while before being visible.
					</p>

					<div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
						<div className="flex h-7 w-full items-center justify-between">
							<div className="flex items-center gap-x-1.5">
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
											<img alt="" className="h-24 w-32 rounded-md border object-cover" src={source} />
											{/* {source.startsWith("blob") ? ( */}
											<button
												type="button"
												onClick={() => {
													removeImageFromQuestion(chapterId, moduleId, question.sequence_number, index);
													if (image instanceof File) {
														handleRemoveFile(image);
													}
												}}
												className="absolute right-2 top-2 rounded bg-red-50 p-1 text-red-400 transition-colors hover:bg-red-500 hover:text-red-100">
												<RiDeleteBinLine className="size-3" />
											</button>
											{/* ) : null}  */}
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

					<div className="flex items-center gap-2">
						<Button onClick={handleUpdate} disabled={isPending} className="w-40" type="button">
							{isPending ? <Spinner /> : "Update Question"}
						</Button>

						<DialogClose>
							<Button disabled={isPending} className="w-32" variant="outline" type="button">
								Cancel
							</Button>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
