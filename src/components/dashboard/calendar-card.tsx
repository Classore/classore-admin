import type { RemixiconComponentType } from "@remixicon/react";
import React from "react";

interface Props {
	icon: RemixiconComponentType;
	label: string;
	value: number;
	tag?: string;
	variant?: "default" | "total" | "upcoming" | "live" | "ended";
	className?: string;
}

const variantStyles = {
	default: {
		iconBg: "border-neutral-200 bg-neutral-50 text-neutral-600",
		tagBg: "bg-neutral-100 text-neutral-600 border-neutral-200",
	},
	total: {
		iconBg: "border-purple-200 bg-purple-50 text-purple-600",
		tagBg: "bg-purple-50 text-purple-700 border-purple-200/80",
	},
	upcoming: {
		iconBg: "border-amber-200 bg-amber-50 text-amber-600",
		tagBg: "bg-amber-50 text-amber-700 border-amber-200/80",
	},
	live: {
		iconBg: "border-emerald-200 bg-emerald-50 text-emerald-600",
		tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
	},
	ended: {
		iconBg: "border-neutral-200 bg-neutral-100 text-neutral-500",
		tagBg: "bg-neutral-100 text-neutral-600 border-neutral-200/80",
	},
};

export const CalendarCard = ({
	icon: Icon,
	label,
	value,
	tag,
	variant = "default",
	className = "",
}: Props) => {
	const styles = variantStyles[variant] || variantStyles.default;

	return (
		<div
			className={`flex aspect-[1.84/1] w-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm sm:p-5 ${className}`}>
			<div className="flex w-full items-center justify-between">
				<div className={`grid size-9 place-items-center rounded-full border ${styles.iconBg}`}>
					<Icon size={19} />
				</div>
				{tag && (
					<span
						className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles.tagBg}`}>
						{tag}
					</span>
				)}
			</div>
			<div className="flex w-full items-center justify-between">
				<div className="flex flex-col gap-y-1">
					<div className="flex items-center gap-x-2">
						<h6 className="text-2xl font-bold tracking-tight text-neutral-900">
							{value.toLocaleString()}
						</h6>
						{variant === "live" && value > 0 && (
							<span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
						)}
					</div>
					<p className="text-xs font-medium text-neutral-400">{label}</p>
				</div>
			</div>
		</div>
	);
};

