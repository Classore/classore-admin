import { RiArrowDownSLine, RiNotification4Line } from "@remixicon/react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUserStore } from "@/store/z-store";
import { SearchInput } from "./search-input";
import { useDebounce } from "@/hooks";

export const Appbar = () => {
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
		<nav className="flex h-24 w-full items-center justify-between bg-white px-8">
			<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
			<div className="flex items-center gap-x-3">
				<button className="relative grid size-9 place-items-center rounded-full border">
					<RiNotification4Line size={18} />
				</button>
				<div className="h-7 w-[1px] bg-neutral-300"></div>
				<div
					onClick={() => setOpen(!open)}
					className="flex cursor-pointer items-center gap-x-2">
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
	);
};
