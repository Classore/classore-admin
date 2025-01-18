import { RiInformationLine, RiLink, RiUploadCloud2Line } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";

import type { ChapterProps, ChapterModuleProps, MakeOptional } from "@/types";
import { useFileHandler } from "@/hooks";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;
type Chapter = MakeOptional<ChapterProps, "createdOn">;

interface CourseCardProps {
	chapter: Chapter;
	index: number;
	module: ChapterModule | null;
}

export const ModuleCard = ({ chapter, module }: CourseCardProps) => {
	const [open, setOpen] = React.useState(false);

	const handleFiles = (file: File) => {
		if (!module?.id) {
			toast.error("Chapter ID is required");
			return;
		}
		console.log(file);
	};

	const {
		handleClick,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleDragEnter,
		handleFileChange,
		inputRef,
		isDragging,
	} = useFileHandler({
		onValueChange: (files) => {
			handleFiles(files[0]);
		},
		fileType: "video",
		validationRules: {
			allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
			maxSize: 300000000, // 300MB
			maxFiles: 1,
			minFiles: 1,
		},
		onError: (error) => {
			toast.error(error);
		},
	});

	return (
		<div className="w-full space-y-4">
			<div className="space-y-2">
				<p className="text-xs font-medium text-neutral-500">CHAPTER {chapter.sequence + 1}</p>
				<h5
					className={`text-lg font-medium capitalize ${module?.title ? "text-black" : "text-neutral-300"}`}>
					{chapter.name}: {module?.title || "Input title 'e.g. Introduction to Algebra'"}
				</h5>
			</div>
			<label
				htmlFor="video-upload"
				className="grid w-full place-items-center rounded-lg bg-white py-8 transition-all duration-500 hover:drop-shadow-xl"
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
					<div className="grid size-10 place-items-center">
						<RiUploadCloud2Line size={20} />
					</div>
					{isDragging ? (
						<p className="text-xs text-neutral-400">Drop files here</p>
					) : (
						<p className="text-xs text-neutral-400">
							<button onClick={handleClick} className="text-amber-500">
								Click to upload
							</button>{" "}
							or drag and drop video
						</p>
					)}
					<p className="text-center text-xs text-neutral-300">
						mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
					</p>
					<div className="relative my-4 h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
					<div className="flex items-center justify-center gap-x-4">
						<Button onClick={handleClick} className="w-fit" size="sm" variant="invert-outline">
							<RiUploadCloud2Line size={14} /> Upload Video
						</Button>
						<PasteLink open={open} setOpen={setOpen} />
					</div>
				</div>
			</label>
		</div>
	);
};

const PasteLink = ({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) => {
	const [link, setLink] = React.useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!link) {
			toast.error("Please enter a link");
			return;
		}
		console.log(link);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-fit" size="sm" variant="invert-outline">
					<RiLink /> Paste URL
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<form
					onSubmit={handleSubmit}
					className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiLink} />
					<div className="my-4 flex flex-col gap-y-4">
						<DialogTitle>Paste Video Link</DialogTitle>
						<div className="space-y-2">
							<div className="flex h-10 w-full items-center rounded-lg border border-neutral-300">
								<div className="flex h-full w-fit items-center rounded-l-lg border-r border-neutral-300 bg-neutral-100 px-3">
									<span className="text-sm font-medium text-neutral-500">https://</span>
								</div>
								<input
									type="text"
									value={link}
									onChange={(e) => setLink(e.target.value)}
									className="h-full flex-1 rounded-r-lg border-none bg-transparent px-3 text-sm outline-none transition-all duration-500 placeholder:text-neutral-400 focus:ring-primary-400"
									placeholder="drive.google.com/file/d/1abcdef12345GHIJKL67890/view?usp=sharing"
								/>
							</div>
							<div className="flex items-start gap-x-2 text-neutral-400">
								<RiInformationLine size={22} />
								<DialogDescription>
									Videos will be automatically be imported from the pasted link source
								</DialogDescription>
							</div>
						</div>
					</div>
					<hr />
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							type="button"
							onClick={() => setOpen(false)}
							className="w-fit"
							size="sm"
							variant="outline">
							Cancel
						</Button>
						<Button type="submit" className="w-fit" size="sm">
							Import Video Link
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
