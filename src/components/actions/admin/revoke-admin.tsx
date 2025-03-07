import { RiForbid2Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { DeleteEntities } from "@/queries";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	adminId: string;
	isRevokeopen: boolean;
	setIsRevokeOpen: (isRevokeopen: boolean) => void;
}

export const RevokeAdmin = ({ adminId, isRevokeopen, setIsRevokeOpen }: Props) => {
	const { isPending: isRevoking, mutate: revoke } = useMutation({
		mutationFn: () => DeleteEntities({ ids: [adminId], model_type: "SUBJECT" }),
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.log(error);
		},
	});
	return (
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
						Are you sure you want to revoke the access of this admin access to Classore Admin?
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
							onClick={() => revoke()}
							disabled={isRevoking}
							className="w-fit"
							variant="destructive">
							{isRevoking ? <RiLoaderLine className="animate-spin" /> : "Yes, revoke access"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
