import { RiEditLine } from "@remixicon/react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	isEditopen: boolean;
	setIsEditOpen: (isEditopen: boolean) => void;
}

export const EditAdmin = ({ isEditopen, setIsEditOpen }: Props) => {
	return (
		<Dialog open={isEditopen} onOpenChange={setIsEditOpen}>
			<DialogTrigger asChild>
				<button
					onClick={() => setIsEditOpen(true)}
					className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
					<RiEditLine size={18} /> Edit Details
				</button>
			</DialogTrigger>
			<DialogContent animate={false} className="top-4 w-[550px] -translate-y-0 translate-x-[38%]">
				<DialogTitle>Admin Details</DialogTitle>
				<DialogDescription hidden>User Details</DialogDescription>
				<div className="w-full">
					<div className="w-full"></div>
					<div className="flex w-full items-center justify-between">
						<Button size="sm" className="w-fit" variant="destructive">
							Delete Account
						</Button>
						<div className="flex items-center gap-x-4">
							<Button size="sm" className="w-fit" variant="outline">
								Suspend Account
							</Button>
							<Button size="sm" className="w-fit">
								Edit Account
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
