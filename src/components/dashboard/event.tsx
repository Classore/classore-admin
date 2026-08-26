import { useMutation, useQueries } from "@tanstack/react-query";
import { RiCalendar2Line, RiLoaderLine } from "@remixicon/react";
import { useFormik } from "formik";
import { format } from "date-fns";
import { DatePicker } from "antd";
import * as Yup from "yup";
import React from "react";
import dayjs from "dayjs";

import type { CourseResponse, ExaminationBundleResponse, ExaminationResponse } from "@/queries";
import {
	type CreateEventDto,
	CreateCalendarEvent,
	UpdateCalendarEvent,
} from "@/queries/calendar";
import { GetBundles, GetExaminations, GetSubjects } from "@/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconLabel } from "@/components/shared";
import { queryClient } from "@/providers";
import { TIME_OPTIONS } from "@/config";
import type { Event as EventType } from "@/types";
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
	/** When provided, the form opens in edit mode pre-populated with this event */
	eventData?: EventType;
}

const event_frequency = ["once", "daily", "weekly", "biweekly", "monthly"];

/** Resolve a field that may be a nested {id,name} object OR a flat UUID string */
const resolveId = (field: unknown): string => {
	if (!field) return "";
	if (typeof field === "string") return field;
	if (typeof field === "object" && field !== null && "id" in field)
		return (field as { id: string }).id ?? "";
	return "";
};

const buildInitialValues = (eventData?: EventType): CreateEventDto => ({
	category_id: resolveId(eventData?.category_id),
	date: eventData?.date ?? new Date(),
	end_hour: eventData?.end_hour ?? 0,
	event_day: eventData?.event_day ?? 1,
	frequency: eventData?.frequency ?? "",
	start_hour: eventData?.start_hour ?? 0,
	sub_category: resolveId(eventData?.sub_category),
	subject: resolveId(eventData?.subject),
	title: eventData?.title ?? "",
	meeting_link: eventData?.meeting_link ?? "",
	platform: eventData?.platform ?? "",
	note: eventData?.note ?? "",
});

export const Event = ({ onClose, eventData }: Props) => {
	const isEditMode = !!eventData;
	const eventId = eventData?.id;

	const initialValues = React.useMemo(() => buildInitialValues(eventData), [eventData]);

	const { isPending: isCreating, mutate: create } = useMutation({
		mutationFn: (payload: CreateEventDto) => CreateCalendarEvent(payload),
		mutationKey: ["create-event"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["calendar-events"] }).then(() => {
				resetForm();
				onClose();
			});
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to create event");
		},
	});

	const { isPending: isUpdating, mutate: update } = useMutation({
		mutationFn: (payload: Partial<CreateEventDto>) =>
			UpdateCalendarEvent(eventId!, payload),
		mutationKey: ["update-event", eventId],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["calendar-events"] }).then(() => {
				onClose();
			});
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to update event");
		},
	});

	const isPending = isCreating || isUpdating;

	const { errors, handleChange, handleSubmit, resetForm, setFieldValue, values, touched } =
		useFormik({
			initialValues,
			enableReinitialize: true,
			validationSchema: Yup.object().shape({
				category_id: Yup.string().required("Examination type is required"),
				date: Yup.date().required("Event date is required"),
				end_hour: Yup.number().required("End time is required"),
				event_day: Yup.number()
					.min(1, "Event requires minimum of one day")
					.required("number of event days is required"),
				frequency: Yup.string()
					.oneOf(["once", "daily", "weekly", "biweekly", "monthly"], "Frequency is required")
					.required("Frequency is required"),
				start_hour: Yup.number().required("Start time is required"),
				sub_category: Yup.string().required("Examination bundle is required"),
				subject: Yup.string().required("Subject is required"),
				title: Yup.string().required("Event title is required"),
				meeting_link: Yup.string(),
				platform: Yup.string(),
				note: Yup.string(),
			}),
			onSubmit: (values) => {
				const payload = {
					...values,
					start_hour: Number(values.start_hour),
					end_hour: Number(values.end_hour),
					date: format(values.date, "MM/dd/yyyy"),
				};
				if (isEditMode) {
					update(payload);
				} else {
					create(payload);
				}
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
			const startIndex = TIME_OPTIONS.findIndex(
				(time) => time.value.toString() === values.start_hour.toString()
			);
			return TIME_OPTIONS.slice(startIndex + 1);
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
							value={values.title}
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
							onValueChange={(value) => setFieldValue("sub_category", value)}
							disabled={!values.category_id}>
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
						<Select
							value={values.subject}
							onValueChange={(value) => setFieldValue("subject", value)}
							disabled={!values.sub_category}>
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
							minDate={isEditMode ? undefined : dayjs(new Date()).add(1, "day")}
						/>
						<div className="grid w-full grid-cols-2 border-t">
							<Select
								name="start_hour"
								value={values.start_hour ? values.start_hour.toString() : undefined}
								onValueChange={(value) => setFieldValue("start_hour", value)}
								disabled={!values.date || new Date(values.date).getTime() < new Date().getTime()}>
								<SelectTrigger className="rounded-none border-0 border-r focus:border-neutral-300">
									<SelectValue placeholder="Start Time" />
								</SelectTrigger>
								<SelectContent>
									{TIME_OPTIONS.map((time) => (
										<SelectItem key={time.value} value={time.value.toString()}>
											{time.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								name="end_hour"
								value={values.end_hour ? values.end_hour.toString() : undefined}
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
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex flex-col space-y-1">
						<label htmlFor="meeting_link" className="text-xs text-neutral-400">
							Meeting Link
						</label>
						<Input
							id="meeting_link"
							name="meeting_link"
							type="url"
							placeholder="https://zoom.us/..."
							value={values.meeting_link}
							onChange={handleChange}
							className="h-11"
						/>
						{errorMessage("meeting_link") && (
							<p className="text-xs text-red-500">{errorMessage("meeting_link")}</p>
						)}
					</div>
					<div className="flex flex-col space-y-1">
						<label htmlFor="platform" className="text-xs text-neutral-400">
							Platform
						</label>
						<Select value={values.platform} onValueChange={(value) => setFieldValue("platform", value)}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Platform" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="zoom">Zoom</SelectItem>
								<SelectItem value="google meet">Google Meet</SelectItem>
								<SelectItem value="microsoft teams">Microsoft Teams</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
						{errorMessage("platform") && (
							<p className="text-xs text-red-500">{errorMessage("platform")}</p>
						)}
					</div>
				</div>
				<div className="flex flex-col space-y-1">
					<label htmlFor="note" className="text-xs text-neutral-400">
						Note
					</label>
					<Textarea
						id="note"
						name="note"
						placeholder="Add a short note for the meeting..."
						value={values.note}
						onChange={handleChange}
						className="min-h-[80px] resize-none"
					/>
					{errorMessage("note") && <p className="text-xs text-red-500">{errorMessage("note")}</p>}
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
						{isPending ? (
							<RiLoaderLine className="animate-spin" />
						) : isEditMode ? (
							"Save Changes"
						) : (
							"Create Event"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
};
