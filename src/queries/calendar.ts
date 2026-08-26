import { useQuery } from "@tanstack/react-query";

import type { EventProps, HttpResponse, PaginationProps } from "@/types";
import { endpoints } from "@/config";
import { api } from "@/lib";

export interface CreateEventDto {
	category_id: string;
	date: Date | string;
	end_hour: number;
	event_day: number;
	frequency: string;
	start_hour: number;
	sub_category: string;
	subject: string;
	title: string;
	meeting_link?: string;
	platform?: string;
	note?: string;
}

export interface GetEventsResponse {
	calendar: {
		ended: number;
		live: number;
		total_events: number;
		upcoming: number;
	};
	events: EventProps[];
}

export type EventsResponse = HttpResponse<GetEventsResponse>;

const CreateCalendarEvent = async (payload: CreateEventDto) => {
	console.log(
		"[Calendar API] Creating event at:",
		endpoints().calendar.create,
		"with payload:",
		payload
	);
	return api
		.post<HttpResponse<EventProps>>(endpoints().calendar.create, payload)
		.then((res) => {
			console.log("[Calendar API] Create response:", res.data);
			return res.data;
		})
		.catch((error) => {
			console.error("[Calendar API] Error creating event:", error);
			throw error;
		});
};

const GetCalendarEvents = async (params?: PaginationProps & { month: number }) => {
	console.log(
		"[Calendar API] Fetching events from:",
		endpoints().calendar.all,
		"with params:",
		params
	);
	return api
		.get<HttpResponse<GetEventsResponse>>(endpoints().calendar.all, { params })
		.then((res) => {
			console.log("[Calendar API] Response received:", res.data);
			return res.data;
		})
		.catch((error) => {
			console.error("[Calendar API] Error fetching events:", error);
			throw error;
		});
};
export const useGetAllCalendarEvants = (params?: PaginationProps & { month: number }) => {
	return useQuery({
		queryKey: ["calendar-events", params?.month],
		queryFn: () => GetCalendarEvents(params),
		staleTime: Infinity,
		gcTime: Infinity,
		select: (data) => data.data,
	});
};

const GetCalendarEvent = async (id: string) => {
	return api.get<HttpResponse<EventProps>>(endpoints(id).calendar.one).then((res) => res.data);
};

const UpdateCalendarEvent = async (id: string, payload: Partial<CreateEventDto>) => {
	console.log(
		"[Calendar API] Updating event at:",
		endpoints(id).calendar.update,
		"with payload:",
		payload
	);
	return api
		.put<HttpResponse<EventProps>>(endpoints(id).calendar.update, payload)
		.then((res) => res.data);
};

const DeleteCalendarEvent = async (id: string) => {
	console.log("[Calendar API] Deleting event at:", endpoints(id).calendar.delete);
	return api.delete<HttpResponse<EventProps>>(endpoints(id).calendar.delete).then((res) => res.data);
};

export {
	CreateCalendarEvent,
	DeleteCalendarEvent,
	GetCalendarEvent,
	GetCalendarEvents,
	UpdateCalendarEvent,
};
