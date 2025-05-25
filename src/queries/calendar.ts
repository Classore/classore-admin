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
	return api
		.post<HttpResponse<EventProps>>(endpoints().calendar.create, payload)
		.then((res) => res.data);
};

const GetCalendarEvents = async (params?: PaginationProps & { month: number }) => {
	return api
		.get<HttpResponse<GetEventsResponse>>(endpoints().calendar.all, { params })
		.then((res) => res.data);
};
export const useGetAllCalendarEvants = (params?: PaginationProps & { month: number }) => {
	return useQuery({
		queryKey: ["calendar-events", params],
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
	return api
		.put<HttpResponse<EventProps>>(endpoints(id).calendar.update, payload)
		.then((res) => res.data);
};

const DeleteCalendarEvent = async (id: string) => {
	return api.delete<HttpResponse<EventProps>>(endpoints(id).calendar.delete).then((res) => res.data);
};

export {
	CreateCalendarEvent,
	DeleteCalendarEvent,
	GetCalendarEvent,
	GetCalendarEvents,
	UpdateCalendarEvent,
};
