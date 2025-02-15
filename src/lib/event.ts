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
 * @param date The event date to check
 * @returns CSS classes string for the event status
 */
const getEventStatus = (date: Date): string => {
	const today = startOfDay(new Date());
	const eventDate = startOfDay(date);

	if (isSameDay(eventDate, today)) {
		return EVENT_STATUS.CURRENT;
	}

	if (isBefore(eventDate, today)) {
		return EVENT_STATUS.PAST;
	}

	return EVENT_STATUS.UPCOMING;
};

const dayUtils = (event: EventProps) => {
	const startDate = new Date(event.date);
	const endDate = addDays(startDate, event.day);
	const today = new Date();

	const isFirstDay = isSameDay(startDate, today);
	const isLastDay = isSameDay(endDate, today);
	const isMultiDay = !isSameDay(startDate, endDate);

	return {
		endDate,
		isFirstDay,
		isLastDay,
		isMultiDay,
		startDate,
	};
};

export { dayUtils, getEventStatus, type EventStatus };
