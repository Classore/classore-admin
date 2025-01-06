import { RiMore2Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CastedUserProps } from "@/types/casted-types";
import { UserActions } from "@/components/actions";
import { Pagination } from "@/components/shared";
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
	users: CastedUserProps[];
}

export const UserTable = ({ onPageChange, page, total, users }: Props) => {
	return (
		<div>
			<Table>
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs text-neutral-400">
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Account Type</TableHead>
						<TableHead>Date and Time joined</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="max-w-[85px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<LineItem key={user.user_id} user={user} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ user }: { user: CastedUserProps }) => {
	return (
		<TableRow>
			<TableCell className="flex items-center gap-x-2 text-xs">
				<Avatar className="size-7 rounded-md">
					<AvatarImage src={user.user_profile_image} className="rounded-md" />
					<AvatarFallback className="rounded-md bg-blue-100 text-xs">
						{user.user_first_name.charAt(0).toUpperCase()}
						{user.user_last_name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span className="capitalize">
					{user.user_first_name} {user.user_last_name}
				</span>
			</TableCell>
			<TableCell className="text-xs">{user.user_email.toLowerCase()}</TableCell>
			<TableCell className="text-xs">{user.user_user_type}</TableCell>
			<TableCell className="text-xs">
				{format(user.user_createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-xs">
				<div
					className={`flex items-center justify-center rounded px-3 py-0.5 text-xs font-medium ${user.user_isBlocked ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
					{user.user_isBlocked ? "InActive" : "Active"}
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
						<UserActions id={user?.user_id} user={user} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
