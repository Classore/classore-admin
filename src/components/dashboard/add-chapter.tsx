import { RiAddLine, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { toast } from "sonner";
import * as Yup from "yup";

import { queryClient } from "@/providers";
import { CreateChapter, type CreateChapterDto } from "@/queries";
import type { HttpError } from "@/types";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { TiptapEditor } from "../ui/tiptap-editor";

interface Props {
	courseId: string;
	sequence: number;
}

export const AddChapter = ({ courseId, sequence }: Props) => {
	const [open, setOpen] = React.useState(false);

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: CreateChapterDto) => CreateChapter(payload),
		mutationKey: ["create-chapter"],
		onSuccess: (data) => {
			toast.success(data.message);
		},
		onError: (error: HttpError) => {
			const message = error.response?.data.message || "Something went wrong";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
			setOpen(false);
			window.location.reload();
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues: {
			content: "",
			images: [],
			name: "",
			sequence,
			subject_id: courseId,
			videos: [],
		},
		validationSchema: Yup.object({
			name: Yup.string().required("Name is required"),
			content: Yup.string().required("Content is required"),
			sequence: Yup.number().required("Sequence is required"),
		}),
		onSubmit: (values) => {
			console.log(values);
			mutateAsync(values);
		},
	});

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200">
					<RiAddLine className="size-4" />
					<span>Add New Chapter</span>
				</button>
			</DialogTrigger>
			<DialogContent className="w-[450px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiAddLine} />
					<div className="mb-5 mt-4">
						<DialogTitle>Add New Chapter</DialogTitle>
						<DialogDescription hidden>Add New Chapter</DialogDescription>
					</div>
					<form onSubmit={handleSubmit} className="w-full space-y-4">
						<Input
							name="name"
							label="Name"
							placeholder="Chapter Name"
							onChange={handleChange}
							error={touched.name && errors.name ? errors.name : ""}
						/>
						<Input label="Sequence" type="number" name="sequence" onChange={handleChange} />
						<div>
							<TiptapEditor
								value={values.content}
								onChange={(value) => setFieldValue("content", value)}
								editorClassName="min-h-[175px]"
							/>
							{errors.content && touched.content && (
								<p className="text-xs text-red-500">{errors.content}</p>
							)}
						</div>
						<div className="flex w-full items-center justify-end">
							<Button className="w-fit" size="sm" type="submit" disabled={isPending}>
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Create Chapter"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
