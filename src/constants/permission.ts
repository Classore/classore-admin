export type Permissions =
	| "admin"
	| "student"
	| "transactions"
	| "tutor"
	| "videos"
	| "waitlist";
export type PermissionKey = `${Permissions}_read` | `${Permissions}_write`;

export type PermissionItem = {
	[key in PermissionKey]: "YES" | "NO";
};
