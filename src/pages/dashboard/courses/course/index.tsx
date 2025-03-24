import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { Breadcrumbs, Seo, Spinner, type BreadcrumbItemProps } from "@/components/shared";
import { DeleteQuestions } from "@/components/dashboard/delete-questions";
import { DuplicateCourse } from "@/components/dashboard/duplicate-course";
import { DeleteSubject } from "@/components/dashboard/delete-subject";
import { CreateCourseTabPanel } from "@/components/create-course";
import { EditCourse } from "@/components/dashboard/edit-course";
import { QuizSettingsTab } from "@/components/quiz-settings";
import { chapterActions } from "@/store/z-store/chapter";
import { DashboardLayout } from "@/components/layout";
import { useQuizStore } from "@/store/z-store/quizz";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import { GetSubject } from "@/queries";

const { setChapters } = chapterActions;

const Page = () => {
	const [openModal, setOpenModal] = React.useState(false);
	const [chapterId, setChapterId] = React.useState("");
	const [moduleId, setModuleId] = React.useState("");
	const [tab, setTab] = React.useState("course");
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const { getSelectedCount } = useQuizStore();

	const {
		data: course,
		isError,
		isPending,
	} = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: () => GetSubject(courseId),
		enabled: !!courseId,
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
				is_published: chapter.is_published,
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
				<div className="flex h-full w-full flex-col gap-y-2">
					<div className="flex w-full items-center justify-between rounded-lg bg-white px-5 py-3">
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
							<DuplicateCourse courseId={courseId} />
							<EditCourse course={course.data} courseId={courseId} open={open} setOpen={setOpen} />
						</div>
					</div>
					<section className="mt-2 h-[calc(100%-84px)] w-full overflow-hidden rounded-md bg-white">
						<div className="flex h-10 w-full items-center justify-between border-b px-5 py-3">
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
							<div className="flex items-center gap-x-4">
								{getSelectedCount(chapterId, moduleId) > 0 && (
									<DeleteQuestions chapterId={chapterId} moduleId={moduleId} />
								)}
								<button className="flex items-center gap-x-1 text-sm text-neutral-400">
									<RiEyeLine size={16} /> Preview
								</button>
							</div>
						</div>
						<div className="h-[calc(100%-40px)] w-full">
							<CreateCourseTabPanel
								tab={tab}
								courseName={course.data.name}
								setChapterID={setChapterId}
								setModuleId={setModuleId}
							/>
							<QuizSettingsTab tab={tab} />
							{/* <AssignTeachers tab={tab} /> */}
						</div>
					</section>
				</div>
			</DashboardLayout>
		</>
	);
};
export default Page;
