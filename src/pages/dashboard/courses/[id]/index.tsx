import { RiAddLine, RiArrowLeftSLine } from "@remixicon/react";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { Breadcrumbs, Loading, SearchInput, Seo } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { AddCourse } from "@/components/dashboard";
import { CourseTable } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { GetBundle } from "@/queries";
import { useDebounce } from "@/hooks";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const course_status = ["all", "published", "unpublished"] as const;
const sort_options = ["recent", "oldest"] as const;
type Status = (typeof course_status)[number];

const Page = () => {
	const [status, setStatus] = React.useState<Status>("all");
	const [sort_by, setSortBy] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [page, setPage] = React.useState(1);
	const router = useRouter();
	const { id } = router.query;

	useDebounce(query, 500);

	const [{ data: bundle }] = useQueries({
		queries: [
			{
				queryKey: ["get-bundle", id],
				queryFn: () => GetBundle(String(id)),
				enabled: !!id,
			},
		],
	});

	const breadcrumbs = [
		{ label: "Manage Courses", href: "/dashboard/courses" },
		{
			label: `${bundle?.data.examBundle.name?.toUpperCase()}`,
			href: `/dashboard/courses/${id}`,
			active: true,
		},
	];

	if (!bundle) return <Loading />;

	return (
		<>
			<AddCourse open={open} onOpenChange={setOpen} />
			<Seo title="Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="flex flex-col gap-y-2">
							<div className="flex items-center gap-x-4">
								<Button
									onClick={() => router.back()}
									className="w-fit"
									size="sm"
									variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<h3 className="text-lg font-medium uppercase">{bundle.data.examBundle.name}</h3>
							</div>
							<Breadcrumbs links={breadcrumbs} />
						</div>
						<Button onClick={() => setOpen(true)} className="w-fit" size="sm">
							<RiAddLine /> Add New Course
						</Button>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center">
								{course_status.map((s) => (
									<button
										key={s}
										onClick={() => setStatus(s)}
										className={`h-6 min-w-[90px] rounded-md text-xs capitalize ${status === s ? "bg-primary-100 text-primary-400" : "text-neutral-400"}`}>
										{s}
									</button>
								))}
							</div>
							<div className="flex items-center gap-x-4">
								<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
								<Select value={sort_by} onValueChange={(value) => setSortBy(value)}>
									<SelectTrigger className="h-8 w-[90px] text-xs capitalize">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent className="capitalize">
										{sort_options.map((option) => (
											<SelectItem key={option} value={option} className="text-xs">
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="w-full">
							<CourseTable
								courses={bundle.data.subjects.data || []}
								onPageChange={setPage}
								page={page}
								total={bundle.data.subjects.meta.itemCount || 0}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
