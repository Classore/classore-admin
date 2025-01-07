import { RiEditLine, RiForbid2Line } from "@remixicon/react";
import React from "react";

import type { AdminProps } from "@/types";
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
	admin: AdminProps;
	id: string;
}

export const AdminActions = ({ admin }: Props) => {
	const [isRevokeopen, setIsRevokeOpen] = React.useState(false);
	const [isEditopen, setIsEditOpen] = React.useState(false);

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Dialog open={isEditopen} onOpenChange={setIsEditOpen}>
				<DialogTrigger>
					<button
						onClick={() => setIsEditOpen(true)}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine size={18} /> Edit Details
					</button>
				</DialogTrigger>
				<DialogContent
					animate={false}
					className="top-4 w-[550px] -translate-y-0 translate-x-[42%]">
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
				</DialogContent>
			</Dialog>
			<Dialog open={isRevokeopen} onOpenChange={setIsRevokeOpen}>
				<DialogTrigger asChild>
					<button
						onClick={() => setIsRevokeOpen(true)}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
						<RiForbid2Line size={18} /> Revoke Access
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] max-w-[90%] p-1">
					<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiForbid2Line} />
						<DialogTitle className="my-4">Revoke Admin Access</DialogTitle>
						<DialogDescription>
							Are you sure you want to revoke this &ldquo;{admin.first_name} {admin.last_name}
							&rdquo; access to Classore Admin?
						</DialogDescription>
						<div className="mt-6 flex w-full items-center justify-end gap-x-4">
							<Button onClick={() => setIsRevokeOpen(false)} className="w-fit" variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" variant="destructive">
								Yes, revoke access
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
