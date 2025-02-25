import type { RemixiconComponentType } from "@remixicon/react";
import React from "react";

interface Props {
	icon: RemixiconComponentType;
	label: string;
	value: number;
}

export const Card = ({ icon: Icon, label, value }: Props) => {
	return (
		<div className="flex aspect-[1.8/1] w-full flex-col justify-between rounded-lg border px-5 py-[15px]">
			<div className="grid size-10 place-items-center rounded-full border">
				<Icon className="size-6" />
			</div>
			<div className="space-y-2">
				<h3 className="text-2xl font-semibold">{value}</h3>
				<p className="text-sm text-neutral-400">{label}</p>
			</div>
		</div>
	);
};
