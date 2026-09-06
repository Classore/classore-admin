import { useMutation, useQueries } from "@tanstack/react-query";
import { RiCalendar2Line, RiLoaderLine } from "@remixicon/react";
import { useFormik } from "formik";
import { format } from "date-fns";
import { DatePicker } from "antd";
import * as Yup from "yup";
import React from "react";
import dayjs from "dayjs";

import { type CreateEventDto, CreateCalendarEvent, UpdateCalendarEvent } from "@/queries/calendar";
import { GetBundles, GetExaminations, GetSubjects } from "@/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconLabel } from "@/components/shared";
import { queryClient } from "@/providers";
import { TIME_OPTIONS } from "@/config";
import type {
	CastedCourseProps,
	CastedExamBundleProps,
	CastedExamTypeProps,
	Event as EventType,
} from "@/types";
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
	if (typeof field === "object" && field !== null) {
		const obj = field as Record<string, unknown>;
		return (
			(obj.id as string) ||
			(obj.examination_id as string) ||
			(obj.examinationbundle_id as string) ||
			(obj.subject_id as string) ||
			""
		);
	}
	return "";
};

const extractDataArray = (response: unknown): any[] => {
	if (!response) return [];
	const res = response as any;
	const list = res?.data?.data ?? res?.data ?? res;
	return Array.isArray(list) ? list : [];
};

