import { RiEditLine } from "@remixicon/react";
import React from "react";

import type { RoleProps } from "@/types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	role: RoleProps;
	id: string;
}

export const RoleActions = ({ role }: Props) => {
	const [isEditOpen, setIsEditOpen] = React.useState(false);

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogTrigger>
					<button
						onClick={() => setIsEditOpen(true)}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine size={18} /> Edit Role
					</button>
				</DialogTrigger>
				<DialogContent animate={false} className="top-4 w-[550px] -translate-y-0 translate-x-[38%]">
					<DialogTitle>Role Details</DialogTitle>
					<DialogDescription hidden>Role Details</DialogDescription>
					<div className="w-full">
						<div className="w-full"></div>
						<div className="flex w-full items-center justify-between">
							<Button size="sm" className="w-fit" variant="destructive">
								Delete Role
							</Button>
							<div className="flex items-center gap-x-4">
								<Button size="sm" className="w-fit" variant="outline">
									Disable Role
								</Button>
								<Button size="sm" className="w-fit">
									Edit Role
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
