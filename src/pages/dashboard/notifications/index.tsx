import React, { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { useGetAllUsers, useSendNotification } from "@/queries";
import type {
	NotificationCategory,
	NotificationType,
	SendNotificationParams,
	UserFilterType,
} from "@/queries/notifications";
import { useUserStore } from "@/store/z-store/user";
import type { CastedUserProps } from "@/types/casted-types";

// ============== Constants ==============

const CATEGORY_OPTIONS: { value: NotificationCategory; label: string }[] = [
	{ value: "GENERAL", label: "General" },
	{ value: "CHAT", label: "Chat" },
	{ value: "COURSE", label: "Course" },
	{ value: "QUIZ", label: "Quiz" },
	{ value: "SUBSCRIPTION", label: "Subscription" },
	{ value: "EXAM", label: "Exam" },
	{ value: "EXAM_BUNDLE", label: "Exam Bundle" },
	{ value: "STUDY_PACK", label: "Study Pack" },
	{ value: "STUDY_PLAN", label: "Study Plan" },
	{ value: "STUDY_PLAN_RENEWAL", label: "Study Plan Renewal" },
	{ value: "STUDY_PLAN_EXPIRATION", label: "Study Plan Expiration" },
	{ value: "STUDY_PLAN_CANCELLATION", label: "Study Plan Cancellation" },
	{ value: "STUDY_PLAN_COMPLETION", label: "Study Plan Completion" },
];

const BUNDLE_OPTIONS: { value: UserFilterType; label: string }[] = [
	{ value: "ALL", label: "All Users" },
	{ value: "PAID", label: "Paid Users (Active Subscription)" },
	{ value: "EXPIRED", label: "Expired Users" },
	{ value: "jamb", label: "JAMB Bundle" },
	{ value: "sss 1", label: "SSS 1 Bundle" },
	{ value: "sss 2", label: "SSS 2 Bundle" },
	{ value: "sss 3", label: "SSS 3 Bundle" },
	{ value: "jss 1", label: "JSS 1 Bundle" },
	{ value: "jss 2", label: "JSS 2 Bundle" },
	{ value: "jss 3", label: "JSS 3 Bundle" },
	{ value: "waec (gce)", label: "WAEC GCE Bundle" },
];

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
	{ value: "USER", label: "All Users" },
	{ value: "ADMIN", label: "Specific Users" },
];

// Deep link options for the mobile app
const DEEPLINK_OPTIONS = [
	{ value: "", label: "No Deeplink (Open App Home)" },
	{ value: "classore://dashboard", label: "Home / Dashboard" },
	{ value: "classore://dashboard/my-courses", label: "My Courses" },
	{ value: "classore://dashboard/categories", label: "Browse Categories" },
	{ value: "classore://dashboard/forum", label: "Forum" },
	{ value: "classore://dashboard/more", label: "More Menu" },
	{ value: "classore://dashboard/notifications", label: "Notifications" },
	{ value: "classore://dashboard/live-class", label: "Live Classes" },
	{ value: "classore://dashboard/messages", label: "Messages List" },
	{ value: "classore://dashboard/leaderboard", label: "Leaderboard" },
	{ value: "classore://dashboard/ai-chat-screen", label: "AI Chat" },
	{ value: "classore://dashboard/calendar", label: "Calendar" },
	{ value: "classore://dashboard/my-courses/[course_id]", label: "Course Detail" },
	{ value: "classore://dashboard/my-courses/course/[id]", label: "Course Lesson" },
	{ value: "classore://dashboard/my-courses/course/[id]/quiz", label: "Quiz" },
	{ value: "classore://dashboard/categories/[bundle]", label: "Bundle (JAMB/WAEC)" },
	{ value: "classore://dashboard/categories/[bundle]/[slug]", label: "Subject Detail" },
	{ value: "classore://dashboard/categories/[bundle]/payment", label: "Payment Page" },
	{ value: "classore://dashboard/more/profile", label: "Profile" },
	{ value: "classore://dashboard/more/account-settings", label: "Account Settings" },
	{ value: "classore://dashboard/more/bank-details", label: "Bank Details" },
	{ value: "classore://dashboard/more/notification-settings", label: "Notification Settings" },
	{ value: "classore://dashboard/more/withdrawal", label: "Withdrawal" },
	{ value: "classore://dashboard/more/my-referrals", label: "My Referrals" },
];

// ============== Page Component ==============

