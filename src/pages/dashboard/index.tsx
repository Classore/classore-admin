import Link from "next/link";
import React from "react";

import { Card, LeaderboardItem, ReferralItem } from "@/components/card";
import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { formatCurrency } from "@/lib";
import {
	useGetAllCalendarEvants,
	useGetAllBundles,
	useGetAllExaminations,
	useGetAllPayments,
	useGetAllUsers,
} from "@/queries";

const Page = () => {
	const month = new Date().getMonth();
	const leaderboard: string[] = [];
	const referrals: string[] = [];

	const { data: calendar } = useGetAllCalendarEvants({ page: 1, limit: 10, month });
	const { data: examinations } = useGetAllExaminations({ page: 1, limit: 10 });
	const { data: payments } = useGetAllPayments({ page: 1, limit: 10 });
	const { data: bundles } = useGetAllBundles({ page: 1, limit: 10 });
	const { data: users } = useGetAllUsers({ page: 1, limit: 10 });

	const calendarAnalytics = React.useMemo(() => {
		if (!calendar)
			return {
				ended: 0,
				live: 0,
				total_events: 0,
				upcoming: 0,
			};
		return calendar.calendar;
	}, [calendar]);

	const courseAnalytics = React.useMemo(() => {
		if (!bundles)
			return {
				itemCount: 0,
			};
		return bundles.data.meta;
	}, [bundles]);

	const examAnalytics = React.useMemo(() => {
		if (!examinations)
			return {
				itemCount: 0,
			};
		return examinations.data.meta;
	}, [examinations]);

	const paymentAnalytics = React.useMemo(() => {
		return {
			cancelled: payments?.data.cancelled || 0,
			international_exams: payments?.data.international_exams || 0,
			national_exams: payments?.data.national_exams || 0,
			total_earnings: payments?.data.total_earnings || 0,
		};
	}, [payments]);

	const userAnalytics = React.useMemo(() => {
		if (!users)
			return {
				total_active_users: 0,
				total_inactive_users: 0,
				student_count: 0,
				parent_count: 0,
			};
		return users.analytics;
	}, [users]);

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
								<Card value={userAnalytics.total_active_users} label="Total Active Users" />
								<Card value={userAnalytics.total_inactive_users} label="Total Inactive Users" />
								<Card value={userAnalytics.student_count} label="Students" />
								<Card value={userAnalytics.parent_count} label="Parents" />
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
								<Card value={formatCurrency(paymentAnalytics.total_earnings)} label="Total Earnings" />
								<Card value={formatCurrency(paymentAnalytics.cancelled)} label="Cancelled" />
								<Card
									value={formatCurrency(paymentAnalytics.international_exams)}
									label="International Exams"
								/>
								<Card value={formatCurrency(paymentAnalytics.national_exams)} label="National Exams" />
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
								<Card value={examAnalytics.itemCount} label="Categories" />
								<Card value={courseAnalytics.itemCount} label="Subcategories" />
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
								<Card value={calendarAnalytics.total_events} label="Total Events" />
								<Card value={calendarAnalytics.upcoming} label="Upcoming" />
								<Card value={calendarAnalytics.ended} label="Ended" />
								<Card value={calendarAnalytics.live} label="Live" />
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
								{leaderboard.length === 0 ? (
									<div className="flex h-40 w-full items-center justify-center">
										<p className="text-sm text-neutral-400">No data available</p>
									</div>
								) : (
									leaderboard.map((_, index) => <LeaderboardItem key={index} />)
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
								{referrals.length === 0 ? (
									<div className="flex h-40 w-full items-center justify-center">
										<p className="text-sm text-neutral-400">No data available</p>
									</div>
								) : (
									referrals.map((_, index) => <ReferralItem key={index} />)
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
