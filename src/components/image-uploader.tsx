import { RiCameraLine, RiDeleteBin6Line, RiLoopLeftLine } from "@remixicon/react";
import Image from "next/image";
import { toast } from "sonner";
import React from "react";

import { DEFAULT_MIME_TYPES, type FileType, useFileHandler } from "@/hooks";
import { cn } from "@/lib";

interface Props {
	fileType: FileType;
	onValueChange: (value: File | string) => void;
	value: File | string | null;
	className?: string;
}

export const ImageUploader = ({ fileType, onValueChange, value, className }: Props) => {
	const allowedTypes = React.useMemo(() => DEFAULT_MIME_TYPES[fileType], [fileType]);

	const { handleClick, handleFileChange, handleRemoveFile, inputRef } = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			onValueChange(file);
		},
		fileType,
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes,
			maxFiles: 1,
			maxSize: 1024 * 1024 * 2, // 2MB
			minFiles: 1,
		},
	});

	return (
		<div className={cn("aspect-video w-full rounded-lg border", className)}>
			{!value ? (
				<div className="relative size-full rounded-lg bg-gradient-to-br from-primary-100 to-secondary-200">
					<label htmlFor="image-upload">
						<input
							type="file"
							id="image-upload"
							className="sr-only hidden"
							ref={inputRef}
							onChange={handleFileChange}
						/>
						<button
							type="button"
							onClick={handleClick}
							className="absolute bottom-2 right-2 flex items-center gap-x-1 rounded-sm bg-white px-2 py-0.5 text-xs font-medium">
							<RiCameraLine className="size-4" /> Upload Image
						</button>
					</label>
				</div>
			) : (
				<div className="relative size-full rounded-lg">
					<Image
						src={typeof value === "string" ? value : URL.createObjectURL(value)}
						alt="Image"
						fill
						sizes="100%"
						className="rounded-lg object-cover"
					/>
					{value === "string" ? (
						<label htmlFor="image-upload">
							<input
								type="file"
								id="image-upload"
								className="sr-only hidden"
								ref={inputRef}
								onChange={handleFileChange}
							/>
							<button
								type="button"
								className="absolute bottom-2 right-2 flex items-center gap-x-1 rounded-sm bg-white px-2 py-0.5 text-xs font-medium">
								<RiLoopLeftLine className="size-4" />
							</button>
						</label>
					) : (
						<button
							type="button"
							onClick={() => handleRemoveFile(value as File)}
							className="absolute bottom-2 right-2 flex items-center gap-x-1 rounded-sm bg-white px-2 py-0.5 text-xs font-medium text-red-500">
							<RiDeleteBin6Line className="size-4" />
						</button>
					)}
				</div>
			)}
		</div>
	);
};
