import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { Breadcrumbs, Loading, Seo, TabPanel } from "@/components/shared";
// import { CreateCourseTabPanel } from "@/components/create-course";
import type { BreadcrumbItemProps } from "@/components/shared";
import { QuizSettings } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import { GetSubject } from "@/queries";

const Page = () => {
	const [tab, setTab] = React.useState("course");
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const [{ data: course }] = useQueries({
		queries: [
			{
				queryKey: ["get-subject", courseId],
				queryFn: () => GetSubject(courseId),
				enabled: !!courseId,
			},
		],
	});

	const breadcrumbs: BreadcrumbItemProps[] = [
		{ label: "Manage Courses", href: "/dashboard/courses" },
		{
			label: `${course?.data.examination.name}`,
			href: `/dashboard/courses/`,
		},
		{
			label: `${course?.data.examination_bundle.name?.toUpperCase()}`,
			href: `/dashboard/courses/${course?.data.examination_bundle.id}`,
		},
		{
			label: "change directory",
			href: "",
			active: true,
			variant: "warning",
		},
	];

	if (!course) return <Loading />;

	return (
		<>
			<Seo title="New Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="flex flex-col gap-y-2">
							<div className="flex items-center gap-x-4">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<div className="flex items-center gap-x-2">
									<h3 className="text-lg font-medium capitalize">{course.data.name}</h3>
								</div>
							</div>
							<Breadcrumbs courseId={courseId} links={breadcrumbs} />
						</div>
						<div className="flex items-center gap-x-2">
							<Button className="w-fit" size="sm" variant="destructive-outline">
								Delete
							</Button>
							<Button className="w-fit" size="sm" variant="outline">
								Save and Exit
							</Button>
							<Button className="w-fit" size="sm">
								Next <RiArrowLeftSLine className="rotate-180" />
							</Button>
						</div>
					</div>
					<div className="flex h-[calc(100vh-268px)] w-full flex-col gap-y-6 overflow-hidden rounded-lg bg-white p-5">
						<div className="flex h-10 w-full items-center justify-between border-b">
							<div className="flex items-center gap-x-6">
								{create_course_tabs.map(({ action, icon: Icon, label }) => (
									<button
										key={action}
										onClick={() => setTab(action)}
										className={`relative flex h-10 items-center gap-x-1 text-sm capitalize transition-all duration-500 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-primary-400 ${action === tab ? "text-primary-400 before:w-full" : "text-neutral-400"}`}>
										<Icon size={16} /> {label}
									</button>
								))}
							</div>
							<button className="flex items-center gap-x-1 text-sm text-neutral-400">
								<RiEyeLine size={16} /> Preview
							</button>
						</div>
						<div className="h-full w-full">
							<TabPanel selected={tab} value="course">
								{/* <CreateCourse existingChapters={course.data.chapters} /> */}
							</TabPanel>
							<TabPanel selected={tab} value="settings">
								<QuizSettings />
							</TabPanel>
							{/* <AssignTeachers tab={tab} /> */}
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
