import type { RemixiconComponentType } from "@remixicon/react";
import React from "react";

interface Props {
	icon: RemixiconComponentType;
	label: string;
	value: number;
}

export const CalendarCard = ({ icon: Icon, label, value }: Props) => {
	return (
		<div className="flex aspect-[1.84/1] w-full flex-col gap-y-4 rounded-xl border px-5 py-[15px]">
			<div className="grid size-8 place-items-center rounded-full border">
				<Icon size={20} />
			</div>
			<div className="flex w-full items-center justify-between">
				<div className="flex flex-col gap-y-2">
					<h6 className="text-xl font-semibold">{value.toLocaleString()}</h6>
					<p className="text-xs text-neutral-400">{label}</p>
				</div>
				<div></div>
			</div>
		</div>
	);
};
