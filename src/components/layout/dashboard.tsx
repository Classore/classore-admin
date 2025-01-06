import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { dashboard_links } from "@/config";
import { Appbar } from "../shared";
import { normalize } from "@/lib";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { pathname } = useRouter();

	const isActiveRoute = (href: string) => normalize(pathname) === href;

	return (
		<div className="flex h-screen w-screen items-start overflow-hidden">
			<aside className="flex h-full w-[256px] flex-col bg-white">
				<div className="min-h-24 w-full px-6 py-9">
					<div className="relative h-8 w-[140px]">
						<Image
							src="/assets/images/classore.png"
							alt="classore"
							fill
							sizes="100%"
							className="object-cover"
						/>
					</div>
				</div>
				<div className="flex h-full w-full flex-col overflow-y-scroll">
					<div className="flex w-full flex-col px-6">
						<p className="text-[10px] font-medium uppercase text-neutral-200">admin menu</p>
						<div className="flex w-full flex-col">
							{dashboard_links.value.map(({ id, links }) => {
								return (
									<div
										key={id}
										className="flex w-full flex-col gap-2 border-b py-4 last:border-b-0">
										{links.map(({ href, icon: Icon, name }) => (
											<Link
												key={name}
												href={href}
												className={`relative flex h-10 items-center gap-2 rounded-md px-3 text-xs capitalize transition-colors hover:bg-primary-100 ${isActiveRoute(href) ? "bg-primary-100 font-medium text-primary-400" : "text-neutral-400"}`}>
												<Icon size={20} /> {name}
											</Link>
										))}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</aside>
			<main className="flex h-full w-full max-w-[calc(100vw-256px)] flex-1 flex-col">
				<Appbar />
				<div className="w-full flex-1 overflow-y-scroll bg-[#F6F8FA] px-8 py-6">
					{children}
				</div>
			</main>
		</div>
	);
}
