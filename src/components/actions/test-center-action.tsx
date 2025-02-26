import React from "react";
import {
	RiBracketsLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeOffLine,
	RiSettings6Line,
} from "@remixicon/react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";

interface Props {
	id: string;
}

export const TestCenterAction = ({}: Props) => {
	return (
		<div className="w-full space-y-2">
			<button
				onClick={() => {}}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiEditLine /> Rename
			</button>
			<Dialog>
				<DialogTrigger asChild>
					<button
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiSettings6Line /> Test Settings
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full rounded-lg border border-neutral-400 p-4">
						<DialogTitle>Test Settings</DialogTitle>
						<DialogDescription hidden>Test Settings</DialogDescription>
						<div className="w-full"></div>
						<div className="w-full"></div>
					</div>
				</DialogContent>
			</Dialog>
			<button
				onClick={() => {}}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiBracketsLine /> View Sections
			</button>
			<button
				onClick={() => {}}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiEyeOffLine /> Unpublish
			</button>
			<button
				onClick={() => {}}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
				<RiDeleteBinLine /> Delete Test
			</button>
		</div>
	);
};
