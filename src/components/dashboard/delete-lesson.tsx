import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DeleteChapterModule } from "@/queries";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { DialogDescription, DialogTitle } from "../ui/dialog";

interface Props {
	lessonId: string;
	onClose: () => void;
}

export const DeleteLesson = ({ lessonId, onClose }: Props) => {
	const queryClient = useQueryClient();

	const { isPending, mutate } = useMutation({
		mutationFn: (id: string) => DeleteChapterModule(id),
		mutationKey: ["delete-lesson"],
		onSuccess: () => {
			toast.success("Lesson deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: () => {
			toast.error("Failed to delete lesson");
		},
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
