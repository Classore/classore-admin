import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DeleteEntity } from "@/queries";
import type { HttpError } from "@/types";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";

interface Props {
	id: string;
}

export const DeleteAction = ({ id }: Props) => {
	const [open, setOpen] = React.useState(false);

	const { isPending } = useMutation({
		mutationFn: (id: string) => DeleteEntity("SUBJECT", [id]),
		mutationKey: ["delete-subject", id],
		onSuccess: (data) => {
			toast.success(data.message);
			setOpen(false);
		},
		onError: (error: HttpError) => {
			const data = error.response.data;
			const message = Array.isArray(data.message) ? data.message[0] : data.message;
			toast.error(message);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-fit" size="sm" variant="destructive-outline">
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
					<DialogTitle>Delete Subject</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this subject? This action cannot be undone.
					</DialogDescription>
					<div className="flex items-center justify-end gap-2">
						<Button className="w-fit" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button className="w-fit" variant="destructive" disabled={isPending}>
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
