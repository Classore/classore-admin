import { toKebabCase } from "@/lib";
import { GetSubject, UpdateQuizSettings, type UpdateQuizSettingsPayload } from "@/queries";
import { quizSettingsActions, useQuizSettingsStore } from "@/store/z-store/quiz-settings";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";
import { answer_settings, question_settings, type QuestionSettings } from "./dashboard/data";
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

const { addValue, setValues } = quizSettingsActions;
export const QuizSettingsTab = ({ tab }: { tab: string }) => {
	const queryClient = useQueryClient();
	const setting = useQuizSettingsStore((state) => state);

	const router = useRouter();
	const courseId = router.query.courseId as string;

	const { data: course } = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: courseId ? () => GetSubject(courseId) : skipToken,
	});

	const { isPending, mutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) => UpdateQuizSettings(chapter_id, module),
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
		if (typeof setting.timer_hour !== "number" || typeof setting.timer_minute !== "number") {
			toast.error("Please select a timer duration (hour and minute) for the quiz");
			return;
		}

		if (typeof setting.bench_mark !== "number") {
			toast.error("Please select a pass mark");
			return;
		}

		if (typeof setting.attempt_limit !== "number" || typeof setting.attempt_reset !== "number") {
			toast.error("Please select a number of attempts and frequency");
			return;
		}

		mutate({
			chapter_id: course?.data?.chapters[0]?.id ?? "",
			module: {
				timer_hour: setting.timer_hour,
				timer_minute: setting.timer_minute,
				bench_mark: setting.bench_mark,
				attempt_limit: setting.attempt_limit,
				attempt_reset: setting.attempt_reset,
				shuffle_questions: setting.shuffle_questions ? "YES" : "NO",
				skip_questions: setting.skip_questions ? "YES" : "NO",
			},
		});
	};

	React.useEffect(() => {
		if (course) {
			setValues({
				timer_hour: course?.data?.chapters[0]?.timer_hour,
				timer_minute: course?.data?.chapters[0]?.timer_minute,
				bench_mark: Number(course?.data?.chapters[0]?.bench_mark),
				attempt_limit: course?.data?.chapters[0]?.attempt_limit,
				attempt_reset: course?.data?.chapters[0]?.attempt_reset,
				shuffle_questions: course?.data?.chapters[0]?.shuffle_questions === "YES" ? true : false,
				skip_questions: course?.data?.chapters[0]?.skip_questions === "YES" ? true : false,
			});
		}
	}, [course]);

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

const QuestionItem = ({ description, hasChildren, icon: Icon, label, slug }: QuestionSettings) => {
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
