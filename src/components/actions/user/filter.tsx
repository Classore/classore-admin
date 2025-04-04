import { RiFilter3Line } from "@remixicon/react";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { type UserFilters } from "@/queries";
import { periods } from "@/config";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Props {
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	setFieldValue: (field: keyof UserFilters, value: string) => void;
	values: UserFilters;
}

export const UserFilter = ({ onSubmit, setFieldValue, values }: Props) => {
	const [open, setOpen] = React.useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit(e);
		setOpen(false);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button className="w-fit" onClick={() => setOpen(true)} size="sm" variant="outline">
					<RiFilter3Line /> Filters
				</Button>
			</PopoverTrigger>
			<PopoverContent className="mr-10 w-[400px]">
				<form onSubmit={handleSubmit} className="w-full space-y-2">
					<fieldset className="grid grid-cols-2 gap-x-2">
						<Select onValueChange={(value) => setFieldValue("sort_by", value)} value={values.sort_by}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Sort By" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NAME">Name</SelectItem>
								<SelectItem value="DATE_CREATED">Date Created</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(value) => setFieldValue("sort_order", value)}
							value={values.sort_order}>
							<SelectTrigger>
								<SelectValue placeholder="Sort Order" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ASC">Ascending</SelectItem>
								<SelectItem value="DESC">Descending</SelectItem>
							</SelectContent>
						</Select>
					</fieldset>
					<fieldset className="grid grid-cols-2 gap-x-2">
						<Select onValueChange={(value) => setFieldValue("timeline", value)} value={values.timeline}>
							<SelectTrigger>
								<SelectValue placeholder="Select timeline" />
							</SelectTrigger>
							<SelectContent>
								{periods.map(({ label, period }, index) => (
									<SelectItem key={index} value={period}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</fieldset>
					<fieldset className="grid grid-cols-2 gap-x-2">
						<div className="flex items-center gap-x-2">
							<label htmlFor="is_blocked" className="text-xs font-medium text-neutral-400">
								Show Blocked
							</label>
							<Switch
								checked={values.is_blocked === "YES"}
								onCheckedChange={() =>
									setFieldValue("is_blocked", values.is_blocked === "YES" ? "NO" : "YES")
								}
							/>
						</div>
						<div className="flex items-center gap-x-2">
							<label htmlFor="is_blocked" className="text-xs font-medium text-neutral-400">
								Show Deleted
							</label>
							<Switch
								checked={values.is_deleted === "YES"}
								onCheckedChange={() =>
									setFieldValue("is_deleted", values.is_deleted === "YES" ? "NO" : "YES")
								}
							/>
						</div>
					</fieldset>
					<div className="mt-5 flex w-full items-center justify-end">
						<Button className="w-fit" size="sm" type="submit">
							Apply Filters
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
};
