import { RiFlashlightLine, RiTrophyLine, RiUserAddLine } from "@remixicon/react";
import { Target04 } from "@untitled-ui/icons-react";
import { format } from "date-fns";
import React from "react";

import { TabPanel } from "@/components/shared";
import type { ViewUserProps } from "@/types";

interface Props {
	tab: string;
	user?: ViewUserProps;
}

export const Profile = ({ tab, user }: Props) => {
	// const { user } = useUserStore();

	return (
		<TabPanel selected={tab} value="user profile">
			<div className="space-y-4">
				<div className="w-full rounded-lg border p-4">
					<div className="flex w-full items-center justify-between py-2">
						<p className="text-xs text-neutral-400">Full Name</p>
						<p className="text-xs font-medium capitalize">
							{user?.first_name.toLowerCase()} {user?.last_name.toLowerCase()}
						</p>
					</div>
					<div className="flex w-full items-center justify-between py-2">
						<p className="text-xs text-neutral-400">Email Address</p>
						<p className="text-xs font-medium lowercase">{user?.email}</p>
					</div>
					<div className="flex w-full items-center justify-between py-2">
						<p className="text-xs text-neutral-400">Date and Time Joined</p>
						<p className="text-xs font-medium">
							{user?.createdOn && format(user.createdOn, "MMM dd, yyyy HH:mm a")}
						</p>
					</div>
				</div>
				<div className="flex w-full items-center gap-x-3 rounded-lg bg-gradient-to-r from-primary-200 to-primary-600 px-4 py-2">
					<div className="size-9 rounded-full bg-neutral-100"></div>
					<div>
						<p className="text-xs text-white">{user?.classore_points}</p>
						<p className="text-[10px] text-neutral-200">Classore Points</p>
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex w-full items-start gap-x-2 rounded-md border p-3">
						<div className="grid size-7 place-items-center rounded-full border">
							<RiTrophyLine className="size-3.5" />
						</div>
						<div>
							<p className="text-xs font-medium">{user?.ranking}</p>
							<p className="text-xs text-neutral-400">Ranking</p>
						</div>
					</div>
					<div className="flex w-full items-start gap-x-2 rounded-md border p-3">
						<div className="grid size-7 place-items-center rounded-full border">
							<RiUserAddLine className="size-3.5" />
						</div>
						<div>
							<p className="text-xs font-medium">{user?.referrals}</p>
							<p className="text-xs text-neutral-400">Referrals</p>
						</div>
					</div>
					<div className="flex w-full items-start gap-x-2 rounded-md border p-3">
						<div className="grid size-7 place-items-center rounded-full border">
							<RiFlashlightLine className="size-3.5" />
						</div>
						<div>
							<p className="text-xs font-medium">{user?.streak}</p>
							<p className="text-xs text-neutral-400">Streak</p>
						</div>
					</div>
					<div className="flex w-full items-start gap-x-2 rounded-md border p-3">
						<div className="grid size-7 place-items-center rounded-full border">
							<Target04 className="size-3.5" />
						</div>
						<div>
							<p className="text-xs font-medium">{user?.quiz_points}</p>
							<p className="text-xs text-neutral-400">Quiz Points</p>
						</div>
					</div>
				</div>
				<div>
					<p className="text-xs text-neutral-400">Activity Log</p>
					<div className="w-full rounded-lg border p-4"></div>
				</div>
			</div>
		</TabPanel>
	);
};
