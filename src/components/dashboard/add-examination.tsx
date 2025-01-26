import { RiAddLine, RiBookMarkedLine, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";

import type { CreateExaminationDto } from "@/queries";
import { CreateExamination } from "@/queries";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import { Input } from "../ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export const AddExamination = ({ onOpenChange, open }: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: (data: CreateExaminationDto) => CreateExamination(data),
		onSuccess: () => {
			console.log("Examination type created successfully");
			onOpenChange(false);
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const { errors, handleChange, handleSubmit, touched } = useFormik({
		initialValues: { name: "" },
		validateOnChange: true,
		validationSchema: Yup.object({
			name: Yup.string().required("Examination name is required"),
		}),
		onSubmit: (values: CreateExaminationDto) => {
			mutate(values);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="w-fit" onClick={() => onOpenChange(true)} size="sm">
					<RiAddLine /> Add New Category
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<div className="space-y-5">
						<IconLabel icon={RiBookMarkedLine} />
						<DialogTitle>Add New Category</DialogTitle>
						<DialogDescription hidden>Add Category</DialogDescription>
						<form onSubmit={handleSubmit} className="w-full space-y-4">
							<Input
								label="Category Name"
								placeholder="National Examination"
								className="col-span-full"
								name="name"
								onChange={handleChange}
								error={touched.name && errors.name ? errors.name : ""}
							/>
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Create Category"}
							</Button>
						</form>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
