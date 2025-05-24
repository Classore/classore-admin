import { format } from "date-fns";
import React from "react";

import { CoinsIcon } from "@/assets/icons/coins";
import { TabPanel } from "@/components/shared";
import type { ViewAdminProps } from "@/types";

interface Props {
	admin: ViewAdminProps;
	tab: string;
}

export const Profile = ({ admin, tab }: Props) => {
	const adminName = `${admin.admin_first_name} ${admin.admin_last_name}`;

	return (
		<TabPanel selected={tab} value="profile">
			<div className="space-y-4">
				<div className="w-full space-y-1.5 rounded-md border border-neutral-300 p-4">
					<div className="flex h-10 items-center justify-between">
						<p className="text-sm text-neutral-400">Full Name</p>
						<p className="text-sm font-medium capitalize">{adminName}</p>
					</div>
					<div className="flex h-10 items-center justify-between">
						<p className="text-sm text-neutral-400">Email Address</p>
						<p className="text-sm font-medium">{admin.admin_email}</p>
					</div>
					<div className="flex h-10 items-center justify-between">
						<p className="text-sm text-neutral-400">Date and Time Joined</p>
						<p className="text-sm font-medium">
							{admin.admin_createdOn && format(admin.admin_createdOn, "MMM dd, yyyy | HH:mm a")}
						</p>
					</div>
				</div>
				{admin.role_name === "marketer" && (
					<div className="flex w-full space-x-2 rounded-md bg-gradient-to-r from-primary-300/75 to-primary-500 p-3">
						<div className="grid size-9 place-items-center rounded-full bg-white/25">
							<CoinsIcon className="text-white" />
						</div>
						<div className="">
							<p className="text-sm font-medium text-white">{0}</p>
							<p className="text-xs text-neutral-300">Classore points</p>
						</div>
					</div>
				)}
				<div className="w-full space-y-2">
					<p className="text-sm text-neutral-400">Activity Log</p>
					<div className="rounded-md border border-neutral-300 p-4"></div>
				</div>
			</div>
		</TabPanel>
	);
};
