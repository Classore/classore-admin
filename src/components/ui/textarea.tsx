import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea"> & {
		error?: string;
		label?: string;
		labelClassName?: string;
		wrapperClassName?: string;
	}
>(({ className, error, label, labelClassName, wrapperClassName, ...props }, ref) => {
	return (
		<div className={cn("flex flex-col gap-1.5 font-body", wrapperClassName)}>
			{label && (
				<label
					className={cn("text-xs text-neutral-400 dark:text-neutral-50", labelClassName)}
					htmlFor={props.id}>
					{label}
				</label>
			)}
			<div className={cn("relative min-h-20", wrapperClassName)}>
				<textarea
					className={cn(
						"flex h-full w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-primary-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs",
						className
					)}
					ref={ref}
					{...props}
				/>
				{error && <p className="text-xs text-error">{error}</p>}
			</div>
		</div>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
