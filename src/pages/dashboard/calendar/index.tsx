import {
	RiAddLine,
	RiArrowLeftSLine,
	RiCalendar2Line,
	RiCalendarCheckLine,
	RiCalendarEventLine,
	RiCalendarTodoLine,
	RiDeleteBinLine,
	RiEditLine,
	RiLoaderLine,
} from "@remixicon/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { addMonths, format, subMonths } from "date-fns";
import { toast } from "sonner";
import React from "react";

import { CalendarCard, Event } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { Button } from "@/components/ui/button";
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
import { dayUtils, getEventStatus, getEventTemporalStatus } from "@/lib";
import { queryClient } from "@/providers";
import type { EventsResponse } from "@/queries";
import {
	DeleteCalendarEvent,
	GetAllCalendarEventsAcrossMonths,
	GetCalendarEvent,
	GetCalendarEvents,
} from "@/queries";
import type { DayProps, Event as EventType, EventProps } from "@/types";

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
	// Dialog state for creating or editing
	const [createOpen, setCreateOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedEvent, setSelectedEvent] = React.useState<EventType | null>(null);
	const [isFetchingEvent, setIsFetchingEvent] = React.useState(false);

	const month = currentDate.getMonth();

	const [{ data: monthData }, { data: allEventsData }] = useQueries({
		queries: [
			{
				queryKey: ["calendar-events", month],
				queryFn: () => GetCalendarEvents({ month }),
				select: (data: unknown) => (data as EventsResponse).data,
				enabled: month !== undefined,
			},
			{
				queryKey: ["calendar-events", "all"],
				queryFn: () => GetAllCalendarEventsAcrossMonths(),
				staleTime: 5 * 60 * 1000,
			},
		],
	});

	const { isPending: isDeleting, mutate: deleteEvent } = useMutation({
		mutationFn: (id: string) => DeleteCalendarEvent(id),
		mutationKey: ["delete-event"],
		onSuccess: (data) => {
			toast.success(data.message ?? "Event deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["calendar-events"] }).then(() => {
				setDeleteOpen(false);
				setSelectedEvent(null);
			});
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to delete event");
		},
	});

	const processedEvents = React.useMemo(() => {
		const monthEvents: Record<string, EventProps[]> = {};
		const targetMonth = currentDate.getMonth();

		// Backend returns an array of day objects: [{ date, day, events: [] }, ...]
		monthData?.events?.forEach((dayItem) => {
			const dayEvents = dayItem.events || [];
			const dayDate = new Date(dayItem.date);
			// Verify that the event date actually matches the selected month (guards against backend's month=0 bug)
			if (dayDate.getUTCMonth() === targetMonth && dayEvents.length > 0) {
				// Use getUTCDate to avoid timezone offset issues
				const dayNum = dayDate.getUTCDate().toString();
				monthEvents[dayNum] = dayEvents;
			}
		});
		return monthEvents;
	}, [monthData, currentDate]);

	const monthlyStats = React.useMemo(() => {
		const eventsList = Object.values(processedEvents).flat();
		let upcoming = 0;
		let live = 0;
		let ended = 0;

		eventsList.forEach((ev) => {
			const status = getEventTemporalStatus(ev);
			if (status === "LIVE") live++;
			else if (status === "UPCOMING") upcoming++;
			else ended++;
		});

		return {
			total_events: eventsList.length,
			upcoming,
			live,
			ended,
		};
	}, [processedEvents]);

	const overallStats = React.useMemo(() => {
		const eventsList = allEventsData || [];
		let upcoming = 0;
		let live = 0;
		let ended = 0;

		eventsList.forEach((ev) => {
			const status = getEventTemporalStatus(ev);
			if (status === "LIVE") live++;
			else if (status === "UPCOMING") upcoming++;
			else ended++;
		});

		return {
			total_events: eventsList.length,
			upcoming,
			live,
			ended,
		};
	}, [allEventsData]);

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

	const handleEventClick = async (eventItem: EventProps) => {
		const id = (eventItem as unknown as EventType).id;
		if (!id) return;
		try {
			setIsFetchingEvent(true);
			const res = await GetCalendarEvent(id);
			setSelectedEvent(res as unknown as EventType);
			setEditOpen(true);
		} catch (err) {
			console.error("[Calendar] Failed to fetch event:", err);
			// Fallback to list data so the dialog still opens
			setSelectedEvent(eventItem as unknown as EventType);
			setEditOpen(true);
		} finally {
			setIsFetchingEvent(false);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent, eventItem: EventProps) => {
		e.stopPropagation();
		setSelectedEvent(eventItem as unknown as EventType);
		setDeleteOpen(true);
	};

	return (
		<>
			<Seo title="Calendar" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					{/* 1. Overall / General Event Stats (All Events) */}
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex flex-col gap-y-0.5">
								<div className="flex items-center gap-x-2">
									<h4 className="text-base font-semibold text-neutral-900">Overall Calendar Overview</h4>
									<span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
										All Events
									</span>
								</div>
								<p className="text-xs text-neutral-400">
									Cumulative event statistics across the entire calendar
								</p>
							</div>

							{/* Create event dialog */}
							<Dialog open={createOpen} onOpenChange={setCreateOpen}>
								<DialogTrigger asChild>
									<Button size="sm" className="w-fit">
										<RiAddLine /> Add New Event
									</Button>
								</DialogTrigger>
								<DialogContent className="w-[450px] max-w-[90%] p-1">
									<DialogTitle hidden>New Event</DialogTitle>
									<DialogDescription hidden>New Event</DialogDescription>
									<Event open={createOpen} onClose={() => setCreateOpen(false)} />
								</DialogContent>
							</Dialog>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<CalendarCard
								icon={RiCalendar2Line}
								value={overallStats.total_events}
								label="Total No of Events"
								variant="total"
								tag="All Time"
							/>
							<CalendarCard
								icon={RiCalendarTodoLine}
								value={overallStats.upcoming}
								label="Upcoming"
								variant="upcoming"
								tag="All Time"
							/>
							<CalendarCard
								icon={RiCalendarEventLine}
								value={overallStats.live}
								label="Live"
								variant="live"
								tag="All Time"
							/>
							<CalendarCard
								icon={RiCalendarCheckLine}
								value={overallStats.ended}
								label="Ended"
								variant="ended"
								tag="All Time"
							/>
						</div>
					</div>

					{/* 2. Monthly Stats for the Selected Month */}
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex flex-col gap-y-0.5">
								<div className="flex items-center gap-x-2">
									<h4 className="text-base font-semibold text-neutral-900">Monthly Statistics</h4>
									<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
										{format(currentDate, "MMMM yyyy")}
									</span>
								</div>
								<p className="text-xs text-neutral-400">
									Event statistics for the currently selected month
								</p>
							</div>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<CalendarCard
								icon={RiCalendar2Line}
								value={monthlyStats.total_events}
								label="Total No of Events"
								variant="total"
								tag={format(currentDate, "MMM")}
							/>
							<CalendarCard
								icon={RiCalendarTodoLine}
								value={monthlyStats.upcoming}
								label="Upcoming"
								variant="upcoming"
								tag={format(currentDate, "MMM")}
							/>
							<CalendarCard
								icon={RiCalendarEventLine}
								value={monthlyStats.live}
								label="Live"
								variant="live"
								tag={format(currentDate, "MMM")}
							/>
							<CalendarCard
								icon={RiCalendarCheckLine}
								value={monthlyStats.ended}
								label="Ended"
								variant="ended"
								tag={format(currentDate, "MMM")}
							/>
						</div>

					</div>

					{/* 3. Month Calendar View */}
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
												{events.map((eventItem) => {
													const { endDate, isFirstDay, isLastDay, isMultiDay, startDate } =
														dayUtils(eventItem);
													const uniqueKey = `${eventItem.date}-${eventItem.title}`;

													return (
														<div
															key={uniqueKey}
															className="space-y-1"
															onClick={() => handleEventClick(eventItem)}>
															<div
																className={`group relative flex min-h-14 items-center truncate px-1 py-0.5 text-xs ${getEventStatus(eventItem.date)} ${isMultiDay ? "rounded-none" : "rounded"} ${isFirstDay ? "ml-2 rounded-l border-l-2" : "-ml-1"} ${isLastDay ? "rounded-r" : "pr-0"} ${!isFirstDay && !isLastDay && isMultiDay ? "pl-0" : ""} cursor-pointer`}>
																<div className="flex w-full cursor-pointer items-center">
																	<div className="flex items-start justify-center">
																		<RiCalendarEventLine className="ml-1 size-4 text-inherit" />
																		<div className="absolute left-7 z-50 flex flex-1 flex-col pl-1">
																			<span className={`truncate font-medium ${!isFirstDay ? "pl-1" : ""}`}>
																				{eventItem.title}
																			</span>
																			{isMultiDay && (
																				<span className="text-[10px] text-neutral-500">
																					{format(startDate, "EEE")} - {format(endDate, "EEE")}
																				</span>
																			)}
																		</div>
																	</div>
																</div>
																{/* Edit / Delete action buttons shown on hover */}
																<div className="absolute right-1 top-1 hidden gap-x-0.5 group-hover:flex">
																	<button
																		type="button"
																		title="Edit event"
																		disabled={isFetchingEvent}
																		className="grid size-5 place-items-center rounded bg-white/80 text-neutral-600 hover:text-primary-600 disabled:cursor-wait"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleEventClick(eventItem);
																		}}>
																		{isFetchingEvent ? (
																			<RiLoaderLine size={12} className="animate-spin" />
																		) : (
																			<RiEditLine size={12} />
																		)}
																	</button>
																	<button
																		type="button"
																		title="Delete event"
																		className="grid size-5 place-items-center rounded bg-white/80 text-neutral-600 hover:text-red-600"
																		onClick={(e) => handleDeleteClick(e, eventItem)}>
																		<RiDeleteBinLine size={12} />
																	</button>
																</div>
															</div>
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

			{/* Edit event dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="w-[450px] max-w-[90%] p-1">
					<DialogTitle hidden>Edit Event</DialogTitle>
					<DialogDescription hidden>Edit Event</DialogDescription>
					<Event
						key={selectedEvent?.id ?? "edit"}
						open={editOpen}
						onClose={() => {
							setEditOpen(false);
							setSelectedEvent(null);
						}}
						eventData={selectedEvent ?? undefined}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="w-[400px] max-w-[90%] p-6">
					<DialogTitle>Delete Event</DialogTitle>
					<DialogDescription className="mt-2 text-sm text-neutral-500">
						Are you sure you want to delete{" "}
						<span className="font-semibold text-neutral-800">{selectedEvent?.title}</span>? This action
						cannot be undone.
					</DialogDescription>
					<div className="mt-6 flex items-center justify-end gap-x-3">
						<Button
							variant="outline"
							className="w-fit"
							disabled={isDeleting}
							onClick={() => {
								setDeleteOpen(false);
								setSelectedEvent(null);
							}}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							className="w-fit"
							disabled={isDeleting || !selectedEvent?.id}
							onClick={() => selectedEvent?.id && deleteEvent(selectedEvent.id)}>
							{isDeleting ? "Deleting..." : "Delete Event"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Page;
