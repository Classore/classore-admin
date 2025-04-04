import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import React from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DeleteEntities } from "@/queries";
import type { HttpError } from "@/types";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	subjectId: string;
	subjectName: string;
}

export const DeleteSubject = ({ open, setOpen, subjectId, subjectName }: Props) => {
	const router = useRouter();

	const { isPending } = useMutation({
		mutationFn: () => DeleteEntities({ ids: [subjectId], model_type: "SUBJECT" }),
		onSuccess: () => {
			router.push("/dashboard/courses");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to delete module";
			toast.error(message);
		},
	});

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button
					className="w-fit"
					onClick={() => setOpen(!open)}
					size="sm"
					variant="destructive-outline">
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[450px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiDeleteBin6Line} />
					<div className="mt-5 space-y-2">
						<DialogTitle>Delete Subject</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {subjectName}? This action cannot be undone.
						</DialogDescription>
					</div>
					<div className="mt-5 flex w-full items-center justify-end gap-x-4">
						<Button className="w-fit" onClick={() => setOpen(false)} size="sm" variant="outline">
							Cancel
						</Button>
						<Button className="w-fit" onClick={() => setOpen(false)} size="sm" variant="destructive">
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Confirm Delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
