import { RiDeleteBin6Line, RiEdit2Line, RiInformationLine } from "@remixicon/react";
import Link from "next/link";
import React from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PublishResource } from "@/queries";
import type { CastedExamBundleProps } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EditSubcategory } from "../dashboard";
import { PublishModal } from "../publish-modal";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";

interface Props {
	id: string;
	subcategory: CastedExamBundleProps;
}

export const ExamActions = ({ id, subcategory }: Props) => {
	const queryClient = useQueryClient();
	const [open, setOpen] = React.useState({ edit: false, remove: false });
	const [openPublishModal, setOpenPublishModal] = React.useState(false);

	const { mutate, isPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			toast.success("Exam bundle published successfully!");
			queryClient.invalidateQueries({
				queryKey: ["bundles"],
			});
			setOpenPublishModal(false);
		},
	});

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Link
				href={`/dashboard/courses/${id}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiInformationLine size={18} /> View Details
			</Link>

			<PublishModal
				open={openPublishModal}
				setOpen={setOpenPublishModal}
				type="bundle"
				published={subcategory.examinationbundle_is_published === "YES"}
				isPending={isPending}
				onConfirm={() =>
					mutate({
						id,
						model_type: "EXAM_BUNDLE",
					})
				}
			/>

			<Dialog open={open.edit} onOpenChange={(edit) => setOpen({ ...open, edit })}>
				<DialogTrigger asChild>
					<button
						type="button"
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEdit2Line size={18} /> Edit Details
					</button>
				</DialogTrigger>
				<DialogContent className="max-h-[80vh] w-[500px] overflow-y-auto p-1">
					<EditSubcategory
						id={id}
						onOpenChange={(edit) => setOpen({ ...open, edit })}
						subcategory={subcategory}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={open.remove} onOpenChange={(remove) => setOpen({ ...open, remove })}>
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
						<DialogTitle className="my-4">Delete Exam Bundle</DialogTitle>
						<DialogDescription>Are you sure you want to delete this bundle?</DialogDescription>
						<div className="mt-6 flex w-full items-center justify-end gap-x-4">
							<Button
								onClick={() => setOpen({ ...open, remove: false })}
								className="w-fit"
								variant="outline">
								Cancel
							</Button>
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
