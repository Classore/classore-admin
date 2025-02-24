import { useQuery } from "@tanstack/react-query";
import React from "react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { TestCenterTable } from "@/components/tables";
import { AddTest } from "@/components/dashboard";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import { Seo } from "@/components/shared";

const statuses = ["all", "published", "unpublished"];

const Page = () => {
	const [current, setCurrent] = React.useState("all");
	const [page, setPage] = React.useState(1);
	const { user } = useUserStore();

	const { isLoading } = useQuery({
		queryKey: ["get-tests", { page }],
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
							{[...Array(4)].map((_, index) => (
								<div key={index} className="h-[140px] rounded-2xl border border-neutral-400"></div>
							))}
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
