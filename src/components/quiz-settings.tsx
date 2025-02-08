import { toKebabCase } from "@/lib";
import { UpdateQuizSettings, type UpdateQuizSettingsPayload } from "@/queries";
import { quizSettingsActions, useQuizSettingsStore } from "@/store/z-store/quiz-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
	answer_settings,
	question_settings,
	type QuestionSettings,
} from "./dashboard/data";
import { Attempts, PassMark, Timer } from "./dashboard/quiz-setting-items";
import { Spinner, TabPanel } from "./shared";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

interface UseMutationProps {
	chapter_id: string;
	module: UpdateQuizSettingsPayload;
}

const items: Record<string, React.ReactNode> = {
	attempts: <Attempts />,
	"assign-pass-mark": <PassMark />,
	"set-timer": <Timer />,
};

const { addValue } = quizSettingsActions;
export const QuizSettingsTab = ({ tab }: { tab: string }) => {
	const queryClient = useQueryClient();
	const setting = useQuizSettingsStore((state) => state);

	const { isPending, mutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) =>
			UpdateQuizSettings(chapter_id, module),
		mutationKey: ["update-quiz-settings"],
		onSuccess: () => {
			toast.success("Quiz settings update successfully!");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to update quiz settings");
		},
	});

	const onUpdateQuizSettings = () => {
		if (!setting.timer_hour || !setting.timer_minute) {
			toast.error("Please select a timer duration (hour and minute) for the quiz");
			return;
		}

		if (!setting.bench_mark) {
			toast.error("Please select a pass mark");
			return;
		}

		if (!setting.attempt_limit || !setting.attempt_reset) {
			toast.error("Please select a number of attempts and frequency");
			return;
		}

		console.log("quiz settings", setting);
	};

	return (
		<TabPanel innerClassName="space-y-4 pt-5" selected={tab} value="quiz">
			<div className="grid w-full grid-cols-2 gap-x-4">
				<div className="w-full space-y-3 rounded-lg bg-neutral-100 p-3">
					<p className="text-xs font-medium text-neutral-500">QUESTION SETTINGS</p>
					<div className="w-full space-y-2">
						{question_settings.map((setting, index) => (
							<QuestionItem key={index} {...setting} />
						))}
					</div>
				</div>
				<div className="w-full space-y-3 rounded-lg bg-neutral-100 p-3">
					<p className="text-xs font-medium text-neutral-500">ANSWER SETTINGS</p>
					<div className="w-full space-y-2">
						{answer_settings.map((setting, index) => (
							<QuestionItem key={index} {...setting} />
						))}
					</div>
				</div>
			</div>

			<Button
				disabled={isPending}
				onClick={onUpdateQuizSettings}
				className="w-40 text-sm font-semibold">
				{isPending ? <Spinner /> : "Update Settings"}
			</Button>
		</TabPanel>
	);
};

const QuestionItem = ({
	description,
	hasChildren,
	icon: Icon,
	label,
	slug,
}: QuestionSettings) => {
	const [enabled, setEnabled] = React.useState(false);

	return (
		<div className="w-full rounded-lg bg-white p-4">
			<div className="flex items-start gap-x-2">
				<Icon size={18} />

				<div className="flex flex-1 items-start justify-between gap-4 space-y-2">
					<div className="flex flex-col gap-y-1">
						<h5 className="text-sm">{label}</h5>
						<p className="text-xs text-neutral-400">{description}</p>

						{hasChildren && <div className="mt-4 h-10 w-full">{items[toKebabCase(label)]}</div>}
					</div>

					{slug === "shuffle_questions" || slug == "skip_questions" ? (
						<Switch
							checked={enabled}
							onCheckedChange={() => {
								setEnabled(!enabled);

								if (slug === "shuffle_questions") {
									addValue("shuffle_questions", !enabled);
									return;
								}
								if (slug === "skip_questions") {
									addValue("skip_questions", !enabled);
									return;
								}
							}}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};
