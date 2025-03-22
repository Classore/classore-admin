import { RiAddLine, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { toast } from "sonner";
import * as Yup from "yup";

import { queryClient } from "@/providers";
import { UpdateChapter, type CreateChapterDto } from "@/queries";
import { useChapterStore } from "@/store/z-store/chapter";
import type { HttpError } from "@/types";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { TiptapEditor } from "../ui/tiptap-editor";

interface Props {
	chapterId: string;
	sequence: number;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditChapter = ({ chapterId, sequence, open, setOpen }: Props) => {
	const chapters = useChapterStore((state) => state.chapters);
	const chapter = chapters.find((chapter) => chapter.id === chapterId);

	const { isPending, mutate } = useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateChapterDto> }) =>
			UpdateChapter(id, payload),
		mutationKey: ["update-chapter"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			setOpen(false);
		},
		onError: (error: HttpError) => {
			const { message } = error.response.data;
			const err = Array.isArray(message) ? message[0] : message;
			toast.error(err);
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues: {
			content: chapter?.content ?? "",
			name: chapter?.name ?? "",
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().required("Name is required"),
			content: Yup.string().required("Content is required"),
		}),
		onSubmit: (values) => {
			// console.log("values", values);
			mutate({
				id: chapterId,
				payload: {
					...values,
					sequence,
				},
			});
		},
	});

	// const handleUpdate = (id: string) => {
	// 	if (!currentChapter) {
	// 		toast.error("Please select a chapter");
	// 		return;
	// 	}

	// 	const chapter = course?.data.chapters.find((chapter) => chapter.id === id);
	// 	if (!chapter) {
	// 		toast.error("Chapter not found");
	// 		return;
	// 	}

	// 	const payload: Partial<CreateChapterDto> = {
	// 		name: values.name,
	// 		content: values.content,
	// 		sequence,
	// 	};

	// 	mutate({
	// 		id,
	// 		payload,
	// 	});
	// };

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogContent className="w-[450px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiAddLine} />
					<div className="mb-5 mt-4">
						<DialogTitle>Edit Chapter</DialogTitle>
						<DialogDescription hidden>Edit Chapter</DialogDescription>
					</div>
					<form onSubmit={handleSubmit} className="w-full space-y-4">
						<Input
							name="name"
							label="Name"
							placeholder="Chapter Name"
							onChange={handleChange}
							value={values.name}
							error={touched.name && errors.name ? errors.name : ""}
						/>
						{/* <Input label="Sequence" type="number" name="sequence" onChange={handleChange} /> */}
						<div>
							<TiptapEditor
								value={values.content}
								onChange={(value) => setFieldValue("content", value)}
								editorClassName="min-h-[175px]"
								initialValue={values.content}
							/>
							{errors.content && touched.content && (
								<p className="text-xs text-red-500">{errors.content}</p>
							)}
						</div>
						<div className="mt-6 flex w-full items-center justify-end gap-x-4">
							<DialogClose asChild>
								<Button className="w-fit" variant="outline">
									Cancel
								</Button>
							</DialogClose>

							<Button className="w-fit" type="submit" disabled={isPending}>
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Update Chapter"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
