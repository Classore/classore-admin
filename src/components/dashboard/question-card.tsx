import { toast } from "sonner";
import {
	RiAddLine,
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxCircleFill,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiDraggable,
	RiFileCopyLine,
	RiImageAddLine,
	// RiQuestionLine,
} from "@remixicon/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useQuizStore, type QuestionDto } from "@/store/z-store/quizz";
import { Textarea } from "../ui/textarea";
import { useFileHandler } from "@/hooks";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

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
	{ label: "duplicate", icon: RiFileCopyLine },
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

	const { handleFileChange, handleRemoveFile, inputRef } = useFileHandler({
		onValueChange: (files) => {
			addImagesToQuestion(chapterId, moduleId, question.sequence_number, files);
		},
		fileType: "image",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
			maxFiles: 5,
			maxSize: 1 * 1024 * 1024, // 1MB
			minFiles: 1,
		},
	});

	return (
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
								key={index}
								onClick={() => {
									if (label === "delete") {
										removeQuestion(chapterId, moduleId, question.sequence_number);
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
					className="h-44 w-full md:text-sm"
				/>

				<label className="absolute bottom-2 right-2 ml-auto">
					<input
						ref={inputRef}
						onChange={handleFileChange}
						type="file"
						accept="image/*"
						multiple
						maxLength={4}
						className="peer sr-only"
					/>

					<div className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
						<RiImageAddLine className="size-4" />
						<span>Upload Image</span>
					</div>
				</label>
			</div>

			{question.images.length ? (
				<ul className="grid grid-cols-4 gap-x-2">
					{question.images.map((image, index) => {
						const source = URL.createObjectURL(image);
						return (
							<li key={index} className="relative">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img alt="" className="size-32 rounded-md border" src={source} />
								<button
									type="button"
									onClick={() => {
										removeImageFromQuestion(chapterId, moduleId, question.sequence_number, index);
										handleRemoveFile(image);
									}}
									className="absolute right-2 top-2 rounded bg-red-50 p-1 text-red-400 transition-colors hover:text-red-500">
									<RiDeleteBinLine className="size-4" />
								</button>
							</li>
						);
					})}
				</ul>
			) : null}

			{question.question_type === "MULTICHOICE" && (
				<div className="flex w-full items-center justify-center gap-x-4">
					<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2"></div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Randomize options</p>
						<Switch
							checked={false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Mark as required</p>
						<Switch
							checked={false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
				</div>
			)}

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
	);
};

const OptionItem = ({
	chapterId,
	moduleId,
	question,
}: {
	chapterId: string;
	moduleId: string;
	question: QuestionDto;
}) => {
	const { addOptionContent, addOption, setCorrectOption, removeOption } = useQuizStore();

	return (
		<>
			<div className="w-full space-y-2">
				{question.options.map((option, index) => (
					<div
						key={index}
						className="flex h-10 w-full items-center gap-x-4 rounded-lg border border-neutral-400 px-3">
						<div className="flex flex-1 items-center gap-x-2">
							<button type="button" className={`grid size-6 place-items-center p-1`}>
								<RiDraggable className="size-full text-neutral-400" />
							</button>
							<input
								type="text"
								value={option.content}
								autoFocus
								onChange={(e) =>
									addOptionContent(
										chapterId,
										moduleId,
										question.sequence_number,
										e.target.value,
										option.sequence_number
									)
								}
								className="flex-1 border-0 bg-transparent px-0 py-1 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
							/>
							<div className="flex w-fit items-center gap-x-2">
								{option.is_correct === "YES" && (
									<div className="rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-400">
										Correct Answer
									</div>
								)}
								<button
									type="button"
									onClick={() =>
										setCorrectOption(chapterId, moduleId, question.sequence_number, option.sequence_number)
									}>
									<RiCheckboxCircleFill
										className={`size-5 ${option.is_correct === "YES" ? "text-primary-400" : "text-neutral-400"}`}
									/>
								</button>
							</div>
						</div>

						{question.question_type !== "YES_OR_NO" && (
							<button
								onClick={() =>
									removeOption(chapterId, moduleId, question.sequence_number, option.sequence_number)
								}
								className="grid size-6 place-items-center rounded-md border">
								<RiDeleteBin6Line className="size-4 text-neutral-400" />
							</button>
						)}
					</div>
				))}
			</div>

			{question.question_type === "MULTICHOICE" ? (
				<Button
					type="button"
					onClick={() => {
						if (question.options.length >= 4) {
							toast.error("Maximum options limit for this question type reached");
							return;
						}

						if (question.question_type !== "MULTICHOICE") {
							toast.error("Options can only be added to multiple choice questions");
							return;
						}
						addOption(chapterId, moduleId, question.sequence_number);
					}}
					className="w-fit focus:border-primary-300"
					size="xs"
					variant="dotted">
					<RiAddLine className="size-4" /> Add Option
				</Button>
			) : null}
		</>
	);
};
