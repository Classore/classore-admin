import { RiMoneyDollarCircleLine } from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { IconLabel, Pagination } from "@/components/shared";
import type { SubscriptionProps } from "@/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
	total: number;
	subscriptions: SubscriptionProps[];
}

const status: Record<SubscriptionProps["status"], string> = {
	FAILED: "bg-red-100 text-red-500",
	PENDING: "bg-amber-100 text-amber-500",
	REVERSAL: "bg-blue-100 text-blue-500",
	SUCCESSFUL: "bg-green-100 text-green-500",
};

export const PaymentTable = ({ onPageChange, page, total, subscriptions }: Props) => {
	return (
		<div>
			<Table className="font-body">
				<TableHeader className="rounded-t-lg bg-neutral-50">
					<TableRow className="rounded-t-lg text-xs">
						<TableHead className="text-neutral-400">Exam</TableHead>
						<TableHead className="w-[210px] text-neutral-400">Bought by</TableHead>
						<TableHead className="w-[118px] text-center text-neutral-400">Amount</TableHead>
						<TableHead className="w-[156px] text-center text-neutral-400">Category</TableHead>
						<TableHead className="w-[186px] text-center text-neutral-400">
							Date and Time
						</TableHead>
						<TableHead className="w-[141px] text-center text-neutral-400">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{subscriptions.map((subscription) => (
						<LineItem key={subscription.id} subscription={subscription} />
					))}
				</TableBody>
			</Table>
			<Pagination current={page} onPageChange={onPageChange} pageSize={10} total={total} />
		</div>
	);
};

const LineItem = ({ subscription }: { subscription: SubscriptionProps }) => {
	const [open, setOpen] = React.useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<TableRow className="cursor-pointer">
					<TableCell className="flex items-center gap-x-2 text-xs">
						<Avatar className="size-7 rounded-md">
							<AvatarImage src="" className="rounded-md" />
						</Avatar>
						<span className="capitalize"></span>
					</TableCell>
					<TableCell className="text-xs text-neutral-400">
						{subscription.first_name} {subscription.last_name}
					</TableCell>
					<TableCell className="text-center text-xs font-medium">
						{formatCurrency(subscription.amount, subscription.currency)}
					</TableCell>
					<TableCell className="text-xs text-neutral-400"></TableCell>
					<TableCell className="text-center text-xs text-neutral-400">
						{format(subscription.createdOn, "MMM dd,yyyy HH:mm a")}
					</TableCell>
					<TableCell className="text-xs">
						<div
							className={`flex items-center justify-center rounded px-3 py-0.5 text-[10px] font-medium capitalize ${status[subscription.status]}`}>
							{subscription.status}
						</div>
					</TableCell>
				</TableRow>
			</DialogTrigger>
			<DialogContent animate className="w-[450px] p-1">
				<div className="w-full rounded-lg border px-4 pt-[59px]">
					<IconLabel icon={RiMoneyDollarCircleLine} />
					<div className="my-4 w-full">
						<DialogTitle>Transaction Details</DialogTitle>
						<DialogDescription></DialogDescription>
						<div className="my-4 w-full space-y-4 overflow-auto">
							<div className="w-full space-y-2">
								<p className="text-xs text-neutral-400">User Details</p>
								<div className="w-full rounded-lg border p-4">
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Name</p>
										<p className="text-xs capitalize">
											{subscription.first_name} {subscription.last_name}
										</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Email</p>
										<p className="text-xs">{subscription.user_email}</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Date and Time</p>
										<p className="text-xs">
											{format(subscription.createdOn, "MMM dd, yyyy | HH:mm a")}
										</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Category</p>
										<p className="text-xs">{}</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Bundle</p>
										<p className="text-xs">{}</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Amount</p>
										<p className="text-xs">
											{formatCurrency(subscription.amount, subscription.currency)}
										</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Transaction ID</p>
										<p className="text-xs">{subscription.reference}</p>
									</div>
									<div className="flex h-10 w-full items-center justify-between">
										<p className="text-xs text-neutral-400">Status</p>
										<div
											className={`flex items-center justify-center rounded px-3 py-0.5 text-[10px] font-medium capitalize ${status[subscription.status]}`}>
											{subscription.status}
										</div>
									</div>
								</div>
							</div>
							<div className="w-full space-y-2">
								<p className="text-xs text-neutral-400">Selected Courses</p>
								<div className="flex w-full flex-wrap items-center gap-2 rounded-lg border p-4">
									{[...Array(5)].map((_, index) => (
										<div
											key={index}
											className="rounded-md border bg-neutral-100 px-4 py-2 text-xs text-neutral-400">
											Subject
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="flex w-full items-center justify-end">
							<Button onClick={() => setOpen(false)} size="sm" className="w-fit">
								Okay
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
