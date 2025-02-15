import { addMonths, format, subMonths } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import React from "react";
import {
	RiAddLine,
	RiArrowLeftSLine,
	RiCalendar2Line,
	RiCalendarCheckLine,
	RiCalendarEventLine,
	RiCalendarTodoLine,
} from "@remixicon/react";

import { CalendarCard, Event } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import type { DayProps, EventProps } from "@/types";
import { dayUtils, getEventStatus } from "@/lib";
import { Button } from "@/components/ui/button";
import type { EventsResponse } from "@/queries";
import { GetCalendarEvents } from "@/queries";
import { Seo } from "@/components/shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const calendarUtils = {
	getDaysInMonth: (year: number, month: number) => new Date(year, month + 1, 0).getDate(),
	getFirstDayOfMonth: (year: number, month: number) => new Date(year, month, 1).getDay(),
	isToday: (day: number | null, currentDate: Date) =>
		day === new Date().getDate() &&
		currentDate.getMonth() === new Date().getMonth() &&
		currentDate.getFullYear() === new Date().getFullYear(),
};

const Page = () => {
	const [currentDate, setCurrentDate] = React.useState(new Date());
	const [open, setOpen] = React.useState(false);
	const month = currentDate.getMonth();

	const [{ data }] = useQueries({
		queries: [
			{
				queryKey: ["get-events", month],
				queryFn: () => GetCalendarEvents({ month }),
				select: (data: unknown) => (data as EventsResponse).data,
			},
		],
	});

	const processedEvents = React.useMemo(() => {
		const monthEvents: Record<string, EventProps[]> = {};
		data?.events.forEach((event) => {
			const eventDate = new Date(event.date);
			if (
				eventDate.getFullYear() === currentDate.getFullYear() &&
				eventDate.getMonth() === currentDate.getMonth()
			) {
				const dateKey = eventDate.getDate().toString();
				if (!monthEvents[dateKey]) {
					monthEvents[dateKey] = [];
				}
				monthEvents[dateKey].push(event);
			}
		});
		return monthEvents;
	}, [currentDate, data]);

	const daysOfMonth = React.useMemo(() => {
		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1).toString());
	}, [currentDate]);

	const calendarDays = React.useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const daysInMonth = calendarUtils.getDaysInMonth(year, month);
		const firstDay = calendarUtils.getFirstDayOfMonth(year, month);
		const days: DayProps[] = Array(firstDay).fill({ day: null, events: [] });

		for (let day = 1; day <= daysInMonth; day++) {
			days.push({
				day,
				events: processedEvents[day.toString()] || [],
			});
		}

		return days;
	}, [currentDate, processedEvents]);

	const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));

	const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

	return (
		<>
			<Seo title="Calendar" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Calendar</p>
							<Dialog open={open} onOpenChange={setOpen}>
								<DialogTrigger asChild>
									<Button size="sm" className="w-fit">
										<RiAddLine /> Add New Event
									</Button>
								</DialogTrigger>
								<DialogContent className="w-[450px] max-w-[90%] p-1">
									<DialogTitle hidden>New Event</DialogTitle>
									<DialogDescription hidden>New Event</DialogDescription>
									<Event open={open} onClose={() => setOpen(false)} />
								</DialogContent>
							</Dialog>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<CalendarCard
								icon={RiCalendar2Line}
								value={data?.calendar.total_events ?? 0}
								label="Total No of Events"
							/>
							<CalendarCard
								icon={RiCalendarTodoLine}
								value={data?.calendar.upcoming ?? 0}
								label="Upcoming"
							/>
							<CalendarCard icon={RiCalendarEventLine} value={data?.calendar.live ?? 0} label="Live" />
							<CalendarCard icon={RiCalendarCheckLine} value={data?.calendar.ended ?? 0} label="Ended" />
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-2 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-x-2">
								<h5 className="">{format(currentDate, "MMMM yyyy")}</h5>
								<Select value="" onValueChange={(value) => console.log(value)}>
									<SelectTrigger className="h-6 w-[89px] text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="text-[10px]">
										{daysOfMonth.map((day) => (
											<SelectItem key={day} value={day}>
												{format(day, "EEE, d")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center gap-x-4">
								<button
									onClick={goToPreviousMonth}
									className="grid size-6 place-items-center rounded-full border">
									<RiArrowLeftSLine size={20} />
								</button>
								<button
									onClick={goToNextMonth}
									className="grid size-6 place-items-center rounded-full border">
									<RiArrowLeftSLine size={20} className="rotate-180" />
								</button>
							</div>
						</div>
						<div className="flex w-full flex-col rounded-md border">
							<div className="grid w-full grid-cols-7 border-b">
								{daysOfWeek.map((day) => (
									<div
										key={day}
										className="flex h-12 flex-1 items-center justify-center border-r text-xs text-neutral-400 last:border-r-0">
										{day}
									</div>
								))}
							</div>
							<div className="grid w-full grid-cols-7">
								{calendarDays.map(({ day, events }, index) => {
									const isToday = calendarUtils.isToday(day, currentDate);
									return (
										<div
											key={index}
											className={`flex aspect-[1.08/1] w-full flex-col overflow-hidden border-b ${index % 7 === 6 ? "" : "border-r"} ${isToday ? "bg-neutral-100 font-semibold" : "text-neutral-500"}`}>
											<div className="flex w-full items-center justify-end px-3 pt-3">
												<span className="text-xs">{day}</span>
											</div>
											<div className="mt-1 flex flex-col gap-y-1 overflow-y-auto">
												{events.map((event, index) => {
													const { endDate, isFirstDay, isLastDay, isMultiDay, startDate } = dayUtils(event);

													return (
														<div key={index} className="space-y-1">
															{event.events.map((ev, idx) => (
																<div
																	key={idx}
																	className={`group relative flex min-h-14 items-center truncate px-1 py-0.5 text-xs ${getEventStatus(event.date)} ${isMultiDay ? "rounded-none" : "rounded"} ${isFirstDay ? "ml-2 rounded-l border-l-2" : "-ml-1"} ${isLastDay ? "rounded-r" : "pr-0"} ${!isFirstDay && !isLastDay && isMultiDay ? "pl-0" : ""} `}>
																	<div className="flex w-full cursor-pointer items-center">
																		<div className="flex items-start justify-center">
																			<RiCalendarEventLine className="ml-1 size-4 text-inherit" />
																			<div className="absolute left-7 z-50 flex flex-1 flex-col pl-1">
																				<span className={`truncate font-medium ${!isFirstDay ? "pl-1" : ""}`}>
																					{ev.title}
																				</span>
																				<span className="text-[10px] text-neutral-500">
																					{format(startDate, "EEEE")} - {format(endDate, "EEEE")}
																				</span>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
