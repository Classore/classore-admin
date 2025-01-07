import { RiAddLine, RiArrowLeftSLine } from "@remixicon/react";
import { useRouter } from "next/router";
import React from "react";

import { Breadcrumbs, SearchInput, Seo } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { CourseTable } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { exam_bundles } from "@/mock/courses";

const course_status = ["all", "published", "unpublished"] as const;
const sort_options = ["recent", "oldest"] as const;
type Status = (typeof course_status)[number];

const Page = () => {
	const [status, setStatus] = React.useState<Status>("all");
	const [sort_by, setSortBy] = React.useState("");
	const [query, setQuery] = React.useState("");
	const [page, setPage] = React.useState(1);
	const router = useRouter();
	const { id } = router.query;

	const search = useDebounce(query, 500);

	const bundle = exam_bundles.find((bundle) => bundle.id === String(id));

	const courses = React.useMemo(() => {
		if (search) {
			return bundle?.courses.filter((course) => {
				course.title.toLowerCase().includes(search.toLowerCase());
			});
		}
		return bundle?.courses;
	}, [bundle?.courses, search]);

	const breadcrumbs = [
		{ label: "Manage Courses", href: "/dashboard/courses" },
		{
			label: `${bundle?.subcategory}`,
			href: `/dashboard/courses/${id}`,
			active: true,
		},
	];

	return (
		<>
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
								<h3 className="text-lg font-medium">{bundle?.subcategory}</h3>
							</div>
							<Breadcrumbs links={breadcrumbs} />
						</div>
						<Button className="w-fit" size="sm">
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
								courses={courses || []}
								onPageChange={setPage}
								page={page}
								total={courses?.length || 0}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
