import React from "react";

interface Props {
	progress: number;
	animation?: "pulse" | "smooth" | "none";
	background?: string;
	className?: string;
	color?: "success" | "warning" | "error" | "info";
	height?: "sm" | "md" | "lg";
	labelBackground?: string;
	labelColor?: string;
	showLabel?: boolean;
}

export const Progress = ({
	progress,
	animation = "smooth",
	className = "",
	color = "success",
	height = "sm",
	labelBackground = "bg-white",
	labelColor = "text-black",
	showLabel = false,
}: Props) => {
	const clampedProgress = Math.min(100, Math.max(0, progress));

	const heightClasses = {
		sm: "h-1",
		md: "h-2",
		lg: "h-3",
	};

	const colorClasses = {
		success: "bg-green-400",
		warning: "bg-yellow-400",
		error: "bg-red-400",
		info: "bg-blue-400",
	};

	const animationClasses = {
		pulse: "animate-pulse",
		smooth: "transition-all duration-300 ease-in-out",
		none: "",
	};

	return (
		<div className="relative w-full">
			<div className={`w-full rounded-2xl bg-neutral-200 ${heightClasses[height]} ${className}`}>
				<div
					style={{ width: `${clampedProgress}%` }}
					className={`rounded-2xl ${heightClasses[height]} ${colorClasses[color]} ${clampedProgress < 100 ? animationClasses[animation] : ""}`}
				/>
			</div>
			{showLabel && (
				<span
					className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-1 text-xs font-medium text-neutral-600 ${labelBackground} ${labelColor}`}>
					{Math.round(clampedProgress)}%
				</span>
			)}
		</div>
	);
};
