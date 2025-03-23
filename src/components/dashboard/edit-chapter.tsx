import { RiEdit2Line, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import type { HttpError } from "@/types";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";

interface Props {
	chapterId: string;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	sequence: number;
}

export const EditChapter = ({ chapterId, onOpenChange, open, sequence }: Props) => {
	const { isPending } = useMutation({
		mutationKey: ["edit-chapter", chapterId, sequence],
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error: HttpError) => {
			console.error(error);
		},
	});

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button className="w-fit" onClick={() => onOpenChange(false)} size="sm">
					Edit Chapter
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<IconLabel icon={RiEdit2Line} />
				<div>
					<DialogTitle>Edit chapter</DialogTitle>
					<DialogDescription>
						Make changes to your chapter here. Click save when you&apos;re done.
					</DialogDescription>
				</div>
				<form>
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							className="w-fit"
							onClick={() => onOpenChange(false)}
							size="sm"
							type="button"
							variant="outline">
							Cancel
						</Button>
						<Button className="w-fit" size="sm" type="submit">
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Save Changes"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
