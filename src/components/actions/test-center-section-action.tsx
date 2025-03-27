import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Link from "next/link";
import React from "react";
import {
	RiDeleteBinLine,
	RiEditBoxLine,
	RiEditLine,
	RiEyeLine,
	RiEyeOffLine,
	RiLoaderLine,
} from "@remixicon/react";

import { UpdateTestSection, type UpdateTestDto } from "@/queries/test-center";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { DeleteEntities } from "@/queries";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import { Input } from "../ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	is_published: boolean;
	sectionId: string;
	sectionTitle: string;
}

const initialModalState = {
	rename: false,
	publish: false,
	delete: false,
};

export const TestCenterSectionAction = ({ is_published, sectionId, sectionTitle }: Props) => {
	const [modalStates, setModalStates] = React.useState(initialModalState);
	const [name, setName] = React.useState("");
	const router = useRouter();
	const id = router.query.id as string;

	const handleModalStateChange = (key: keyof typeof initialModalState, state: boolean) => {
		setModalStates((prev) => ({ ...prev, [key]: state }));
	};

	const { isPending: isRenaming, mutate: rename } = useMutation({
		mutationFn: (data: Partial<UpdateTestDto>) => UpdateTestSection(sectionId, data),
		mutationKey: ["rename-test-section", sectionId],
		onSuccess: () => {
			toast.success("Section renamed successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Failed to rename section";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-test-sections"] });
			handleModalStateChange("rename", false);
		},
	});

	const { isPending: isPublishing, mutate: publish } = useMutation({
		mutationFn: (data: Partial<UpdateTestDto>) => UpdateTestSection(sectionId, data),
		mutationKey: ["rename-test-section", sectionId],
		onSuccess: () => {
			if (is_published) {
				toast.success("Section unpublished successfully");
			} else {
				toast.success("Section published successfully");
			}
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Failed to rename section";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-test-sections"] });
			handleModalStateChange("publish", false);
		},
	});

	const { isPending: isDeleting, mutate: remove } = useMutation({
		mutationFn: () => DeleteEntities({ ids: [sectionId], model_type: "TEST_SECTION" }),
		mutationKey: ["delete-test-section", sectionId],

		onSuccess: () => {
			toast.success("Section deleted successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Failed to rename section";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-test-sections"] });
			handleModalStateChange("delete", false);
		},
	});

	const handleRename = () => {
		if (!name) {
			toast.error("Please enter a new name");
			return;
		}
		if (name === sectionTitle) {
			toast.error("Please enter a different name");
			return;
		}
		const payload: Partial<UpdateTestDto> = {
			title: name,
		};
		rename(payload);
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
					<button className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine className="size-5" /> Rename
					</button>
				</DialogTrigger>
				<DialogContent className="w-[400px] p-1">
					<div className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
						<IconLabel icon={RiEditLine} />
						<DialogTitle>Rename Section</DialogTitle>
						<DialogDescription hidden>Rename Section</DialogDescription>
						<div className="w-full">
							<Input label="Test Name" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								onClick={() => handleModalStateChange("rename", false)}
								className="w-fit"
								size="sm"
								variant="outline"
								disabled={isRenaming}>
								Cancel
							</Button>
							<Button onClick={handleRename} className="w-fit" size="sm" disabled={isRenaming}>
								{isRenaming ? <RiLoaderLine className="animate-spin" /> : "Save Changes"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Link
				href={`/dashboard/test-center/${id}/questions?sectionTitle=${sectionTitle}&sectionId=${sectionId}`}
				className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
				<RiEditBoxLine className="size-5" /> Edit Section
			</Link>
			<Dialog
				onOpenChange={(value) => handleModalStateChange("publish", value)}
				open={modalStates.publish}>
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
						<IconLabel icon={is_published ? RiEyeOffLine : RiEyeLine} />
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