const Page = () => {
	return (
		<>
			<Seo title="Push Notifications" />
			<DashboardLayout>
				<div className="p-6">
					<h1 className="mb-6 text-2xl font-bold">Push Notifications</h1>
					<NotificationForm />
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;

// ============== User Search Modal ==============

interface UserSearchModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (user: CastedUserProps) => void;
	selectedUsers: CastedUserProps[];
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
	isOpen,
	onClose,
	onSelect,
	selectedUsers,
}) => {
	const [search, setSearch] = useState("");

	// Fetch all users with high limit
	const { data, isLoading } = useGetAllUsers({ limit: 1000 });

	// Get all users from response
	const allUsers = useMemo(() => {
		return data?.users?.data || [];
	}, [data]);

	// Filter users locally based on search
	const filteredUsers = useMemo(() => {
		if (!search.trim()) return allUsers;
		const searchLower = search.toLowerCase();
		return allUsers.filter(
			(user) =>
				user.user_first_name?.toLowerCase().includes(searchLower) ||
				user.user_last_name?.toLowerCase().includes(searchLower) ||
				user.user_email?.toLowerCase().includes(searchLower)
		);
	}, [allUsers, search]);

	// Track selected users locally in modal
	const [localSelected, setLocalSelected] = useState<Set<string>>(
		new Set(selectedUsers.map((u) => u.user_id))
	);

	// Sync with parent when modal opens/closes or selectedUsers changes
	useEffect(() => {
		if (isOpen) {
			setLocalSelected(new Set(selectedUsers.map((u) => u.user_id)));
		}
	}, [isOpen, selectedUsers]);

	const handleSelect = (user: CastedUserProps) => {
		const newSelected = new Set(localSelected);
		if (newSelected.has(user.user_id)) {
			newSelected.delete(user.user_id);
		} else {
			newSelected.add(user.user_id);
		}
		setLocalSelected(newSelected);
	};

	const handleConfirm = () => {
		// Add all selected users
		const selectedUserList = allUsers.filter((u) => localSelected.has(u.user_id));
		selectedUserList.forEach((user) => onSelect(user));
		setLocalSelected(new Set());
		setSearch("");
		onClose();
	};

	const handleRemoveFromSelection = (userId: string) => {
		const newSelected = new Set(localSelected);
		newSelected.delete(userId);
		setLocalSelected(newSelected);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
				<h2 className="mb-4 text-lg font-semibold">Select Users</h2>

				{localSelected.size > 0 && (
					<div className="mb-3 flex flex-wrap gap-2">
						{Array.from(localSelected).map((id) => {
							const user = allUsers.find((u) => u.user_id === id);
							if (!user) return null;
							return (
								<div
									key={id}
									className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs">
									<span>
										{user.user_first_name} {user.user_last_name}
									</span>
									<button
										onClick={() => handleRemoveFromSelection(id)}
										className="ml-1 text-blue-600 hover:text-blue-800">
										×
									</button>
								</div>
							);
						})}
					</div>
				)}

				<div className="relative mb-4">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name or email..."
						className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
					/>
					<svg
						className="absolute left-3 top-3 h-5 w-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				<div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
					{isLoading ? (
						<div className="flex items-center justify-center p-8">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
						</div>
					) : filteredUsers.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							{search.trim() ? "No users found" : "No users available"}
						</div>
					) : (
						<ul className="divide-y divide-gray-100">
							{filteredUsers.map((user) => {
								const isSelected = localSelected.has(user.user_id);
								return (
									<li
										key={user.user_id}
										onClick={() => handleSelect(user)}
										className={`flex cursor-pointer items-center gap-3 p-3 transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}>
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
											{user.user_first_name?.[0]}
											{user.user_last_name?.[0]}
										</div>
										<div className="flex-1">
											<p className="font-medium text-gray-900">
												{user.user_first_name} {user.user_last_name}
											</p>
											<p className="text-sm text-gray-500">{user.user_email}</p>
										</div>
										<div
											className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"}`}>
											{isSelected && (
												<svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				{localSelected.size > 0 && (
					<p className="mt-2 text-sm text-blue-600">
						{localSelected.size} user{localSelected.size > 1 ? "s" : ""} selected
					</p>
				)}

				<div className="mt-4 flex justify-end gap-2">
					<button
						onClick={() => {
							setLocalSelected(new Set());
							setSearch("");
							onClose();
						}}
						className="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100">
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						disabled={localSelected.size === 0}
						className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
						Add Selected
					</button>
				</div>
			</div>
		</div>
	);
};

// ============== Selected User Badge ==============

interface SelectedUserBadgeProps {
	user: CastedUserProps;
	onRemove: () => void;
}

const SelectedUserBadge: React.FC<SelectedUserBadgeProps> = ({ user, onRemove }) => (
	<div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
		<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
			{user.user_first_name?.[0]}
			{user.user_last_name?.[0]}
		</div>
		<span className="text-sm text-blue-800">
			{user.user_first_name} {user.user_last_name}
		</span>
		<button
			onClick={onRemove}
			className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300">
			<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
);

// ============== Notification Form ==============

const NotificationForm = () => {
	const [type, setType] = useState<NotificationType>("USER");
	const [category, setCategory] = useState<NotificationCategory>("GENERAL");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [deeplink, setDeeplink] = useState("");
	const [deeplinkParam, setDeeplinkParam] = useState("");
	const [notificationTypeId, setNotificationTypeId] = useState("");
	const [notificationIcon, setNotificationIcon] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<CastedUserProps[]>([]);
	const [bundle, setBundle] = useState<UserFilterType | "">("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);

	const { user } = useUserStore();
	const senderId = user?.id || "";
	const sendNotification = useSendNotification();

	// Reset selections when type changes
	useEffect(() => {
		setSelectedUsers([]);
	}, [type]);

	// Build the final deeplink with parameter if needed
	const getFinalDeeplink = () => {
		if (!deeplink) return "";
		if (deeplinkParam && deeplink.includes("[")) {
			return deeplink.replace(/\[.*?\]/g, deeplinkParam);
		}
		return deeplink;
	};

	// Check if selected deeplink needs a parameter
	const selectedDeeplink = DEEPLINK_OPTIONS.find((opt) => opt.value === deeplink);
	const needsParam = deeplink && deeplink.includes("[");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setResult(null);

		try {
			const finalDeeplink = getFinalDeeplink();

			const payload: SendNotificationParams = {
				title,
				message,
				category,
				type: bundle && bundle !== "ALL" && bundle !== "PAID" && bundle !== "EXPIRED" ? "ADMIN" : type,
				sender: senderId,
				receiver:
					type === "USER"
						? bundle === "PAID"
							? "true"
							: bundle || "ALL"
						: selectedUsers.map((u) => u.user_id).join(","),
			};

			if (finalDeeplink) payload.path = finalDeeplink;
			if (notificationTypeId) payload.notification_type_id = notificationTypeId;
			if (notificationIcon) payload.notification_icon = notificationIcon;

			console.log("Sending notification payload:", JSON.stringify(payload, null, 2));

			await sendNotification.mutateAsync(payload);
			setResult({ success: true, message: "Notification sent successfully!" });

			// Reset form
			setTitle("");
			setMessage("");
			setDeeplink("");
			setDeeplinkParam("");
			setNotificationTypeId("");
			setNotificationIcon("");
			setSelectedUsers([]);
			setBundle("");
		} catch (error: unknown) {
			console.error("Notification error:", error);
			const errorMessage =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
				(error as { message?: string })?.message ||
				"Failed to send notification. Please try again.";
			setResult({ success: false, message: errorMessage });
		} finally {
			setIsSubmitting(false);
		}
	};

	const isDisabled =
		isSubmitting ||
		!title ||
		!message ||
		!senderId ||
		(type === "ADMIN" && selectedUsers.length === 0);

	const handleMultiUserSelect = useCallback((user: CastedUserProps) => {
		setSelectedUsers((prev) => {
			if (prev.find((u) => u.user_id === user.user_id)) {
				return prev.filter((u) => u.user_id !== user.user_id);
			}
			return [...prev, user];
		});
	}, []);

	const handleUserRemove = (userId: string) => {
		setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId));
	};

	return (
		<div className="max-w-4xl">
			{result && (
				<div
					className={`mb-6 rounded-lg p-4 ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
					{result.message}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Target Type Selection */}
				<div className="rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-lg font-semibold">Target Audience</h2>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-2">
						{TYPE_OPTIONS.map((option) => (
							<label
								key={option.value}
								className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 text-center transition-colors ${
									type === option.value
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 hover:border-gray-300"
								}`}>
								<input
									type="radio"
									name="type"
									value={option.value}
									checked={type === option.value}
									onChange={(e) => setType(e.target.value as NotificationType)}
									className="sr-only"
								/>
								<span className="text-sm font-medium">{option.label}</span>
							</label>
						))}
					</div>

					{/* User Selection for specific */}
					{type === "ADMIN" && (
						<div className="mt-4">
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Select Users ({selectedUsers.length} selected)
							</label>
							{selectedUsers.length > 0 ? (
								<div className="mb-2 flex flex-wrap gap-2">
									{selectedUsers.map((user) => (
										<SelectedUserBadge
											key={user.user_id}
											user={user}
											onRemove={() => handleUserRemove(user.user_id)}
										/>
									))}
								</div>
							) : null}
							<button
								type="button"
								onClick={() => setIsUserModalOpen(true)}
								className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600">
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
								Search and select users
							</button>
						</div>
					)}

					{/* Bundle Selection for all users */}
					{type === "USER" && (
						<div className="mt-4">
							<label className="mb-1 block text-sm font-medium text-gray-700">User Filter</label>
							<select
								value={bundle}
								onChange={(e) => setBundle(e.target.value as UserFilterType)}
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
								<option value="">All Users</option>
								{BUNDLE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* Notification Content */}
				<div className="rounded-lg bg-white p-6 shadow">
					<h2 className="mb-4 text-lg font-semibold">Notification Content</h2>
					<div className="space-y-4">
						{/* Title */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Title <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g., New Announcement"
								maxLength={100}
								required
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
							<p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
						</div>

						{/* Message */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Message <span className="text-red-500">*</span>
							</label>
							<textarea
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="e.g., Your exam results are now available"
								maxLength={255}
								rows={3}
								required
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
							<p className="mt-1 text-xs text-gray-500">{message.length}/255 characters</p>
						</div>

						{/* Category */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value as NotificationCategory)}
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
								{CATEGORY_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						{/* Path (Deeplink) */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Deeplink (Where to open)
							</label>
							<select
								value={deeplink}
								onChange={(e) => {
									setDeeplink(e.target.value);
									setDeeplinkParam("");
								}}
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
								{DEEPLINK_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						{/* Dynamic parameter input for deeplinks that need IDs */}
						{needsParam && (
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">
									{selectedDeeplink?.label.split(" ")[1] || "Item"} ID{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={deeplinkParam}
									onChange={(e) => setDeeplinkParam(e.target.value)}
									placeholder="Enter ID (e.g., course-123)"
									required={needsParam}
									className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						)}

						{/* Notification Type ID */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Notification Type ID
								<span className="ml-1 font-normal text-gray-400">(Optional)</span>
							</label>
							<input
								type="text"
								value={notificationTypeId}
								onChange={(e) => setNotificationTypeId(e.target.value)}
								placeholder="e.g., type-123-uuid"
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
							<p className="mt-1 text-xs text-gray-500">
								A unique identifier for the type of notification. Leave empty if not sure.
							</p>
						</div>

						{/* Notification Icon */}
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Notification Icon URL
								<span className="ml-1 font-normal text-gray-400">(Optional)</span>
							</label>
							<input
								type="text"
								value={notificationIcon}
								onChange={(e) => setNotificationIcon(e.target.value)}
								placeholder="e.g., https://example.com/icons/exam-icon.png"
								className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isDisabled}
						className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${
							isDisabled ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
						}`}>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Sending...
							</span>
						) : (
							`Send Notification ${type === "USER" ? " to All Users" : ` to ${selectedUsers.length} Users`}`
						)}
					</button>
				</div>
			</form>

			{/* Preview Card */}
			{title || message ? (
				<div className="mt-8 rounded-lg bg-gray-100 p-6">
					<h3 className="mb-4 text-sm font-semibold text-gray-500">Notification Preview</h3>
					<div className="max-w-md rounded-lg bg-white p-4 shadow-lg">
						<div className="mb-2 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
								<span className="text-sm font-bold text-white">C</span>
							</div>
							<div>
								<p className="text-sm font-semibold">Classore</p>
								<p className="text-xs text-gray-500">just now</p>
							</div>
						</div>
						<p className="text-sm font-medium">{title || "Title"}</p>
						<p className="mt-1 text-sm text-gray-600">{message || "Message body"}</p>
						{deeplink && (
							<div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
								<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
								<span>Tapping opens: {selectedDeeplink?.label}</span>
							</div>
						)}
					</div>
				</div>
			) : null}

			{/* User Search Modal */}
			<UserSearchModal
				isOpen={isUserModalOpen}
				onClose={() => setIsUserModalOpen(false)}
				onSelect={handleMultiUserSelect}
				selectedUsers={selectedUsers}
			/>
		</div>
	);
};