const buildInitialValues = (eventData?: EventType): CreateEventDto => ({
	category_id: resolveId(eventData?.category_id),
	date: eventData?.date ? new Date(eventData.date) : new Date(),
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
	recurrence_end_date: eventData?.recurrence_end_date
		? new Date(eventData.recurrence_end_date)
		: undefined,
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
		mutationFn: (payload: Partial<CreateEventDto>) => UpdateCalendarEvent(eventId!, payload),
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
				date: Yup.date()
					.required("Event date is required")
					.test("not-past-date", "Event date cannot be in the past", function (value) {
						if (!value || isEditMode) return true;
						return !dayjs(value).isBefore(dayjs().startOf("day"));
					}),
				end_hour: Yup.number()
					.required("End time is required")
					.test("after-start", "End time must be after start time", function (value) {
						const { start_hour } = this.parent;
						if (value === undefined || start_hour === undefined) return true;
						return Number(value) > Number(start_hour);
					}),
				event_day: Yup.number()
					.min(1, "Event requires minimum of one day")
					.required("number of event days is required"),
				frequency: Yup.string()
					.oneOf(["once", "daily", "weekly", "biweekly", "monthly"], "Frequency is required")
					.required("Frequency is required"),
				start_hour: Yup.number()
					.required("Start time is required")
					.test("future-time-if-today", "Start time must be in the future", function (value) {
						if (value === undefined || value === null || isEditMode) return true;
						const { date } = this.parent;
						if (date && dayjs(date).isSame(dayjs(), "day")) {
							return Number(value) > new Date().getHours();
						}
						return true;
					}),
				sub_category: Yup.string().required("Examination bundle is required"),
				subject: Yup.string().required("Subject is required"),
				title: Yup.string().required("Event title is required"),
				meeting_link: Yup.string(),
				platform: Yup.string(),
				note: Yup.string(),
				recurrence_end_date: Yup.date()
					.nullable()
					.when("frequency", {
						is: (frequency: string) => ["daily", "weekly", "biweekly", "monthly"].includes(frequency),
						then: (schema) =>
							schema
								.required("Recurrence end date is required")
								.test("is-after-start", "End date must be after event start date", function (value) {
									const { date } = this.parent;
									if (!value || !date) return true;
									return dayjs(value).isAfter(dayjs(date).startOf("day"));
								})
								.test(
									"is-within-one-year",
									"Recurrence end date cannot exceed 1 year from start date",
									function (value) {
										const { date } = this.parent;
										if (!value || !date) return true;
										return !dayjs(value).isAfter(dayjs(date).add(1, "year").endOf("day"));
									}
								),
						otherwise: (schema) => schema.notRequired().nullable(),
					}),
			}),
			onSubmit: (values) => {
				const isRecurring = ["daily", "weekly", "biweekly", "monthly"].includes(values.frequency);
				const payload: CreateEventDto = {
					...values,
					start_hour: Number(values.start_hour),
					end_hour: Number(values.end_hour),
					date: format(values.date, "MM/dd/yyyy"),
					...(isRecurring && values.recurrence_end_date
						? { recurrence_end_date: format(new Date(values.recurrence_end_date), "MM/dd/yyyy") }
						: {}),
				};
				if (!isRecurring) {
					delete payload.recurrence_end_date;
				}
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
				queryKey: ["get-exams"],
				queryFn: () => GetExaminations(),
				select: (data: unknown) => extractDataArray(data) as CastedExamTypeProps[],
			},
			{
				queryKey: ["get-bundles", values.category_id],
				queryFn: () => GetBundles({ examination: values.category_id }),
				enabled: !!values.category_id,
				select: (data: unknown) => extractDataArray(data) as CastedExamBundleProps[],
			},
			{
				queryKey: ["get-subjects", values.category_id, values.sub_category],
				queryFn: () =>
					GetSubjects({
						examination: values.category_id,
						examination_bundle: values.sub_category,
						limit: 50,
					}),
				enabled: !!(values.category_id && values.sub_category),
				select: (data: unknown) => extractDataArray(data) as CastedCourseProps[],
			},
		],
	});

	const errorMessage = (key: keyof CreateEventDto) => {
		if (errors[key] && touched[key]) {
			return errors[key] as string;
		}
		return "";
	};

	const isRecurring = React.useMemo(() => {
		return ["daily", "weekly", "biweekly", "monthly"].includes(values.frequency);
	}, [values.frequency]);

	// Clear recurrence_end_date if frequency changes to non-recurring
	React.useEffect(() => {
		if (!isRecurring && values.recurrence_end_date) {
			setFieldValue("recurrence_end_date", undefined);
		}
	}, [isRecurring, values.recurrence_end_date, setFieldValue]);

	// If start date moves after recurrence_end_date or exceeds 1 year, reset recurrence_end_date
	React.useEffect(() => {
		if (values.date && values.recurrence_end_date && isRecurring) {
			const startDate = dayjs(values.date);
			const endDate = dayjs(values.recurrence_end_date);
			if (endDate.isBefore(startDate.add(1, "day")) || endDate.isAfter(startDate.add(1, "year"))) {
				setFieldValue("recurrence_end_date", undefined);
			}
		}
	}, [values.date, values.recurrence_end_date, isRecurring, setFieldValue]);

	const isToday = React.useMemo(() => {
		if (!values.date) return false;
		return dayjs(values.date).isSame(dayjs(), "day");
	}, [values.date]);

	const startTimes = React.useMemo(() => {
		if (isEditMode) return TIME_OPTIONS;
		if (isToday) {
			const currentHour = new Date().getHours();
			return TIME_OPTIONS.filter((time) => time.value > currentHour);
		}
		return TIME_OPTIONS;
	}, [isEditMode, isToday]);

	// If selected start_hour is no longer available in startTimes, clear it
	React.useEffect(() => {
		if (
			values.start_hour &&
			!startTimes.some((t) => t.value.toString() === values.start_hour.toString())
		) {
			setFieldValue("start_hour", 0);
			setFieldValue("end_hour", 0);
		}
	}, [startTimes, values.start_hour, setFieldValue]);

	const endTimes = React.useMemo(() => {
		if (values.start_hour) {
			const startIndex = TIME_OPTIONS.findIndex(
				(time) => time.value.toString() === values.start_hour.toString()
			);
			if (startIndex !== -1) {
				return TIME_OPTIONS.slice(startIndex + 1);
			}
		}
		return [];
	}, [values.start_hour]);

	// If selected end_hour is no longer available in endTimes, clear it
	React.useEffect(() => {
		if (values.end_hour && !endTimes.some((t) => t.value.toString() === values.end_hour.toString())) {
			setFieldValue("end_hour", 0);
		}
	}, [endTimes, values.end_hour, setFieldValue]);

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
							value={values.category_id || undefined}
							onValueChange={(value) => {
								setFieldValue("category_id", value);
								setFieldValue("sub_category", "");
								setFieldValue("subject", "");
							}}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue placeholder="Select Category" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{examinations?.map((examination) => {
									const id = examination.examination_id || (examination as any).id;
									const name = examination.examination_name || (examination as any).name;
									if (!id) return null;
									return (
										<SelectItem key={id} value={id}>
											{name}
										</SelectItem>
									);
								})}
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
							value={values.sub_category || undefined}
							onValueChange={(value) => {
								setFieldValue("sub_category", value);
								setFieldValue("subject", "");
							}}
							disabled={!values.category_id}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue
									placeholder={
										!values.category_id
											? "Select Category First"
											: "Select Subcategory"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{bundles?.map((bundle) => {
									const id = bundle.examinationbundle_id || (bundle as any).id;
									const name = bundle.examinationbundle_name || (bundle as any).name;
									if (!id) return null;
									return (
										<SelectItem key={id} value={id}>
											{name ? name.toUpperCase() : id}
										</SelectItem>
									);
								})}
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
							value={values.subject || undefined}
							onValueChange={(value) => setFieldValue("subject", value)}
							disabled={!values.sub_category}>
							<SelectTrigger className="h-11 border capitalize">
								<SelectValue
									placeholder={
										!values.sub_category
											? "Select Subcategory First"
											: "Select Subject"
									}
								/>
							</SelectTrigger>
							<SelectContent className="capitalize">
								{subjects?.map((subject) => {
									const id = subject.subject_id || (subject as any).id;
									const name = subject.subject_name || (subject as any).name;
									if (!id) return null;
									return (
										<SelectItem key={id} value={id}>
											{name}
										</SelectItem>
									);
								})}
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
					<label htmlFor="date" className="text-xs text-neutral-400">
						Date and Time
					</label>
					<div className="rounded-md border">
						<DatePicker
							value={values.date ? dayjs(values.date) : null}
							onChange={(date) => setFieldValue("date", date ? new Date(date.toString()) : null)}
							className="h-11 w-full border-0 font-body font-medium"
							format="DD/MM/YYYY"
							minDate={isEditMode ? undefined : dayjs().startOf("day")}
						/>
						<div className="grid w-full grid-cols-2 border-t">
							<Select
								name="start_hour"
								value={values.start_hour ? values.start_hour.toString() : undefined}
								onValueChange={(value) => setFieldValue("start_hour", value)}
								disabled={
									!values.date ||
									(!isEditMode && dayjs(values.date).isBefore(dayjs().startOf("day"))) ||
									startTimes.length === 0
								}>
								<SelectTrigger className="rounded-none border-0 border-r focus:border-neutral-300">
									<SelectValue
										placeholder={startTimes.length === 0 && isToday ? "No slots today" : "Start Time"}
									/>
								</SelectTrigger>
								<SelectContent>
									{startTimes.map((time) => (
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
								disabled={!values.start_hour || endTimes.length === 0}>
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
					{errorMessage("date") && <p className="text-xs text-red-500">{errorMessage("date")}</p>}
					{errorMessage("start_hour") && (
						<p className="text-xs text-red-500">{errorMessage("start_hour")}</p>
					)}
					{errorMessage("end_hour") && (
						<p className="text-xs text-red-500">{errorMessage("end_hour")}</p>
					)}
				</div>
				{isRecurring && (
					<div className="flex flex-col space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3">
						<div className="flex items-center justify-between">
							<label htmlFor="recurrence_end_date" className="text-xs font-medium text-neutral-700">
								Repeat Until (Recurrence End Date)
							</label>
							<span className="text-[11px] text-neutral-400">Max 1 year ahead</span>
						</div>
						<p className="text-[11px] text-neutral-500">
							Select the final date for this series. Events will automatically be created on the calendar{" "}
							<span className="font-semibold capitalize text-primary-600">{values.frequency}</span> from the start date up until this date.
						</p>
						<DatePicker
							value={values.recurrence_end_date ? dayjs(values.recurrence_end_date) : null}
							onChange={(date) =>
								setFieldValue("recurrence_end_date", date ? new Date(date.toString()) : null)
							}
							className="h-11 w-full border bg-white font-body font-medium"
							format="DD/MM/YYYY"
							placeholder="Select cutoff date (e.g. end of term)"
							minDate={values.date ? dayjs(values.date).add(1, "day") : dayjs().add(1, "day")}
							maxDate={values.date ? dayjs(values.date).add(1, "year") : dayjs().add(1, "year")}
						/>
						{errorMessage("recurrence_end_date") && (
							<p className="text-xs text-red-500">{errorMessage("recurrence_end_date")}</p>
						)}
					</div>
				)}
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
