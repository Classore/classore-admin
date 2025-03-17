import { RiEye2Line } from "@remixicon/react";
import { IconLabel, Spinner } from "./shared";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

type PublishModalProps = {
	published: boolean;
	isPending: boolean;
	onConfirm: () => void;
	trigger?: React.ReactNode;
	type: string;
};

export const PublishModal = ({
	published,
	isPending,
	onConfirm,
	trigger,
	type,
}: PublishModalProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				{!trigger ? (
					<button
						disabled={published}
						type="button"
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs capitalize text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
						<RiEye2Line size={18} />
						<span> Publish {type}</span>
					</button>
				) : (
					trigger
				)}
			</DialogTrigger>

			<DialogContent className="w-[400px] p-1">
				<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiEye2Line} />
					<DialogHeader>
						<DialogTitle className="my-4 capitalize">Publish {type}</DialogTitle>
						<DialogDescription className="text-neutral-400">
							Are you sure you want to publish this {type}? Publishing this {type} will make it available
							to all users on the platform.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6 flex w-full items-center justify-end gap-x-4">
						<DialogClose asChild>
							<Button className="w-fit" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button disabled={isPending} onClick={onConfirm} className="w-32">
							{isPending ? <Spinner /> : "Yes, Publish"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
