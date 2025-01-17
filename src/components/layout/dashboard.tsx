import { RiLogoutBoxRLine } from "@remixicon/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useUserStore } from "@/store/z-store";
import { Appbar, IconLabel } from "../shared";
import { dashboard_links } from "@/config";
import { Button } from "../ui/button";
import { normalize } from "@/lib";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);
	const { signOut } = useUserStore();
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
							{dashboard_links.value.map(({ id, links }) => (
								<div
									key={id}
									className="flex w-full flex-col gap-2 border-b py-4 last:border-b-0">
									{links.map(({ href, icon: Icon, name }) => {
										if (href) {
											return (
												<Link
													key={name}
													href={href}
													className={`relative flex h-10 items-center gap-2 rounded-md px-3 text-xs capitalize transition-colors hover:bg-primary-100 ${isActiveRoute(href) ? "bg-primary-100 font-medium text-primary-400" : "text-neutral-400"}`}>
													<Icon size={20} /> {name}
												</Link>
											);
										} else {
											return (
												<Dialog key={name} open={open} onOpenChange={setOpen}>
													<DialogTrigger asChild>
														<button className="flex h-10 items-center gap-2 rounded-md px-3 text-xs font-medium capitalize text-red-400 transition-colors hover:bg-primary-200 hover:text-red-500">
															<Icon size={20} /> {name}
														</button>
													</DialogTrigger>
													<DialogContent className="w-[400px] p-1">
														<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
															<IconLabel icon={RiLogoutBoxRLine} variant="destructive" />
															<div className="my-4 space-y-3">
																<DialogTitle>Log Out</DialogTitle>
																<DialogDescription>
																	Are you sure you want to log out of your account?
																</DialogDescription>
															</div>
															<div className="flex items-center justify-end gap-x-4">
																<Button
																	onClick={() => setOpen(false)}
																	className="w-fit"
																	variant="outline">
																	Cancel
																</Button>
																<Button onClick={signOut} className="w-fit" variant="destructive">
																	Proceed
																</Button>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											);
										}
									})}
								</div>
							))}
						</div>
					</div>
				</div>
			</aside>
			<main className="flex h-full w-full max-w-[calc(100vw-256px)] flex-1 flex-col">
				<Appbar />
				<div className="h-[calc(100vh-96px)] w-full flex-1 overflow-y-scroll bg-[#F6F8FA] px-8 py-6">
					{children}
				</div>
			</main>
		</div>
	);
}
