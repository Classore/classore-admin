import { RiLogoutCircleRLine } from "@remixicon/react"
import { useRouter } from "next/router"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { dashboard_links, role_access } from "@/config"
import type { DashboardLinkProps } from "@/config"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/z-store"
import { getInitials, normalize } from "@/lib"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false)
	const { signOut, user } = useUserStore()
	const role = user?.role.name ?? "super"
	const { pathname } = useRouter()

	const isActiveRoute = (href: string) => normalize(pathname) === href

	const filterLinksByRole = (links: DashboardLinkProps["links"]) => {
		return links.filter((link) => role_access[role].includes(link.label))
	}

	const handleSignOut = () => {
		signOut().then(() => {
			setOpen(false)
		})
	}

	return (
		<div className="flex h-screen w-screen items-start overflow-hidden">
			<aside className="flex h-full w-[285px] flex-col bg-primary-400">
				<div className="min-h-24 w-full border-b"></div>
				<div className="flex h-full w-full flex-col justify-between p-4">
					{dashboard_links.map(({ label, links }) => {
						const filtered = filterLinksByRole(links)
						return (
							<div key={label} className="flex w-full flex-col gap-4">
								<p className="text-[10px] font-medium uppercase text-neutral-200">{label}</p>
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
				<div className="grid min-h-24 w-full place-items-center border-t text-white">
					<div className="flex h-[68px] w-full items-center gap-4 px-4">
						<Avatar className="size-8">
							<AvatarImage src="" alt={user?.first_name} />
							<AvatarFallback>{getInitials(`${user?.first_name} ${user?.last_name}`)}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<p className="text-sm capitalize text-white">{`${user?.first_name} ${user?.last_name}`}</p>
							<p className="text-xs lowercase text-white/70">{user?.email}</p>
						</div>
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<button>
									<RiLogoutCircleRLine size={16} />
								</button>
							</DialogTrigger>
							<DialogContent className="left-1/2 top-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2">
								<DialogTitle>Logout</DialogTitle>
								<DialogDescription>Are you sure you want to logout?</DialogDescription>
								<div className="grid w-full grid-cols-2 gap-4">
									<Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button className="w-full" onClick={() => handleSignOut()}>
										Continue
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</aside>
			<main className="flex h-full w-full max-w-[calc(100vw-280px)] flex-1 flex-col bg-white">
				<div className="h-24 w-full border-b"></div>
				<div className="w-full overflow-y-scroll">{children}</div>
			</main>
		</div>
	)
}
