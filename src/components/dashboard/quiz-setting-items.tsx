import { quizSettingsActions, useQuizSettingsStore } from "@/store/z-store/quiz-settings";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const { addValue } = quizSettingsActions;
export const Attempts = () => {
	const attempt_limit = useQuizSettingsStore((state) => state.attempt_limit);
	const attempt_reset = useQuizSettingsStore((state) => state.attempt_reset);

	return (
		<div className="flex h-10 items-center">
			<div className="flex flex-col gap-1">
				<p className="text-xs text-neutral-400">Select attempts</p>
				<Select
					value={String(attempt_limit)}
					onValueChange={(value) => addValue("attempt_limit", value)}>
					<SelectTrigger className="w-[120px] rounded-r-none bg-neutral-100 text-xs">
						<SelectValue placeholder="Select attempts" />
					</SelectTrigger>
					<SelectContent>
						{[...Array(10)].map((_, index) => (
							<SelectItem className="text-xs" key={index} value={(index + 1).toString()}>
								{index + 1}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-xs text-neutral-400">Select frequency</p>
				<Select
					value={String(attempt_reset)}
					onValueChange={(value) => addValue("attempt_reset", value)}>
					<SelectTrigger className="w-[120px] rounded-l-none pl-1.5 text-xs">
						<SelectValue placeholder="Select frequency" />
					</SelectTrigger>
					<SelectContent>
						{[...Array(24)].map((_, index) => (
							<SelectItem className="text-xs" key={index} value={(index + 1).toString()}>
								Every {index + 1} hrs
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export const PassMark = () => {
	const bench_mark = useQuizSettingsStore((state) => state.bench_mark);

	return (
		<div className="h-10">
			<Select
				value={String(bench_mark)}
				onValueChange={(value) => addValue("bench_mark", value)}>
				<SelectTrigger className="w-[120px] bg-neutral-100 text-xs">
					<SelectValue placeholder="Select pass mark" />
				</SelectTrigger>
				<SelectContent>
					{[...Array(31)].map((_, index) => (
						<SelectItem className="text-xs" key={index} value={(index + 70).toString()}>
							{index + 70}%
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export const Timer = () => {
	const hour = useQuizSettingsStore((state) => state.timer_hour);
	const minute = useQuizSettingsStore((state) => state.timer_minute);

	return (
		<div className="flex h-10 items-center">
			<div className="flex flex-col gap-1">
				<p className="text-xs text-neutral-400">Select hour</p>
				<Select value={String(hour)} onValueChange={(value) => addValue("timer_hour", value)}>
					<SelectTrigger className="w-[120px] rounded-r-none bg-neutral-100 text-xs">
						<SelectValue placeholder="Select hours" />
					</SelectTrigger>
					<SelectContent>
						{[...Array(6)].map((_, index) => (
							<SelectItem className="text-xs" key={index} value={(index * 1).toString()}>
								{index * 1} Hrs
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-xs text-neutral-400">Select minute</p>
				<Select
					value={String(minute)}
					onValueChange={(value) => addValue("timer_minute", value)}>
					<SelectTrigger className="w-[120px] rounded-l-none text-xs">
						<SelectValue placeholder="Select minutes" />
					</SelectTrigger>
					<SelectContent>
						{[...Array(12)].map((_, index) => (
							<SelectItem className="text-xs" key={index} value={(index * 5).toString()}>
								{index * 5} mins
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
