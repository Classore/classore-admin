import { useFormik } from "formik";
import React from "react";
import {
	RiAddLine,
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileCopyLine,
	RiQuestionLine,
} from "@remixicon/react";

import type { CreateOptionsDto, CreateQuestionDto } from "@/queries";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface Props {
	onDelete: (sequence: number) => void;
	onDuplicate: (sequence: number) => void;
	onReorder: (sequence: number, direction: "up" | "down") => void;
	onUpdateQuestions: (question: CreateQuestionDto) => void;
	question: CreateQuestionDto;
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
	onDelete,
	onDuplicate,
	onReorder,
	onUpdateQuestions,
	question,
}: Props) => {
	const initialValues: CreateQuestionDto = {
		content: question.content ?? "",
		images: question.images ?? [],
		options: question.options ?? [],
		question_type: question.question_type ?? "",
		sequence: question.sequence ?? 0,
	};

	const { setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			onUpdateQuestions(values);
		},
	});

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
						value={values.question_type}
						onValueChange={(value) => setFieldValue("question_type", value)}>
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
			{values.question_type === "MULTICHOICE" && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<div className="w-full">
						{question.options.map((_option, index) => (
							<OptionItem key={index} index={index} option={_option} />
						))}
					</div>
					<Button className="w-fit" size="xs" variant="dotted">
						<RiAddLine className="size-4" /> Add Option
					</Button>
				</div>
			)}
			{values.question_type === "SINGLECHOICE" && <div className=""></div>}
			{values.question_type === "SHORTANSWER" && <div className=""></div>}
			{values.question_type === "TRUORFALSE" && <div className=""></div>}
		</div>
	);
};

const OptionItem = ({ option }: { index: number; option: CreateOptionsDto }) => {
	const [isGrabbing, setIsGrabbing] = React.useState(false);

	return (
		<div className="flex h-10 w-full items-center gap-x-4">
			<div className="flex flex-1 items-center gap-x-2">
				<button
					onMouseDown={() => setIsGrabbing(true)}
					onMouseUp={() => setIsGrabbing(false)}
					onMouseLeave={() => setIsGrabbing(false)}
					type="button"
					className={`size-6 ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}>
					<RiDraggable size={14} className="text-neutral-400" />
				</button>
				<input
					type="text"
					value={option.content}
					className="flex-1 rounded-md border bg-transparent p-2 text-sm outline-none"
				/>
			</div>
			<button className="grid size-6 place-items-center rounded-md border">
				<RiDeleteBin6Line className="size-4 text-neutral-400" />
			</button>
		</div>
	);
};
