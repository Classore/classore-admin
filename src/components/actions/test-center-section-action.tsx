import React from "react";
import { RiDeleteBinLine, RiEditBoxLine, RiEditLine, RiEyeOffLine } from "@remixicon/react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { IconLabel } from "../shared";

interface Props {
	id: string;
}

export const TestCenterSectionAction = ({}: Props) => {
	return (
		<div className="w-full space-y-2">
			<Dialog>
				<DialogTrigger asChild>
					<button className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine /> Rename
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiEditLine} />
						<DialogTitle>Rename Section</DialogTitle>
						<DialogDescription hidden>Rename Section</DialogDescription>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog>
				<DialogTrigger asChild>
					<button className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditBoxLine /> Edit Section
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiEditBoxLine} />
						<DialogTitle>Edit Section</DialogTitle>
						<DialogDescription hidden>Edit Section</DialogDescription>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog>
				<DialogTrigger asChild>
					<button className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEyeOffLine /> Unpublish
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiEyeOffLine} />
						<DialogTitle>Unpublish Section</DialogTitle>
						<DialogTitle>DialogDescription hidden Section</DialogTitle>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog>
				<DialogTrigger asChild>
					<button className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
						<RiDeleteBinLine /> Delete section
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiDeleteBinLine} />
						<DialogTitle>Delete Section</DialogTitle>
						<DialogDescription hidden>Delete Section</DialogDescription>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
