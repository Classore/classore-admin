import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

import { AssignTeachers, CreateCourse, QuizSettings } from "@/components/dashboard";
import { Breadcrumbs, Loading, Seo, TabPanel } from "@/components/shared";
import { GetBundles, GetExaminaions } from "@/queries";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";

const Page = () => {
	const [tab, setTab] = React.useState("course");
	const router = useRouter();
	const { categoryId, examination_bundle, name } = router.query;

	const [{ data: exams }, { data: bundles }] = useQueries({
		queries: [
			{
				queryKey: ["get-exams"],
				queryFn: () => GetExaminaions(),
			},
			{
				queryKey: ["get-bundles"],
				queryFn: () => GetBundles({ examination: String(categoryId) }),
				enabled: !!categoryId,
			},
		],
	});

	const exam = React.useMemo(() => {
		if (exams?.data) {
			return exams?.data?.data.find((exam) => exam.examination_id === String(categoryId));
		}
	}, [exams?.data]);

	const bundle = React.useMemo(() => {
		if (bundles?.data) {
			return bundles?.data?.data.find(
				(bundle) => bundle.examinationbundle_id === String(examination_bundle)
			);
		}
	}, [bundles?.data]);

	const breadcrumbs = [
		{ label: "Manage Courses", href: "/dashboard/courses" },
		{
			label: `${exam?.examination_name}`,
			href: `/dashboard/courses/`,
		},
		{
			label: `${bundle?.examinationbundle_name?.toUpperCase()}`,
			href: `/dashboard/courses/new`,
		},
		{
			label: "",
			href: "",
		},
	];

	if (!exam || !bundle) return <Loading />;

	return (
		<>
			<Seo title="New Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="flex flex-col gap-y-2">
							<div className="flex items-center gap-x-4">
								<Button
									onClick={() => router.back()}
									className="w-fit"
									size="sm"
									variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<div className="flex items-center gap-x-2">
									<h3 className="text-lg font-medium">{name}</h3>
								</div>
							</div>
							<Breadcrumbs links={breadcrumbs} />
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
					<div className="flex w-full flex-col gap-y-6 rounded-lg bg-white p-5">
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
						<div className="w-full">
							<TabPanel selected={tab} value="course">
								<CreateCourse />
							</TabPanel>
							<TabPanel selected={tab} value="settings">
								<QuizSettings />
							</TabPanel>
							<TabPanel selected={tab} value="teachers">
								<AssignTeachers />
							</TabPanel>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
