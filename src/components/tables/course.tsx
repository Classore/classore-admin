import { RiFileTextLine, RiMore2Line, RiPlayCircleLine } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared";
import type { CourseProps } from "@/types";
import { formatCurrency } from "@/lib";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	courses: CourseProps[];
	onPageChange: (page: number) => void;
	page: number;
	total: number;
}

const status: Record<CourseProps["status"], string> = {
	PUBLISHED: "bg-green-100 text-green-500",
	UNPUBLISHED: "bg-red-100 text-red-500",
};

export const CourseTable = ({ courses, onPageChange, page, total }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="w-[] text-neutral-400">Subcategories</TableHead>
						<TableHead className="w-[118px] text-center text-neutral-400">
							Amount/Course
						</TableHead>
						<TableHead className="w-[236px] text-center text-neutral-400">
							Last Updated
						</TableHead>
						<TableHead className="w-[236px] text-center text-neutral-400">Media</TableHead>
						<TableHead className="w-[154px] text-center text-neutral-400">Status</TableHead>
						<TableHead className="w-[61px] text-center text-neutral-400"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{courses.map((course) => (
						<LineItem key={course.id} course={course} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ course }: { course: CourseProps }) => {
	return (
		<TableRow>
			<TableCell className="text-xs font-medium">{course.title}</TableCell>
			<TableCell className="text-xs">{formatCurrency(course.amount)}</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{course.updatedOn
					? format(new Date(course.updatedOn), "MMM dd,yyyy HH:mm a")
					: format(course.createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-3">
					<div className="flex items-center gap-x-1">
						<RiPlayCircleLine size={16} />
						<span>{course.media.videos.length} Videos</span>
					</div>
					<div className="flex items-center gap-x-1">
						<RiFileTextLine size={16} />
						<span>{course.media.files.length} Files</span>
					</div>
				</div>
			</TableCell>
			<TableCell className="text-center text-xs">
				<div
					className={`flex items-center justify-center rounded px-3 py-0.5 text-[10px] font-medium capitalize ${status[course.status]}`}>
					{course.status}
				</div>
			</TableCell>
			<TableCell>
				<Popover>
					<PopoverTrigger asChild>
						<button className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40"></PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
