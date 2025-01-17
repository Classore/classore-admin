import { RiFileTextLine, RiMore2Line, RiPlayCircleLine } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CastedCourseProps } from "@/types/casted-types";
import { Pagination } from "@/components/shared";
import { CourseActions } from "../actions";
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
	courses: CastedCourseProps[];
	onPageChange: (page: number) => void;
	page: number;
	total: number;
}

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
					{courses.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="py-10 text-center text-xs">
								No courses found.
							</TableCell>
						</TableRow>
					)}
					{courses.map((course) => (
						<LineItem key={course.subject_id} course={course} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ course }: { course: CastedCourseProps }) => {
	return (
		<TableRow>
			<TableCell className="text-xs font-medium capitalize">{course.subject_name}</TableCell>
			<TableCell className="text-xs">{formatCurrency(0)}</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{course.subject_updatedOn
					? format(new Date(course.subject_updatedOn), "MMM dd,yyyy HH:mm a")
					: format(course.subject_createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-3">
					<div className="flex items-center gap-x-1">
						<RiPlayCircleLine size={16} />
						<span> Videos</span>
					</div>
					<div className="flex items-center gap-x-1">
						<RiFileTextLine size={16} />
						<span> Files</span>
					</div>
				</div>
			</TableCell>
			<TableCell className="text-center text-xs">
				<div
					className={`flex items-center justify-center rounded px-3 py-0.5 text-[10px] font-medium capitalize ${course.subject_isBlocked ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
					{course.subject_isBlocked ? "UNPUBLISHED" : "PUBLISHED"}
				</div>
			</TableCell>
			<TableCell>
				<Popover>
					<PopoverTrigger asChild>
						<button className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40">
						<CourseActions id={course.subject_id} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
