import type { AdminOneProps, PaginatedRoleProps } from "@/types";
import type { PermissionKey } from "@/constants";

export type PermissionObject = {
	permission: PermissionKey;
	hasPermission: boolean;
};

export const getUserPermissions = (user: AdminOneProps) => {
	const pattern = /^([a-zA-Z]+)_(read|write)$/;
	const permissions = Object.keys(user.role)
		.map((key) => {
			const match = key.match(pattern);
			return match ? key : null;
		})
		.filter((item): item is string => item !== null);
	return permissions;
};

export const hasPermission = (user: AdminOneProps | null, permissions: PermissionKey[]) => {
	if (!user) return false;
	const userPermissions = getUserPermissions(user);
	return permissions.every((permission) => userPermissions.includes(permission));
};

export const hasAllPermissions = (user: AdminOneProps | null, permissions: PermissionKey[]) => {
	if (!user) return false;
	const userPermissions = getUserPermissions(user);
	return permissions.every((permission) => userPermissions.includes(permission));
};

export const getRolePermissions = (role: PaginatedRoleProps): PermissionObject[] => {
	const pattern = /^([a-zA-Z]+)_(read|write)$/;
	const permissions = Object.entries(role)
		.map(([key, value]) => {
			const match = key.match(pattern);
			if (match) {
				const permission: PermissionKey = match[1] as PermissionKey;
				return { permission, hasPermission: value === "YES" };
			}
			return { permission: null, hasPermission: false };
		})
		.filter((item): item is PermissionObject => item.permission !== null);
	return permissions;
};
