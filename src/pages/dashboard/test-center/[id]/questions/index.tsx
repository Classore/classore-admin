import { useRouter } from "next/router";
import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiBook2Line,
	RiEyeLine,
} from "@remixicon/react";

import type { BreadcrumbItemProps } from "@/components/shared";
import type { QuestionDto } from "@/store/z-store/quizz";
import { Breadcrumbs, Seo } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { Question } from "@/components/test-center";
import { Button } from "@/components/ui/button";

const tabs = [{ icon: RiBook2Line, label: "Create Questions", name: "create" }];

const Page = () => {
	const [current, setCurrent] = React.useState(0);
	const [tab, setTab] = React.useState("create");
	const router = useRouter();
	const id = router.query.id as string;

	const [questions, setQuestions] = React.useState<QuestionDto[]>([
		{
			content: "",
			images: [],
			options: [],
			question_type: "MULTICHOICE",
			sequence: 0,
			sequence_number: 0,
		},
	]);

	const addQuestion = () => {
		setQuestions((prev) => [
			...prev,
			{
				content: "",
				images: [],
				options: [],
				question_type: "MULTICHOICE",
				sequence: 0,
				sequence_number: prev.length + 1,
			},
		]);
	};

	const deleteQuestion = (index: number) => {
		if (questions.length === 1) {
			toast.error("You cannot delete all questions");
			return;
		}
		setQuestions((prev) => prev.filter((_, i) => i !== index));
		setCurrent((prev) => (index === 0 ? 0 : prev - 1));
	};

	const links: BreadcrumbItemProps[] = [
		{ href: "/dashboard/test-center", label: "Manage Test Center", active: true },
		{ href: `/dashboard/test-center/${id}`, label: `test exam`, active: true },
		{ href: `/dashboard/test-center/${id}/questions`, label: `test section`, active: true },
		{ href: ``, label: "Change Directory", variant: "warning" },
	];

	return (
		<>
			<Seo title={id} />
			<DashboardLayout>
				<div className="h-full w-full space-y-4">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="space-y-2">
							<div className="flex items-center gap-x-2">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<p className="text-sm font-medium">Test Title</p>
							</div>
							<Breadcrumbs courseId={id} links={links} />
						</div>
						<div className="flex items-center gap-x-4">
							<Button className="w-fit" size="sm" variant="destructive-outline">
								Delete
							</Button>
							<Button className="w-fit" size="sm" variant="invert-outline">
								Save & Exit
							</Button>
							<Button className="w-fit" size="sm">
								Publish <RiArrowRightSLine />
							</Button>
						</div>
					</div>
					<div className="h-[calc(100%-118px)] w-full space-y-6 rounded-2xl bg-white p-5">
						<div className="flex h-10 w-full items-center justify-between border-b">
							<div className="flex items-center gap-x-4">
								{tabs.map(({ icon: Icon, label, name }) => (
									<button
										key={name}
										onClick={() => setTab(name)}
										className={`relative flex h-10 items-center gap-x-1 text-sm font-medium transition-all duration-300 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-primary-400 ${tab === name ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
										<Icon className="size-5" /> {label}
									</button>
								))}
							</div>
							<button className="flex items-center gap-x-1 rounded-md px-2 py-1 text-sm text-neutral-400 transition-all duration-300 hover:bg-neutral-100 active:scale-95">
								<RiEyeLine className="size-[18px]" /> Preview
							</button>
						</div>
						<div className="grid min-h-[500px] w-full grid-cols-12">
							<div className="col-span-7 space-y-4 overflow-y-auto bg-neutral-100 p-3">
								<div className="flex w-full items-center justify-between bg-white px-4 py-3">
									<p className="text-sm text-neutral-400">ALL QUESTIONS</p>
									<button
										onClick={addQuestion}
										className="flex h-7 items-center gap-x-2 rounded-md border border-neutral-400 bg-neutral-100 px-1 text-xs font-medium text-neutral-400 transition-all duration-300 active:scale-95">
										<RiAddLine className="size-4" /> Add New Question
									</button>
								</div>
								<Question index={current} onDelete={deleteQuestion} question={questions[current]} />
							</div>
							<div className="col-span-5 px-8">
								<div className="w-[285px] space-y-5 rounded-md border p-3">
									<p className="text-xs text-neutral-400">ALL QUESTIONS</p>
									<div className="grid w-full grid-cols-5 gap-x-9 gap-y-2">
										{questions.map((_, index) => (
											<button
												key={index}
												onClick={() => setCurrent(index)}
												className={`grid size-6 place-items-center rounded-full text-xs ${index === current ? "bg-primary-100 text-primary-400" : "bg-neutral-100 text-neutral-400"}`}>
												{index + 1}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
