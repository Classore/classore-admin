import { useMutation, useQueries } from "@tanstack/react-query";
import { RiCalendar2Line, RiLoaderLine } from "@remixicon/react";
import { useFormik } from "formik";
import { format } from "date-fns";
import { DatePicker } from "antd";
import * as Yup from "yup";
import React from "react";
import dayjs from "dayjs";

import { type CreateEventDto, CreateCalendarEvent } from "@/queries/calendar";
import { GetBundles, GetExaminations, GetSubjects } from "@/queries";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { queryClient } from "@/providers";
import { times } from "@/config";
import type { CourseResponse, ExaminationBundleResponse, ExaminationResponse } from "@/queries";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import "dayjs/locale/en-gb";
import { toast } from "sonner";
dayjs.locale("en-gb");

interface Props {
	onClose: () => void;
	open: boolean;
}

const event_frequency = ["once", "daily", "weekly", "biweekly", "monthly"];

const initialValues: CreateEventDto = {
	category_id: "",
	date: new Date(),
	end_hour: 0,
	event_day: 1,
	frequency: "",
	start_hour: 0,
	sub_category: "",
	subject: "",
	title: "",
};

export const Event = ({ onClose }: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateEventDto) => CreateCalendarEvent(payload),
		mutationKey: ["create-event"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-events"] }).then(() => {
				resetForm();
				onClose();
			});
		},
	});

	const { errors, handleChange, handleSubmit, resetForm, setFieldValue, values, touched } =
		useFormik({
			initialValues,
			validationSchema: Yup.object().shape({
				category_id: Yup.string().required("Examination type is required"),
				date: Yup.date()
					.min(new Date(), "Event date cannot be today")
					.required("Event date is required"),
				end_hour: Yup.number().required("End time is required"),
				event_day: Yup.number()
					.min(1, "Event requires minimum of one day")
					.required("number of event days is required"),
				frequency: Yup.string().required("Frequency is required"),
				start_hour: Yup.number().required("Start time is required"),
				sub_category: Yup.string().required("Examination bundle is required"),
				subject: Yup.string().required("Subject is required"),
				title: Yup.string().required("Event title is required"),
			}),
			onSubmit: (values) => {
				const payload = {
					...values,
					start_hour: Number(values.start_hour),
					end_hour: Number(values.end_hour),
					date: format(values.date, "MM/dd/yyyy"),
				};
				mutate(payload);
			},
		});

	const [{ data: examinations }, { data: bundles }, { data: subjects }] = useQueries({
		queries: [
			{
				queryKey: ["examinations"],
				queryFn: () => GetExaminations(),
				select: (data: unknown) => (data as ExaminationResponse).data.data,
			},
			{
				queryKey: ["bundles", values.category_id],
				queryFn: () => GetBundles({ examination: values.category_id }),
				enabled: !!values.category_id,
				select: (data: unknown) => (data as ExaminationBundleResponse).data.data,
			},
			{
				queryKey: ["subjects", values.category_id, values.sub_category],
				queryFn: () =>
					GetSubjects({
						examination: values.category_id,
						examination_bundle: values.sub_category,
						limit: 50,
					}),
				enabled: !!(values.category_id && values.sub_category),
				select: (data: unknown) => (data as CourseResponse).data.data,
			},
		],
	});

	const errorMessage = (key: keyof CreateEventDto) => {
		if (errors[key] && touched[key]) {
			if (key === "date") {
				return errors[key] && touched[key] ? (errors[key] as string) : "";
			}
			return errors[key];
		}
		return "";
	};

	const endTimes = React.useMemo(() => {
		if (values.start_hour) {
			const startIndex = times.findIndex(
				(time) => time.value.toString() === values.start_hour.toString()
			);
			return times.slice(startIndex + 1);
		}
		return [];
	}, [values.start_hour]);

	return (
		<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiCalendar2Line} />
			<form onSubmit={handleSubmit} className="my-4 w-full space-y-5">
				<div className="space-y-0.5">
					<div className="w-full border-b border-b-neutral-400 transition-all duration-500 focus-within:border-b-primary-600">
						<input
							type="text"
							name="title"
							onChange={handleChange}
							className="w-full appearance-none border-0 border-none bg-transparent text-2xl font-semibold outline-none placeholder:text-neutral-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
							placeholder="Event title here"
						/>
					</div>
					{errorMessage("title") && <p className="text-xs text-red-500">{errorMessage("title")}</p>}
				</div>
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex flex-col space-y-1">
						<label htmlFor="category_id" className="text-xs text-neutral-400">
							Select Category
						</label>
						<Select
							value={values.category_id}
							onValueChange={(value) => setFieldValue("category_id", value)}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Category" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{examinations?.map((examination) => (
									<SelectItem key={examination.examination_id} value={examination.examination_id}>
										{examination.examination_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errorMessage("category_id") && (
							<p className="text-xs text-red-500">{errorMessage("category_id")}</p>
						)}
					</div>
					<div className="flex flex-col space-y-1">
						<label htmlFor="sub_category" className="text-xs text-neutral-400">
							Select Subcategory
						</label>
						<Select
							value={values.sub_category}
							onValueChange={(value) => setFieldValue("sub_category", value)}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Subcategory" />
							</SelectTrigger>
							<SelectContent>
								{bundles?.map((bundle) => (
									<SelectItem key={bundle.examinationbundle_id} value={bundle.examinationbundle_id}>
										{bundle.examinationbundle_name.toUpperCase()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errorMessage("sub_category") && (
							<p className="text-xs text-red-500">{errorMessage("sub_category")}</p>
						)}
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex flex-col space-y-1">
						<label htmlFor="subject" className="text-xs text-neutral-400">
							Select Subject
						</label>
						<Select value={values.subject} onValueChange={(value) => setFieldValue("subject", value)}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Subject" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{subjects?.map((subject) => (
									<SelectItem key={subject.subject_id} value={subject.subject_id}>
										{subject.subject_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errorMessage("subject") && <p className="text-xs text-red-500">{errorMessage("subject")}</p>}
					</div>
					<div className="flex flex-col space-y-1">
						<label htmlFor="frequency" className="text-xs text-neutral-400">
							Frequency
						</label>
						<Select value={values.frequency} onValueChange={(value) => setFieldValue("frequency", value)}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Frequency" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{event_frequency.map((frequency) => (
									<SelectItem key={frequency} value={frequency}>
										{frequency}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errorMessage("frequency") && (
							<p className="text-xs text-red-500">{errorMessage("frequency")}</p>
						)}
					</div>
				</div>
				<div className="flex flex-col space-y-1">
					<label htmlFor="frequency" className="text-xs text-neutral-400">
						Date and Time
					</label>
					<div className="rounded-md border">
						<DatePicker
							value={dayjs(values.date)}
							onChange={(date) => setFieldValue("date", date ? new Date(date.toString()) : null)}
							className="h-11 w-full border-0 font-body font-medium"
							format="DD/MM/YYYY"
							minDate={dayjs(new Date()).add(1, "day")}
						/>
						<div className="grid w-full grid-cols-2 border-t">
							<Select
								name="start_hour"
								onValueChange={(value) => setFieldValue("start_hour", value)}
								disabled={!values.date || new Date(values.date).getTime() < new Date().getTime()}>
								<SelectTrigger className="rounded-none border-0 border-r focus:border-neutral-300">
									<SelectValue placeholder="Start Time" />
								</SelectTrigger>
								<SelectContent>
									{times.map((time) => (
										<SelectItem key={time.value} value={time.value.toString()}>
											{time.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								name="end_hour"
								onValueChange={(value) => setFieldValue("end_hour", value)}
								disabled={!values.start_hour}>
								<SelectTrigger className="border-0">
									<SelectValue placeholder="End Time" />
								</SelectTrigger>
								<SelectContent>
									{endTimes.map((time) => (
										<SelectItem key={time.value} value={time.value.toString()}>
											{time.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<hr />
				<div className="flex w-full items-center justify-end gap-x-4">
					<Button
						className="w-fit"
						type="button"
						disabled={isPending}
						onClick={onClose}
						variant="outline">
						Cancel
					</Button>
					<Button className="w-fit" type="submit" disabled={isPending}>
						{isPending ? <RiLoaderLine className="animate-spin" /> : "Create Event"}
					</Button>
				</div>
			</form>
		</div>
	);
};
