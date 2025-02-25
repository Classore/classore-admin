import Link from "next/link";
import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
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
								{[...Array(4)].map((_, index) => (
									<div key={index} className="aspect-[1.7/1] w-full rounded-2xl bg-white"></div>
								))}
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
								{[...Array(4)].map((_, index) => (
									<div key={index} className="aspect-[1.7/1] w-full rounded-2xl bg-white"></div>
								))}
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
								{[...Array(4)].map((_, index) => (
									<div key={index} className="aspect-[1.7/1] w-full rounded-2xl bg-white"></div>
								))}
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
								{[...Array(4)].map((_, index) => (
									<div key={index} className="aspect-[1.7/1] w-full rounded-2xl bg-white"></div>
								))}
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
							<div className="rounded-2xl bg-white p-3"></div>
						</div>
						{/* REFERRALS */}
						<div className="h-fit w-full space-y-4 rounded-lg bg-neutral-100 p-4">
							<div className="flex w-full items-center justify-between">
								<p className="text-sm font-medium">Top Referrals</p>
								<Link href="" className="link text-xs text-neutral-400">
									View Details
								</Link>
							</div>
							<div className="rounded-2xl bg-white p-3"></div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
