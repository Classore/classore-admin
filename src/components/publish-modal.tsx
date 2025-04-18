import { RiEye2Line, RiEyeOffLine } from "@remixicon/react";
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
	published?: boolean;
	isPending: boolean;
	onConfirm: () => void;
	trigger?: React.ReactNode;
	hasTrigger?: boolean;
	type: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PublishModal = ({
	published,
	isPending,
	onConfirm,
	trigger,
	hasTrigger = true,
	type,
	open,
	setOpen,
}: PublishModalProps) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{hasTrigger ? (
				<DialogTrigger asChild>
					{!trigger ? (
						<button
							type="button"
							className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs capitalize text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
							{published ? <RiEyeOffLine size={18} /> : <RiEye2Line size={18} />}
							<span>
								{" "}
								{published ? "Unpublish" : "Publish"} {type}
							</span>
						</button>
					) : (
						trigger
					)}
				</DialogTrigger>
			) : null}

			<DialogContent className="w-[400px] p-1">
				<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiEye2Line} />
					<DialogHeader>
						<DialogTitle className="my-4 capitalize">
							{published ? "Unpublish" : "Publish"} {type}
						</DialogTitle>
						{published ? (
							<DialogDescription className="text-neutral-400">
								Are you sure you want to unpublish this {type}? Unpublishing this {type} will make it
								unavailable to all users on the platform.
							</DialogDescription>
						) : (
							<DialogDescription className="text-neutral-400">
								Are you sure you want to publish this {type}? Publishing this {type} will make it available
								to all users on the platform.
							</DialogDescription>
						)}
					</DialogHeader>
					<div className="mt-6 flex w-full items-center justify-end gap-x-4">
						<DialogClose asChild>
							<Button className="w-fit" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button disabled={isPending} onClick={onConfirm} className="w-32">
							{isPending ? <Spinner /> : published ? "Yes, Unpublish" : "Yes, Publish"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
