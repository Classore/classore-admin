import {
	RiAdminLine,
	RiBarChart2Line,
	RiBookLine,
	RiCalendar2Line,
	RiMessage3Line,
	RiMoneyDollarCircleLine,
	RiSettingsLine,
	RiTeamLine,
} from "@remixicon/react";

import type { RoleProps } from "@/types";

export const role_access: Record<RoleProps["name"], string[]> = {
	admin: ["dashboard", "courses", "teacher", "users", "account", "settings"],
	teacher: ["dashboard", "courses", "account"],
	super: [
		"dashboard",
		"courses",
		"teachers",
		"users",
		"transactions",
		"subscriptions",
		"account",
		"admins",
		"roles & permissions",
		"waitlist",
		"settings",
	],
	sub: ["dashboard", "courses", "account"],
};

export const dashboard_links = {
	label: "admin menu",
	value: [
		{
			id: "1",
			links: [
				{ name: "analytics", href: "/dashboard", icon: RiBarChart2Line },
				{ name: "manage users", href: "/dashboard/users", icon: RiTeamLine },
				{ name: "manage courses", href: "/dashboard/courses", icon: RiBookLine },
			],
		},
		{
			id: "2",
			links: [
				{ name: "manage forums", href: "/dashboard/forums", icon: RiMessage3Line },
				{
					name: "payments",
					href: "/dashboard/subscriptions",
					icon: RiMoneyDollarCircleLine,
				},
				{
					name: "manage roles",
					href: "/dashboard/roles-and-permissions",
					icon: RiAdminLine,
				},
			],
		},
		{
			id: "3",
			links: [
				{ name: "calendar", href: "/dashboard/calendar", icon: RiCalendar2Line },
				{ name: "settings", href: "/dashboard/settings", icon: RiSettingsLine },
			],
		},
	],
};
