import { RiDeleteBin6Line, RiEdit2Line, RiInformationLine } from "@remixicon/react";
import Link from "next/link";
import React from "react";

import type { CastedExamBundleProps } from "@/types";
import { EditSubcategory } from "../dashboard";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	id: string;
	subcategory: CastedExamBundleProps;
}

export const ExamActions = ({ id, subcategory }: Props) => {
	const [open, setOpen] = React.useState({ edit: false, remove: false });

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Link
				href={`/dashboard/courses/${id}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiInformationLine size={18} /> View Details
			</Link>
			<Dialog open={open.edit} onOpenChange={(edit) => setOpen({ ...open, edit })}>
				<DialogTrigger asChild>
					<button
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
