import type { RemixiconComponentType } from "@remixicon/react";
import { TrendingUp } from "lucide-react";
import React from "react";

import { cn } from "@/lib";

interface Props {
	icon: RemixiconComponentType;
	label: string;
	percentage?: number;
	value: number | string;
	variant?: "success" | "danger";
}

const variants: Record<string, string> = {
	danger: "bg-red-100 text-red-600",
	success: "bg-green-100 text-green-400",
};

export const UserCard = ({
	icon: Icon,
	label,
	percentage,
	value,
	variant = "success",
}: Props) => {
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
				{percentage && (
					<div
						className={cn(
							"flex items-center gap-x-1 rounded-md px-1 py-0.5 text-xs font-semibold",
							variants[variant]
						)}>
						<TrendingUp size={12} /> <span>{percentage}%</span>
					</div>
				)}
			</div>
		</div>
	);
};
