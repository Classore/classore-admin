import React from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export interface AttemptsProps {
	attempts: string;
	attemptedInterval: string;
	onAttemptChange: (attempt: string) => void;
	onAttemptedIntervalChange: (attemptedInterval: string) => void;
}

export interface PassMarkProps {
	passMark: string;
	onPassMarkChange: (passMark: string) => void;
}

export interface TimerProps {
	timer: string;
	onTimerChange: (timer: string) => void;
}

export const Attempts = () => {
	return (
		<div className="flex h-10 items-center">
			<Select>
				<SelectTrigger className="w-[119px] rounded-r-none bg-neutral-200 text-xs">
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
			<Select>
				<SelectTrigger className="w-[119px] rounded-l-none text-xs">
					<SelectValue placeholder="Select frequuency" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem className="text-xs" value="never">
						Never
					</SelectItem>
					<SelectItem className="text-xs" value="daily">
						Every 24 hours
					</SelectItem>
					<SelectItem className="text-xs" value="weekly">
						Every week
					</SelectItem>
					<SelectItem className="text-xs" value="monthly">
						Every month
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};

export const PassMark = () => {
	return (
		<div className="h-10">
			<Select>
				<SelectTrigger className="w-[119px] bg-neutral-200 text-xs">
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
	return (
		<div className="flex h-10 items-center">
			<Select>
				<SelectTrigger className="w-[119px] rounded-r-none bg-neutral-200 text-xs">
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
			<Select>
				<SelectTrigger className="w-[119px] rounded-l-none text-xs">
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
	);
};
