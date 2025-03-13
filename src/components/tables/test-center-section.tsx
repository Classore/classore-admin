import { RiMore2Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { TestCenterSectionProps } from "@/types";
import { TestCenterSectionAction } from "../actions";
import { Pagination } from "@/components/shared";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	onPageChange: (page: number) => void;
	page: number;
	sections: TestCenterSectionProps[];
	total: number;
	isLoading?: boolean;
}

export const TestCenterSectionTable = ({
	onPageChange,
	page,
	sections,
	total,
	isLoading,
}: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="min-w-[180px] text-neutral-400">Sections</TableHead>
						<TableHead className="min-w-[180px] text-center text-neutral-400">Last Updated</TableHead>
						<TableHead className="min-w-[180px] text-center text-neutral-400">Avg. Pass Score</TableHead>
						<TableHead className="min-w-[180px] text-center text-neutral-400">Status</TableHead>
						<TableHead className="w-[61px] text-center text-neutral-400"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && (
						<TableRow>
							<TableCell colSpan={12} className="h-[400px] py-10 text-center text-xs">
								Loading...
							</TableCell>
						</TableRow>
					)}
					{sections.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="py-10 text-center text-xs">
								No examination bundles found.
							</TableCell>
						</TableRow>
					)}
					{sections.map((section, index) => (
						<LineItem key={index} section={section} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ section }: { section: TestCenterSectionProps }) => {
	const admin = useUserStore().user;

	return (
		<TableRow>
			<TableCell className="flex min-w-[350px] items-center gap-x-2">
				<Avatar className="size-8 rounded-md">
					<AvatarImage src={section.banner} />
				</Avatar>
				<span className="text-sm font-medium capitalize">{section.title}</span>
			</TableCell>
			<TableCell>{format(new Date(), "MMM dd,yyyy HH:mm a")}</TableCell>
			<TableCell className="text-center">{section.average_pass_score}</TableCell>
			<TableCell className="max-w-[200px]">
				<div className="flex w-full items-center justify-center">
					<div
						className={`w-fit rounded-md px-3 py-0.5 text-xs font-medium ${section.is_published === "YES" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
						{section.is_published === "YES" ? "Published" : "Unpublished"}
					</div>
				</div>
			</TableCell>
			<TableCell>
				<Popover>
					<PopoverTrigger asChild disabled={!hasPermission(admin, ["videos_write"])}>
						<button className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40">
						<TestCenterSectionAction
							is_published={section.is_published === "YES"}
							sectionId={section.id}
						/>
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
