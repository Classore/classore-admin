import { RiMore2Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type { PaginatedRoleProps, RoleProps } from "@/types";
import { Pagination } from "@/components/shared";
import { RoleBadge } from "../dashboard";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { RoleActions } from "../actions";

interface Props {
	onPageChange: (page: number) => void;
	page: number;
	roles: PaginatedRoleProps[];
	total: number;
	isLoading?: boolean;
}

export const RoleTable = ({ onPageChange, page, roles, total, isLoading }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs text-neutral-400">
						<TableHead className="min-w-[300px] text-neutral-400">Name</TableHead>
						<TableHead className="min-w-[300px] text-neutral-400">Date Added</TableHead>
						<TableHead className="min-w-[300px] text-neutral-400">Permissions</TableHead>
						<TableHead className="max-w-[85px] text-neutral-400"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && (
						<TableRow>
							<TableCell colSpan={12} className="h-[400px] py-10 text-center text-xs">
								Loading...
							</TableCell>
						</TableRow>
					)}
					{roles.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="h-[300px] text-center text-xs">
								No roles found.
							</TableCell>
						</TableRow>
					)}
					{roles.map((role) => (
						<LineItem key={role.role_id} role={role} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ role }: { role: RoleProps }) => {
	const permissions = React.useMemo(() => {
		const pattern = /^role_(admin|marketer|student|transactions|utor|videos|waitlist)_(read|write)$/;
		return Object.entries(role)
			.map(([key, value]) => {
				const match = key.match(pattern);
				if (!match) {
					return { permission: null, hasPermission: false };
				}
				return { permission: match[0], hasPermission: value === "YES" };
			})
			.filter((item) => item.permission !== null);
	}, [role]);

	return (
		<TableRow>
			<TableCell className="font-medium capitalize">{role.role_name}</TableCell>
			<TableCell>{format(role.role_createdOn, "MMM dd, yyyy HH:mm a")}</TableCell>
			<TableCell className="">
				<Dialog>
					<DialogTrigger asChild>
						<button className="">View permission list</button>
					</DialogTrigger>
					<DialogContent className="w-[500px]">
						<DialogTitle className="text-xl">Permissions List</DialogTitle>
						<DialogDescription className="text-base font-medium capitalize">
							{role.role_name}
						</DialogDescription>
						<hr />
						<div className="grid grid-cols-2 gap-1.5">
							{permissions.map((permission, index) => (
								<RoleBadge key={index} permission={permission} />
							))}
						</div>
					</DialogContent>
				</Dialog>
			</TableCell>
			<TableCell className="grid place-items-center">
				<Popover>
					<PopoverTrigger asChild>
						<button className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px]">
						<RoleActions role={role} id={role.role_id}/>
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
