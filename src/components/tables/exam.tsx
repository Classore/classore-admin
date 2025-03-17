import { RiMore2Line, RiStarFill, RiUser3Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib";
import { hasPermission } from "@/lib/permission";
import { GetExaminations } from "@/queries";
import { useUserStore } from "@/store/z-store";
import type { CastedExamBundleProps } from "@/types/casted-types";
import { ExamActions } from "../actions";

interface Props {
	bundles: CastedExamBundleProps[];
	onPageChange: (page: number) => void;
	page: number;
	total: number;
	isLoading?: boolean;
}

export const ExamTable = ({ bundles, onPageChange, page, total, isLoading }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="w-[156px] text-neutral-400">Category</TableHead>
						<TableHead className="w-[] text-neutral-400">Subcategories</TableHead>
						<TableHead className="w-[94px] text-center text-neutral-400">Courses</TableHead>
						<TableHead className="w-[181px] text-center text-neutral-400">Last Updated</TableHead>
						<TableHead className="w-[110px] text-center text-neutral-400">Amount/Bundle</TableHead>
						<TableHead className="w-[120px] text-center text-neutral-400">Ratings</TableHead>
						<TableHead className="w-[157px] text-center text-neutral-400">Enrolled</TableHead>
						<TableHead className="w-[157px] text-center text-neutral-400">Status</TableHead>
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
	const admin = useUserStore().user;

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
	}, [bundle.examinationbundle_examination, exams?.data]);

	if (!exams) return null;

	return (
		<TableRow>
			<TableCell className="text-xs capitalize text-neutral-400">{exam?.examination_name}</TableCell>
			<TableCell className="text-xs font-medium uppercase">{bundle.examinationbundle_name}</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">{bundle.subject_count}</TableCell>
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
					<span>{bundle.examinationbundle_rating}</span>
				</div>
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div className="flex items-center justify-center gap-x-2">
					<RiUser3Line size={16} />
				</div>
			</TableCell>
			<TableCell className="text-center text-xs text-neutral-400">
				<div
					className={`mx-auto flex w-fit items-center justify-center rounded px-3 py-1 text-[10px] font-bold capitalize ${bundle.examinationbundle_is_published === "NO" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
					{bundle.examinationbundle_is_published === "NO" ? "UNPUBLISHED" : "PUBLISHED"}
				</div>
			</TableCell>
			<TableCell>
				<Popover>
					<PopoverTrigger asChild disabled={!hasPermission(admin, ["videos_write"])}>
						<button type="button" className="grid h-8 w-9 place-items-center rounded-md border">
							<RiMore2Line size={18} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-40">
						<ExamActions id={bundle.examinationbundle_id} subcategory={bundle} />
					</PopoverContent>
				</Popover>
			</TableCell>
		</TableRow>
	);
};
