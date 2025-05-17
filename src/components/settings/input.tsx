import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
	error?: string;
	label?: string;
	labelClassName?: string;
	metric?: string;
	wrapperClassName?: string;
}

const MetricInput = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, error, label, labelClassName, metric, ...props }, ref) => {
		return (
			<div className={cn("flex flex-col gap-1.5 font-body", className)}>
				{label && (
					<label
						className={cn("text-sm text-neutral-400 dark:text-neutral-50", labelClassName)}
						htmlFor={props.id}>
						{label}
					</label>
				)}
				<div className="flex items-center rounded-md border focus-within:border-primary-400">
					<input
						type="number"
						className={cn(
							"flex w-24 rounded-l-md border-0 bg-transparent px-3 py-2.5 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
							className
						)}
						ref={ref}
						onWheel={(e) => e.currentTarget.blur()}
						{...props}
					/>
					<div className="grid size-10 place-items-center rounded-r-md border-l border-neutral-300 bg-slate-200 text-sm">
						{metric}
					</div>
				</div>
				{error && <p className="text-xs text-error">{error}</p>}
			</div>
		);
	}
);
MetricInput.displayName = "MetricInput";

export { MetricInput };
