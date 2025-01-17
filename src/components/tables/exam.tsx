import { RiMore2Line, RiStarFill, RiUser3Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CastedExamBundleProps } from "@/types/casted-types";
import { Pagination } from "@/components/shared";
import { GetExaminations } from "@/queries";
import { ExamActions } from "../actions";
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
	bundles: CastedExamBundleProps[];
	onPageChange: (page: number) => void;
	page: number;
	total: number;
}

export const ExamTable = ({ bundles, onPageChange, page, total }: Props) => {
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
					{bundles.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="py-10 text-center text-xs">
								No examination bundles found.
							</TableCell>
						</TableRow>
					)}
					{bundles.map((bundle) => (
						<LineItem key={bundle.examinationbundle_id} bundle={bundle} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ bundle }: { bundle: CastedExamBundleProps }) => {
	const { data: exams } = useQuery({
		queryKey: ["get-exams"],
		queryFn: () => GetExaminations(),
	});

	const exam = React.useMemo(() => {
		if (exams?.data) {
			return exams.data.data.find(
				(exam) => exam.examination_id === bundle.examinationbundle_examination
			);
		}
	}, [exams?.data]);

	if (!exams) return null;

	return (
		<TableRow>
			<TableCell className="text-xs capitalize text-neutral-400">
				{exam?.examination_name}
			</TableCell>
			<TableCell className="text-xs font-medium uppercase">
				{bundle.examinationbundle_name}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{bundle.subject_count}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				{bundle.examinationbundle_updatedon
					? format(new Date(bundle.examinationbundle_updatedon), "MMM dd,yyyy HH:mm a")
					: format(bundle.examinationbundle_createdon, "MMM dd,yyyy HH:mm a")}
			</TableCell>
			<TableCell className="text-center text-xs font-medium">
				{formatCurrency(bundle.examinationbundle_amount)}
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-1">
					<RiStarFill className="size-4 text-amber-500" />
					{/* {aggregate(bundle.rating)} ({bundle.rating.length}) */}
				</div>
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-2">
					<RiUser3Line size={16} />
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
						<ExamActions id={bundle.examinationbundle_id} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
