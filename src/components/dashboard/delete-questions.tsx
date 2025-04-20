import { RiDeleteBin2Line, RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteEntities } from "@/queries";
import { useQuizStore } from "@/store/z-store/quiz";
import type { HttpError } from "@/types";
import { IconLabel } from "../shared";

interface Props {
	chapterId: string;
	disabled: boolean;
	moduleId: string;
}

export const DeleteQuestions = ({ chapterId, disabled, moduleId }: Props) => {
	const [open, setOpen] = React.useState(false);

	const { selectedQuestions, deleteSelectedQuestions } = useQuizStore();

	const ids = React.useMemo(() => {
		const questions = selectedQuestions[chapterId]?.[moduleId];
		if (!questions) return [];
		return questions.map((question) => question.id || "");
	}, [chapterId, moduleId, selectedQuestions]);

	const { isPending, mutate } = useMutation({
		mutationFn: (ids: string[]) => DeleteEntities({ ids, model_type: "QUESTION" }),
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
		deleteSelectedQuestions(chapterId, moduleId);
		mutate(ids);
		setOpen(false);
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				disabled={disabled}
				title="Delete Questions"
				className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs text-red-50">
				<RiDeleteBin2Line className="size-4" />
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
						<Button onClick={handleDelete} className="w-fit" variant="destructive" disabled={isPending}>
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Delete Questions"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
