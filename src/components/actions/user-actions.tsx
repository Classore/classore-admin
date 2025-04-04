import { useMutation } from "@tanstack/react-query";
import { RiLoaderLine } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";
import {
	RiBook2Line,
	RiDeleteBin6Line,
	RiEditLine,
	RiForbid2Line,
	RiInformationLine,
	RiUserAddLine,
	RiUserLine,
} from "@remixicon/react";

import type { CastedUserProps } from "@/types/casted-types";
import { EditUser, type EditUserPayload } from "@/queries";
import { Referrals } from "./user/referrals";
import { queryClient } from "@/providers";
import { Profile } from "./user/profile";
import { Courses } from "./user/courses";
import type { HttpError } from "@/types";
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

type UseMutationProps = {
	id: string;
	payload: EditUserPayload;
};

const tabs = [
	{ label: "user profile", icon: RiUserLine },
	{ label: "referrals", icon: RiUserAddLine },
	{ label: "courses", icon: RiBook2Line },
];

export const UserActions = ({ user }: Props) => {
	const [tab, setTab] = React.useState("user profile");
	const [open, setOpen] = React.useState({
		delete: false,
		edit: false,
		suspend: false,
		view: false,
	});

	const { isPending: isSuspending, mutate: suspend } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => EditUser(id, payload),
		mutationKey: ["suspend-user", user],
		onSuccess: (data) => {
			toast.success(data.message);
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "An error occurred while suspending the user.";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-users"] });
			setOpen({ ...open, suspend: false });
		},
	});

	const { isPending: isRemoving, mutate: remove } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => EditUser(id, payload),
		mutationKey: ["delete-user", user],
		onSuccess: (data) => {
			toast.success(data.message);
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "An error occurred while deleting the user.";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-users"] });
			setOpen({ ...open, delete: false });
		},
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
				<DialogContent animate={false} className="top-4 w-[550px] -translate-y-0 translate-x-[38%] p-0">
					<div className="w-full space-y-4 rounded-lg border p-4">
						<DialogTitle className="capitalize">{user.user_user_type.toLowerCase()} Details</DialogTitle>
						<DialogDescription hidden>User Details</DialogDescription>
						<div className="w-full space-y-6">
							<div className="w-full space-y-6">
								<div className="h-[214px] w-full">
									<div className="h-[150px] w-full rounded-lg bg-gradient-to-r from-secondary-100 to-primary-200"></div>
								</div>
								<div className="w-full space-y-6">
									<div className="flex h-10 items-center gap-x-3 border-b">
										{tabs.map(({ icon: Icon, label }) => (
											<button
												key={label}
												onClick={() => setTab(label)}
												className={`relative flex h-10 items-center gap-x-1 text-sm font-medium capitalize before:absolute before:bottom-0 before:left-0 before:h-[1px] before:bg-primary-400 ${label === tab ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
												<Icon size={14} /> {label}
											</button>
										))}
									</div>
								</div>
								<Profile tab={tab} user={user} />
								<Referrals tab={tab} />
								<Courses tab={tab} />
							</div>
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
							<DialogTitle>{user.user_isBlocked ? "Unsuspend" : "Suspend"} Account</DialogTitle>
							<DialogDescription>
								Are you sure you want to {user.user_isBlocked ? "unsuspend" : "suspend"} this user account?
								<br />
								{user.user_isBlocked ? (
									<span className="text-red-500">This user will be able to log in again.</span>
								) : (
									<span className="text-red-500">This user will no longer be able to log in.</span>
								)}
							</DialogDescription>
						</div>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								className="w-fit"
								onClick={() => setOpen({ ...open, suspend: false })}
								variant="outline">
								Cancel
							</Button>
							<Button
								className="w-fit"
								onClick={() =>
									suspend({
										id: user.user_id,
										payload: { isBlocked: user.user_isBlocked ? "NO" : "YES", isDeleted: "NO" },
									})
								}
								variant="warning">
								{isSuspending ? (
									<RiLoaderLine className="animate-spin" />
								) : user.user_isBlocked ? (
									"Unsuspend User"
								) : (
									"Suspend User"
								)}
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
							<Button
								className="w-fit"
								onClick={() => remove({ id: user.user_id, payload: { isDeleted: "YES", isBlocked: "NO" } })}
								variant="destructive">
								{isRemoving ? <RiLoaderLine className="animate-spin" /> : "Delete User Account"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
