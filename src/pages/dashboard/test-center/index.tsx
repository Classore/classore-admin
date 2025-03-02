import { useQuery } from "@tanstack/react-query";
import React from "react";
import { RiBook2Line, RiBookMarkedLine, RiBookOpenLine, RiBookReadLine } from "@remixicon/react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { SearchInput, Seo } from "@/components/shared";
import { TestCenterTable } from "@/components/tables";
import { AddTest } from "@/components/dashboard";
import { hasPermission } from "@/lib/permission";
import { GetTests } from "@/queries/test-center";
import { Card } from "@/components/test-center";
import { useUserStore } from "@/store/z-store";
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

	const { isLoading } = useQuery({
		queryKey: ["get-tests", { page }],
		queryFn: () => GetTests({ limit: 10, page }),
		enabled: false,
	});

	if (!hasPermission(user, ["videos_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Test Center" />
			<DashboardLayout>
				<div className="flex h-full w-full flex-col gap-y-6">
					<div className="w-full space-y-4 rounded-2xl bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="font-medium">Test Center</p>
							<AddTest />
						</div>
						<div className="grid grid-cols-4 gap-x-4">
							<Card icon={RiBookMarkedLine} label="Total Categories" value={0} />
							<Card icon={RiBook2Line} label="All Courses" value={0} />
							<Card icon={RiBookReadLine} label="Published Courses" value={0} />
							<Card icon={RiBookOpenLine} label="Unpublished Courses" value={0} />
						</div>
					</div>
					<div className="w-full space-y-4 rounded-2xl bg-white p-5">
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
						<div className="w-full">
							<TestCenterTable
								onPageChange={setPage}
								page={page}
								tests={[]}
								total={0}
								isLoading={isLoading}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
