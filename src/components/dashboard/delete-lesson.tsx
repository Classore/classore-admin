import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { DialogDescription, DialogTitle } from "../ui/dialog";
import { DeleteChapterModule } from "@/queries";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";

interface Props {
	lessonId: string;
	onClose: () => void;
}

export const DeleteLesson = ({ lessonId, onClose }: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: (id: string) => DeleteChapterModule(id),
		mutationKey: ["delete-lesson"],
		onSuccess: () => {
			toast.success("Lesson deleted successfully");
		},
		// onError: () => {
		// 	toast.error("Failed to delete lesson");
		// },
	});

	return (
		<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
			<div className="my-7">
				<DialogTitle>Delete Lesson</DialogTitle>
				<DialogDescription>Are you sure you want to delete this lesson?</DialogDescription>
			</div>
			<div className="flex w-full items-center justify-end gap-x-4">
				<Button className="w-fit" onClick={onClose} variant="outline">
					Cancel
				</Button>
				<Button onClick={() => mutate(lessonId)} className="w-fit" variant="destructive">
					{isPending ? <RiLoaderLine className="animate-spin" /> : "Delete Lesson"}
				</Button>
			</div>
		</div>
	);
};
