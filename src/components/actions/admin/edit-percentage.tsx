import { RiEditLine } from "@remixicon/react";
import React from "react";

import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { Input } from "@/components/ui/input";
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

export const EditPercentage = ({}: Props) => {
	const [percent, setPercent] = React.useState("");
	const [open, setOpen] = React.useState(false);

	const handleSubmit = () => {
		console.log(percent);
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
					<Input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="numeric" />
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button className="w-fit" onClick={() => setOpen(false)} size="sm" variant="outline">
							Cancel
						</Button>
						<Button className="w-fit" onClick={handleSubmit} size="sm">
							Save Changes
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
