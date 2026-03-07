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

export { dayUtils, getEventStatus, type EventStatus };
