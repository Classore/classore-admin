import { useMutation, useQuery } from "@tanstack/react-query";

import { endpoints } from "@/config";
import { api } from "@/lib";
import type { HttpResponse } from "@/types";

// ============== Types ==============

export type NotificationTargetType = "all" | "specific";

export type NotificationCategory =
	| "GENERAL"
	| "CHAT"
	| "COURSE"
	| "QUIZ"
	| "SUBSCRIPTION"
	| "EXAM"
	| "EXAM_BUNDLE"
	| "STUDY_PACK"
	| "STUDY_PLAN"
	| "STUDY_PLAN_RENEWAL"
	| "STUDY_PLAN_EXPIRATION"
	| "STUDY_PLAN_CANCELLATION"
	| "STUDY_PLAN_COMPLETION";

export type NotificationType = "ADMIN" | "USER";

export type BundleType =
	| "JAMB"
	| "SS1"
	| "SS2"
	| "SS3"
	| "WAEC_GCE"
	| "jamb"
	| "sss 1"
	| "sss 2"
	| "sss 3"
	| "jss 1"
	| "jss 2"
	| "jss 3"
	| "waec (gce)";

export type UserFilterType = "ALL" | "PAID" | "EXPIRED" | BundleType;

export interface SendNotificationParams {
	// Required fields
	title: string;
	message: string;
	category: NotificationCategory;
	type: NotificationType;
	sender: string; // Admin ID

	// Target
	receiver: string; // "ALL" for all users, array of user IDs for specific

	// Optional fields
	path?: string; // Deeplink URL
	notification_type_id?: string;
	notification_icon?: string;

	// Bundle (for bundle-based notifications)
	bundle?: BundleType;
}

export interface NotificationHistoryItem {
	id: string;
	title: string;
	message: string;
	category: NotificationCategory;
	type: NotificationType;
	target_count: number;
	created_at: string;
	status: "sent" | "failed" | "pending";
}

export interface NotificationHistoryResponse {
	notifications: NotificationHistoryItem[];
	total: number;
	page: number;
	limit: number;
}

// ============== Mutations ==============

const SendNotification = async (payload: SendNotificationParams) => {
	return api
		.post<
			HttpResponse<{ success: boolean; message_id: string }>
		>(endpoints().notifications.create, payload)
		.then((res) => res.data);
};

export const useSendNotification = () => {
	return useMutation({
		mutationFn: (payload: SendNotificationParams) => SendNotification(payload),
		onSuccess: () => {
			console.log("✅ Notification sent successfully");
		},
		onError: (error: unknown) => {
			console.error("❌ Failed to send notification:", error);
		},
	});
};

// ============== Queries ==============

const GetNotificationHistory = async (params?: { page?: number; limit?: number }) => {
	return api
		.get<HttpResponse<NotificationHistoryResponse>>(endpoints().notifications.get_history, { params })
		.then((res) => res.data);
};

export const useGetNotificationHistory = (params?: { page?: number; limit?: number }) => {
	return useQuery({
		queryKey: ["notification-history", params],
		queryFn: () => GetNotificationHistory(params),
		select: (data) => data.data,
	});
};
