import { RiEditLine } from "@remixicon/react";
import React, { useState, useEffect } from "react";
import type { RoleProps } from "@/types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { RoleBadge } from "../dashboard";

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

	// Extracts and formats permissions from role object
	const extractPermissions = () => {
		if (!role) return;

		const pattern = /^role_(admin|marketer|student|transactions|utor|videos|waitlist)_(read|write)$/;
		const extractedPermissions: PermissionItem[] = Object.entries(role)
			.filter(([key]) => pattern.test(key))
			.map(([key, value]) => ({
				permission: key,
				hasPermission: value === "YES",
			}));

		setPermissions(extractedPermissions);
	};

	useEffect(() => {
		extractPermissions();
	}, [role]);

	// Toggle a permission state
	const togglePermission = (permissionKey: string) => {
		setPermissions((prev) =>
			prev.map((item) =>
				item.permission === permissionKey ? { ...item, hasPermission: !item.hasPermission } : item
			)
		);
	};

	// Handle Save button click
	const handleSave = () => {
		updateRolePermissions();
	};

  console.log(`Sending request to: /admin/staff/update/${id}`);

	// API Call: Update role permissions
	const updateRolePermissions = async () => {
    try {
      setLoading(true);
  
      if (!id) {
        alert("Error: Missing ID for role update.");
        return;
      }
  
      const response = await fetch(`/admin/staff/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: permissions.reduce((acc, item) => {
            acc[item.permission] = item.hasPermission ? "YES" : "NO";
            return acc;
          }, {} as Record<string, string>),
        }),
      });
  
      const data = await response.json(); // Convert response to JSON
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to update permissions.");
      }
  
      alert("Permissions updated successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        alert(`Error updating permissions: ${error.message}`);
      } else {
        console.error("Unknown Error:", error);
        alert("An unknown error occurred. Please try again.");
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
							<div key={permission.permission} className="flex items-center gap-2 justify-between">
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
