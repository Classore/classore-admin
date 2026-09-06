import { addDays, isBefore, isSameDay, startOfDay } from "date-fns";

import type { EventProps } from "@/types";

type EventStatus = {
	PAST: "border-neutral-500 bg-neutral-100 text-neutral-500";
	UPCOMING: "border-amber-500 bg-amber-100 text-amber-500";
	CURRENT: "border-primary-500 bg-primary-100 text-primary-500";
};

const EVENT_STATUS: EventStatus = {
	PAST: "border-neutral-500 bg-neutral-100 text-neutral-500",
	UPCOMING: "border-amber-500 bg-amber-100 text-amber-500",
	CURRENT: "border-primary-500 bg-primary-100 text-primary-500",
} as const;

/**
 * Returns the CSS classes for an event based on its date status
 * @param date The event date to check (can be Date object or string)
 * @returns CSS classes string for the event status
 */
const getEventStatus = (date: Date | string): string => {
	const today = startOfDay(new Date());
	const eventDate = startOfDay(typeof date === "string" ? new Date(date) : date);

	if (isSameDay(eventDate, today)) {
		return EVENT_STATUS.CURRENT;
	}

	if (isBefore(eventDate, today)) {
		return EVENT_STATUS.PAST;
	}

	return EVENT_STATUS.UPCOMING;
};

const dayUtils = (event: EventProps) => {
	// Handle both Date objects and string dates from backend
	const startDate = typeof event.date === "string" ? new Date(event.date) : new Date(event.date);
	// event.day seems to be 1 for single-day events, so we use it directly
	// If day is 1, the event is on that single day
	const endDate = event.day > 1 ? addDays(startDate, event.day - 1) : startDate;
	const today = new Date();

	const isFirstDay = isSameDay(startDate, today);
	const isLastDay = isSameDay(endDate, today);
	const isMultiDay = event.day > 1 && !isSameDay(startDate, endDate);

	return {
		endDate,
		isFirstDay,
		isLastDay,
		isMultiDay,
		startDate,
	};
};

export type EventTemporalStatus = "LIVE" | "UPCOMING" | "ENDED";

/**
 * Accurately determines whether an event is LIVE, UPCOMING, or ENDED based on start/end hours and date.
 */
const getEventTemporalStatus = (event: any): EventTemporalStatus => {
	if (!event) return "ENDED";
	try {
		const now = new Date();
		const rawDate = event.date;
		if (!rawDate) return "ENDED";

		let year: number;
		let month: number;
		let day: number;

		if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
			const parts = rawDate.split("T")[0].split("-").map(Number);
			year = parts[0];
			month = parts[1] - 1;
			day = parts[2];
		} else if (typeof rawDate === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}/.test(rawDate)) {
			const parts = rawDate.split("/").map(Number);
			month = parts[0] - 1;
			day = parts[1];
			year = parts[2];
		} else {
			const d = new Date(rawDate);
			if (isNaN(d.getTime())) return "ENDED";
			year = d.getFullYear();
			month = d.getMonth();
			day = d.getDate();
		}

		const startHour = Number(event.start_hour) || 0;
		const endHour = Number(event.end_hour) || 0;

		const startTime = new Date(year, month, day, startHour, 0, 0, 0);
		const effectiveEndHour = endHour > startHour ? endHour : startHour + 1;
		const endTime = new Date(year, month, day, effectiveEndHour, 0, 0, 0);

		if (now >= startTime && now <= endTime) {
			return "LIVE";
		} else if (now < startTime) {
			return "UPCOMING";
		} else {
			return "ENDED";
		}
	} catch {
		return "ENDED";
	}
};

export { dayUtils, getEventStatus, getEventTemporalStatus, type EventStatus };
