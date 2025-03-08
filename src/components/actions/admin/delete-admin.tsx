import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { DeleteEntities } from "@/queries";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	adminId: string;
	isDeleteOpen: boolean;
	setIsDeleteOpen: (isDeleteOpen: boolean) => void;
}

export const DeleteAdmin = ({ adminId, isDeleteOpen, setIsDeleteOpen }: Props) => {
	const { isPending: isDeleting, mutate: remove } = useMutation({
		mutationFn: () => DeleteEntities({ ids: [adminId], model_type: "ADMIN" }),
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.log(error);
		},
	});

	return (
		<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
			<DialogTrigger asChild>
				<button
					onClick={() => setIsDeleteOpen(true)}
					className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
					<RiDeleteBin6Line size={18} /> Delete Admin
				</button>
			</DialogTrigger>
			<DialogContent className="w-[400px] max-w-[90%] p-1">
				<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiDeleteBin6Line} />
					<DialogTitle className="my-4">Delete Admin</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this admin from Classore?
					</DialogDescription>
					<div className="mt-6 flex w-full items-center justify-end gap-x-4">
						<Button
							onClick={() => setIsDeleteOpen(false)}
							disabled={isDeleting}
							className="w-fit"
							variant="outline">
							Cancel
						</Button>
						<Button
							className="w-fit"
							variant="destructive"
							disabled={isDeleting}
							onClick={() => remove()}>
							{isDeleting ? <RiLoaderLine className="animate-spin" /> : "Yes, delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
