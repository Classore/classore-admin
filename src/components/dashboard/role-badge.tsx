import React from "react";

interface Props {
	permission: {
		permission: string;
		hasPermission: boolean;
	};
}

const sanitize = (value: string) => {
	const words = value
		.split("_")
		.filter((_, index) => index !== 0)
		.reverse()
		.join(" ");
	return words;
};

export const RoleBadge = ({ permission }: Props) => {
	return (
		<div className="flex items-center justify-between gap-x-3 rounded-md border px-2 py-1">
			<p className="text-sm capitalize">{sanitize(permission.permission)}</p>
			<div
				className={`flex items-center rounded-md px-1.5 text-xs font-medium ${permission.hasPermission ? "bg-green-100 text-green-400" : "bg-red-100 text-red-400"}`}>
				{permission.hasPermission ? "YES" : "NO"}
			</div>
		</div>
	);
};
