import { RiArrowLeftSLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { Breadcrumbs, Loading, SearchInput, Seo } from "@/components/shared";
import { TestSettings } from "@/components/dashboard/test-settings";
import { DashboardLayout, Unauthorized } from "@/components/layout";
import { AddSection } from "@/components/dashboard/add-section";
import type { BreadcrumbItemProps } from "@/components/shared";
import { TestCenterSectionTable } from "@/components/tables";
import { hasPermission } from "@/lib/permission";
import { Button } from "@/components/ui/button";
import { GetTest } from "@/queries/test-center";
import { useUserStore } from "@/store/z-store";
import { capitalize } from "@/lib";
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
	const [page, setPage] = React.useState(1);
	const { user } = useUserStore();
	const router = useRouter();
	const id = router.query.id as string;

	const { data, isLoading } = useQuery({
		queryKey: ["get-test-sections", id],
		queryFn: () => GetTest(id, { limit: 10, page }),
		enabled: !!id,
		select: (data) => ({
			banner: data?.data?.banner,
			createdOn: data?.data?.createdOn,
			description: data?.data?.description,
			title: data?.data?.title,
			sections: data?.data?.sections,
		}),
	});

	const links: BreadcrumbItemProps[] = [
		{ href: "/dashboard/test-center", label: "Manage Test Center", active: true },
		{ href: `/dashboard/test-center/${id}`, label: `test exam`, active: true },
	];

	if (!hasPermission(user, ["transactions_read"])) {
		return <Unauthorized />;
	}

	if (isLoading) return <Loading />;

	return (
		<>
			<Seo title={capitalize(data?.title || "Test Section")} />
			<DashboardLayout>
				<div className="w-full space-y-4">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="space-y-2">
							<div className="flex items-center gap-x-2">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<p className="text-sm font-medium uppercase">{data?.title}</p>
							</div>
							<Breadcrumbs courseId={id} links={links} />
						</div>
						<div className="flex items-center gap-x-4">
							<TestSettings testId={id} />
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
						<TestCenterSectionTable
							onPageChange={setPage}
							page={page}
							sections={data?.sections.data || []}
							total={0}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
