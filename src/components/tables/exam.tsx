import { RiMore2Line, RiStarFill, RiUser3Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aggregate, formatCurrency } from "@/lib";
import { Pagination } from "@/components/shared";
import { ExamActions } from "../actions";
import type { ExamProps } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	exams: ExamProps[];
	onPageChange: (page: number) => void;
	page: number;
	total: number;
}

export const ExamTable = ({ exams, onPageChange, page, total }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="w-[156px] text-neutral-400">Category</TableHead>
						<TableHead className="w-[] text-neutral-400">Subcategories</TableHead>
						<TableHead className="w-[94px] text-center text-neutral-400">Courses</TableHead>
						<TableHead className="w-[181px] text-center text-neutral-400">
							Last Updated
						</TableHead>
						<TableHead className="w-[110px] text-center text-neutral-400">
							Amount/Bundle
						</TableHead>
						<TableHead className="w-[120px] text-center text-neutral-400">Ratings</TableHead>
						<TableHead className="w-[157px] text-center text-neutral-400">Enrolled</TableHead>
						<TableHead className="w-[61px] text-center text-neutral-400"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{exams.map((exam) => (
						<LineItem key={exam.id} exam={exam} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ exam }: { exam: ExamProps }) => {
	return (
		<TableRow>
			<TableCell className="text-xs text-neutral-400">{exam.category}</TableCell>
			<TableCell className="text-xs font-medium">{exam.subcategory}</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{exam.courses.length}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{exam.updatedOn
					? format(new Date(exam.updatedOn), "MMM dd,yyyy HH:mm a")
					: format(exam.createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-center text-xs font-medium">
				{formatCurrency(exam.amount)}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-1">
					<RiStarFill className="size-4 text-amber-500" />
					{aggregate(exam.rating)} ({exam.rating.length})
				</div>
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-2">
					<RiUser3Line size={16} /> {exam.number_of_students}
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
						<ExamActions id={exam.id} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
