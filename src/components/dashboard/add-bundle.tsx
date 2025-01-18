import { RiBookMarkedLine } from "@remixicon/react";
import React from "react";

import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

interface Props {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export const AddBundle = ({ onOpenChange, open }: Props) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiBookMarkedLine} />
					<div className="my-4">
						<DialogTitle>Add New Bundle</DialogTitle>
						<DialogDescription hidden>Add New Bundle</DialogDescription>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
