import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
	RiArrowLeftSLine,
	RiTeamLine,
	RiUser2Line,
	RiUser5Line,
	RiUserUnfollowLine,
} from "@remixicon/react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { formatCurrency, fromSnakeCase } from "@/lib";
import { PaymentTable } from "@/components/tables";
import { UserCard } from "@/components/dashboard";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import { GetSubscriptions } from "@/queries";
import { Seo } from "@/components/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const payment_status = ["all", "successful", "pending", "failed", "reversal"] as const;
type PaymentStatus = (typeof payment_status)[number];
const sort_options = ["name", "date_created"];

const Page = () => {
	const [status, setStatus] = React.useState<PaymentStatus>("all");
	const [sort_by, setSortBy] = React.useState("");
	const [page, setPage] = React.useState(1);
	const { user } = useUserStore();

	const { data, isLoading } = useQuery({
		queryKey: ["subscriptions", page, status, sort_by],
		queryFn: () =>
			GetSubscriptions({
				limit: 10,
				page,
				sort_by: sort_by === "all" ? undefined : sort_by,
				txn_status: status === "all" ? undefined : status,
			}),
		select: (data) => ({
			cancelled: data.data.data.cancelled,
			international_exams: data.data.data.international_exams,
			national_exams: data.data.data.national_exams,
			meta: {
				itemCount: data.data.data.logs.meta.itemCount,
				page: data.data.data.logs.meta.page,
				pageCount: data.data.data.logs.meta.pageCount,
				take: data.data.data.logs.meta.take,
			},
			subscriptions: data.data.data.logs.data,
			total_earnings: data.data.data.total_earnings,
		}),
	});

	if (!hasPermission(user, ["transactions_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Payments" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Payments</p>
							<div className="flex items-center gap-x-4">
								<button className="grid size-6 place-items-center rounded-full border">
									<RiArrowLeftSLine size={20} />
								</button>
								<button className="grid size-6 place-items-center rounded-full border">
									<RiArrowLeftSLine size={20} className="rotate-180" />
								</button>
							</div>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<UserCard
								icon={RiTeamLine}
								value={formatCurrency(data?.total_earnings || 0)}
								label="Total Earnings"
								percentage={0}
								variant="success"
							/>
							<UserCard
								icon={RiUser5Line}
								value={formatCurrency(data?.national_exams || 0)}
								label="National Exams"
								percentage={0}
								variant="success"
							/>
							<UserCard
								icon={RiUser2Line}
								value={formatCurrency(data?.international_exams || 0)}
								label="International Exams"
								percentage={0}
								variant="success"
							/>
							<UserCard
								icon={RiUserUnfollowLine}
								value={formatCurrency(data?.cancelled || 0)}
								label="Cancelled"
								percentage={0}
								variant="success"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-x-4">
								<p className="">Recent Activities</p>
								<div className="flex items-center">
									{payment_status.map((s) => (
										<button
											key={s}
											onClick={() => setStatus(s)}
											className={`h-6 min-w-[90px] rounded-md text-xs capitalize ${status === s ? "bg-primary-100 text-primary-400" : "text-neutral-400"}`}>
											{s}
										</button>
									))}
								</div>
							</div>
							<Select value={sort_by} onValueChange={(value) => setSortBy(value)}>
								<SelectTrigger className="h-8 w-[90px] text-xs capitalize">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent className="capitalize">
									{sort_options.map((option) => (
										<SelectItem key={option} value={option} className="text-xs">
											{fromSnakeCase(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="w-full">
							<PaymentTable
								onPageChange={setPage}
								page={page}
								subscriptions={data?.subscriptions ?? []}
								total={data?.meta.itemCount ?? 0}
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
