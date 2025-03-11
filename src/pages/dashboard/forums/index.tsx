import { useQueries } from "@tanstack/react-query";
import { RiLoaderLine, RiMoreLine } from "@remixicon/react";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BundlesResponse, ExaminationResponse } from "@/queries";
import { DashboardLayout, Unauthorized } from "@/components/layout";
import { GetBundles, GetExaminations } from "@/queries";
import { SearchInput, Seo } from "@/components/shared";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";

const Page = () => {
	const [selected, setSelected] = React.useState({ exam: "", bundle: "" });
	const { user } = useUserStore();

	const [{ data: examinations }, { data: bundles }] = useQueries({
		queries: [
			{
				queryKey: ["get-exams"],
				queryFn: () => GetExaminations({ limit: 20, page: 1 }),
				select: (data: ExaminationResponse) => data.data.data,
			},
			{
				queryKey: ["get-bundles", selected.exam],
				queryFn: () => GetBundles({ examination: selected.exam, limit: 100, page: 1 }),
				enabled: !!selected.exam,
				select: (data: BundlesResponse) => data.data.data,
			},
		],
	});

	const selectedForum = React.useMemo(() => {
		if (!selected.bundle || !bundles) return "";
		const bundle = bundles.find((bundle) => bundle.examinationbundle_id === selected.bundle);
		if (!bundle) return "";
		return bundle.examinationbundle_name;
	}, [bundles, selected.bundle]);

	if (!hasPermission(user, ["student_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Forums" />
			<DashboardLayout>
				<div className="h-[100%] w-full rounded-lg bg-white">
					<div className="flex h-14 w-full items-center gap-x-6 border-b px-5">
						<p className="text-xl font-medium">Community Forum</p>
						<div className="flex items-center gap-x-6">
							{examinations?.map((exam) => (
								<button
									key={exam.examination_id}
									onClick={() => setSelected({ ...selected, exam: exam.examination_id })}
									className={`h-8 rounded-md px-2 text-sm font-medium capitalize transition-colors duration-300 ${exam.examination_id === selected.exam ? "bg-primary-100 text-primary-400" : "bg-neutral-100 text-neutral-400"}`}>
									{exam.examination_name}
								</button>
							))}
						</div>
					</div>
					<div className="flex h-16 w-full items-center gap-x-6 border-b px-5">
						{!bundles ? (
							<div className="flex items-center gap-x-4">
								<RiLoaderLine className="animate-spin text-primary-400" />
								<span className="text-sm font-medium">Fetching channels</span>
							</div>
						) : (
							<>
								{bundles.map((bundle) => (
									<button
										key={bundle.examinationbundle_id}
										onClick={() => setSelected({ ...selected, bundle: bundle.examinationbundle_id })}
										className={`relative h-16 text-sm font-medium uppercase transition-all duration-300 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:bg-primary-400 ${bundle.examinationbundle_id === selected.bundle ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
										{bundle.examinationbundle_name}
									</button>
								))}
							</>
						)}
					</div>
					<div className="flex h-[calc(100%-120px)] w-full items-start">
						<div className="h-full w-[300px] border-r">
							<div className="flex h-[76px] w-full items-center justify-start border-b px-5">
								<p className="font-medium capitalize">{selectedForum}</p>
							</div>
							<div className="grid h-[72px] w-full place-items-center border-b">
								<SearchInput />
							</div>
							<div className="flex flex-1 flex-col overflow-y-auto"></div>
						</div>
						<div className="h-full flex-1">
							<div className="flex h-[76px] w-full items-center justify-between border-b px-8">
								<div className="flex items-center gap-x-4">
									<div className="size-10 rounded-lg bg-green-500"></div>
									<div className="space-y-1">
										<p className="text-sm font-medium">Room Name</p>
										<p className="text-xs text-neutral-400">0 Members</p>
									</div>
								</div>
								<Popover>
									<PopoverTrigger className="grid size-8 place-items-center rounded-md bg-neutral-100">
										<RiMoreLine className="size-6" />
									</PopoverTrigger>
									<PopoverContent className="right-10"></PopoverContent>
								</Popover>
							</div>
							<div className="flex h-[calc(100%-76px)] w-full flex-col gap-y-2 overflow-y-auto px-8"></div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
