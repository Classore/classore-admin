import { RiHashtag, RiUserAddLine } from "@remixicon/react";
import React from "react";

import { Textarea } from "../ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export const AssignTeachers = () => {
	return (
		<div className="grid w-full grid-cols-2 gap-x-4">
			<div className="h-fit w-full space-y-2 rounded-lg bg-neutral-100 p-3">
				<p className="text-xs font-medium text-neutral-500">ASSIGN TEACHER</p>
				<div className="w-full space-y-2 rounded-lg bg-white p-4">
					<div className="flex items-start gap-x-2">
						<RiUserAddLine size={18} />
						<div className="flex-1 space-y-2">
							<label className="text-sm font-medium" htmlFor="">
								Select Teacher
							</label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Teacher" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
									<SelectItem value="system">System</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			<div className="h-fit w-full space-y-2 rounded-lg bg-neutral-100 p-3">
				<p className="text-xs font-medium text-neutral-500">ADD COURSE TAGS</p>
				<div className="w-full rounded-lg bg-white p-4">
					<div className="flex items-start gap-x-2">
						<RiHashtag size={18} />
						<div className="flex-1 space-y-2">
							<label className="text-sm font-medium" htmlFor="">
								Tags
							</label>
							<p className="text-[10px]">Use relevant keywords for the created course</p>
							<Textarea className="h-[90px]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
