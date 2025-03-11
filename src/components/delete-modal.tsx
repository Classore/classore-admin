import { RiDeleteBin6Line, RiLoaderLine } from "@remixicon/react";
import { IconLabel } from "./shared";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

type DeleteModalProps = {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onConfirm: () => void;
	description: string;
	isDeleting?: boolean;
	title: string;
};

export const DeleteModal = ({
	isOpen,
	setIsOpen,
	onConfirm,
	description,
	isDeleting,
	title,
}: DeleteModalProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="w-[400px] max-w-[90%] p-1">
				<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiDeleteBin6Line} />

					<DialogTitle className="my-4">{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>

					<div className="mt-6 flex w-full items-center justify-end gap-x-4">
						<Button
							onClick={() => setIsOpen(false)}
							disabled={isDeleting}
							className="w-fit"
							variant="outline">
							Cancel
						</Button>
						<Button className="w-fit" variant="destructive" disabled={isDeleting} onClick={onConfirm}>
							{isDeleting ? <RiLoaderLine className="animate-spin" /> : "Yes, delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
