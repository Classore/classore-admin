import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";
import {
	RiListCheck3,
	RiLoaderLine,
	RiSettings6Line,
	RiShuffleLine,
	RiSkipForwardLine,
	RiTimerLine,
} from "@remixicon/react";

import { type UpdateTestDto, UpdateTest } from "@/queries/test-center";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const initialValues: Partial<UpdateTestDto> = {
	attempt_limit: 0,
	attempt_reset: 0,
	bench_mark: 0,
	shuffle_questions: "NO",
	skip_questions: "NO",
	timer_hour: 0,
	timer_minute: 0,
};

export const TestSettings = ({ testId }: { testId: string }) => {
	const [open, setOpen] = React.useState({ attempt: false, pass: false, timer: false });

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: Partial<UpdateTestDto>) => UpdateTest(testId, payload),
		mutationKey: ["update-test", testId],
		onSuccess: () => {
			toast.success("Test settings updated successfully");
		},
		onError: () => {
			toast.error("Failed to update test settings");
		},
		onSettled: () => {},
	});

	const {} = useQuery({
		queryFn: () => Promise.resolve(null),
		queryKey: ["get-test-settings", testId],
		enabled: false,
	});

	const { handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			mutateAsync(values);
		},
	});

	React.useEffect(() => {
		setFieldValue("attempt_limit", 0);
		setFieldValue("attempt_reset", 0);
	}, [open.attempt, setFieldValue]);

	React.useEffect(() => {
		setFieldValue("bench_mark", 0);
	}, [open.pass, setFieldValue]);

	React.useEffect(() => {
		setFieldValue("timer_hour", 0);
		setFieldValue("timer_minute", 0);
	}, [open.timer, setFieldValue]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-fit" size="sm" variant="outline">
					<RiSettings6Line /> Test Settings
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full space-y-4 rounded-lg border p-4">
					<DialogTitle>Test Settings</DialogTitle>
					<DialogDescription hidden>Test Settings</DialogDescription>
					<hr />
					<form onSubmit={handleSubmit} className="w-full space-y-5">
						<div className="w-full space-y-2">
							<p className="text-xs text-neutral-400">QUESTION SETTINGS</p>
							<div className="w-full">
								<div className="flex min-h-[75px] w-full items-start gap-x-3 p-2">
									<div className="grid size-5 place-items-center">
										<RiShuffleLine className="size-4" />
									</div>
									<div className="flex-1 space-y-2">
										<p className="text-sm capitalize">Shuffle Questions</p>
										<p className="text-xs text-neutral-400">
											Let the system automatically shuffle questions for each attempt or anytime they attempt
											the quiz.
										</p>
									</div>
									<div className="w-8">
										<Switch
											checked={values.shuffle_questions === "YES"}
											onCheckedChange={(value) => setFieldValue("shuffle_questions", value ? "YES" : "NO")}
										/>
									</div>
								</div>
								<div className="flex min-h-[75px] w-full items-start gap-x-3 p-2">
									<div className="grid size-5 place-items-center">
										<RiSkipForwardLine className="size-4" />
									</div>
									<div className="flex-1 space-y-2">
										<p className="text-sm capitalize">Skip Questions</p>
										<p className="text-xs text-neutral-400">
											Allow students to skip questions and allow them to revisit them before the limit is up
										</p>
									</div>
									<div className="w-8">
										<Switch
											checked={values.skip_questions === "YES"}
											onCheckedChange={(value) => setFieldValue("skip_questions", value ? "YES" : "NO")}
										/>
									</div>
								</div>
								<div>
									<div className="flex min-h-[75px] w-full items-start gap-x-3 p-2">
										<div className="grid size-5 place-items-center">
											<RiTimerLine className="size-4" />
										</div>
										<div className="flex-1 space-y-2">
											<p className="text-sm capitalize">Set Timer</p>
											<p className="text-xs text-neutral-400">
												Set a time limit for each attempt. Students will not be able to submit their answers
												after the timer is up.
											</p>
										</div>
										<div className="w-8">
											<Switch checked={open.timer} onCheckedChange={(timer) => setOpen({ ...open, timer })} />
										</div>
									</div>
									{open.timer && (
										<div className="ml-10 flex h-10 items-center">
											<Select
												value={values.timer_hour?.toString()}
												onValueChange={(value) => setFieldValue("timer_hour", value)}>
												<SelectTrigger className="h-full w-[120px] rounded-r-none bg-neutral-200 outline-none ring-0">
													<SelectValue placeholder="Select hours" />
												</SelectTrigger>
												<SelectContent>
													{[...Array(6)].map((_, index) => (
														<SelectItem key={index} value={index.toString()}>
															{index.toString()} {index > 1 ? "hours" : "hour"}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Select
												value={values.timer_minute?.toString()}
												onValueChange={(value) => setFieldValue("timer_minute", value)}>
												<SelectTrigger className="h-full w-[120px] rounded-l-none outline-none ring-0">
													<SelectValue placeholder="Select minutes" />
												</SelectTrigger>
												<SelectContent>
													{[...Array(12)].map((_, index) => (
														<SelectItem key={index} value={(index * 5).toString()}>
															{(index * 5).toString()} {index * 5 > 1 ? "minutes" : "minute"}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="w-full space-y-2">
							<p className="text-xs text-neutral-400">ANSWER SETTINGS</p>
							<div className="w-full">
								<div>
									<div className="flex min-h-[75px] w-full items-start gap-x-3 p-2">
										<div className="grid size-5 place-items-center">
											<RiListCheck3 className="size-4" />
										</div>
										<div className="flex-1 space-y-2">
											<p className="text-sm capitalize">Assign Passmark</p>
											<p className="text-xs text-neutral-400">
												Set a pass mark for each attempt. Student will not to be able to proceed if they do not
												meet the pass mark.
											</p>
										</div>
										<div className="w-8">
											<Switch checked={open.pass} onCheckedChange={(pass) => setOpen({ ...open, pass })} />
										</div>
									</div>
									{open.pass && (
										<div className="ml-10 flex h-10 items-center">
											<Select
												value={values.bench_mark?.toString()}
												onValueChange={(value) => setFieldValue("bench_mark", value)}>
												<SelectTrigger className="h-full w-[120px] rounded-lg bg-neutral-200 outline-none ring-0">
													<SelectValue placeholder="Select a pass mark" />
												</SelectTrigger>
												<SelectContent>
													{[...Array(11)].map((_, index) => (
														<SelectItem key={index} value={(index * 5 + 50).toString()}>
															{(index * 5 + 50).toString()} %
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>
								<div>
									<div className="flex min-h-[75px] w-full items-start gap-x-3 p-2">
										<div className="grid size-5 place-items-center">
											<RiSkipForwardLine className="size-4" />
										</div>
										<div className="flex-1 space-y-2">
											<p className="text-sm capitalize">Attempts</p>
											<p className="text-xs text-neutral-400">
												Set a number of attempts for each student. Students will not be able to take the quiz
												after the number of attempts is up.
											</p>
										</div>
										<div className="w-8">
											<Switch
												checked={open.attempt}
												onCheckedChange={(attempt) => setOpen({ ...open, attempt })}
											/>
										</div>
									</div>
									{open.attempt && (
										<div className="ml-10 flex h-10 items-center">
											<Select
												value={values.attempt_limit?.toString()}
												onValueChange={(value) => setFieldValue("attempt_limit", value)}>
												<SelectTrigger className="h-full w-20 rounded-r-none bg-neutral-200 outline-none ring-0">
													<SelectValue placeholder="Select" />
												</SelectTrigger>
												<SelectContent>
													{[...Array(6)].map((_, index) => (
														<SelectItem key={index} value={index.toString()}>
															{index.toString()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Select
												value={values.attempt_reset?.toString()}
												onValueChange={(value) => setFieldValue("attempt_reset", value)}>
												<SelectTrigger className="h-full w-40 rounded-l-none outline-none ring-0">
													<SelectValue placeholder="Select" />
												</SelectTrigger>
												<SelectContent>
													{[...Array(6)].map((_, index) => (
														<SelectItem key={index} value={((index + 1) * 12).toString()}>
															Every {((index + 1) * 12).toString()} hours
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="flex w-full items-center justify-end">
							<Button type="submit" size="sm" disabled={isPending} className="w-fit">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Update Settings"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
