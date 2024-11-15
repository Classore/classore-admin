import type { RemixiconComponentType } from "@remixicon/react"

import type { AdminProps } from "@/types"

export type DashboardLinkProps = {
	label: string
	links: {
		label: string
		href: string
		icon?: RemixiconComponentType
	}[]
}

export const role_access: Record<AdminProps["role"], string[]> = {
	ADMIN: ["dashboard", "courses", "teacher", "users", "account", "settings"],
	SUB_TEACHER: ["dashboard", "courses", "account"],
	SUPER_ADMIN: [
		"dashboard",
		"courses",
		"teachers",
		"users",
		"payments",
		"subscriptions",
		"account",
		"admins",
		"waitlist",
		"settings",
	],
	TEACHER: ["dashboard", "courses", "account"],
}

export const dashboard_links: DashboardLinkProps[] = [
	{
		label: "main",
		links: [
			{
				label: "dashboard",
				href: "/dashboard",
			},
			{
				label: "courses",
				href: "/dashboard/courses",
			},
			{
				label: "users",
				href: "/dashboard/users",
			},
			{
				label: "payments",
				href: "/dashboard/payments",
			},
			{
				label: "subscriptions",
				href: "/dashboard/subscriptions",
			},
			{
				label: "teachers",
				href: "/dashboard/teachers",
			},
			{
				label: "admins",
				href: "/dashboard/admins",
			},
		],
	},
	{
		label: "others",
		links: [
			{
				label: "account",
				href: "/dashboard/account",
			},
			{
				label: "waitlist",
				href: "/dashboard/waitlist",
			},
			{
				label: "settings",
				href: "/dashboard/settings",
			},
		],
	},
]
