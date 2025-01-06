import { useMutation } from "@tanstack/react-query";
import { RiCalendar2Line } from "@remixicon/react";
import { useFormik } from "formik";
import { DatePicker } from "antd";
import React from "react";
import dayjs from "dayjs";

import { type CreateEventDto, CreateCalendarEvent } from "@/queries/calendar";
import { Button } from "@/components/ui/button";
import { IconLabel } from "@/components/shared";
import { times } from "@/config";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import "dayjs/locale/en-gb";
dayjs.locale("en-gb");

interface Props {
	onClose: () => void;
	open: boolean;
}

const event_frequency = ["once", "daily", "weekly", "biweekly", "monthly"];

const initialValues: CreateEventDto = {
	categoryId: "",
	endTime: "",
	frequency: "",
	startDate: null,
	startTime: "",
	subcategoryId: "",
	subject: "",
	title: "",
};

export const Event = ({ onClose }: Props) => {
	const {} = useMutation({
		mutationFn: (payload: CreateEventDto) => CreateCalendarEvent(payload),
		mutationKey: ["create-event"],
		onSuccess: (data) => {
			console.log(data);
		},
	});

	const { handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			console.log(values);
		},
	});

	const date = React.useMemo(
		() => (values.startDate ? dayjs(values.startDate) : null),
		[values.startDate]
	);

	const endTimes = React.useMemo(() => {
		if (values.startTime) {
			const startIndex = times.indexOf(values.startTime);
			return times.slice(startIndex + 1);
		}
		return [];
	}, [values.startTime]);

	return (
		<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiCalendar2Line} />
			<form onSubmit={handleSubmit} className="my-4 w-full space-y-5">
				<div className="w-full border-b border-b-neutral-400 transition-all duration-500 focus-within:border-b-primary-600">
					<input
						type="text"
						name="title"
						onChange={handleChange}
						className="w-full appearance-none border-0 border-none bg-transparent text-2xl font-semibold outline-none placeholder:text-neutral-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
						placeholder="Event title here"
					/>
				</div>
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex flex-col space-y-1">
						<label htmlFor="categoryId" className="text-xs text-neutral-400">
							Select Category
						</label>
						<Select>
							<SelectTrigger className="h-11 border">
								<SelectValue placeholder="Select Category" />
							</SelectTrigger>
							<SelectContent></SelectContent>
						</Select>
					</div>
					<div className="flex flex-col space-y-1">
						<label htmlFor="subcategoryId" className="text-xs text-neutral-400">
							Select Subcategory
						</label>
						<Select>
							<SelectTrigger className="h-11 border">
								<SelectValue placeholder="Select Subcategory" />
							</SelectTrigger>
							<SelectContent></SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid w-full grid-cols-2 gap-3">
					<div className="flex flex-col space-y-1">
						<label htmlFor="subject" className="text-xs text-neutral-400">
							Select Subject
						</label>
						<Select>
							<SelectTrigger className="h-11 border">
								<SelectValue placeholder="Select Subject" />
							</SelectTrigger>
							<SelectContent></SelectContent>
						</Select>
					</div>
					<div className="flex flex-col space-y-1">
						<label htmlFor="frequency" className="text-xs text-neutral-400">
							Frequency
						</label>
						<Select>
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
					</div>
				</div>
				<div className="flex flex-col space-y-1">
					<label htmlFor="frequency" className="text-xs text-neutral-400">
						Date and Time
					</label>
					<div className="rounded-md border">
						<DatePicker
							value={date}
							onChange={(date) => setFieldValue("startDate", date ? date.toDate() : null)}
							className="h-11 w-full border-0 font-body font-medium"
							format="DD/MM/YYYY"
							minDate={dayjs(new Date()).add(1, "day")}
						/>
						<div className="grid w-full grid-cols-2 border-t">
							<Select
								name="startTime"
								onValueChange={(value) => setFieldValue("startTime", value)}
								disabled={!values.startDate}>
								<SelectTrigger className="rounded-none border-0 border-r focus:border-neutral-300">
									<SelectValue placeholder="Start Time" />
								</SelectTrigger>
								<SelectContent>
									{times.map((time) => (
										<SelectItem key={time} value={time}>
											{time}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								name="endTime"
								onValueChange={(value) => setFieldValue("endTime", value)}
								disabled={!values.startDate || !values.startTime}>
								<SelectTrigger className="border-0">
									<SelectValue placeholder="End Time" />
								</SelectTrigger>
								<SelectContent>
									{endTimes.map((time) => (
										<SelectItem key={time} value={time}>
											{time}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<hr />
				<div className="flex w-full items-center justify-end gap-x-4">
					<Button className="w-fit" type="button" onClick={onClose} variant="outline">
						Cancel
					</Button>
					<Button className="w-fit" type="submit">
						Create Event
					</Button>
				</div>
			</form>
		</div>
	);
};
