import { RiMore2Line } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared";
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
			<Table>
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs text-neutral-400">
						<TableHead className="w-[156px]">Category</TableHead>
						<TableHead className="w-[]">Subcategory</TableHead>
						<TableHead className="w-[94px] text-center">Courses</TableHead>
						<TableHead className="w-[181px] text-center">Last Updated</TableHead>
						<TableHead className="w-[110px] text-center">Amount/Bundle</TableHead>
						<TableHead className="w-[120px] text-center">Ratings</TableHead>
						<TableHead className="w-[157px] text-center">Enrolled</TableHead>
						<TableHead className="w-[61px] text-center"></TableHead>
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
			<TableCell className="text-xs"></TableCell>
			<TableCell className="text-xs"></TableCell>
			<TableCell className="text-center text-xs"></TableCell>
			<TableCell className="text-center text-xs">
				{exam.updatedOn
					? format(new Date(exam.updatedOn), "MMM dd,yyyy HH:mm a")
					: format(exam.createdOn, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-center text-xs"></TableCell>
			<TableCell className="text-center text-xs"></TableCell>
			<TableCell className="text-center text-xs"></TableCell>
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
