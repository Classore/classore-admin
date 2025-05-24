import { RiDownload2Line, RiFileCopyLine, RiShareLine, RiUserAddLine } from "@remixicon/react";
import { toast } from "sonner";
import React from "react";

import { TabPanel } from "@/components/shared";
import type { ViewUserProps } from "@/types";
import { cn, formatCurrency } from "@/lib";

interface Props {
	tab: string;
	user?: ViewUserProps;
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

export const Referrals = ({ tab, user }: Props) => {
	const [selected, setSelected] = React.useState("withdrawals");

	const copy = (value?: string) => {
		if (!value) return;
		navigator.clipboard.writeText(value);
		toast.success("Copied to clipboard");
	};

	return (
		<TabPanel selected={tab} value="referrals">
			<div className="h-[calc(100%-294px)] w-full space-y-4">
				<div className="grid w-full grid-cols-2 gap-x-2">
					<div className="flex h-[110px] w-full flex-col justify-between rounded-md bg-gradient-to-r from-primary-300 to-primary-400 p-2">
						<div className="size-9 rounded-full bg-white/50"></div>
						<div className="">
							<p className="text-sm text-white">{user?.classore_points} Points</p>
							<p className="text-xs text-neutral-200">Your points is equal {formatCurrency(0)}</p>
						</div>
					</div>
					<div className="flex h-[110px] w-full flex-col justify-between rounded-md bg-gradient-to-r from-primary-100 to-primary-200 p-2">
						<div>
							<p className="text-xs text-neutral-400">Referral Code</p>
							<p className="font-semibold">{user?.referral_code}</p>
						</div>
						<div className="flex items-center gap-x-4">
							<button className="flex items-center gap-x-2 rounded-3xl border bg-white px-3 py-1 text-sm">
								Share <RiShareLine className="size-4" />
							</button>
							<button
								className="flex items-center gap-x-2 rounded-3xl border bg-white px-3 py-1 text-sm"
								onClick={() => copy(user?.referral_code)}>
								Copy <RiFileCopyLine className="size-4" />
							</button>
						</div>
					</div>
				</div>
				<div className="h-[calc(100%-130px)] w-full space-y-2">
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
						<div className="h-full w-full space-y-2 overflow-y-auto"></div>
					</TabPanel>
					<TabPanel selected={selected} value="referrals">
						<div className="h-full w-full space-y-2 overflow-y-auto">
							{user?.referral_list.map((referral) => (
								<div key={referral.referral_id} className="flex w-full items-center justify-between">
									<div className="flex items-center gap-x-1">
										<div>
											<p className="text-sm">
												{referral.user_first_name} {referral.user_last_name}
											</p>
											<p className="text-xs text-neutral-500">{referral.referral_type}</p>
										</div>
									</div>
									<div className="flex items-center gap-x-2">
										<p className="text-sm">{referral.referral_points}</p>
										<p
											className={cn(
												"px-2 py-1 text-sm",
												referral.referral_isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
											)}>
											{referral.referral_isBlocked ? "Inactive" : "Active"}
										</p>
									</div>
								</div>
							))}
						</div>
					</TabPanel>
				</div>
			</div>
		</TabPanel>
	);
};
