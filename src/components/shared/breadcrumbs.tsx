import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
	label: string;
	href: string;
	active?: boolean;
}

interface Props {
	links: BreadcrumbItem[];
	className?: string;
}

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
								className="capitalize transition-colors hover:text-neutral-500"
								aria-current="page">
								{link.label}
							</Link>
						) : (
							<span className="capitalize">{link.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};
