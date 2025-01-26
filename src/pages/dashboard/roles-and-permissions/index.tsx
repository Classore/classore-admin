import { useQueries } from "@tanstack/react-query";
import React from "react";
import {
	RiAddLine,
	RiTeamLine,
	RiUser2Line,
	RiUser5Line,
	RiUserUnfollowLine,
} from "@remixicon/react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddAdmin, AddRoles, UserCard } from "@/components/dashboard";
import { DashboardLayout, Unauthorized } from "@/components/layout";
import { SearchInput, Seo } from "@/components/shared";
import { AdminTable } from "@/components/tables";
import { hasPermission } from "@/lib/permission";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/z-store";
import { useDebounce } from "@/hooks";
import { GetStaffs } from "@/queries";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const user_types = ["all", "super admin", "view only", "edit access"] as const;
const sort_options = ["NAME", "DATE_CREATED"];
type User_Type = (typeof user_types)[number];

const Page = () => {
	const [open, setOpen] = React.useState({ admin: false, roles: false });
	const [user_type, setUserType] = React.useState<User_Type>("all");
	const [sort_by, setSortBy] = React.useState("");
	const [name, setName] = React.useState("");
	const [page, setPage] = React.useState(1);
	const { user } = useUserStore();

	const search = useDebounce(name, 500);

	const [{ data, isLoading }] = useQueries({
		queries: [
			{
				queryKey: ["get-staffs", page, search],
				queryFn: () => GetStaffs({ limit: 10, page, search }),
			},
		],
	});

	if (!hasPermission(user, ["admin_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Roles and Permissions" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Manage Roles</p>
							<div className="flex items-center gap-x-3">
								<Dialog
									open={open.roles}
									onOpenChange={(roles) => setOpen({ ...open, roles: roles })}>
									<DialogTrigger asChild>
										<Button
											onClick={() => setOpen({ ...open, roles: true })}
											variant="outline"
											size="sm"
											className="w-fit">
											<RiAddLine /> Add Role
										</Button>
									</DialogTrigger>
									<DialogContent className="w-[450px] max-w-[90%] p-1">
										<AddRoles setOpen={(roles) => setOpen({ ...open, roles })} />
									</DialogContent>
								</Dialog>
								<Dialog
									open={open.admin}
									onOpenChange={(admin) => setOpen({ ...open, admin: admin })}>
									<DialogTrigger asChild>
										<Button
											onClick={() => setOpen({ ...open, admin: true })}
											size="sm"
											className="w-fit">
											<RiAddLine /> Add Admin
										</Button>
									</DialogTrigger>
									<DialogContent className="w-[450px] max-w-[90%] p-1">
										<AddAdmin setOpen={(admin) => setOpen({ ...open, admin })} />
									</DialogContent>
								</Dialog>
							</div>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<UserCard
								icon={RiTeamLine}
								value={data?.data.total_no_of_admins ?? 0}
								label="Total No of Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser5Line}
								value={data?.data.super_admins ?? 0}
								label="Super Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser2Line}
								value={data?.data.edit_access ?? 0}
								label="Edit Access"
								percentage={10}
								variant="danger"
							/>
							<UserCard
								icon={RiUserUnfollowLine}
								value={data?.data.view_only ?? 0}
								label="View Only"
								percentage={10}
								variant="danger"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-x-2">
								<p className="">Roles</p>
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
							<div className="flex items-center gap-x-2">
								<SearchInput value={name} onChange={(e) => setName(e.target.value)} />
								<Select value={sort_by} onValueChange={(value) => setSortBy(value)}>
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
						<AdminTable
							admins={data?.data.admins.data ?? []}
							onPageChange={setPage}
							page={page}
							total={data?.data.admins.meta.itemCount ?? 0}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
