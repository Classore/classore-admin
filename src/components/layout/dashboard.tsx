import { useRouter } from "next/router"
import Link from "next/link"
import React from "react"

import { dashboard_links, role_access } from "@/config"
import type { DashboardLinkProps } from "@/config"
import { useUserStore } from "@/store/z-store"
import { normalize } from "@/lib"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { user } = useUserStore()
	const role = user?.role.name ?? "super"
	const { pathname } = useRouter()

	const isActiveRoute = (href: string) => normalize(pathname) === href

	const filterLinksByRole = (links: DashboardLinkProps["links"]) => {
		return links.filter((link) => role_access[role].includes(link.label))
	}

	return (
		<div className="flex h-screen w-screen items-start overflow-hidden">
			<aside className="flex h-full w-[280px] flex-col bg-primary-400">
				<div className="min-h-24 w-full border-b"></div>
				<div className="flex h-full w-full flex-col justify-between p-4">
					{dashboard_links.map(({ label, links }) => {
						const filtered = filterLinksByRole(links)
						return (
							<div key={label} className="flex w-full flex-col gap-4">
								<p className="text-xs font-medium uppercase text-neutral-200">{label}</p>
								<div className="flex w-full flex-col gap-4">
									{filtered.map(({ href, label }) => (
										<Link
											key={label}
											href={href}
											className={`relative flex h-9 items-center gap-2 rounded-md px-3 text-sm capitalize transition-colors hover:bg-white/35 ${isActiveRoute(href) ? "border bg-white/80 text-primary-400" : "text-white"}`}>
											{label}
										</Link>
									))}
								</div>
							</div>
						)
					})}
				</div>
				<div className="min-h-24 w-full border-t"></div>
			</aside>
			<main className="flex h-full w-full max-w-[calc(100vw-280px)] flex-1 flex-col bg-white">
				<div className="h-24 w-full border-b"></div>
				<div className="w-full overflow-y-scroll">{children}</div>
			</main>
		</div>
	)
}
