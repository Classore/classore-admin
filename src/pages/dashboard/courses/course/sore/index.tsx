import { CreateCourseTabPanel } from "@/components/create-course";
import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import { RiArrowLeftSLine, RiEyeLine } from "@remixicon/react";
import { useRouter } from "next/router";
import * as React from "react";

const Page = () => {
	const [tab, setTab] = React.useState("course");
	const router = useRouter();

	return (
		<>
			<Seo title="New Course" />
			<DashboardLayout>
				<header className="flex w-full items-center justify-between rounded-lg bg-white p-5">
					<div>
						<div className="flex items-center gap-4">
							<Button
								onClick={() => router.back()}
								className="gap-1 px-2 text-xs"
								variant="outline">
								<RiArrowLeftSLine className="text-neutral-400" /> Back
							</Button>
							<h3 className="text-xl font-semibold">Mathematics</h3>
						</div>
					</div>

					<div className="flex items-center gap-x-2">
						<Button
							className="w-fit border-none bg-transparent shadow-none hover:bg-transparent"
							size="sm"
							variant="destructive-outline">
							Delete
						</Button>
						<Button
							className="w-fit border-none bg-primary-100 text-primary-300 hover:bg-primary-200 hover:text-primary-300"
							size="sm"
							variant="outline">
							Save and Exit
						</Button>
						<Button className="w-24" size="sm">
							Next <RiArrowLeftSLine className="rotate-180" />
						</Button>
					</div>
				</header>

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
					</div>
				</section>
			</DashboardLayout>
		</>
	);
};

export default Page;
