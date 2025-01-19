import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";
import {
	RiDeleteBin6Line,
	RiFileUploadLine,
	RiLoaderLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import type { CreateChapterModuleDto, UpdateChapterModuleDto } from "@/queries";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { getFileSize, shortenFileName } from "@/lib";
import { UpdateChapterModule } from "@/queries";
import { queryClient } from "@/providers";
import { useFileHandler } from "@/hooks";
import { Button } from "../ui/button";
import { format } from "date-fns";

interface Props {
	id: string;
	sequence: number;
	setFieldValue: (field: string, value: any) => void;
	setOpen: (open: boolean) => void;
	values: CreateChapterModuleDto;
}

interface UseMutationProps {
	module_id: string;
	module: UpdateChapterModuleDto;
}

export const AddAttachment = ({
	id,
	sequence,
	setFieldValue,
	setOpen,
	values,
}: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: ({ module_id, module }: UseMutationProps) =>
			UpdateChapterModule(module_id, module),
		mutationKey: ["update-chapter-module"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] }).then(() => {
				setOpen(false);
				clearFiles();
			});
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to update module");
		},
	});

	// Helper function to check for duplicate files
	const isDuplicateFile = (file: File, existingFiles: File[]) => {
		return existingFiles.some(
			(existingFile) =>
				existingFile.name === file.name &&
				existingFile.size === file.size &&
				existingFile.lastModified === file.lastModified
		);
	};

	const {
		clearFiles,
		handleClick,
		handleFileChange,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		inputRef,
		isDragging,
	} = useFileHandler({
		onValueChange: (files) => {
			const newFiles = files.filter((file) => !isDuplicateFile(file, values.attachments));
			if (newFiles.length < files.length) {
				toast.warning("Duplicate files were skipped");
			}
			if (newFiles.length > 0) {
				setFieldValue("attachments", [...values.attachments, ...newFiles]);
			}
		},
		fileType: "document",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			maxFiles: 10,
			maxSize: 1024 * 1024 * 5, // 5MB
			minFiles: 1,
		},
	});

	const handleClose = () => {
		setFieldValue("attachments", []);
		setOpen(false);
	};

	const handleDeleteFile = (file: File) => {
		const newAttachments = values.attachments.filter((f: File) => f.name !== file.name);
		setFieldValue("attachments", newAttachments);
	};

	const handleSubmit = () => {
		if (!values.attachments.length) {
			toast.error("Please add at least one file");
			return;
		}
		if (!module.id) {
			toast.error("This module does not exist");
			return;
		}
		mutate({
			module_id: id,
			module: { attachments: values.attachments, sequence: sequence },
		});
	};

	return (
		<div className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
			<DialogTitle>Upload Attachment</DialogTitle>
			<DialogDescription hidden>Upload attachment to this lesson</DialogDescription>
			<label
				htmlFor="file-upload"
				className="relative flex w-full flex-col place-items-center gap-y-3 rounded-lg border border-dashed bg-white p-5"
				draggable
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}>
				<input
					ref={inputRef}
					type="file"
					id="file-upload"
					className="sr-only"
					multiple
					accept="*"
					onChange={handleFileChange}
				/>
				<RiUploadCloud2Line size={18} />
				{isDragging ? (
					<p className="text-xs text-neutral-400">Drop files here</p>
				) : (
					<p className="text-xs text-neutral-400">
						<span className="text-amber-500">Click to upload</span> or drag and drop attachments
						here
					</p>
				)}
				<p className="text-center text-xs text-neutral-300">doc, docx, and pdf</p>
				<div className="relative my-4 h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
				<Button
					onClick={handleClick}
					className="w-[250px]"
					size="sm"
					variant="invert-outline">
					<RiUploadCloud2Line /> Upload Attachment
				</Button>
			</label>
			<div className="w-full space-y-2">
				{values.attachments.map((attachment, index) => (
					<Attachement key={index} attachment={attachment} onDelete={handleDeleteFile} />
				))}
			</div>
			<div className="flex w-full items-center justify-end gap-x-4">
				<Button
					onClick={handleClose}
					className="w-fit"
					size="sm"
					variant="outline"
					disabled={isPending}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					className="w-fit"
					size="sm"
					disabled={isPending || values.attachments.length === 0}>
					{isPending ? <RiLoaderLine className="animate-spin" /> : "Save Uploads"}
				</Button>
			</div>
		</div>
	);
};

const Attachement = ({
	attachment,
	onDelete,
}: {
	attachment: File;
	onDelete: (attachment: File) => void;
}) => {
	return (
		<div className="flex w-full items-center gap-x-4 border-b border-neutral-400 pb-6">
			<div className="flex h-10 flex-1 items-center gap-x-2">
				<div className="size-6 p-1 text-neutral-400">
					<RiFileUploadLine className="size-full" />
				</div>
				<div className="flex flex-1 flex-col">
					<p className="text-sm font-medium text-neutral-600">
						{shortenFileName(attachment.name)}
					</p>
					<div className="flex items-center gap-x-2">
						<p className="text-xs text-neutral-400">
							{format(new Date(), "dd MMM, yyyy HH:mm a")}
						</p>
						<span className="size-1 rounded-full bg-neutral-400"></span>
						<p className="text-xs text-neutral-400">{getFileSize(attachment, "mb")} MB</p>
					</div>
				</div>
			</div>
			<button className="size-[18px] text-neutral-400">
				<RiDeleteBin6Line
					onClick={() => onDelete(attachment)}
					className="size-full text-neutral-400"
				/>
			</button>
		</div>
	);
};
