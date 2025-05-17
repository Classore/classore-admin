import {
	RiArrowLeftSLine,
	RiDownload2Line,
	RiFileCopyLine,
	RiShareLine,
	RiUserAddLine,
} from "@remixicon/react";
import { format } from "date-fns";
import React from "react";

import { useGetReferrals, useGetWithdrawals } from "@/queries";
import { EditPercentage } from "./edit-percentage";
import { TabPanel } from "@/components/shared";
import type { AdminProps } from "@/types";
import { formatCurrency } from "@/lib";

interface Props {
	admin: AdminProps;
	tab: string;
}

const tabs = [
	{
		label: "withdrawals",
		icon: RiDownload2Line,
	},
	{
		label: "referrals",
		icon: RiUserAddLine,
	},
];

export const Referrals = ({ admin, tab }: Props) => {
	const [selected, setSelected] = React.useState("withdrawals");
	const [rpage, setRpage] = React.useState(1);
	const [wpage, setWpage] = React.useState(1);

	const { data: referrals } = useGetReferrals({ limit: 10, page: rpage, timeLine: "THIS_MONTH" });
	const { data: withdrawals } = useGetWithdrawals({ limit: 10, page: wpage });

	return (
		<TabPanel selected={tab} value="referrals">
			<div className="space-y-4">
				<div className="grid h-28 w-full grid-cols-2 gap-x-3">
					<div className="flex flex-col justify-between rounded-md bg-gradient-to-r from-primary-300/75 to-primary-500 p-2">
						<div className="size-9 rounded-full bg-white/50"></div>
						<div className="">
							<p className="text-sm text-white">Points</p>
							<p className="text-xs text-neutral-200">Your points is equal {formatCurrency(0)}</p>
						</div>
					</div>
					<div className="flex flex-col justify-between rounded-md bg-gradient-to-r from-primary-50 to-primary-100 p-2">
						<div>
							<p className="text-xs text-neutral-400">Referral Code</p>
							<p className="text-sm"></p>
						</div>
						<div className="flex items-center gap-x-4">
							<button className="flex items-center gap-x-2 rounded-3xl border bg-white px-3 py-1 text-sm">
								Share <RiShareLine className="size-4" />
							</button>
							<button className="flex items-center gap-x-2 rounded-3xl border bg-white px-3 py-1 text-sm">
								Copy <RiFileCopyLine className="size-4" />
							</button>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between p-4">
					<p className="text-sm">
						Percentage Per Referral: <span className="text-secondary-400">%</span>
					</p>
					<EditPercentage id={admin.id} />
				</div>
				<div className="w-full">
					<div className="flex h-10 items-center gap-x-3 border-b">
						{tabs.map(({ icon: Icon, label }) => (
							<button
								key={label}
								onClick={() => setSelected(label)}
								className={`relative flex h-10 items-center gap-x-1 text-sm font-medium capitalize before:absolute before:bottom-0 before:left-0 before:h-[1px] before:bg-primary-400 ${label === selected ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
								<Icon size={14} /> {label}
							</button>
						))}
					</div>
					<TabPanel selected={selected} value="withdrawals">
						<div className="w-full space-y-2 py-2">
							{referrals?.data.map((referral, index) => (
								<div key={index} className="flex w-full items-center justify-between">
									<p className="text-xs">{referral.count}</p>
									<p className="text-xs">{referral.day_or_month}</p>
								</div>
							))}
						</div>
						<MiniPagination
							page={rpage}
							limit={10}
							onPageChange={setRpage}
							total={referrals?.data.length || 0}
						/>
					</TabPanel>
					<TabPanel selected={selected} value="referrals">
						<div className="w-full space-y-2 py-2">
							{withdrawals?.data.data.map((withdrawal, index) => (
								<div key={index} className="flex w-full items-center justify-between">
									<p className="text-xs">{formatCurrency(withdrawal.amount)}</p>
									<p className="text-xs">{format(withdrawal.date, "MMM dd, yyyy | HH:mm a")}</p>
								</div>
							))}
						</div>
						<MiniPagination
							page={wpage}
							limit={10}
							onPageChange={setWpage}
							total={withdrawals?.data.meta.itemCount || 0}
						/>
					</TabPanel>
				</div>
			</div>
		</TabPanel>
	);
};

const MiniPagination = ({
	limit,
	onPageChange,
	page,
	total,
}: {
	limit: number;
	onPageChange: (page: number) => void;
	page: number;
	total: number;
}) => {
	const totalPages = Math.ceil(total / limit);

	const goToPrevious = () => {
		if (page > 1) {
			return onPageChange(page - 1);
		}
	};
	const goToNext = () => {
		if (page < totalPages) {
			onPageChange(page + 1);
		}
	};
	return (
		<div className="mt-4 flex items-center justify-between">
			<button onClick={goToPrevious} disabled={page === 1} className="rounded-md border p-1">
				<RiArrowLeftSLine className="size-3.5" />
			</button>
			<button onClick={goToNext} disabled={page === totalPages} className="rounded-md border p-1">
				<RiArrowLeftSLine className="size-3.5 rotate-180" />
			</button>
		</div>
	);
};
