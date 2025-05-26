import { useMutation } from "@tanstack/react-query";
import { RiEditLine, RiLoaderLine } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";

import { UpdateAdmin, type UpdateAdminDto } from "@/queries";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	id: string;
}

type UseMutationProps = { id: string; payload: Partial<UpdateAdminDto> };

export const EditPercentage = ({ id }: Props) => {
	const [percent, setPercent] = React.useState("");
	const [open, setOpen] = React.useState(false);

	const { isPending, mutate } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => UpdateAdmin(id, payload),
		onSuccess: () => {
			toast.success("Action successful");
		},
		onError: (error: HttpError) => {
			const message = error?.response?.data.message || "Something went wrong";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-admin", id] });
			setOpen(false);
		},
	});

	const handleSubmit = () => {
		mutate({
			id,
			payload: {
				referral_percentage: Number(percent) || 0,
				referral_percentage_for_marketers: Number(percent) || 0,
			},
		});
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<button className="flex items-center gap-x-2 rounded-3xl border border-neutral-300 bg-white px-3 py-1 text-sm">
					<RiEditLine className="size-4" />
					Edit
				</button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full space-y-6 px-4 pb-4 pt-14">
					<IconLabel icon={RiEditLine} />
					<div className="space-y-1">
						<DialogTitle>Edit Agent Referral Percentage</DialogTitle>
						<DialogDescription>
							Define how much students when they refer new users. This is a flat rate across all students.
						</DialogDescription>
					</div>
					<Input
						type="number"
						value={percent}
						onChange={(e) => setPercent(e.target.value)}
						onWheel={(e) => e.preventDefault()}
					/>
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button className="w-fit" onClick={() => setOpen(false)} size="sm" variant="outline">
							Cancel
						</Button>
						<Button className="w-fit" disabled={isPending} onClick={handleSubmit} size="sm">
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Save Changes"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
