import Link from "next/link";
import React from "react";

import { ChangeDirectory } from "../dashboard";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export interface BreadcrumbItemProps {
	label: string;
	href: string;
	active?: boolean;
	change_directory?: boolean;
	variant?: "default" | "error" | "info" | "success" | "warning";
}

interface Props {
	courseId: string;
	links: BreadcrumbItemProps[];
	className?: string;
	currentSubcategory?: string;
	currentCategory?: string;
}

const variants = {
	default: "text-neutral-400 hover:text-neutral-300",
	error: "text-red-500 hover:text-red-400",
	info: "text-blue-500 hover:text-blue-400",
	success: "text-green-500 hover:text-green-400",
	warning: "text-amber-500 hover:text-amber-400",
};

export const Breadcrumbs = ({
	courseId,
	currentCategory,
	currentSubcategory,
	links,
	className,
}: Props) => {
	const [open, setOpen] = React.useState(false);

	return (
		<nav aria-label="Breadcrumb" className={className}>
			<ol className="flex items-center text-xs">
				{links.map((link, index) => (
					<li key={link.href} className={cn("flex items-center text-neutral-400")}>
						{index > 0 && (
							<span className="mx-1 text-neutral-400" aria-hidden="true">
								/
							</span>
						)}
						{link.active ? (
							<Link
								href={link.href}
								className={`capitalize transition-colors ${variants[link.variant || "default"]}`}
								aria-current="page">
								{link.label}
							</Link>
						) : (
							<>
								{link.change_directory ? (
									<Dialog open={open} onOpenChange={setOpen}>
										<DialogTrigger asChild>
											<button className={`capitalize ${variants[link.variant || "default"]}`}>
												{link.label}
											</button>
										</DialogTrigger>
										<DialogContent className="w-[400px] p-1">
											<ChangeDirectory
												courseId={courseId}
												currentCategory={String(currentCategory)}
												currentSubcategory={String(currentSubcategory)}
												onOpenChange={setOpen}
											/>
										</DialogContent>
									</Dialog>
								) : (
									<span className={`capitalize ${variants[link.variant || "default"]}`}>{link.label}</span>
								)}
							</>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};
