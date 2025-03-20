import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { useQuestionContext } from "@/providers";
import { Button } from "@/components/ui/button";
import { DeleteEntities } from "@/queries";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { HttpError } from "@/types";

export const DeleteQuestions = () => {
	const [open, setOpen] = React.useState(false);
	const { selected, onDelete } = useQuestionContext();

	// TODO: @williamssam - These ids are not being passed to the mutation function
	const ids = selected.map((item) => item.id as string);

	const { isPending } = useMutation({
		mutationFn: () => DeleteEntities({ ids, model_type: "QUESTION" }),
		onSuccess: () => {
			toast.success("Questions deleted successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Failed to delete questions";
			toast.error(message);
		},
		onSettled: () => {
			setOpen(false);
		},
	});

	const handleDelete = () => {
		onDelete(selected);
		console.log(ids);
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button className="h-6 text-xs" size="sm" variant="destructive">
					Delete Questions
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full space-y-6 rounded-lg border border-neutral-300 p-4 px-4 pb-4 pt-14">
					<IconLabel icon={RiDeleteBin6Line} />
					<div className="space-y-4">
						<DialogTitle>Delete Questions</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete these questions? This action cannot be undone.
						</DialogDescription>
					</div>
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							className="w-fit"
							onClick={() => setOpen(false)}
							variant="outline"
							disabled={isPending}>
							Cancel
						</Button>
						<Button
							onClick={() => handleDelete()}
							className="w-fit"
							variant="destructive"
							disabled={isPending}>
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Delete Lesson"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
