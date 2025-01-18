import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItemProps {
	label: string;
	href: string;
	active?: boolean;
	variant?: "default" | "error" | "info" | "success" | "warning";
}

interface Props {
	links: BreadcrumbItemProps[];
	className?: string;
}

const variants = {
	default: "text-neutral-400 hover:text-neutral-300",
	error: "text-red-500 hover:text-red-400",
	info: "text-blue-500 hover:text-blue-400",
	success: "text-green-500 hover:text-green-400",
	warning: "text-amber-500 hover:text-amber-400",
};

export const Breadcrumbs = ({ links, className }: Props) => {
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
							<span className={`capitalize ${variants[link.variant || "default"]}`}>
								{link.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};
