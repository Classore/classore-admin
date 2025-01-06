import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	EventProps,
	HttpResponse,
	Maybe,
	PaginatedResponse,
	PaginationProps,
} from "@/types";

export interface CreateEventDto {
	categoryId: string;
	endTime: string;
	frequency: "once" | "daily" | "weekly" | "biweekly" | "monthly" | (string & {});
	startDate: Maybe<Date>;
	startTime: string;
	subcategoryId: string;
	subject: string;
	title: string;
}

const CreateCalendarEvent = async (payload: CreateEventDto) => {
	return axios
		.post<HttpResponse<EventProps>>(endpoints().calendar.create, payload)
		.then((res) => res.data);
};

const GetCalendarEvents = async (params?: PaginationProps) => {
	return axios
		.get<HttpResponse<PaginatedResponse<EventProps>>>(endpoints().calendar.all, { params })
		.then((res) => res.data);
};

const GetCalendarEvent = async (id: string) => {
	return axios
		.get<HttpResponse<EventProps>>(endpoints(id).calendar.one)
		.then((res) => res.data);
};

const UpdateCalendarEvent = async (id: string, payload: CreateEventDto) => {
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
