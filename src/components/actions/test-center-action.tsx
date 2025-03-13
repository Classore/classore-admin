import React from "react";
import {
	RiBracketsLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeLine,
	RiEyeOffLine,
	RiSettings6Line,
} from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	id: string;
	is_published: boolean;
}

export const TestCenterAction = ({ id, is_published }: Props) => {
	return (
		<div className="w-full space-y-2">
			<Dialog>
				<DialogTrigger asChild>
					<button
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine className="size-5" /> Rename
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full space-y-5 rounded-lg border border-neutral-400 p-4 pt-14">
						<DialogTitle>Edit Section</DialogTitle>
						<DialogDescription hidden></DialogDescription>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog>
				<DialogTrigger asChild>
					<button
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiSettings6Line className="size-5" /> Test Settings
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full space-y-5 rounded-lg border border-neutral-400 p-4 pt-14">
						<DialogTitle>Test Settings</DialogTitle>
						<DialogDescription hidden>Test Settings</DialogDescription>
						<div className="w-full"></div>
						<div className="w-full"></div>
					</div>
				</DialogContent>
			</Dialog>
			<Link
				href={`/dashboard/test-center/${id}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiBracketsLine className="size-5" /> View Sections
			</Link>
			<Dialog>
				<DialogTrigger asChild>
					{is_published ? (
						<button
							onClick={() => {}}
							className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
							<RiEyeOffLine className="size-5" /> Unpublish
						</button>
					) : (
						<button
							onClick={() => {}}
							className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
							<RiEyeLine className="size-5" /> Publish
						</button>
					)}
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full space-y-5 rounded-lg border border-neutral-400 p-4 pt-14">
						<DialogTitle>{is_published ? "Unpublish Section" : "Publish section"}</DialogTitle>
						{is_published ? (
							<DialogDescription>
								You are about to unpublish this section. Are you sure you want to continue?
							</DialogDescription>
						) : (
							<DialogDescription>
								You are about to publish this section. Are you sure you want to continue?
							</DialogDescription>
						)}
						{is_published ? (
							<div className="flex w-full items-center justify-end gap-x-4">
								<Button className="w-fit" size="sm" variant="outline">
									Cancel
								</Button>
								<Button className="w-fit" size="sm" variant="destructive">
									Yes, unpublish
								</Button>
							</div>
						) : (
							<div className="flex w-full items-center justify-end gap-x-4">
								<Button className="w-fit" size="sm" variant="outline">
									Cancel
								</Button>
								<Button className="w-fit" size="sm" variant="success">
									Yes, publish
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<Dialog>
				<DialogTrigger asChild>
					<button
						onClick={() => {}}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
						<RiDeleteBinLine className="size-5" /> Delete Test
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full space-y-5 rounded-lg border border-neutral-400 p-4 pt-14">
						<IconLabel icon={RiDeleteBinLine} variant="destructive" />
						<DialogTitle>Delete Section</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this section? This action cannot be undone.
						</DialogDescription>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button className="w-fit" size="sm" variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" size="sm" variant="destructive">
								Yes, delete
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
