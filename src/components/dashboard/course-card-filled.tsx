import { RiLink, RiUploadCloud2Line } from "@remixicon/react";
import React from "react";

import { useDragAndDrop, useFileHandler } from "@/hooks";
import type { CreateChapterDto } from "@/queries";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

interface CourseCardProps {
	chapter: CreateChapterDto;
	index: number;
}

export const CourseCardFilled = ({ chapter, index }: CourseCardProps) => {
	const {
		files,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		isDragging,
	} = useDragAndDrop();

	const handleFiles = (files: File[]) => {
		console.log(files);
	};

	const { handleFileChange, inputRef } = useFileHandler({
		onFilesChange: (files) => {
			handleFiles(files);
		},
		onSuccess: () => {},
	});

	React.useEffect(() => {
		if (files) {
			handleFiles(files);
		}
	}, [files]);

	return (
		<div className="w-full space-y-4">
			<div className="space-y-2">
				<p className="text-xs font-medium text-neutral-500">CHAPTER {index}</p>
				<h5
					className={`text-lg font-medium ${chapter.name ? "text-black" : "text-neutral-300"}`}>
					{chapter.name || "Input title 'e.g. Introduction to Algebra'"}
				</h5>
			</div>
			<label
				htmlFor="video-upload"
				className="grid w-full place-items-center rounded-lg bg-white py-8"
				draggable
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}>
				<input
					ref={inputRef}
					type="file"
					className="sr-only hidden"
					id="video-upload"
					onChange={handleFileChange}
					accept="video/*"
					multiple={false}
				/>
				<div className="flex w-1/2 flex-col items-center gap-y-3 p-5">
					<RiUploadCloud2Line size={18} />
					{isDragging ? (
						<p className="text-xs text-neutral-400">Drop files here</p>
					) : (
						<p className="text-xs text-neutral-400">
							<span className="text-amber-500">Click to upload</span> or drag and drop video
						</p>
					)}
					<p className="text-center text-xs text-neutral-300">
						mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
					</p>
					<div className="relative my-4 h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
					<div className="flex items-center justify-center gap-x-4">
						<Button className="w-fit" size="sm" variant="invert-outline">
							<RiUploadCloud2Line /> Upload Video
						</Button>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="w-fit" size="sm" variant="invert-outline">
									<RiLink /> Paste URL
								</Button>
							</DialogTrigger>
							<DialogContent className="w-[400px]">
								<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
									<IconLabel icon={RiLink} />
									<div className="my-4 space-y-4">
										<DialogTitle>Paste Video Link</DialogTitle>
										<DialogDescription>
											Videos will be automatically be imported from the pasted link source
										</DialogDescription>
									</div>
								</div>
								<div className="flex w-full items-center justify-end gap-x-4">
									<Button className="w-fit" size="sm" variant="outline">
										Cancel
									</Button>
									<Button className="w-fit" size="sm">
										import Video Link
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</label>
		</div>
	);
};
