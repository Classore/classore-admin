import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";
import {
	RiBracketsLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeLine,
	RiEyeOffLine,
	RiLoaderLine,
	RiSettings6Line,
} from "@remixicon/react";

import { type UpdateTestDto, UpdateTest } from "@/queries/test-center";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { DeleteEntities } from "@/queries";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import { Input } from "../ui/input";
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

const initialModalState = {
	delete: false,
	publish: false,
	rename: false,
	settings: false,
};

export const TestCenterAction = ({ id, is_published }: Props) => {
	const [modalStates, setModalStates] = React.useState(initialModalState);
	const [name, setName] = React.useState("");

	const handleModalStateChange = (key: keyof typeof initialModalState, value: boolean) => {
		setModalStates((prev) => ({ ...prev, [key]: value }));
	};

	const { isPending: isEditing, mutate: edit } = useMutation({
		mutationFn: (payload: Partial<UpdateTestDto>) => UpdateTest(id, payload),
		mutationKey: ["rename-test", id],
		onSuccess: () => {
			toast.success("Test renamed successfully");
			handleModalStateChange("rename", false);
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "An error occured";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-tests"] });
		},
	});

	const { isPending: isPublishing, mutate: publish } = useMutation({
		mutationFn: (payload: Partial<UpdateTestDto>) => UpdateTest(id, payload),
		mutationKey: ["publish-test", id],
		onSuccess: () => {
			if (is_published) {
				toast.success("Test unpublished successfully");
			} else {
				toast.success("Test published successfully");
			}
			handleModalStateChange("publish", false);
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "An error occured";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-tests"] });
		},
	});

	const { isPending: isDeleting, mutate: remove } = useMutation({
		mutationFn: () => DeleteEntities({ ids: [id], model_type: "SUBJECT" }),
		mutationKey: ["delete-test", id],
		onSuccess: () => {
			toast.success("Test deleted successfully");
			handleModalStateChange("delete", false);
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "An error occured";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-tests"] });
		},
	});

	const handleRename = () => {
		if (!name) {
			toast.error("Please enter a new name");
			return;
		}
		const payload: Partial<UpdateTestDto> = {
			title: name,
		};
		edit(payload);
	};

	const handlePublish = (is_published: boolean) => {
		const payload: Partial<UpdateTestDto> = {
			is_published: is_published ? "NO" : "YES",
		};
		publish(payload);
	};

	return (
		<div className="w-full space-y-2">
			<Dialog
				onOpenChange={(value) => handleModalStateChange("rename", value)}
				open={modalStates.rename}>
				<DialogTrigger asChild>
					<button
						onClick={() => handleModalStateChange("rename", true)}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine className="size-5" /> Rename
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px] p-1">
					<div className="w-full space-y-5 rounded-lg border border-neutral-400 p-4 pt-14">
						<DialogTitle>Edit Section</DialogTitle>
						<DialogDescription hidden></DialogDescription>
						<div className="w-full">
							<Input label="Test Name" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								onClick={() => handleModalStateChange("rename", false)}
								className="w-fit"
								size="sm"
								variant="outline"
								disabled={isEditing}>
								Cancel
							</Button>
							<Button onClick={handleRename} className="w-fit" size="sm" disabled={isEditing}>
								{isEditing ? <RiLoaderLine className="animate-spin" /> : "Save Changes"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog
				onOpenChange={(value) => handleModalStateChange("settings", value)}
				open={modalStates.settings}>
				<DialogTrigger asChild>
					<button
						onClick={() => handleModalStateChange("settings", true)}
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
			<Dialog
				onOpenChange={(value) => handleModalStateChange("publish", value)}
				open={modalStates.publish}>
				<DialogTrigger asChild>
					{is_published ? (
						<button
							onClick={() => handleModalStateChange("publish", true)}
							className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
							<RiEyeOffLine className="size-5" /> Unpublish
						</button>
					) : (
						<button
							onClick={() => handleModalStateChange("publish", true)}
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
								<Button
									onClick={() => handleModalStateChange("publish", false)}
									className="w-fit"
									size="sm"
									variant="outline"
									disabled={isPublishing}>
									Cancel
								</Button>
								<Button
									onClick={() => handlePublish(is_published)}
									className="w-fit"
									size="sm"
									variant="destructive"
									disabled={isPublishing}>
									{isPublishing ? <RiLoaderLine className="animate-spin" /> : "Yes, unpublish"}
								</Button>
							</div>
						) : (
							<div className="flex w-full items-center justify-end gap-x-4">
								<Button
									onClick={() => handleModalStateChange("publish", false)}
									className="w-fit"
									size="sm"
									variant="outline"
									disabled={isPublishing}>
									Cancel
								</Button>
								<Button
									onClick={() => handlePublish(is_published)}
									className="w-fit"
									size="sm"
									variant="success"
									disabled={isPublishing}>
									{isPublishing ? <RiLoaderLine className="animate-spin" /> : "Yes, publish"}
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<Dialog
				onOpenChange={(value) => handleModalStateChange("delete", value)}
				open={modalStates.delete}>
				<DialogTrigger asChild>
					<button
						onClick={() => handleModalStateChange("delete", true)}
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
							<Button
								onClick={() => handleModalStateChange("delete", false)}
								className="w-fit"
								size="sm"
								variant="outline"
								disabled={isDeleting}>
								Cancel
							</Button>
							<Button
								onClick={() => remove()}
								className="w-fit"
								size="sm"
								variant="destructive"
								disabled={isDeleting}>
								{isDeleting ? <RiLoaderLine className="animate-spin" /> : "Yes, delete"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
