import { useQueries } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import {
	RiArrowLeftSLine,
	RiTeamLine,
	RiUser2Line,
	RiUser5Line,
	RiUserUnfollowLine,
} from "@remixicon/react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { UserFilter } from "@/components/actions/user/filter";
import type { UserFilters } from "@/queries/user";
import { UserCard } from "@/components/dashboard";
import { hasPermission } from "@/lib/permission";
import { UserTable } from "@/components/tables";
import { useUserStore } from "@/store/z-store";
import { Seo } from "@/components/shared";
import { GetUsers } from "@/queries/user";

const user_types = ["all", "student", "parent"] as const;
type User_Type = (typeof user_types)[number];

const initialValues: UserFilters = {
	is_blocked: "NO",
	is_deleted: "NO",
	sort_by: "NAME",
	sort_order: "ASC",
	timeline: "LAST_12_MONTHS",
};

const Page = () => {
	const [user_type, setUserType] = React.useState<User_Type>("all");
	const [params, setParams] = React.useState<UserFilters>({
		is_blocked: "NO",
		is_deleted: "NO",
		sort_by: "NAME",
		sort_order: "ASC",
		timeline: "LAST_12_MONTHS",
	});
	const [page, setPage] = React.useState(1);
	const admin = useUserStore().user;

	const { handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			setParams(values);
		},
	});

	const [{ data, isLoading }, { data: all }] = useQueries({
		queries: [
			{
				queryKey: ["get-users", page, params],
				queryFn: () =>
					GetUsers({
						is_blocked: params.is_blocked,
						is_deleted: params.is_deleted,
						limit: 10,
						page,
						sort_by: params.sort_by,
						sort_order: params.sort_order,
						timeline: params.timeline,
						user_type: user_type === "all" ? "" : user_type.toUpperCase(),
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
	}, [all?.data.users]);

	const numberOfInactiveUsers = React.useMemo(() => {
		if (all?.data.users) {
			return all?.data.users.data.filter((user) => user.user_isBlocked).length;
		}
		return 0;
	}, [all?.data.users]);

	if (!hasPermission(admin, ["student_read"])) {
		return <Unauthorized />;
	}

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
							<UserFilter onSubmit={handleSubmit} setFieldValue={setFieldValue} values={values} />
						</div>
						<div className="w-full">
							<UserTable
								onPageChange={setPage}
								page={page}
								total={data?.data.users.meta.itemCount ?? 0}
								users={data?.data.users.data ?? []}
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
