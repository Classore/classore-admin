import { Chapters } from "@/components/chapters";
import { DashboardLayout } from "@/components/layout";
import { Seo, TabPanel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { create_course_tabs } from "@/config";
import {
	RiAddLine,
	RiArrowDownLine,
	RiArrowLeftSLine,
	RiArrowUpLine,
	RiDeleteBin6Line,
	RiEyeLine,
	RiFile2Line,
	RiFileCopyLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { useRouter } from "next/router";
import * as React from "react";

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

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
						<TabPanel
							innerClassName="grid grid-cols-7 pt-5 gap-2"
							selected={tab}
							value="course">
							<Chapters />

							{/* the children inside will be an accordion */}
							<div className="col-span-4 rounded-md bg-neutral-100 p-4">
								<div className="flex flex-col gap-4">
									<div>
										<p className="text-xs uppercase tracking-widest">Lesson 1</p>
										<input
											type="text"
											placeholder="Enter lesson title"
											className="w-full border-0 bg-transparent px-0 text-lg font-bold text-neutral-600 outline-0 ring-0 focus:border-b focus:ring-0"
											value="Introduction to Biology Education 007"
										/>
									</div>

									<label className="flex flex-col gap-2 text-sm">
										<p>Lesson Description:</p>
										<textarea className="flex h-44 w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-primary-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" />
									</label>

									<div className="flex items-center gap-2">
										<button
											type="button"
											className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
											<RiAddLine className="size-4" />
											<span>Add Quiz</span>
										</button>
									</div>

									<div className="flex flex-col gap-2">
										<label
											htmlFor="video-upload"
											className="grid w-full place-items-center rounded-lg bg-white py-4">
											<input
												type="file"
												className="sr-only hidden"
												id="video-upload"
												accept="video/*"
												multiple={false}
											/>
											<div className="flex flex-col items-center gap-y-6 p-5">
												<div className="grid size-10 place-items-center rounded-md bg-neutral-100">
													<RiUploadCloud2Line size={20} />
												</div>

												<div className="text-center text-sm">
													<p className="font-medium">
														<span className="text-secondary-300">Click to upload</span> or drag and drop
														video
													</p>
													<p className="text-center text-xs text-neutral-400">
														mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
													</p>
												</div>

												<div className="relative h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
												<div className="flex items-center justify-center gap-x-4">
													<Button className="w-fit" size="sm" variant="invert-outline">
														<RiUploadCloud2Line size={14} /> Upload Video
														{/* {isPending && <RiLoaderLine className="animate-spin" />} */}
													</Button>
													{/* <PasteLink
													module={module}
													open={open.paste}
													setOpen={(paste) => setOpen({ ...open, paste })}
													disabled={isPending}
												/> */}
												</div>
											</div>
										</label>

										<div className="rounded-md bg-white px-4 py-3 text-sm">
											<div className="flex items-center justify-between gap-2">
												<p className="font-semibold text-neutral-500">File Attachments</p>

												<button
													type="button"
													className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
													<RiFile2Line className="size-4" />
													<span>Upload Attachments</span>
												</button>
											</div>
										</div>

										<Button className="mt-4 w-40 text-sm font-medium">Save Lesson</Button>
									</div>
								</div>
							</div>
						</TabPanel>
					</div>
				</section>
			</DashboardLayout>
		</>
	);
};

export default Page;
