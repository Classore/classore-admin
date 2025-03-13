import { RiMore2Line, RiUser3Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import type { TestCenterProps } from "@/types";
import { TestCenterAction } from "../actions";
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
	tests: TestCenterProps[];
	total: number;
	isLoading?: boolean;
}

export const TestCenterTable = ({ onPageChange, page, tests, total, isLoading }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="min-w-[180px] text-neutral-400">Tests</TableHead>
						<TableHead className="min-w-[180px] text-neutral-400">Sections</TableHead>
						<TableHead className="min-w-[180px] text-center text-neutral-400">Last Updated</TableHead>
						<TableHead className="min-w-[180px] text-center text-neutral-400">Participants</TableHead>
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
					{tests.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="py-10 text-center text-xs">
								No examination bundles found.
							</TableCell>
						</TableRow>
					)}
					{tests.map((test, index) => (
						<LineItem key={index} test={test} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ test }: { test: TestCenterProps }) => {
	const admin = useUserStore().user;

	return (
		<TableRow>
			<TableCell className="flex items-center gap-x-2">
				<Avatar className="size-8 rounded-md">
					<AvatarImage src={test.banner} />
				</Avatar>
				<span className="text-sm font-medium uppercase">{test.title}</span>
			</TableCell>
			<TableCell>{test.sections}</TableCell>
			<TableCell>{format(new Date(), "MMM dd,yyyy HH:mm a")}</TableCell>
			<TableCell className="flex items-center justify-center gap-x-2">
				<RiUser3Line size={18} />
				<span className="text-sm font-medium">{test.participants}</span>
			</TableCell>
			<TableCell className="max-w-[200px]">
				<div className="flex w-full items-center justify-center">
					<div
						className={`w-fit rounded-md px-3 py-0.5 text-xs font-medium ${test.is_published === "YES" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
						{test.is_published === "YES" ? "Published" : "Unpublished"}
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
						<TestCenterAction id={test.id} is_published={test.is_published === "YES"} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
