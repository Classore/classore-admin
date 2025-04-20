import { RiLoaderLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { toast } from "sonner";
import * as Yup from "yup";

import {
	type DuplicateResourceDto,
	DuplicateResource,
	GetBundles,
	GetExaminations,
} from "@/queries";
import type { HttpError } from "@/types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";

interface Props {
	courseId: string;
}

export const DuplicateCourse = ({ courseId }: Props) => {
	const [open, setOpen] = React.useState(false);

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: DuplicateResourceDto) => DuplicateResource(payload),
		mutationKey: ["duplicate-course", courseId],
		onSuccess: () => {
			toast.success("Course duplicated successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response.data.message)
				? error.response.data.message[0]
				: error.response.data.message;
			const message = errorMessage || "Something went wrong";
			toast.error(message);
		},
		onSettled: () => {
			setOpen(false);
		},
	});

	const { errors, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues: {
			course_id: courseId,
			examination: "",
			bundle: "",
			is_chapters: false,
			is_modules: false,
			is_options: false,
			is_questions: false,
			subject_id: courseId,
		},
		validationSchema: Yup.object({
			examination: Yup.string().required("Category is required"),
			bundle: Yup.string().required("Subcategory is required"),
			is_chapters: Yup.boolean(),
			is_modules: Yup.boolean(),
			is_options: Yup.boolean(),
			is_questions: Yup.boolean(),
		}),
		onSubmit: (values) => {
			if (!values.is_chapters && !values.is_modules && !values.is_options && !values.is_questions) {
				toast.error("Please select at least one option");
				return;
			}
			const payload: DuplicateResourceDto = {
				exam_bundle_id: values.bundle,
				is_chapters: values.is_chapters ? "YES" : "NO",
				is_modules: values.is_modules ? "YES" : "NO",
				is_options: values.is_options ? "YES" : "NO",
				is_questions: values.is_questions ? "YES" : "NO",
				subject_id: values.subject_id,
			};
			mutateAsync(payload);
		},
	});

	const { data: exams } = useQuery({
		queryKey: ["get-exams"],
		queryFn: () => GetExaminations(),
	});

	const { data: bundles } = useQuery({
		queryKey: ["get-bundles", values.examination],
		queryFn: () => GetBundles({ examination: values.examination }),
		enabled: !!values.examination,
	});

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" onClick={() => setOpen(true)} className="w-fit">
					Duplicate Course
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px]">
				<DialogTitle>Duplicate Course</DialogTitle>
				<DialogDescription>
					This course will be duplicated and added to the selected course.
				</DialogDescription>
				<form onSubmit={handleSubmit} className="w-full space-y-4">
					<div className="space-y-0.5">
						<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="role">
							New Examination
						</label>
						<Select name="examination" onValueChange={(value) => setFieldValue("examination", value)}>
							<SelectTrigger className="h-[42px] capitalize">
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{exams?.data?.data?.map((exam) => (
									<SelectItem key={exam.examination_id} value={exam.examination_id}>
										{exam.examination_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.examination && touched.examination && (
							<p className="text-xs text-red-500">{errors.examination}</p>
						)}
					</div>
					<div className="space-y-0.5">
						<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="role">
							New Bundle
						</label>
						<Select name="bundle" onValueChange={(value) => setFieldValue("bundle", value)}>
							<SelectTrigger className="h-[42px] capitalize">
								<SelectValue placeholder="select subcategory" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{bundles?.data?.data?.map((bundle) => (
									<SelectItem key={bundle.examinationbundle_id} value={bundle.examinationbundle_id}>
										{bundle.examinationbundle_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.bundle && touched.bundle && <p className="text-xs text-red-500">{errors.bundle}</p>}
					</div>
					<div className="flex w-full items-center justify-between">
						<label className="text-xs text-neutral-400" htmlFor="is_chapters">
							Copy Chapters
						</label>
						<Switch
							checked={values.is_chapters}
							onCheckedChange={(value) => setFieldValue("is_chapters", value)}
						/>
					</div>
					<div className="flex w-full items-center justify-between">
						<label className="text-xs text-neutral-400" htmlFor="is_modules">
							Copy Modules
						</label>
						<Switch
							checked={values.is_modules}
							onCheckedChange={(value) => setFieldValue("is_modules", value)}
						/>
					</div>
					<div className="flex w-full items-center justify-between">
						<label className="text-xs text-neutral-400" htmlFor="is_questions">
							Copy Questions
						</label>
						<Switch
							checked={values.is_questions}
							onCheckedChange={(value) => setFieldValue("is_questions", value)}
						/>
					</div>
					<div className="flex w-full items-center justify-between">
						<label className="text-xs text-neutral-400" htmlFor="is_options">
							Copy Options
						</label>
						<Switch
							checked={values.is_options}
							onCheckedChange={(value) => setFieldValue("is_options", value)}
						/>
					</div>
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							className="w-fit"
							size="sm"
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}>
							Cancel
						</Button>
						<Button className="w-fit" size="sm" type="submit" disabled={isPending}>
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Duplicate"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
