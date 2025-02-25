import { RiArrowLeftSLine } from "@remixicon/react";
import { useRouter } from "next/router";
import React from "react";

import { TestSettings } from "@/components/dashboard/test-settings";
import { Breadcrumbs, SearchInput, Seo } from "@/components/shared";
import { AddSection } from "@/components/dashboard/add-section";
import type { BreadcrumbItemProps } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const statuses = ["all", "published", "unpublished"];

const Page = () => {
	const [current, setCurrent] = React.useState(statuses[0]);
	const router = useRouter();
	const id = router.query.id as string;

	const links: BreadcrumbItemProps[] = [
		{ href: "/dashboard/test-center", label: "Manage Test Center", active: true },
		{ href: `/dashboard/test-center/${id}`, label: `test exam`, active: true },
	];

	return (
		<>
			<Seo title={id} />
			<DashboardLayout>
				<div className="w-full space-y-4">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="space-y-2">
							<div className="flex items-center gap-x-2">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<p className="text-sm font-medium">Test Title</p>
							</div>
							<Breadcrumbs courseId={id} links={links} />
						</div>
						<div className="flex items-center gap-x-4">
							<TestSettings />
							<AddSection testId={id} />
						</div>
					</div>
					<div className="w-full rounded-2xl bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center">
								{statuses.map((status, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setCurrent(status)}
										className={`flex h-8 min-w-24 items-center justify-center rounded-md px-4 text-sm capitalize transition-colors duration-300 ${current === status ? "bg-primary-100 text-primary-400" : "text-neutral-500"}`}>
										{status}
									</button>
								))}
							</div>
							<div className="flex items-center gap-x-4">
								<SearchInput />
								<Select defaultValue="all">
									<SelectTrigger className="h-8 w-[90px] text-xs">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
