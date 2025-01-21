import React, { createElement } from "react";
import {
	type RemixiconComponentType,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileExcel2Line,
	RiFile2Line,
	RiFilePdf2Line,
	RiFilePpt2Line,
	RiFileWord2Line,
} from "@remixicon/react";

import { getFileExtension, shortenFileName } from "@/lib";
// import { CloudinaryFileItem } from "../dynamic";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

interface Props {
	attachment: string;
	onDragStart: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragEnd: (e: React.DragEvent) => void;
}

const fileIcon = (extension: string): RemixiconComponentType => {
	switch (extension) {
		case "pdf":
			return RiFilePdf2Line;
		case "xlsx":
		case "xls":
			return RiFileExcel2Line;
		case "doc":
		case "docx":
			return RiFileWord2Line;
		case "ppt":
		case "pptx":
			return RiFilePpt2Line;
		default:
			return RiFile2Line;
	}
};

export const AttachmentItem = ({
	attachment,
	onDragEnd,
	onDragOver,
	onDragStart,
}: Props) => {
	const [isGrabbing, setIsGrabbing] = React.useState(false);
	const [open, setOpen] = React.useState(false);

	return (
		<div
			draggable
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDragStart={onDragStart}
			className="w-full rounded-md border border-neutral-300 py-2">
			<div className="flex w-full items-center justify-between px-3">
				<div className="flex flex-1 items-center gap-x-2">
					<button
						onMouseDown={() => setIsGrabbing(true)}
						onMouseUp={() => setIsGrabbing(false)}
						onMouseLeave={() => setIsGrabbing(false)}
						className={`grid size-6 place-items-center ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}>
						<RiDraggable className="size-5 text-neutral-400" />
					</button>
					<div className="flex items-center gap-x-2">
						<div className="grid size-8 place-items-center rounded-md bg-neutral-200">
							{createElement(fileIcon(getFileExtension(attachment)), {
								className: "text-neutral-400 size-5",
							})}
						</div>
						{/* <CloudinaryFileItem url={attachment} /> */}
						<p className="text-sm text-neutral-400">{shortenFileName(attachment, 40)}</p>
					</div>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<button onClick={() => setOpen(true)} className="">
							<RiDeleteBin6Line className="size-5 text-neutral-400" />
						</button>
					</DialogTrigger>
					<DialogContent className="w-[400px] p-1">
						<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
							<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
							<div className="my-4 space-y-2">
								<DialogTitle>Are you sure?</DialogTitle>
								<DialogDescription>
									This action cannot be undone. This will permanently delete the event.
								</DialogDescription>
							</div>
							<div className="flex w-full items-center justify-end gap-x-4">
								<Button
									className="w-fit"
									type="button"
									onClick={() => setOpen(false)}
									variant="outline">
									Cancel
								</Button>
								<Button className="w-fit" type="button" variant="destructive">
									Yes, Delete Event
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};
