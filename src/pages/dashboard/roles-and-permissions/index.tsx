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
import { SearchInput, Seo, TabPanel } from "@/components/shared";
import { AdminTable, RoleTable } from "@/components/tables";
import { GetRolesQuery, GetStaffs } from "@/queries";
import { hasPermission } from "@/lib/permission";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/z-store";
import { useDebounce } from "@/hooks";
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
const tabs = ["admins", "roles"];

const Page = () => {
	const [open, setOpen] = React.useState({ admin: false, roles: false });
	const [user_type, setUserType] = React.useState<User_Type>("all");
	const [admin_role, setAdminRole] = React.useState("all");
	const [sort_by, setSortBy] = React.useState("");
	const [tab, setTab] = React.useState("admins");
	const [name, setName] = React.useState("");
	const [page, setPage] = React.useState(1);
	const { user } = useUserStore();

	const search = useDebounce(name, 500);

	const [{ data: admins, isLoading }, { data: roles }] = useQueries({
		queries: [
			{
				queryKey: ["get-staffs", admin_role, page, search],
				queryFn: () =>
					GetStaffs({ admin_role: admin_role === "all" ? "" : admin_role, limit: 10, page, search }),
			},
			{
				queryKey: ["get-roles"],
				queryFn: () => GetRolesQuery(),
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
								<Dialog open={open.roles} onOpenChange={(roles) => setOpen({ ...open, roles: roles })}>
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
								<Dialog open={open.admin} onOpenChange={(admin) => setOpen({ ...open, admin: admin })}>
									<DialogTrigger asChild>
										<Button onClick={() => setOpen({ ...open, admin: true })} size="sm" className="w-fit">
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
								value={admins?.data.total_no_of_admins ?? 0}
								label="Total No of Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser5Line}
								value={admins?.data.super_admins ?? 0}
								label="Super Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser2Line}
								value={admins?.data.edit_access ?? 0}
								label="Edit Access"
								percentage={10}
								variant="danger"
							/>
							<UserCard
								icon={RiUserUnfollowLine}
								value={admins?.data.view_only ?? 0}
								label="View Only"
								percentage={10}
								variant="danger"
							/>
						</div>
					</div>
					<div className="flex items-center rounded-lg bg-white px-5 py-2">
						{tabs.map((tb) => (
							<button
								key={tb}
								onClick={() => setTab(tb)}
								className={`relative flex h-10 items-center gap-x-1 px-4 text-sm font-medium capitalize transition-all duration-500 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-primary-400 ${tb === tab ? "text-primary-400 before:w-full" : "text-neutral-400"}`}>
								{tb}
							</button>
						))}
					</div>
					<TabPanel selected={tab} value="admins">
						<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center gap-x-2">
									<p className="">Admins</p>
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
									<Select value={admin_role} onValueChange={(value) => setAdminRole(value)}>
										<SelectTrigger className="h-8 w-[180px] text-xs capitalize">
											<SelectValue placeholder="Filter by role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All</SelectItem>
											{roles?.data.data.map((role) => (
												<SelectItem key={role.role_id} value={role.role_id} className="text-xs capitalize">
													{role.role_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<AdminTable
								admins={admins?.data.admins.data ?? []}
								onPageChange={setPage}
								page={page}
								total={admins?.data.admins.meta.itemCount ?? 0}
								isLoading={isLoading}
							/>
						</div>
					</TabPanel>
					<TabPanel selected={tab} value="roles">
						<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center gap-x-2">
									<p className="">Roles</p>
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
							{/* table */}
							<RoleTable
								onPageChange={setPage}
								page={page}
								roles={roles?.data.data ?? []}
								total={roles?.data.meta.itemCount ?? 0}
								isLoading={isLoading}
							/>
						</div>
					</TabPanel>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
