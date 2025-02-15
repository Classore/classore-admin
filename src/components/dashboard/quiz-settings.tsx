import React from "react";

import { type QuestionSettings, answer_settings, question_settings } from "./data";
import { Attempts, PassMark, Timer } from "./quiz-setting-items";
import { Switch } from "../ui/switch";
import { toKebabCase } from "@/lib";

const items: Record<string, React.ReactNode> = {
	attempts: <Attempts />,
	"assign-pass-mark": <PassMark />,
	"set-timer": <Timer />,
};

export const QuizSettings = () => {
	return (
		<div className="grid w-full grid-cols-2 gap-x-4">
			<div className="w-full space-y-2 rounded-lg bg-neutral-100 p-3">
				<p className="text-xs font-medium text-neutral-500">QUESTION SETTINGS</p>
				<div className="w-full space-y-2">
					{question_settings.map((setting, index) => (
						<QuestionItem key={index} {...setting} />
					))}
				</div>
			</div>
			<div className="w-full space-y-2 rounded-lg bg-neutral-100 p-3">
				<p className="text-xs font-medium text-neutral-500">ANSWER SETTINGS</p>
				<div className="w-full space-y-2">
					{answer_settings.map((setting, index) => (
						<QuestionItem key={index} {...setting} />
					))}
				</div>
			</div>
		</div>
	);
};

const QuestionItem = ({ description, hasChildren, icon: Icon, label }: QuestionSettings) => {
	const [enabled, setEnabled] = React.useState(false);

	return (
		<div className="w-full rounded-lg bg-white p-4">
			<div className="flex items-start gap-x-2">
				<Icon size={18} />
				<div className="flex-1 space-y-2">
					<div className="flex w-full items-center justify-between">
						<h5 className="text-sm">{label}</h5>
						<Switch checked={enabled} onCheckedChange={setEnabled} />
					</div>
					<p className="text-xs text-neutral-400">{description}</p>
					{hasChildren && enabled && <div className="h-10 w-full">{items[toKebabCase(label)]}</div>}
				</div>
			</div>
		</div>
	);
};
