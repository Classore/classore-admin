import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { DeleteSubject } from "@/components/dashboard/delete-subject";
import { CreateCourseTabPanel } from "@/components/create-course";
import type { BreadcrumbItemProps } from "@/components/shared";
import { Breadcrumbs, Seo, Spinner } from "@/components/shared";
import { EditCourse } from "@/components/dashboard/edit-course";
import { QuizSettingsTab } from "@/components/quiz-settings";
import { chapterActions } from "@/store/z-store/chapter";
import { AssignTeachers } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import { GetSubject } from "@/queries";

const { setChapters } = chapterActions;

const Page = () => {
	const [openModal, setOpenModal] = React.useState(false);
	const [tab, setTab] = React.useState("course");
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const [{ data: course, isError, isPending }] = useQueries({
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
			href: `/dashboard/courses/course?courseId=${courseId}`,
			change_directory: true,
			variant: "warning",
		},
	];

	React.useEffect(() => {
		if (course) {
			const chapters = course.data.chapters.map((chapter) => ({
				name: chapter.name,
				content: chapter.content,
				sequence: chapter.sequence,
				id: chapter.id,
			}));

			setChapters(chapters);
		}
	}, [course]);

	if (isPending) {
		return (
			<DashboardLayout>
				<div className="flex flex-col items-center justify-center gap-2">
					<Spinner variant="primary" />
					<p className="text-sm text-primary-300">Fetching course...</p>
				</div>
			</DashboardLayout>
		);
	}

	if (isError) {
		return (
			<DashboardLayout>
				<div className="flex flex-col items-center justify-center gap-2">
					<p className="text-sm text-primary-300">Error Fetching course</p>
					<p className="text-xs text-neutral-400">Refresh the page to try again...</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<>
			<Seo title="New Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-2">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="flex flex-col gap-y-2">
							<div className="flex items-center gap-x-4">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<div className="flex items-center gap-x-2">
									<h3 className="text-lg font-medium capitalize">{course?.data.name}</h3>
								</div>
							</div>
							<Breadcrumbs
								courseId={courseId}
								currentCategory={String(course?.data.examination.id)}
								currentSubcategory={String(course?.data.examination_bundle.id)}
								links={breadcrumbs}
							/>
						</div>
						<div className="flex items-center gap-x-2">
							<DeleteSubject
								open={openModal}
								setOpen={setOpenModal}
								subjectId={courseId}
								subjectName={course?.data.name}
							/>
							<Button className="w-fit" size="sm" variant="outline">
								Save and Exit
							</Button>
							<EditCourse courseId={courseId} open={open} setOpen={setOpen} subject={course?.data.name} />
							<Button className="w-fit" size="sm">
								Next <RiArrowLeftSLine className="rotate-180" />
							</Button>
						</div>
					</div>
					<section className="mt-2 rounded-md bg-white p-6">
						<div className="flex h-10 w-full items-center justify-between border-b">
							<div className="flex items-center gap-x-6">
								{create_course_tabs.map(({ action, icon: Icon, label }) => (
									<button
										key={action}
										onClick={() => setTab(action)}
										className={`relative flex h-10 items-center gap-x-1 px-4 text-sm capitalize transition-all duration-500 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-primary-400 ${action === tab ? "text-primary-400 before:w-full" : "text-neutral-400"}`}>
										<Icon size={16} /> {label}
									</button>
								))}
							</div>
							<button className="flex items-center gap-x-1 text-sm text-neutral-400">
								<RiEyeLine size={16} /> Preview
							</button>
						</div>
					</section>
				</div>
				<div className="w-full">
					<CreateCourseTabPanel tab={tab} />
					<QuizSettingsTab tab={tab} />
					<AssignTeachers tab={tab} />
				</div>
			</DashboardLayout>
		</>
	);
};
export default Page;
