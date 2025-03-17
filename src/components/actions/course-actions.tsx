import { RiDeleteBin6Line, RiInformationLine } from "@remixicon/react";
import Link from "next/link";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PublishResource } from "@/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublishModal } from "../publish-modal";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";

interface Props {
	id: string;
	published: boolean;
}

export const CourseActions = ({ id, published }: Props) => {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-subjects"],
			});
			// setOpen(false);
		},
	});

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Link
				href={`/dashboard/courses/course?courseId=${id}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiInformationLine size={18} /> View Details
			</Link>

			<PublishModal
				type="course"
				published={published}
				isPending={isPending}
				onConfirm={() =>
					mutate({
						id,
						model_type: "SUBJECT",
					})
				}
			/>

			<Dialog>
				<DialogTrigger asChild>
					<button
						type="button"
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
						<RiDeleteBin6Line size={18} /> Delete
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
						<DialogTitle className="my-4">Delete Course</DialogTitle>
						<DialogDescription>Are you sure you want to delete this course?</DialogDescription>
						<div className="mt-6 flex w-full items-center justify-end gap-x-4">
							<DialogClose asChild>
								<Button className="w-fit" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button className="w-fit" variant="destructive">
								Yes, Delete
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
