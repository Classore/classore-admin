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
	RiFileCopyLine,
	RiImageAddLine,
	RiQuestionLine,
} from "@remixicon/react";

import { useQuizStore, type QuestionDto } from "@/store/z-store/quiz";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface Props {
	question: QuestionDto;
	// onDelete: (sequence: number) => void;
	// onDuplicate: (sequence: number) => void;
	// onReorder: (sequence: number, direction: "up" | "down") => void;
	// onUpdateQuestions: (question: CreateQuestionDto) => void;
}

const question_types = [
	{ label: "Multiple Choice", value: "MULTICHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Short Answer", value: "SHORT_ANSWER", icon: RiAlignLeft },
	{ label: "Yes/No", value: "YES_OR_NO", icon: RiContrastLine },
	{ label: "Single Choice", value: "SINGLECHOICE", icon: RiCheckboxMultipleLine },
	// { label: "Media", value: "MEDIA", icon: RiImageLine },
];

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

export const QuestionCard = ({ question }: Props) => {
	const {
		handleTypeChange,
		addQuestionContent,
		removeQuestion,
		addImagesToQuestion,
		removeImageFromQuestion,
	} = useQuizStore((state) => state.actions);

	return (
		<div className="space-y-3 rounded-lg bg-white p-4">
			<div className="flex h-7 w-full items-center justify-between">
				<div className="flex items-center gap-x-1.5">
					<RiQuestionLine className="size-5 text-neutral-400" />
					<p className="text-xs text-neutral-400">QUESTION {question.sequence_number}</p>
				</div>
				<div className="flex items-center gap-x-2">
					<Select
						value={question.question_type}
						onValueChange={(value) => handleTypeChange(value, question.sequence_number)}>
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
								key={index}
								onClick={() => {
									if (label === "delete") {
										removeQuestion(question.sequence_number);
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
					onChange={(e) => addQuestionContent(question.sequence_number, e.target.value)}
					className="h-44 w-full md:text-sm"
				/>

				<label className="absolute bottom-2 right-2 ml-auto">
					<input
						// value={question.images}
						onChange={(e) => {
							const files = Array.from(e.target.files ?? []);
							addImagesToQuestion(question.sequence_number, files);
						}}
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
								<img alt="" className="size-32 rounded-md" src={source} />

								<button
									type="button"
									onClick={() => {
										removeImageFromQuestion(question.sequence_number, index);
										URL.revokeObjectURL(source);
									}}
									className="absolute right-2 top-2 rounded bg-red-50 p-1 text-red-400 transition-colors hover:text-red-500">
									<RiDeleteBinLine className="size-4" />
								</button>
							</li>
						);
					})}
				</ul>
			) : null}

			{/* Randomizer */}
			{/* <div className="flex w-full items-center justify-center gap-x-4">
				<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2"></div>
				<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
					<p className="text-xs text-neutral-400">Randomize options</p>
					<Switch
						checked={questionSettings.randomized}
						onCheckedChange={(value) => handleSettingsChange("randomized", value)}
						className="data-[state=checked]:bg-green-500"
					/>
				</div>
				<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
					<p className="text-xs text-neutral-400">Mark as required</p>
					<Switch
						checked={questionSettings.required}
						onCheckedChange={(value) => handleSettingsChange("required", value)}
						className="data-[state=checked]:bg-green-500"
					/>
				</div>
			</div> */}

			{question.question_type === "MULTICHOICE" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<OptionItem question={question} />
				</div>
			)}

			{question.question_type === "YES_OR_NO" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full space-y-2">
						<OptionItem question={question} />
					</div>
				</div>
			)}
			{question.question_type === "SINGLECHOICE" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full space-y-2"></div>
				</div>
			)}
			{question.question_type === "SHORT_ANSWER" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					{/* <div className="w-full">
						<OptionItem question={question} />
					</div> */}
				</div>
			)}
			{/* {question.question_type === "MEDIA" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full space-y-2"></div>
				</div>
			)} */}
		</div>
	);
};

const OptionItem = ({ question }: { question: QuestionDto }) => {
	const { addOptionContent, addOption, setCorrectOption, removeOption } = useQuizStore(
		(state) => state.actions
	);

	return (
		<>
			<div className="w-full space-y-2">
				{question.options.map((option, index) => (
					<div
						key={index}
						className="flex h-10 w-full items-center gap-x-4 rounded-lg border border-neutral-400 px-3">
						<div className="flex flex-1 items-center gap-x-2">
							{/* <button
										onMouseDown={() => setIsGrabbing(true)}
										onMouseUp={() => setIsGrabbing(false)}
										onMouseLeave={() => setIsGrabbing(false)}
										type="button"
										className={`grid size-6 place-items-center p-1 ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}>
										<RiDraggable className="size-full text-neutral-400" />
									</button> */}

							<input
								type="text"
								value={option.content}
								autoFocus
								onChange={(e) =>
									addOptionContent(
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
									onClick={() =>
										setCorrectOption(question.sequence_number, option.sequence_number)
									}>
									<RiCheckboxCircleFill
										className={`size-5 ${option.is_correct === "YES" ? "text-primary-400" : "text-neutral-400"}`}
									/>
								</button>
							</div>
						</div>

						{question.question_type !== "YES_OR_NO" && (
							<button
								onClick={() => removeOption(question.sequence_number, option.sequence_number)}
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
						addOption(question.sequence_number);
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
