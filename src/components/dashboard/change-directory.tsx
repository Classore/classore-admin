import { useMutation, useQueries } from "@tanstack/react-query";
import { RiBookLine } from "@remixicon/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";

import type { BundlesResponse, ExaminationResponse } from "@/queries";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { GetExaminations, GetBundles } from "@/queries";
import type { ChangeDirectoryDto } from "@/queries";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface Props {
	courseId: string;
	currentCategory: string;
	currentSubcategory: string;
	onOpenChange: (open: boolean) => void;
}

export const ChangeDirectory = ({
	courseId,
	currentCategory,
	currentSubcategory,
	onOpenChange,
}: Props) => {
	const {} = useMutation({});

	const initialValues: ChangeDirectoryDto = {
		examination: currentCategory,
		bundle: currentSubcategory,
		subject: courseId,
	};

	const { errors, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues,
		validateOnChange: true,
		validationSchema: Yup.object({
			examination: Yup.string().required("Examination is required"),
			bundle: Yup.string().required("Bundle is required"),
			subject: Yup.string().required("Subject is required"),
		}),
		onSubmit: (values) => {
			console.log(values);
		},
	});

	const [{ data: exams }, { data: bundles }] = useQueries({
		queries: [
			{
				queryKey: ["get-exams"],
				queryFn: () => GetExaminations({ limit: 10 }),
				select: (data: ExaminationResponse) => ({
					examinations: data.data.data,
					meta: {
						itemCount: data.data.meta.itemCount,
						page: data.data.meta.page,
						pageCount: data.data.meta.pageCount,
						take: data.data.meta.take,
					},
				}),
			},
			{
				queryKey: ["get-bundles", values.examination],
				queryFn: () => GetBundles({ limit: 50, examination: values.examination }),
				enabled: !!values.examination,
				select: (data: BundlesResponse) => data.data.data,
			},
		],
	});

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiBookLine} />
			<DialogTitle className="mb-4">Change Course Directory</DialogTitle>
			<DialogDescription hidden>Change Course Directory</DialogDescription>
			<div>
				<label
					className="text-xs text-neutral-400 dark:text-neutral-50"
					htmlFor="examination">
					Select Category
				</label>
				<Select
					value={values.examination}
					onValueChange={(value) => setFieldValue("examination", value)}>
					<SelectTrigger className="capitalize">
						<SelectValue placeholder="Select Category" />
					</SelectTrigger>
					<SelectContent className="capitalize">
						{exams?.examinations.map((exam) => (
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
			<div>
				<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="bundle">
					Select Subcategory
				</label>
				<Select
					value={values.bundle}
					onValueChange={(value) => setFieldValue("bundle", value)}>
					<SelectTrigger className="uppercase">
						<SelectValue placeholder="Select Subategory" />
					</SelectTrigger>
					<SelectContent className="">
						{bundles?.map((bundle) => (
							<SelectItem key={bundle.examinationbundle_id} value={bundle.examinationbundle_id}>
								{bundle.examinationbundle_name.toUpperCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.bundle && touched.bundle && (
					<p className="text-xs text-red-500">{errors.bundle}</p>
				)}
			</div>
			<div className="flex w-full items-center justify-end gap-x-4">
				<Button
					className="w-fit"
					size="sm"
					type="button"
					onClick={() => onOpenChange(false)}
					variant="outline">
					Cancel
				</Button>
				<Button className="w-fit" size="sm" type="submit">
					Change Directory
				</Button>
			</div>
		</form>
	);
};
