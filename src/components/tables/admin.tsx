import { RiMore2Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared";
import type { AdminProps } from "@/types";
import { AdminActions } from "../actions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	onPageChange: (page: number) => void;
	page: number;
	total: number;
	admins: AdminProps[];
}

export const AdminTable = ({ onPageChange, page, total, admins }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs text-neutral-400">
						<TableHead className="text-neutral-400">Name</TableHead>
						<TableHead className="text-neutral-400">Email</TableHead>
						<TableHead className="text-neutral-400">Access Type</TableHead>
						<TableHead className="text-neutral-400">Last logged in date and time</TableHead>
						<TableHead className="text-neutral-400">Status</TableHead>
						<TableHead className="max-w-[85px] text-neutral-400"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{admins.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="py-10 text-center text-xs">
								No admins found.
							</TableCell>
						</TableRow>
					)}
					{admins.map((admin) => (
						<LineItem key={admin.id} admin={admin} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ admin }: { admin: AdminProps }) => {
	return (
		<TableRow>
			<TableCell className="flex items-center gap-x-2 text-xs">
				<Avatar className="size-7 rounded-md">
					<AvatarImage src="" className="rounded-md" />
					<AvatarFallback className="rounded-md bg-blue-100 text-xs">
						{admin.first_name.charAt(0).toUpperCase()}
						{admin.last_name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span className="capitalize">
					{admin.first_name} {admin.last_name}
				</span>
			</TableCell>
			<TableCell className="text-xs text-neutral-400">{admin.email.toLowerCase()}</TableCell>
			<TableCell className="text-xs capitalize text-neutral-400">{admin.role}</TableCell>
			<TableCell className="text-xs text-neutral-400">
				{format(admin.createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-xs">
				<div
					className={`flex items-center justify-center rounded px-3 py-0.5 text-xs font-medium ${admin.is_blocked ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
					{admin.is_blocked ? "InActive" : "Active"}
				</div>
			</TableCell>
			<TableCell>
				<Popover>
					<PopoverTrigger asChild>
						<button className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40">
						<AdminActions admin={admin} id={admin.id} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
