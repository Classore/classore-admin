import type { PermissionKey } from "@/constants";
import type { AdminOneProps } from "@/types";

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
