import { useMutation, useQuery } from "@tanstack/react-query";
import { RiLoaderLine } from "@remixicon/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { GetExaminations, GetBundles } from "@/queries";
import { Button } from "../ui/button";

interface Props {
	chapterId: string;
	courseId: string;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export const DuplicateCourse = ({ chapterId, courseId, onOpenChange, open }: Props) => {
	const { isPending } = useMutation({
		mutationKey: ["duplicate-course", chapterId, courseId],
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const { errors, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues: {
			chapter_id: chapterId,
			course_id: courseId,
			examination: "",
			bundle: "",
		},
		validationSchema: Yup.object({
			examination: Yup.string().required("Category is required"),
			bundle: Yup.string().required("Subcategory is required"),
		}),
		onSubmit: (values) => {
			console.log(values);
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
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="w-[400px]">
				<DialogTitle>Duplicate Course</DialogTitle>
				<DialogDescription>
					This course will be duplicated and added to the selected course.
				</DialogDescription>
				<form onSubmit={handleSubmit} className="w-full space-y-4">
					<div className="space-y-1.5">
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
					<div className="space-y-1.5">
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
					<Button type="submit">
						{isPending ? <RiLoaderLine className="animate-spin" /> : "Duplicate"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
