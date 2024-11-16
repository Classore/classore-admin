import type { RemixiconComponentType } from "@remixicon/react"

import type { RoleProps } from "@/types"

export type DashboardLinkProps = {
	label: string
	links: {
		label: string
		href: string
		icon?: RemixiconComponentType
	}[]
}

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
				label: "transactions",
				href: "/dashboard/transactions",
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
			{
				label: "roles & permissions",
				href: "/dashboard/roles-and-permissions",
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
