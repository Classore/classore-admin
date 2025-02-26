import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";

import { DeleteAction } from "@/components/actions";
import { CreateCourseTabPanel } from "@/components/create-course";
import { AssignTeachers, CreateCourse, QuizSettings } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { QuizSettingsTab } from "@/components/quiz-settings";
import { Breadcrumbs, Seo, Spinner, TabPanel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import { capitalize } from "@/lib";
import { GetSubject } from "@/queries";
import { chapterActions } from "@/store/z-store/chapter";

const { setChapters } = chapterActions;

const Page = () => {
	const [tab, setTab] = React.useState("course");
	const router = useRouter();
	const courseId = router.query.courseId as string;

	const {
		data: course,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: courseId ? () => GetSubject(courseId) : skipToken,
		staleTime: Infinity,
		gcTime: Infinity,
	});

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
			<Seo title={capitalize(course?.data.name ?? "New Course")} />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full items-center justify-between rounded-lg bg-white">
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
								links={[]}
							/>
						</div>
						<div className="flex items-center gap-x-2">
							<DeleteAction id={courseId} />
							<Button className="w-fit" size="sm" variant="outline">
								Save and Exit
							</Button>
							<Button className="w-fit" size="sm">
								Next <RiArrowLeftSLine className="rotate-180" />
							</Button>
							<h3 className="text-xl font-semibold capitalize">{course.data.name}</h3>
						</div>
					</div>

					<div className="flex h-[calc(100vh-228px)] w-full flex-col gap-y-3 overflow-y-auto bg-white">
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

						<p className="mx-auto rounded-md bg-orange-100 p-2 text-center text-xs text-orange-600">
							NB: Please make sure there is a chapter saved before trying to add lessons under that
							chapter.
						</p>

						<div className="h-full max-h-[calc(100vh-332px)] w-full">
							<TabPanel selected={tab} value="course">
								{isCoursePending ? (
									<Spinner variant="primary" />
								) : (
									<CreateCourse
										existingChapters={course?.data.chapters ?? []}
										courseName={course?.data.name}
									/>
								)}
							</TabPanel>
							<TabPanel selected={tab} value="quiz">
								<QuizSettings />
							</TabPanel>
							<TabPanel selected={tab} value="teacher">
								<AssignTeachers />
							</TabPanel>
						</div>
					</div>
				</div>

				<section className="mt-4 rounded-md bg-white p-6">
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

					<div>
						<CreateCourseTabPanel tab={tab} />
						<QuizSettingsTab tab={tab} />
					</div>
				</section>
			</DashboardLayout>
		</>
	);
};

export default Page;
