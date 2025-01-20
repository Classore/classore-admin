import type { EventProps, HttpResponse, PaginationProps } from "@/types";
import { endpoints } from "@/config";
import { axios } from "@/lib";

export interface CreateEventDto {
	category_id: string;
	sub_category: string;
	subject: string;
	event_day: number;
	frequency: string;
	date: Date;
	start_hour: number;
	end_hour: number;
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
	return axios
		.post<HttpResponse<EventProps>>(endpoints().calendar.create, payload)
		.then((res) => res.data);
};

const GetCalendarEvents = async (params?: PaginationProps) => {
	return axios
		.get<HttpResponse<GetEventsResponse>>(endpoints().calendar.all, { params })
		.then((res) => res.data);
};

const GetCalendarEvent = async (id: string) => {
	return axios
		.get<HttpResponse<EventProps>>(endpoints(id).calendar.one)
		.then((res) => res.data);
};

const UpdateCalendarEvent = async (id: string, payload: Partial<CreateEventDto>) => {
	return axios
		.put<HttpResponse<EventProps>>(endpoints(id).calendar.update, payload)
		.then((res) => res.data);
};

const DeleteCalendarEvent = async (id: string) => {
	return axios
		.delete<HttpResponse<EventProps>>(endpoints(id).calendar.delete)
		.then((res) => res.data);
};

export {
	CreateCalendarEvent,
	DeleteCalendarEvent,
	GetCalendarEvent,
	GetCalendarEvents,
	UpdateCalendarEvent,
};
