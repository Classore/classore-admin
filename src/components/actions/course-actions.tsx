import { RiDeleteBin6Line, RiInformationLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteEntities, PublishResource } from "@/queries";
import { PublishModal } from "../publish-modal";
import { IconLabel, Spinner } from "../shared";
import { Button } from "../ui/button";

interface Props {
	subject_id: string;
	published: boolean;
}

export const CourseActions = ({ subject_id, published }: Props) => {
	const [open, setOpen] = React.useState(false);
	const queryClient = useQueryClient();

	const router = useRouter();
	const id = router.query.id as string;

	const { mutate, isPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			toast.success("Course published successfully!");
			queryClient.invalidateQueries({
				queryKey: ["get-bundle"],
			});
			setOpen(false);
		},
	});

	const { isPending: isDeleting, mutate: deleteMutate } = useMutation({
		mutationFn: DeleteEntities,
		onSuccess: () => {
			toast.success("Course deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["get-bundle"],
			});
		},
	});

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Link
				href={`/dashboard/courses/${id}/${subject_id}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiInformationLine size={18} /> View Details
			</Link>

			<PublishModal
				open={open}
				setOpen={setOpen}
				type="course"
				published={published}
				isPending={isPending}
				onConfirm={() =>
					mutate({
						id: subject_id,
						model_type: "SUBJECT",
						publish: "YES",
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
								<Button disabled={isDeleting} className="w-fit" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button
								disabled={isDeleting}
								className="w-fit"
								variant="destructive"
								onClick={() => deleteMutate({ ids: [subject_id], model_type: "SUBJECT" })}>
								{isDeleting ? <Spinner /> : "Yes, Delete"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
