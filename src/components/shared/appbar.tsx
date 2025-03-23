import { RiArrowDownSLine, RiNotification4Line } from "@remixicon/react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePassword, Profile } from "@/components/user";
import { ADMIN_TABS } from "@/constants/admin";
import { useUserStore } from "@/store/z-store";
import { SearchInput } from "./search-input";
import { useDebounce } from "@/hooks";

export const Appbar = () => {
	const [tab, setTab] = React.useState("profile");
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const search = useDebounce(query, 500);
	const { user } = useUserStore();

	React.useEffect(() => {
		if (search) {
			console.log(search);
		}
	}, [search]);

	return (
		<>
			<nav className="flex h-24 w-full items-center justify-between bg-white px-8">
				<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
				<div className="flex items-center gap-x-3">
					<button className="relative grid size-9 place-items-center rounded-full border">
						<RiNotification4Line size={18} />
					</button>
					<div className="h-7 w-[1px] bg-neutral-300"></div>
					<div onClick={() => setOpen(!open)} className="flex cursor-pointer items-center gap-x-2">
						<Avatar className="size-9">
							<AvatarImage src="" alt={user?.first_name} />
							<AvatarFallback className="bg-black text-white">
								{user?.first_name.charAt(0).toUpperCase()}
								{user?.last_name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<p className="text-sm font-medium capitalize">
								{user?.first_name} {user?.last_name}
							</p>
							<p className="text-xs text-neutral-400">{user?.email}</p>
						</div>
						<RiArrowDownSLine
							className={`size-[18px] transition-transform duration-500 ${open ? "rotate-180" : ""}`}
						/>
					</div>
				</div>
			</nav>
			<div
				hidden={!open}
				onClick={() => setOpen(false)}
				className={`fixed left-0 top-0 !z-10 h-screen w-screen bg-black/50 backdrop-blur backdrop-filter`}>
				<div
					onClick={(e) => e.stopPropagation()}
					className="absolute right-4 top-4 h-[calc(100vh-32px)] w-[500px] animate-slide-from-right rounded-lg bg-white duration-300">
					<div className="h-full w-full space-y-4 p-4">
						<p className="text-lg font-semibold">Admin Details</p>
						{/* HEADER */}
						<div className="w-full">
							<div className="h-[150px] w-full rounded-lg bg-gradient-to-r from-secondary-100 via-primary-200 to-primary-200"></div>
							<div className="-mt-9 flex w-full items-center justify-between">
								<div className="ml-4 flex items-center gap-x-4">
									<Avatar className="size-[120px]">
										<AvatarImage src="" alt={user?.first_name} />
										<AvatarFallback className="bg-black text-4xl text-white">
											{user?.first_name.charAt(0).toUpperCase()}
											{user?.last_name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium capitalize">
											{user?.first_name} {user?.last_name}
										</p>
										<p className="text-sm text-neutral-400">{user?.email}</p>
									</div>
								</div>
								<div
									className={`h-6 rounded-md px-3 text-sm font-medium ${user?.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
									{user?.is_blocked ? "Blocked" : "Active"}
								</div>
							</div>
						</div>
						{/* TABS */}
						<div className="w-full space-y-6">
							<div className="flex h-10 w-full items-center gap-x-4 border-b">
								{ADMIN_TABS.map(({ icon: Icon, label, value }) => (
									<button
										key={value}
										onClick={() => setTab(value)}
										className={`relative flex h-10 items-center gap-x-2 text-sm font-medium transition-all duration-300 before:absolute before:left-0 before:top-full before:h-0.5 before:bg-primary-400 ${tab === value ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
										<Icon className="size-4" /> {label}
									</button>
								))}
							</div>
							<div className="h-[calc(100vh-420px)] w-full overflow-y-auto">
								<Profile selected={tab} />
								<ChangePassword selected={tab} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
