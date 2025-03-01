import { Target04 } from "@untitled-ui/icons-react";
import React from "react";

interface Props {
	value: string;
	label?: string;
}

export const Card = ({ value, label }: Props) => {
	return (
		<div className="aspect-[1.7/1] w-full space-y-4 rounded-2xl bg-white px-5 py-[15px]">
			<div className="grid size-10 place-items-center rounded-full border">
				<Target04 />
			</div>
			<div className="w-full space-y-2">
				<p className="text-2xl font-semibold">{value}</p>
				<p className="text-sm text-neutral-400">{label}</p>
			</div>
		</div>
	);
};

export const LeaderboardItem = () => {
	return (
		<div className="flex h-14 w-full items-center justify-between rounded-md">
			<div className="flex items-center gap-x-2">
				<div className=""></div>
				<div className=""></div>
				<div className="space-y-1">
					<p className="text-sm font-medium"></p>
					<p className="text-sm text-neutral-400"></p>
				</div>
			</div>
			<div className=""></div>
		</div>
	);
};

export const ReferralItem = () => {
	return (
		<div className="flex h-14 w-full items-center justify-between rounded-md">
			<div className="flex items-center gap-x-2">
				<div className=""></div>
				<div className=""></div>
				<div className="space-y-1">
					<p className="text-sm font-medium"></p>
					<p className="text-sm text-neutral-400"></p>
				</div>
			</div>
			<div className=""></div>
		</div>
	);
};
