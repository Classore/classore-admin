import { useQueries } from "@tanstack/react-query";
import React from "react";
import {
	RiArrowLeftSLine,
	RiTeamLine,
	RiUser2Line,
	RiUser5Line,
	RiUserUnfollowLine,
} from "@remixicon/react";

import { DashboardLayout } from "@/components/layout";
import { UserCard } from "@/components/dashboard";
import { UserTable } from "@/components/tables";
import { Seo } from "@/components/shared";
import { GetUsers } from "@/queries/user";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const user_types = ["all", "student", "parent"] as const;
const sort_options = ["NAME", "DATE_CREATED"] as const;
type User_Type = (typeof user_types)[number];
type Sort_By = (typeof sort_options)[number];

const Page = () => {
	const [user_type, setUserType] = React.useState<User_Type>("all");
	const [sort_by, setSortBy] = React.useState<Sort_By>("NAME");
	const [page, setPage] = React.useState(1);

	const [{ data }, { data: all }] = useQueries({
		queries: [
			{
				queryKey: ["get-users", page, sort_by, user_type],
				queryFn: () =>
					GetUsers({
						limit: 10,
						page,
						sort_by,
						user_type: user_type === "all" ? "" : user_type,
					}),
			},
			{
				queryKey: ["get-users-for-card"],
				queryFn: () => GetUsers({ limit: 100 }),
			},
		],
	});

	const numberOfStudents = React.useMemo(() => {
		if (all?.data.users) {
			return all?.data.users.data.filter((user) => user.user_user_type === "STUDENT").length;
		}
		return 0;
	}, [all?.data.users]);

	const numberOfParents = React.useMemo(() => {
		if (all?.data.users) {
			return all?.data.users.data.filter((user) => user.user_user_type === "PARENT").length;
		}
		return 0;
	}, [all?.data.users.data]);

	const numberOfInactiveUsers = React.useMemo(() => {
		if (all?.data.users) {
			return all?.data.users.data.filter((user) => user.user_isBlocked).length;
		}
		return 0;
	}, [all?.data.users]);

	return (
		<>
			<Seo title="Users" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Manage Users</p>
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
								value={data?.data.users.meta.itemCount ?? 0}
								label="Total Users"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser5Line}
								value={numberOfStudents}
								label="Students"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser2Line}
								value={numberOfParents}
								label="Parents"
								percentage={10}
								variant="danger"
							/>
							<UserCard
								icon={RiUserUnfollowLine}
								value={numberOfInactiveUsers}
								label="Inactive Users"
								percentage={10}
								variant="danger"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-x-4">
								<p className="">Recent Activities</p>
								<div className="flex items-center">
									{user_types.map((type) => (
										<button
											key={type}
											onClick={() => setUserType(type)}
											className={`h-6 min-w-[90px] rounded-md text-xs capitalize ${type === user_type ? "bg-primary-100 text-primary-400" : "text-neutral-400"}`}>
											{type}
										</button>
									))}
								</div>
							</div>
							<Select value={sort_by} onValueChange={(value) => setSortBy(value as Sort_By)}>
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
						<div className="w-full">
							<UserTable
								onPageChange={setPage}
								page={page}
								total={data?.data.users.meta.itemCount ?? 0}
								users={data?.data.users.data ?? []}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
