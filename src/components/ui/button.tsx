import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-base transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950 font-body shadow-[0px_1px_2px_rgba(0,0,0,0.08)] dark:focus-visible:ring-neutral-300 active:scale-[.95]",
	{
		variants: {
			variant: {
				default: "bg-primary-300 text-neutral-50 hover:bg-primary-400",
				destructive: "bg-red-500 text-neutral-50 hover:bg-red-500/90",
				success: "bg-green-500 text-neutral-50 hover:bg-green-500/90",
				warning: "bg-amber-500 text-neutral-50 hover:bg-amber-500/90",
				info: "bg-blue-500 text-neutral-50 hover:bg-blue-500/90",
				outline: "border border-neutral-300 bg-white hover:bg-neutral-100 hover:text-neutral-400",
				"destructive-outline":
					"bg-transparent text-red-500 hover:bg-neutral-50 border border-neutral-300",
				"success-outline":
					"bg-transparent text-green-500 hover:bg-neutral-50 border border-neutral-300",
				"warning-outline":
					"bg-transparent text-amber-500 hover:bg-neutral-50 border border-neutral-300",
				"invert-outline":
					"bg-neutral-200 text-neutral-400 hover:bg-neutral-200/50 border border-neutral-300",
				secondary: "bg-secondary-300 text-primary-300 hover:bg-secondary-300/80",
				ghost: "bg-neutral-100 hover:bg-neutral-200",
				link: "text-primary-300 underline-offset-4 hover:underline dark:text-primary-300/50",
				dotted:
					"border border-dashed border-neutral-400 text-sm bg-neutral-100 text-neutral-400 hover:bg-neutral-50",
			},

			size: {
				default: "px-4 py-2 min-h-[42px]",
				xs: "px-2 py-1 rounded-md text-xs",
				sm: "h-9 rounded-lg text-sm font-normal px-3",
				lg: "h-[60px] rounded-full px-6",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
