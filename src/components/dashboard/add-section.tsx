import { RiAddLine, RiBracketsLine, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	testId: string;
}

export const AddSection = ({}: Props) => {
	const [open, setOpen] = React.useState(false);

	const { isPending } = useMutation({});

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)} className="w-fit" size="sm">
					<RiAddLine /> Add Section
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiBracketsLine} />
					<div className="mb-5 mt-4">
						<DialogTitle>Add Section</DialogTitle>
						<DialogDescription hidden>add Section</DialogDescription>
					</div>
					<form className="w-full space-y-4">
						<hr />
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								onClick={() => setOpen(false)}
								className="w-fit"
								type="button"
								size="sm"
								variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" type="submit" size="sm">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Create section"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
