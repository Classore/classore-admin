import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeSlash } from "iconsax-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: string;
	label?: string;
	labelClassName?: string;
	wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, error, label, labelClassName, type, ...props }, ref) => {
		const [togglePassword, setTogglePassword] = React.useState(false);

		return (
			<div className={cn("flex flex-col gap-1.5 font-body", className)}>
				{label && (
					<label
						className={cn("text-xs text-neutral-400 dark:text-neutral-50", labelClassName)}
						htmlFor={props.id}>
						{label}
					</label>
				)}
				<div className="relative">
					<input
						type={togglePassword ? "text" : type}
						className={cn(
							"flex w-full rounded-md border border-neutral-200 bg-transparent px-4 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-300 focus:border-primary-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
							className
						)}
						ref={ref}
						{...props}
					/>
					{type === "password" ? (
						<button
							type="button"
							className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300"
							onClick={() => setTogglePassword(!togglePassword)}>
							{!togglePassword ? <Eye /> : <EyeSlash />}

							<span className="sr-only">{togglePassword ? "show password" : "hide password"}</span>
						</button>
					) : null}
				</div>
				{error && <p className="text-xs text-error">{error}</p>}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
