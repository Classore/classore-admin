import { useQueries } from "@tanstack/react-query";
import React from "react";
import {
	RiAddLine,
	RiBook2Line,
	RiBookMarkedLine,
	RiBookOpenLine,
	RiBookReadLine,
} from "@remixicon/react";

import { AddBundle, UserCard } from "@/components/dashboard";
import { SearchInput, Seo } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ExamTable } from "@/components/tables";
import { GetBundles } from "@/queries";
import { useDebounce } from "@/hooks";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const exams = ["all", "national", "international"] as const;
const sort_options = ["NAME", "DATE_CREATED"] as const;
type SortBy = (typeof sort_options)[number] | (string & {});
type Exam = (typeof exams)[number];

const Page = () => {
	const [sort_by, setSortBy] = React.useState<SortBy>("");
	const [exam, setExam] = React.useState<Exam>("all");
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [page, setPage] = React.useState(1);

	const search = useDebounce(query, 500);

	const [{ data: bundles }] = useQueries({
		queries: [
			{
				queryKey: ["bundles", { page, search }],
				queryFn: () => GetBundles({ limit: 10, page, search }),
			},
		],
	});

	const courses = React.useMemo(() => {
		if (bundles) {
			return bundles.data.data.reduce((acc, cur) => {
				return acc + cur.subject_count;
			}, 0);
		}
		return 0;
	}, [bundles]);

	return (
		<>
			<AddBundle open={open} onOpenChange={setOpen} />
			<Seo title="Courses" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Courses</p>
							<Button className="w-fit" onClick={() => setOpen(true)} size="sm">
								<RiAddLine /> Add New Bundle
							</Button>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<UserCard
								icon={RiBookMarkedLine}
								value={bundles?.data.meta.itemCount ?? 0}
								label="Total Categories"
							/>
							<UserCard icon={RiBook2Line} value={courses} label="All Courses" />
							<UserCard icon={RiBookReadLine} value={0} label="Published Courses" />
							<UserCard icon={RiBookOpenLine} value={0} label="Unpublished Courses" />
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center">
								{exams.map((type) => (
									<button
										key={type}
										onClick={() => setExam(type)}
										className={`h-6 min-w-[90px] rounded-md text-xs capitalize ${type === exam ? "bg-primary-100 text-primary-400" : "text-neutral-400"}`}>
										{type}
									</button>
								))}
							</div>
							<div className="flex items-center gap-x-4">
								<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
								<Select value={sort_by} onValueChange={(value) => setSortBy(value as SortBy)}>
									<SelectTrigger className="h-8 w-[90px] text-xs">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
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
							<ExamTable
								bundles={bundles?.data.data ?? []}
								onPageChange={setPage}
								page={page}
								total={bundles?.data.meta.itemCount ?? 0}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
