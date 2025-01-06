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
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/shared";
import type { DayProps } from "@/types";
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

const daysOfWeek = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const getDaysInMonth = (year: number, month: number) => {
	return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
	return new Date(year, month, 1).getDay();
};

const Page = () => {
	const [currentDate, setCurrentDate] = React.useState(new Date());
	const [open, setOpen] = React.useState(false);

	const daysOfMonth = React.useMemo(() => {
		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const days = [];
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(new Date(year, month, i).toString());
		}
		return days;
	}, [currentDate]);

	const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));

	const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

	const calendarDays = React.useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const daysInMonth = getDaysInMonth(year, month);
		const firstDay = getFirstDayOfMonth(year, month);
		const days: DayProps[] = [];

		for (let i = 0; i < firstDay; i++) {
			days.push({ day: null, events: [] });
		}

		for (let day = 1; day <= daysInMonth; day++) {
			days.push({
				day,
				events: [],
			});
		}

		return days;
	}, [currentDate]);

	const [] = useQueries({
		queries: [],
	});

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
							<CalendarCard icon={RiCalendar2Line} value={0} label="Total No of Events" />
							<CalendarCard icon={RiCalendarTodoLine} value={0} label="Upcoming" />
							<CalendarCard icon={RiCalendarEventLine} value={0} label="Live" />
							<CalendarCard icon={RiCalendarCheckLine} value={0} label="Ended" />
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
								{calendarDays.map(({ day }, index) => {
									const isToday =
										day === new Date().getDate() &&
										currentDate.getMonth() === new Date().getMonth() &&
										currentDate.getFullYear() === new Date().getFullYear();
									return (
										<div
											key={index}
											className={`flex aspect-square w-full flex-col border-b p-3 ${index % 7 === 6 ? "" : "border-r"} ${isToday ? "bg-primary-50 font-semibold text-primary-400" : "text-neutral-400"}`}>
											<div className="flex w-full items-center justify-end">
												<span className="text-xs">{day}</span>
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
