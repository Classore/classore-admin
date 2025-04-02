import { RiArrowLeftSLine, RiDeleteBin6Line, RiMore2Line, RiStarFill } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import React from "react";

import { Breadcrumbs, IconLabel, Pagination, Seo, Spinner } from "@/components/shared";
import { DeleteEntities, GetExaminations, PublishResource } from "@/queries";
import { PublishModal } from "@/components/publish-modal";
import { AddExamination } from "@/components/dashboard";
import { DashboardLayout } from "@/components/layout";
import { hasPermission } from "@/lib/permission";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/z-store";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const breadcrumbs = [
	{ label: "Manage Courses", href: "/dashboard/courses" },
	{
		label: "Categories",
		href: `/dashboard/courses/categories`,
		active: true,
	},
];

const Page = () => {
	const admin = useUserStore().user;
	const queryClient = useQueryClient();

	const [open, setOpen] = React.useState(false);
	const [page, setPage] = React.useState(1);
	const [openPublishModal, setOpenPublishModal] = React.useState(false);

	const router = useRouter();
	const id = router.query.id as string;

	const { data: exams, isPending } = useQuery({
		queryKey: ["get-exams"],
		queryFn: () => GetExaminations(),
		staleTime: Infinity,
		gcTime: Infinity,
		select: (data) => data.data,
	});

	const { mutate: publishMutate, isPending: publishPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			toast.success("Exam published successfully!");
			queryClient.invalidateQueries({
				queryKey: ["get-exams"],
			});
			setOpenPublishModal(false);
		},
	});

	const { mutate: deleteMutate, isPending: deletePending } = useMutation({
		mutationFn: DeleteEntities,
		onSuccess: () => {
			toast.success("Exam deleted successfully!");
			queryClient.invalidateQueries({
				queryKey: ["get-exams"],
			});
		},
	});

	return (
		<>
			<Seo title="Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full items-center justify-between rounded-lg bg-white p-5">
						<div className="flex flex-col gap-y-2">
							<div className="flex items-center gap-x-4">
								<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
									<RiArrowLeftSLine className="text-neutral-400" /> Back
								</Button>
								<h3 className="text-lg font-medium">Exams</h3>
							</div>
							<Breadcrumbs courseId={id} links={breadcrumbs} />
						</div>

						<AddExamination open={open} onOpenChange={setOpen} />
					</div>

					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<Table className="font-body">
							<TableHeader className="rounded-t-lg bg-neutral-50">
								<TableRow className="rounded-t-lg text-xs">
									<TableHead className="w-[] text-neutral-400">Name</TableHead>
									<TableHead className="w-[118px] text-center text-neutral-400">Rating</TableHead>
									<TableHead className="w-[236px] text-center text-neutral-400">Last Updated</TableHead>
									<TableHead className="w-[154px] text-center text-neutral-400">Status</TableHead>
									<TableHead className="w-[61px] text-center text-neutral-400"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isPending && (
									<TableRow>
										<TableCell colSpan={12} className="h-[400px] py-10 text-center text-xs">
											Loading...
										</TableCell>
									</TableRow>
								)}
								{exams?.data.length === 0 && (
									<TableRow>
										<TableCell colSpan={6} className="py-10 text-center text-xs">
											No courses found.
										</TableCell>
									</TableRow>
								)}
								{exams?.data.map((exam) => (
									<TableRow key={exam.examination_id}>
										<TableCell className="text-xs font-medium capitalize">
											<div className="flex items-center gap-x-2">
												<Image
													src={exam.examination_banner}
													width={100}
													height={100}
													alt=""
													className="h-10 w-10 rounded-full"
												/>
												<p>{exam.examination_name}</p>
											</div>
										</TableCell>
										<TableCell className="text-center text-xs text-neutral-400">
											<div className="flex items-center justify-center gap-x-1">
												<RiStarFill className="size-4 text-amber-500" />
												<span>{exam.examination_rating}</span>
											</div>
										</TableCell>
										<TableCell className="text-center text-xs text-neutral-400">
											{exam.examination_updatedOn
												? format(new Date(exam.examination_updatedOn), "MMM dd,yyyy HH:mm a")
												: format(exam.examination_createdOn, "MMM dd,yyyy HH:mm a")}
										</TableCell>
										<TableCell className="text-center text-xs">
											<div
												className={`mx-auto flex w-fit items-center justify-center rounded px-3 py-1 text-[10px] font-bold capitalize ${exam.examination_is_published === "NO" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
												{exam.examination_is_published === "NO" ? "UNPUBLISHED" : "PUBLISHED"}
											</div>
										</TableCell>
										<TableCell>
											<Popover>
												<PopoverTrigger asChild disabled={!hasPermission(admin, ["videos_write"])}>
													<button type="button" className="grid h-8 w-9 place-items-center rounded-md border">
														<RiMore2Line size={18} />
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-40">
													<PublishModal
														open={openPublishModal}
														setOpen={setOpenPublishModal}
														type="exam"
														published={exam.examination_is_published === "YES"}
														isPending={publishPending}
														onConfirm={() =>
															publishMutate({
																id: exam.examination_id,
																model_type: "EXAMINATION",
																publish: exam.examination_is_published === "YES" ? "NO" : "YES",
															})
														}
													/>

													<Dialog>
														<DialogTrigger asChild>
															<button
																type="button"
																onClick={() => {}}
																className="flex h-7 w-full items-center gap-x-2 rounded-md px-2 text-xs text-red-500 hover:bg-red-100">
																<RiDeleteBin6Line size={18} /> Delete
															</button>
														</DialogTrigger>
														<DialogContent className="w-[400px] p-1">
															<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
																<IconLabel icon={RiDeleteBin6Line} variant="destructive" />
																<DialogTitle className="my-4">Delete Exam</DialogTitle>
																<DialogDescription>Are you sure you want to delete this exam?</DialogDescription>
																<div className="mt-6 flex w-full items-center justify-end gap-x-4">
																	<DialogClose asChild>
																		<Button className="w-fit" variant="outline">
																			Cancel
																		</Button>
																	</DialogClose>
																	<Button
																		disabled={deletePending}
																		onClick={() => {
																			deleteMutate({
																				ids: [exam.examination_id],
																				model_type: "EXAMINATION",
																			});
																		}}
																		className="w-fit"
																		variant="destructive">
																		{deletePending ? <Spinner /> : "Yes, Delete"}
																	</Button>
																</div>
															</div>
														</DialogContent>
													</Dialog>
												</PopoverContent>
											</Popover>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<Pagination
							current={page}
							onPageChange={setPage}
							pageSize={10}
							total={exams?.meta.itemCount || 0}
						/>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
