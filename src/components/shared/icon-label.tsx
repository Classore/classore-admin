import type { RemixiconComponentType } from "@remixicon/react";
import React from "react";

import { cn } from "@/lib";

type Variant = "default" | "destructive" | "info" | "success" | "warning";

interface Props {
	icon: RemixiconComponentType;
	className?: string;
	variant?: Variant;
}

const variants: Record<Variant, string> = {
	default: "text-primary-500",
	destructive: "text-red-500",
	info: "text-blue-500",
	success: "text-green-500",
	warning: "text-amber-500",
};

export const IconLabel = ({ icon: Icon, className, variant = "default" }: Props) => {
	return (
		<div className="grid size-16 place-items-center rounded-full bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
			<div className="grid size-10 place-items-center rounded-full border bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
				<Icon size={18} className={cn(variants[variant], className)} />
			</div>
		</div>
	);
};
