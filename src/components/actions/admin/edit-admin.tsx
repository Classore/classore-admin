import { RiEditLine, RiLoaderLine, RiTeamLine, RiUserAddLine, RiUserLine } from "@remixicon/react";
import React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AdminProps } from "@/types";
import { cn, getInitials } from "@/lib";
import { Referrals } from "./referrals";
import { useGetStaff } from "@/queries";
import { Profile } from "./profile";
import { Wards } from "./wards";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	admin: AdminProps;
	isEditopen: boolean;
	onClose: () => void;
	setIsEditOpen: (isEditopen: boolean) => void;
}

export const EditAdmin = ({ admin, isEditopen, setIsEditOpen }: Props) => {
	const tabs = [
		{ label: "profile", icon: RiUserLine },
		{ ...(admin.role === "marketer" && { label: "referrals", icon: RiUserAddLine }) },
		{ ...(admin.role === "marketer" && { label: "wards", icon: RiTeamLine }) },
	];

	const [tab, setTab] = React.useState("profile");

	const { data } = useGetStaff(admin.id);
	const user = React.useMemo(() => data?.data[0], [data]);

	return (
		<Dialog open={isEditopen} onOpenChange={setIsEditOpen}>
			<DialogTrigger asChild>
				<button
					onClick={() => setIsEditOpen(true)}
					className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
					<RiEditLine size={18} /> Edit Details
				</button>
			</DialogTrigger>
			<DialogContent
				animate={false}
				className="left-full top-4 h-[calc(100vh-32px)] w-[550px] -translate-x-[532px] -translate-y-0">
				{!user ? (
					<div className="grid h-full w-full place-items-center">
						<RiLoaderLine className="size-8 animate-spin text-primary-500" />
					</div>
				) : (
					<div className="flex h-full w-full flex-col justify-between">
						<div className="h-[calc(100%-60px)] w-full space-y-6">
							<div className="h-5">
								<DialogTitle>Admin Details</DialogTitle>
								<DialogDescription hidden>User Details</DialogDescription>
							</div>
							<div className="h-[214px] w-full">
								<div className="h-[150px] w-full rounded-lg bg-gradient-to-r from-secondary-100 to-primary-200"></div>
								<div className="-mt-[52px] flex w-full items-baseline justify-between px-5">
									<div className="flex items-baseline gap-x-3">
										<Avatar className="size-[120px]">
											<AvatarFallback className="bg-black text-5xl text-white">
												{getInitials(`${user.admin_first_name} ${user.admin_last_name}`)}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium capitalize">
												{user.admin_first_name} {user.admin_last_name}
											</p>
											<p className="text-sm text-neutral-400">{user.admin_email}</p>
										</div>
									</div>
									<div
										className={cn(
											"rounded-md px-3 py-1 text-sm font-medium",
											user.admin_isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
										)}>
										{user.admin_isBlocked ? "Blocked" : "Active"}
									</div>
								</div>
							</div>
							<div className="h-[calc(100%-240px)] w-full space-y-2">
								<div className="flex h-10 items-center gap-x-4 border-b">
									{tabs.map(({ icon: Icon, label }) => (
										<button
											key={label}
											onClick={() => setTab(String(label))}
											className={`relative flex h-10 items-center gap-x-1 text-sm font-medium capitalize before:absolute before:bottom-0 before:left-0 before:h-[1px] before:bg-primary-400 ${label === tab ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
											{Icon && <Icon size={14} />} {label}
										</button>
									))}
								</div>
								<div className="h-[calc(100%-96px)] w-full flex-1 overflow-y-auto">
									<Profile tab={tab} admin={user} />
									<Referrals tab={tab} admin={user} />
									<Wards tab={tab} admin={user} />
								</div>
							</div>
						</div>
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
				)}
			</DialogContent>
		</Dialog>
	);
};
