export type Permissions =
	| "admin"
	| "marketer"
	| "student"
	| "transactions"
	| "tutor"
	| "videos"
	| "waitlist";

export type PermissionKey = `${Permissions}_read` | `${Permissions}_write`;

export type PermissionItem = {
	[key in PermissionKey]: "YES" | "NO";
};

export const permissions: PermissionItem = {
	admin_read: "YES",
	admin_write: "YES",
	marketer_read: "YES",
	marketer_write: "YES",
	student_read: "YES",
	student_write: "YES",
	transactions_read: "YES",
	transactions_write: "YES",
	tutor_read: "YES",
	tutor_write: "YES",
	videos_read: "YES",
	videos_write: "YES",
	waitlist_read: "YES",
	waitlist_write: "YES",
};
