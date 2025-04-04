import React, { useState, useEffect } from "react";
import { RiEditLine } from "@remixicon/react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import type { RoleProps } from "@/types";
import { RoleBadge } from "../dashboard";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
	role: RoleProps;
	id: string;
}

interface PermissionItem {
	permission: string;
	hasPermission: boolean;
}

export const RoleActions = ({ role, id }: Props) => {
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [permissions, setPermissions] = useState<PermissionItem[]>([]);
	const [loading, setLoading] = useState(false);

	const extractPermissions = React.useCallback(() => {
		if (!role) return;

		const pattern = /^role_(admin|marketer|student|transactions|utor|videos|waitlist)_(read|write)$/;
		const extractedPermissions: PermissionItem[] = Object.entries(role)
			.filter(([key]) => pattern.test(key))
			.map(([key, value]) => ({
				permission: key,
				hasPermission: value === "YES",
			}));

		setPermissions(extractedPermissions);
	}, [role]);

	useEffect(() => {
		extractPermissions();
	}, [extractPermissions, role]);

	const togglePermission = (permissionKey: string) => {
		setPermissions((prev) =>
			prev.map((item) =>
				item.permission === permissionKey ? { ...item, hasPermission: !item.hasPermission } : item
			)
		);
	};

	const handleSave = () => {
		updateRolePermissions();
	};

	const updateRolePermissions = async () => {
		try {
			setLoading(true);

			if (!id) {
				alert("Error: Missing ID for role update.");
				return;
			}

			const apiUrl = `https://classore-be-dev.up.railway.app/classore/v1/admin/staff/update/${id}`;

			const response = await fetch(apiUrl, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					permissions: permissions.reduce(
						(acc, item) => {
							acc[item.permission] = item.hasPermission ? "YES" : "NO";
							return acc;
						},
						{} as Record<string, string>
					),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to update permissions.");
			}

			toast.success("Permissions updated successfully!");
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(`Error updating permissions: ${error.message}`);
			} else {
				toast.error("An unknown error occurred. Please try again.");
			}
		} finally {
			setLoading(false);
			setIsEditOpen(false);
		}
	};

	return (
		<div className="flex w-full flex-col gap-y-1">
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogTrigger>
					<button
						onClick={() => setIsEditOpen(true)}
						className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100">
						<RiEditLine size={18} /> Edit Role
					</button>
				</DialogTrigger>
				<DialogContent className="w-[500px]">
					<DialogTitle className="text-xl font-bold">Permissions List</DialogTitle>
					<DialogDescription className="text-base font-medium capitalize">
						{role.role_name}
					</DialogDescription>
					<hr />

					<div className="grid grid-cols-1 gap-2 p-2">
						{permissions.map((permission) => (
							<div key={permission.permission} className="flex items-center justify-between gap-2">
								<RoleBadge permission={permission} />
								<Switch
									checked={permission.hasPermission}
									onCheckedChange={() => togglePermission(permission.permission)}
								/>
							</div>
						))}
					</div>
					<div className="mt-4 flex justify-end">
						<Button size="sm" onClick={handleSave} disabled={loading}>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
