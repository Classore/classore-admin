import {
	RiAdminLine,
	RiBarChart2Line,
	RiBookLine,
	RiCalendar2Line,
	RiFlaskLine,
	RiHourglassLine,
	RiLogoutBoxRLine,
	RiMessage3Line,
	RiMoneyDollarCircleLine,
	RiSettingsLine,
	RiTeamLine,
} from "@remixicon/react";

import type { RoleProps } from "@/types";

export const role_access: Record<RoleProps["name"], string[]> = {
	admin: ["dashboard", "courses", "teacher", "users", "account", "messages", "settings"],
	teacher: ["dashboard", "courses", "account", "messages"],
	super: [
		"dashboard",
		"courses",
		"teachers",
		"users",
		"transactions",
		"subscriptions",
		"account",
		"messages",
		"admins",
		"roles & permissions",
		"waitlist",
		"settings",
	],
	sub: ["dashboard", "courses", "account", "messages"],
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
				{ name: "test center", href: "/dashboard/test-center", icon: RiFlaskLine },
				{ name: "calendar", href: "/dashboard/calendar", icon: RiCalendar2Line },
				{ name: "messages", href: "/dashboard/messages", icon: RiMessage3Line },
				{ name: "settings", href: "/dashboard/settings", icon: RiSettingsLine },
			],
		},
		{
			id: "4",
			links: [
				{ name: "waitlist", href: "/dashboard/waitlist", icon: RiHourglassLine },
				{ name: "log out", href: "", icon: RiLogoutBoxRLine },
			],
		},
	],
};
