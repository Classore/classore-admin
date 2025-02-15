import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";

interface Props {
	id: string;
}

export const DeleteAction = ({}: Props) => {
	const [open, setOpen] = React.useState(false);

	const { isPending } = useMutation({});

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
					<DialogTitle>Delete Module</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this module? This action cannot be undone.
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
