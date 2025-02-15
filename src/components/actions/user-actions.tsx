import React from "react";
import { RiDeleteBin6Line, RiEditLine, RiForbid2Line, RiInformationLine } from "@remixicon/react";

import type { CastedUserProps } from "@/types/casted-types";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	id: string;
	user: CastedUserProps;
}

export const UserActions = ({ user }: Props) => {
	const [open, setOpen] = React.useState({
		delete: false,
		edit: false,
		suspend: false,
		view: false,
	});

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Dialog open={open.view} onOpenChange={(view) => setOpen({ ...open, view })}>
				<DialogTrigger asChild>
					<button
						onClick={() => setOpen({ ...open, view: true })}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiInformationLine size={18} /> View Details
					</button>
				</DialogTrigger>
				<DialogContent animate={false} className="top-4 w-[550px] -translate-y-0 translate-x-[38%]">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<DialogTitle className="capitalize">{user.user_user_type.toLowerCase()} Details</DialogTitle>
						<DialogDescription hidden>User Details</DialogDescription>
						<div className="w-full">
							<div className="w-full"></div>
							<div className="flex w-full items-center justify-between">
								<Button size="sm" className="w-fit" variant="destructive-outline">
									Delete Account
								</Button>
								<div className="flex items-center gap-x-4">
									<Button size="sm" className="w-fit" variant="outline">
										Suspend Account
									</Button>
									<Button size="sm" className="w-fit">
										Edit Account
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={open.edit} onOpenChange={(edit) => setOpen({ ...open, edit })}>
				<DialogTrigger asChild>
					<button
						onClick={() => setOpen({ ...open, edit: true })}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine size={18} /> Edit Details
					</button>
				</DialogTrigger>
				<DialogContent animate={false} className="top-4 w-[550px] -translate-y-0 translate-x-[42%] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<DialogTitle>User Details</DialogTitle>
						<DialogDescription hidden>User Details</DialogDescription>
						<div className="w-full">
							<div className="w-full"></div>
							<div className="flex w-full items-center justify-between">
								<Button size="sm" className="w-fit" variant="destructive">
									Delete Account
								</Button>
								<div className="flex items-center gap-x-4">
									<Button size="sm" className="w-fit" variant="outline">
										Suspend Account
									</Button>
									<Button size="sm" className="w-fit">
										Edit Account
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={open.suspend} onOpenChange={(suspend) => setOpen({ ...open, suspend })}>
				<DialogTrigger asChild>
					<button
						onClick={() => setOpen({ ...open, suspend: true })}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiForbid2Line size={18} /> Suspend User
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiForbid2Line} variant="warning" />
						<div className="my-4 space-y-2">
							<DialogTitle>Suspend User</DialogTitle>
							<DialogDescription>Are you sure you want to suspend this user?</DialogDescription>
						</div>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								className="w-fit"
								onClick={() => setOpen({ ...open, suspend: false })}
								variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" variant="warning">
								Suspend User
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={open.delete} onOpenChange={(value) => setOpen({ ...open, delete: value })}>
				<DialogTrigger asChild>
					<button
						onClick={() => setOpen({ ...open, delete: true })}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
						<RiDeleteBin6Line size={18} /> Delete User
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
						<div className="my-4 space-y-2">
							<DialogTitle>Delete User Account</DialogTitle>
							<DialogDescription>Are you sure you want to delete this user account?</DialogDescription>
						</div>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								className="w-fit"
								onClick={() => setOpen({ ...open, delete: false })}
								variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" variant="destructive">
								Delete User Account
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
