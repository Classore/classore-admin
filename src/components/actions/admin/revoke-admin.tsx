import { RiCheckboxCircleLine, RiForbid2Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { UpdateAdmin, type UpdateAdminDto } from "@/queries";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	adminId: string;
	isBlocked: boolean;
	isRevokeopen: boolean;
	setIsRevokeOpen: (isRevokeopen: boolean) => void;
}

interface UseMutationProps {
	id: string;
	payload: UpdateAdminDto;
}

export const RevokeAdmin = ({ adminId, isBlocked, isRevokeopen, setIsRevokeOpen }: Props) => {
	const { isPending: isRevoking, mutate: revoke } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => UpdateAdmin(id, payload),
		onSuccess: () => {
			toast.success("Action successful");
		},
		onError: (error: HttpError) => {
			const message = error?.response?.data.message || "Something went wrong";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-staffs"] });
			setIsRevokeOpen(false);
		},
	});

	return (
		<Dialog open={isRevokeopen} onOpenChange={setIsRevokeOpen}>
			<DialogTrigger asChild>
				<button
					onClick={() => setIsRevokeOpen(true)}
					className={`flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs ${isBlocked ? "text-green-500 hover:bg-green-100" : "text-red-500 hover:bg-red-100"}`}>
					{isBlocked ? <RiCheckboxCircleLine size={18} /> : <RiForbid2Line size={18} />}
					{isBlocked ? "Restore Access" : "Revoke Access"}
				</button>
			</DialogTrigger>
			<DialogContent className="w-[400px] max-w-[90%] p-1">
				<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiForbid2Line} />
					<DialogTitle className="my-4">
						{isBlocked ? "Restore Admin Access" : "Revoke Admin Access"}
					</DialogTitle>
					<DialogDescription>
						{isBlocked
							? "Are you sure you want to restore the access of this admin access to Classore Admin?"
							: "Are you sure you want to revoke the access of this admin access to Classore Admin?"}
					</DialogDescription>
					<div className="mt-6 flex w-full items-center justify-end gap-x-4">
						<Button
							onClick={() => setIsRevokeOpen(false)}
							disabled={isRevoking}
							className="w-fit"
							variant="outline">
							Cancel
						</Button>
						<Button
							onClick={() => revoke({ id: adminId, payload: { isBlocked: isBlocked ? "NO" : "YES" } })}
							disabled={isRevoking}
							className="w-fit"
							variant={isBlocked ? "success" : "destructive"}>
							{isRevoking ? (
								<RiLoaderLine className="animate-spin" />
							) : isBlocked ? (
								"Yes, restore access"
							) : (
								"Yes, revoke access"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
