import { useMutation, useQueries } from "@tanstack/react-query";
import { RiCameraLine } from "@remixicon/react";
import { useFormik } from "formik";
import { addDays } from "date-fns";
import { DatePicker } from "antd";
import Image from "next/image";
import { toast } from "sonner";
import dayjs from "dayjs";
import * as Yup from "yup";
import React from "react";

import type { BundleResponse, CreateBundleDto, ExaminationResponse } from "@/queries";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { GetBundle, GetExaminations } from "@/queries";
import { processImageToBase64 } from "@/lib";
import { useFileHandler } from "@/hooks";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

import "dayjs/locale/en-gb";
dayjs.locale("en-gb");

interface Props {
	id: string;
	onOpenChange: (open: boolean) => void;
}

export const EditSubcategory = ({ id, onOpenChange }: Props) => {
	const [previewUrl, setPreviewUrl] = React.useState("");
	const {} = useMutation({});

	const [{ data }, {}] = useQueries({
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
				queryKey: ["get-bundle", id],
				queryFn: () => GetBundle(id),
				enabled: !!id,
				select: (data: BundleResponse) => ({
					bundle: data.data.examBundle,
				}),
			},
		],
	});

	const initialValues: Partial<CreateBundleDto> = {
		allow_extra_subjects: "NO",
		allowed_subjects: 0,
		amount: 0,
		amount_per_subject: 0,
		cover_image: null,
		end_date: addDays(new Date(), 1),
		examination: "",
		extra_charge: 0,
		max_subjects: 0,
		name: "",
		start_date: new Date(),
	};

	const { handleClick, handleFileChange, inputRef } = useFileHandler({
		onValueChange: (files) => {
			processImageToBase64(files[0]).then((base64) => {
				setPreviewUrl(base64);
			});
			setFieldValue("cover_image", files[0]);
		},
		fileType: "image",
		validationRules: {
			allowedTypes: ["image/png", "image/jpeg", "image/jpg"],
			maxSize: 1024 * 1024 * 2,
			maxFiles: 1,
			minFiles: 1,
		},
		onError: (error) => {
			toast.error(error);
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik(
		{
			initialValues,
			validateOnChange: true,
			validationSchema: Yup.object({
				allow_extra_subjects: Yup.string()
					.required("Allow Extra Subjects is required")
					.oneOf(["YES", "NO"], "Please select an option"),
				allowed_subjects: Yup.number()
					.required("Allowed Subjects is required")
					.min(1, "Allowed Subjects must be at least 1"),
				amount: Yup.number()
					.required("Amount is required")
					.min(1, "Amount must be at least 1"),
				amount_per_subject: Yup.number()
					.required("Amount Per Subject is required")
					.min(1, "Amount Per Subject must be at least 1"),
				end_date: Yup.string().required("End Date is required"),
				examination: Yup.string().required("Examination is required"),
				extra_charge: Yup.number().when("allow_extra_subjects", ([value]) => {
					return value === "YES"
						? Yup.number()
								.required("Extra Charge is required")
								.min(1, "Extra Charge must be at least 1")
						: Yup.number().notRequired();
				}),
				max_subjects: Yup.number()
					.required("Max Subjects is required")
					.min(1, "Max Subjects must be at least 1"),
				name: Yup.string().required("Name is required"),
			}),
			onSubmit: () => {},
		}
	);

	return (
		<form
			onSubmit={handleSubmit}
			className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<DialogTitle className="my-4">Edit Subcategory</DialogTitle>
			<DialogDescription hidden>Edit Subcategory</DialogDescription>
			<div className="space-y-2">
				<div className="relative h-[160px] w-full rounded-md bg-gradient-to-r from-[#6f42c1]/20 to-[#f67f36]/15">
					{values.cover_image ? (
						<Image
							src={previewUrl}
							alt={values.cover_image.name}
							fill
							sizes="100%"
							className="rounded-md object-cover object-center"
						/>
					) : null}
					<input
						ref={inputRef}
						type="file"
						name="image"
						id="image"
						className="sr-only hidden"
						onChange={handleFileChange}
					/>
					<button
						type="button"
						onClick={handleClick}
						className="absolute bottom-2 right-2 flex items-center gap-x-1 rounded bg-white px-2 py-1 text-xs">
						<RiCameraLine className="size-3" /> Update cover image
					</button>
				</div>
				<Input
					label="Subcategory Name"
					placeholder="IELTS"
					className="col-span-full"
					name="name"
					onChange={handleChange}
					error={touched.name && errors.name ? errors.name : ""}
				/>
				<Input
					label="Amount"
					type="number"
					name="amount"
					onChange={handleChange}
					error={errors.amount && touched.amount ? errors.amount : ""}
				/>
				<div className="grid w-full grid-cols-2 gap-x-4">
					<Input
						label="Amount per Subject"
						type="number"
						name="amount_per_subject"
						onChange={handleChange}
						error={
							errors.amount_per_subject && touched.amount_per_subject
								? errors.amount_per_subject
								: ""
						}
					/>
					<Input
						label="Extra Charge"
						type="number"
						name="extra_charge"
						onChange={handleChange}
						error={errors.extra_charge && touched.extra_charge ? errors.extra_charge : ""}
					/>
				</div>
				<div className="grid w-full grid-cols-2 gap-x-4">
					<div>
						<label
							className="text-xs text-neutral-400 dark:text-neutral-50"
							htmlFor="examination">
							Select Examination
						</label>
						<Select
							value={values.examination}
							onValueChange={(value) => setFieldValue("examination", value)}>
							<SelectTrigger className="capitalize">
								<SelectValue placeholder="Select Examination" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{data?.examinations.map((exam) => (
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
						<label
							className="text-xs text-neutral-400 dark:text-neutral-50"
							htmlFor="allow_extra_subjects">
							Allow Extra Subject
						</label>
						<Select
							value={values.allow_extra_subjects}
							onValueChange={(value) => setFieldValue("allow_extra_subjects", value)}>
							<SelectTrigger className="capitalize">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="capitalize">
								<SelectItem value="YES">YES</SelectItem>
								<SelectItem value="NO">NO</SelectItem>
							</SelectContent>
						</Select>
						{errors.allow_extra_subjects && touched.allow_extra_subjects && (
							<p className="text-xs text-red-500">{errors.allow_extra_subjects}</p>
						)}
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-x-4">
					<div>
						<label
							className="text-xs text-neutral-400 dark:text-neutral-50"
							htmlFor="start_date">
							Start Date
						</label>
						<DatePicker
							value={dayjs(values.start_date)}
							onChange={(date) =>
								setFieldValue("start_date", date ? new Date(date.toDate()) : new Date())
							}
							className="h-10 w-full font-body font-medium focus-within:border-primary-400 hover:border-primary-400"
							format="DD/MM/YYYY"
						/>
					</div>
					<div>
						<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="end_date">
							End Date
						</label>
						<DatePicker
							value={dayjs(values.end_date)}
							onChange={(date) =>
								setFieldValue("end_date", date ? new Date(date.toDate()) : addDays(new Date(), 1))
							}
							className="h-10 w-full font-body font-medium focus-within:border-primary-400 hover:border-primary-400"
							format="DD/MM/YYYY"
							minDate={dayjs(new Date(values.start_date ?? new Date())).add(1, "day")}
						/>
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-x-4">
					<Input
						type="number"
						name="allowed_subjects"
						label="Allowed Subjects"
						onChange={handleChange}
						error={
							errors.allowed_subjects && touched.allowed_subjects ? errors.allowed_subjects : ""
						}
					/>
					<Input
						type="number"
						name="max_subjects"
						label="Maximum Number of Subjects"
						onChange={handleChange}
						error={errors.max_subjects && touched.max_subjects ? errors.max_subjects : ""}
					/>
				</div>
			</div>
			<div className="mt-6 flex w-full items-center justify-end gap-x-4">
				<Button
					type="button"
					onClick={() => onOpenChange(false)}
					className="w-fit"
					variant="outline">
					Discard Changes
				</Button>
				<Button type="submit" className="w-fit">
					Update Changes
				</Button>
			</div>
		</form>
	);
};
