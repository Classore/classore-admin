import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

import { Card, LeaderboardItem, ReferralItem } from "@/components/card";
import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import type { UserProps } from "@/types";

const Page = () => {
	const [] = useQueries({
		queries: [],
	});

	const Leaderboard: UserProps[] = [];
	const referrals: UserProps[] = [];

	return (
		<>
			<Seo title="Dashboard" />
			<DashboardLayout>
				<div className="h-[100%] w-full overflow-y-auto">
					<div className="grid w-full grid-cols-2 gap-5 rounded-2xl bg-white p-5">
						{/* USERS */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Users</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="grid w-full grid-cols-2 gap-4">
								<Card value="0" label="Total Users" />
								<Card value="0" label="Active Users" />
								<Card value="0" label="Students" />
								<Card value="0" label="Parents" />
							</div>
						</div>
						{/* PAYMENTS */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Payments</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="grid w-full grid-cols-2 gap-4">
								<Card value="0" label="Total Earnings" />
								<Card value="0" label="Cancelled" />
								<Card value="0" label="Failed" />
								<Card value="0" label="Successful" />
							</div>
						</div>
						{/* COURSES */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Courses</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="grid w-full grid-cols-2 gap-4">
								<Card value="0" label="Categories" />
								<Card value="0" label="Subcategories" />
								<Card value="0" label="Published Courses" />
								<Card value="0" label="Unpublished Courses" />
							</div>
						</div>
						{/* CALENDAR */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Calendar</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="grid w-full grid-cols-2 gap-4">
								<Card value="0" label="Total Events" />
								<Card value="0" label="Upcoming" />
								<Card value="0" label="Ended" />
								<Card value="0" label="Live" />
							</div>
						</div>
						{/* LEADERBOARD */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Leaderboard</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="rounded-2xl bg-white p-3">
								{!Leaderboard.length ? (
									<div className="grid h-40 w-full place-items-center">
										<p className="text-sm text-neutral-400">No data available</p>
									</div>
								) : (
									<div className="flex space-y-2">
										{Leaderboard.map((_, index) => (
											<LeaderboardItem key={index} />
										))}
									</div>
								)}
							</div>
						</div>
						{/* REFERRALS */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Top Referrals</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="rounded-2xl bg-white p-3">
								{!referrals.length ? (
									<div className="grid h-40 w-full place-items-center">
										<p className="text-sm text-neutral-400">No data available</p>
									</div>
								) : (
									<div className="flex space-y-2">
										{referrals.map((_, index) => (
											<ReferralItem key={index} />
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
