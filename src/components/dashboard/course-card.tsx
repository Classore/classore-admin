import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiArrowDownLine,
	RiArrowUpLine,
	RiDeleteBin6Line,
	RiFileCopyLine,
	RiFolderVideoLine,
	RiLoaderLine,
} from "@remixicon/react";

import { CreateChapter, DeleteChapter, type CreateChapterDto } from "@/queries";
import type { ChapterModuleProps, ChapterProps, MakeOptional } from "@/types";
import { IsHttpError, httpErrorhandler } from "@/lib";
import { ChapterModule } from "./chapter-module";
import { queryClient } from "@/providers";
import { Button } from "../ui/button";
import { useDrag } from "@/hooks";

type Chapter = MakeOptional<ChapterProps, "createdOn">;
type ChapterModule = MakeOptional<ChapterModuleProps, "createdOn">;

interface CardProps {
	addChapter: () => void;
	chapter: Chapter;
	existingModules: ChapterModule[];
	index: number;
	isSelected: boolean;
	onDelete: (chapter: Chapter) => void;
	onDuplicate: (sequence: number) => void;
	onMove: (sequence: number, direction: "up" | "down") => void;
	onSelectChapter: (index: number) => void;
	onSelectModule: (module: ChapterModule) => void;
	subjectId: string;
}

const course_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

export const CourseCard = ({
	addChapter,
	chapter,
	existingModules,
	index,
	isSelected,
	onDelete,
	onDuplicate,
	onMove,
	onSelectChapter,
	onSelectModule,
	subjectId,
}: CardProps) => {
	const [sequence, setSequence] = React.useState(() => {
		return existingModules.length > 0 ? existingModules.length - 1 : 0;
	});
	const [modules, setModules] = React.useState<ChapterModule[]>(() => {
		const initialModules = existingModules?.map((module) => ({
			...module,
			sequence: index,
			chapter: chapter.id,
		}));

		initialModules?.push({
			attachments: [],
			chapter: chapter.id,
			id: "",
			content: "",
			images: [],
			sequence: initialModules.length,
			title: "",
			tutor: null,
			videos: [],
		});

		return initialModules;
	});

	const { getDragProps } = useDrag({
		items: modules,
		onReorder: setModules,
	});

	const initialValues: CreateChapterDto = {
		content: "",
		images: [],
		name: "",
		sequence: 0,
		subject_id: subjectId,
		videos: [],
	};

	const addNewModule = () => {
		setModules((prev) => {
			const newModule: ChapterModule = {
				attachments: [],
				chapter: chapter.id,
				content: "",
				id: "",
				images: [],
				sequence: prev.length,
				title: "",
				tutor: null,
				videos: [],
			};
			return [...prev, newModule];
		});
	};

	const deleteModule = (module: ChapterModule) => {
		if (modules.length === 1) {
			toast.error("Cannot delete the last module");
			return;
		}

		setModules((prev) => {
			const newModules = prev
				.filter((md) => md.sequence !== module.sequence)
				.map((md, idx) => ({
					...md,
					sequence: idx,
				}));
			return newModules;
		});

		if (sequence >= modules.length - 1) {
			setSequence(Math.max(0, sequence - 1));
		}
	};

	const { isPending: isCreating, mutate: create } = useMutation({
		mutationFn: (payload: CreateChapterDto) => CreateChapter(payload),
		mutationKey: ["create-chapter"],
		onSuccess: () => {
			toast.success("Chapter created successfully");
			queryClient.invalidateQueries({ queryKey: ["get-subject"] }).then(() => addChapter());
		},
		onError: (error) => {
			const isHttpError = IsHttpError(error);
			if (isHttpError) {
				const { message } = httpErrorhandler(error);
				toast.error(message);
				return;
			} else {
				toast.error("Something went wrong");
			}
		},
	});

	const { isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => DeleteChapter(id),
		mutationKey: ["delete-chapter"],
		onSuccess: () => {
			toast.success("Chapter deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
		},
		onError: (error) => {
			const isHttpError = IsHttpError(error);
			if (isHttpError) {
				const { message } = httpErrorhandler(error);
				toast.error(message);
				return;
			} else {
				toast.error("Something went wrong");
			}
		},
	});

	const handleCourseAction = (label: string) => {
		switch (label) {
			case "up":
				onMove(chapter.sequence, "up");
				break;
			case "down":
				onMove(chapter.sequence, "down");
				break;
			case "duplicate":
				onDuplicate(chapter.sequence);
				break;
			case "delete":
				onDelete(chapter);
				break;
		}
	};

	const { handleChange, handleSubmit, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			if (!values.subject_id) {
				toast.error("Cannot find Subject ID");
				return;
			}
			if (!values.name || !values.content) {
				toast.error("Please fill all fields");
				return;
			}
			create(values);
		},
	});

	return (
		<div
			onClick={() => onSelectChapter(index)}
			className={`w-full rounded-lg border bg-white transition-all duration-500 ${isSelected ? "border-primary-500" : "border-transparent"}`}>
			<div className="flex w-full items-center justify-between rounded-t-lg border-b px-4 py-3">
				<p className="text-xs font-medium text-neutral-400">CHAPTER {index + 1}</p>
				<div className="flex items-center">
					{course_actions.map(({ icon: Icon, label }, i) => (
						<button
							key={i}
							onClick={() => handleCourseAction(label)}
							disabled={isCreating || isDeleting}
							className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
							<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
						</button>
					))}
				</div>
			</div>
			<div className="flex w-full flex-col items-center space-y-3 px-4 py-5">
				<form onSubmit={handleSubmit} className="w-full space-y-2">
					<div className="w-full rounded-lg border">
						<div className="flex h-10 w-full items-center gap-x-1.5 px-3 py-2.5">
							<RiFolderVideoLine className="size-5 text-neutral-400" />
							<input
								type="text"
								name="name"
								defaultValue={chapter.name}
								onChange={handleChange}
								className="h-full w-full border-0 p-0 text-sm outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0"
								placeholder="Input title 'e.g. Introduction to Algebra'"
							/>
						</div>
						<hr />
						<div className="flex h-32 w-full items-center px-3 py-2.5">
							<textarea
								name="content"
								defaultValue={chapter.content}
								onChange={handleChange}
								className="h-full w-full resize-none border-0 p-0 text-xs outline-0 ring-0 focus:border-0 focus:outline-0 focus:ring-0"
								placeholder="Chapter Summary"
							/>
						</div>
					</div>
					{values.name && values.content && (
						<button
							type="submit"
							disabled={isCreating}
							className="rounded-lg bg-primary-400 px-3 py-1.5 text-sm text-white">
							{isCreating ? <RiLoaderLine className="size-4 animate-spin" /> : "Add Chapter"}
						</button>
					)}
				</form>
				<div className="w-full space-y-1.5">
					{modules.map((module, index) => (
						<ChapterModule
							{...getDragProps(index)}
							key={module.sequence}
							chapter_id={chapter.id}
							index={index}
							isSelectedChapter={isSelected}
							module={module}
							onDelete={deleteModule}
							onSelectModule={onSelectModule}
						/>
					))}
				</div>
				<Button
					onClick={addNewModule}
					className="max-w-[250px]"
					size="sm"
					variant="invert-outline">
					<RiAddLine size={16} />
					Add New Lesson
				</Button>
			</div>
		</div>
	);
};
