// import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxMultipleLine,
	RiCheckboxCircleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileCopyLine,
	RiQuestionLine,
} from "@remixicon/react";

import type { CreateOptionsDto, CreateQuestionDto } from "@/queries";
import type { QuestionTypeProps } from "@/types";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	// DialogDescription,
	// DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { toast } from "sonner";

interface Props {
	initialQuestion: CreateQuestionDto;
	onDelete: (sequence: number) => void;
	onDuplicate: (sequence: number) => void;
	onReorder: (sequence: number, direction: "up" | "down") => void;
	onUpdateQuestions: (question: CreateQuestionDto) => void;
}

const question_types = [
	{ label: "Multiple Choice", value: "MULTICHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Short Answer", value: "SHORTANSWER", icon: RiAlignLeft },
	{ label: "Yes/No", value: "TRUEORFALSE", icon: RiContrastLine },
	{ label: "Single Choice", value: "SINGLECHOICE", icon: RiCheckboxMultipleLine },
];

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

export const QuestionCard = ({
	initialQuestion,
	onDelete,
	onDuplicate,
	onReorder,
	onUpdateQuestions,
}: Props) => {
	const [question, setQuestion] = React.useState<CreateQuestionDto>(initialQuestion);

	const handleTypeChange = (question_type: QuestionTypeProps) => {
		let options: CreateOptionsDto[] = [];
		switch (question_type) {
			case "MULTICHOICE":
				options = [{ content: "", is_correct: "NO", sequence_number: 0 }];
				break;
			case "BOOLEAN":
				options = [
					{ content: "True", is_correct: "YES", sequence_number: 0 },
					{ content: "False", is_correct: "NO", sequence_number: 1 },
				];
				break;
			case "SHORTANSWER":
				options = [{ content: "", is_correct: "YES", sequence_number: 0 }];
				break;
			case "SINGLECHOICE":
				options = [{ content: "", is_correct: "YES", sequence_number: 0 }];
				break;
			default:
				options = [];
		}
		const updatedQuestion = {
			...question,
			question_type,
			options,
		};
		setQuestion(updatedQuestion);
		onUpdateQuestions(updatedQuestion);
	};

	const addOption = () => {
		if (question.options.length < 4 && question.question_type === "MULTICHOICE") {
			const options: CreateOptionsDto = {
				content: "",
				is_correct: "NO",
				sequence_number: question.options.length,
			};
			const updatedQuestion = {
				...question,
				options: [...question.options, options],
			};
			setQuestion(updatedQuestion);
			onUpdateQuestions(updatedQuestion);
		}
	};

	const removeOption = (index: number) => {
		if (question.question_type === "MULTICHOICE" && question.options.length > 1) {
			if (question.options.length === 1) {
				toast.error("At least one option is required");
				return;
			}
			const updatedOptions = question.options.filter((_, i) => i !== index);
			const updatedQuestion = {
				...question,
				options: updatedOptions,
			};
			setQuestion(updatedQuestion);
			onUpdateQuestions(updatedQuestion);
		}
	};

	const updateOption = (index: number, content: string) => {
		const updatedOptions = question.options.map((option, i) =>
			i === index ? { ...option, content } : option
		);
		const updatedQuestion = {
			...question,
			options: updatedOptions,
		};
		setQuestion(updatedQuestion);
		onUpdateQuestions(updatedQuestion);
	};

	const setCorrectOption = (index: number) => {
		const updatedOptions: CreateOptionsDto[] = question.options.map((option, i) =>
			i === index ? { ...option, is_correct: "YES" } : { ...option, is_correct: "NO" }
		);
		const updatedQuestion = {
			...question,
			options: updatedOptions,
		};
		setQuestion(updatedQuestion);
		onUpdateQuestions(updatedQuestion);
	};

	const handleQuestionAction = (label: string) => {
		switch (label) {
			case "up":
				onReorder(question.sequence, "up");
				break;
			case "down":
				onReorder(question.sequence, "down");
				break;
			case "duplicate":
				onDuplicate(question.sequence);
				break;
			case "delete":
				onDelete(question.sequence);
				break;
		}
	};

	return (
		<div className="space-y-3 rounded-lg bg-white p-4">
			<div className="flex h-7 w-full items-center justify-between">
				<div className="flex items-center gap-x-1.5">
					<RiQuestionLine className="size-5 text-neutral-400" />
					<p className="text-xs text-neutral-400">QUESTION {}</p>
				</div>
				<div className="flex items-center gap-x-2">
					<Select
						value={question.question_type}
						onValueChange={(value) => handleTypeChange(value as QuestionTypeProps)}>
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
								onClick={() => handleQuestionAction(label)}
								className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
								<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
							</button>
						))}
					</div>
				</div>
			</div>
			<Textarea className="h-40 w-full" />
			<div className="flex w-full items-center justify-center gap-x-4">
				<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2"></div>
				<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
					<p className="text-xs text-neutral-400">Randomize options</p>
					<Switch className="data-[state=checked]:bg-green-500" />
				</div>
				<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
					<p className="text-xs text-neutral-400">Mark as required</p>
					<Switch className="data-[state=checked]:bg-green-500" />
				</div>
			</div>
			{question.question_type === "MULTICHOICE" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full">
						{question.options.map((option, index) => (
							<OptionItem
								key={index}
								index={index}
								onDeleteOption={removeOption}
								onUpdateOptions={updateOption}
								option={option}
								setCorrectOption={setCorrectOption}
							/>
						))}
					</div>
					<Button className="w-fit" size="xs" variant="dotted">
						<RiAddLine onClick={addOption} className="size-4" /> Add Option
					</Button>
				</div>
			)}
			{question.question_type === "BOOLEAN" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full">
						{question.options.map((option, index) => (
							<OptionItem
								key={index}
								index={index}
								onDeleteOption={removeOption}
								onUpdateOptions={updateOption}
								option={option}
								setCorrectOption={setCorrectOption}
							/>
						))}
					</div>
				</div>
			)}
			{question.question_type === "SINGLECHOICE" && <div className=""></div>}
			{question.question_type === "SHORTANSWER" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full">
						{question.options.map((option, index) => (
							<OptionItem
								key={index}
								index={index}
								onDeleteOption={removeOption}
								onUpdateOptions={updateOption}
								option={option}
								setCorrectOption={setCorrectOption}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

const OptionItem = ({
	index,
	onUpdateOptions,
	// onDeleteOption,
	option,
	setCorrectOption,
}: {
	index: number;
	option: CreateOptionsDto;
	onDeleteOption: (index: number) => void;
	onUpdateOptions: (index: number, content: string) => void;
	setCorrectOption: (index: number) => void;
}) => {
	const [isGrabbing, setIsGrabbing] = React.useState(false);
	const [open, setOpen] = React.useState(false);

	return (
		<div className="flex h-10 w-full items-center gap-x-4 rounded-lg border border-neutral-400">
			<div className="flex flex-1 items-center gap-x-2">
				<button
					onMouseDown={() => setIsGrabbing(true)}
					onMouseUp={() => setIsGrabbing(false)}
					onMouseLeave={() => setIsGrabbing(false)}
					type="button"
					className={`size-6 p-1 ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}>
					<RiDraggable className="size-full text-neutral-400" />
				</button>
				<input
					type="text"
					value={option.content}
					onChange={(e) => onUpdateOptions(option.sequence_number, e.target.value)}
					className="flex-1 border-0 bg-transparent p-2 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
				/>
				<div className="flex w-fit items-center gap-x-2">
					{option.is_correct && (
						<div className="rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-400">
							Correct Answer
						</div>
					)}
					<button
						onClick={() => setCorrectOption(index)}
						className="grid size-6 place-items-center rounded-md border bg-green-500">
						<RiCheckboxCircleLine
							className={`size-3.5 ${option.is_correct === "YES" ? "text-primary-400" : "text-neutral-400"}`}
						/>
					</button>
				</div>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<button className="grid size-6 place-items-center rounded-md border">
						<RiDeleteBin6Line className="size-4 text-neutral-400" />
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1"></DialogContent>
			</Dialog>
		</div>
	);
};
