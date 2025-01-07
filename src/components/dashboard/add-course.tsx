import { RiAddLine, RiBookLine, RiLoaderLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";

import { type CreateCourseDto, GetBundles, GetExaminaions } from "@/queries";
import CustomRadio from "../shared/radio";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { IconLabel } from "../shared";
import { Input } from "../ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

type Mode = "initial" | "select" | "create";

interface Props {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

interface InnerProps {
	handleChange: (e: React.ChangeEvent<any>) => void;
	onModeChange: (mode: Mode) => void;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
	setFieldValue: (field: string, value: any) => void;
	values: CreateCourseDto;
}

const initialValues: CreateCourseDto = {
	examination_bundle: "",
	categoryId: "",
	description: "",
	name: "",
};

export const AddCourse = ({ onOpenChange, open }: Props) => {
	const [mode, setMode] = React.useState<Mode>("initial");
	const router = useRouter();

	const {} = useMutation({
		mutationKey: ["create-course"],
		// mutationFn: () => {},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const onModeChange = (mode: Mode) => {
		setMode(mode);
	};

	const { handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values: CreateCourseDto) => {
			console.log(values);
			const query = Object.entries(values)
				.map(([key, value]) => `${key}=${value}`)
				.join("&");
			router.push(`/dashboard/courses/new?${query}`);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiBookLine} />
					{mode === "initial" && (
						<Initial
							handleChange={handleChange}
							onSubmit={handleSubmit}
							onModeChange={onModeChange}
							onOpenChange={onOpenChange}
							setFieldValue={setFieldValue}
							values={values}
						/>
					)}
					{mode === "select" && (
						<Intermediate
							handleChange={handleChange}
							onSubmit={handleSubmit}
							onModeChange={onModeChange}
							onOpenChange={onOpenChange}
							setFieldValue={setFieldValue}
							values={values}
						/>
					)}
					{mode === "create" && (
						<Complete
							handleChange={handleChange}
							onSubmit={handleSubmit}
							onModeChange={onModeChange}
							onOpenChange={onOpenChange}
							setFieldValue={setFieldValue}
							values={values}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const Initial = (props: InnerProps) => {
	const { handleChange, onModeChange, onOpenChange, values } = props;

	const handleSubmit = () => {
		if (!values.name) {
			toast.error("Please enter a name");
			return;
		}
		if (!values.description) {
			toast.error("Please enter a description");
			return;
		}
		onModeChange("select");
	};

	return (
		<div className="my-4 space-y-5">
			<DialogTitle>Add New Course</DialogTitle>
			<DialogDescription hidden>Add New Course</DialogDescription>
			<div className="w-full space-y-4">
				<Input
					label="Enter course title"
					name="name"
					value={values.name}
					onChange={handleChange}
				/>
				<Textarea
					label="Describe what the students will learn"
					name="description"
					value={values.description}
					onChange={handleChange}
					wrapperClassName="h-[90px]"
				/>
			</div>
			<div className="flex w-full items-center justify-between">
				<p className="text-xs text-neutral-400">STEP 1 OF 3</p>
				<div className="flex items-center gap-x-4">
					<Button onClick={() => onOpenChange(false)} className="w-fit" variant="outline">
						Cancel
					</Button>
					<Button onClick={handleSubmit} className="w-fit">
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

const Intermediate = (props: InnerProps) => {
	const { onModeChange, setFieldValue, values } = props;

	const { data: exams } = useQuery({
		queryKey: ["get-exams"],
		queryFn: () => GetExaminaions(),
	});

	const handleSubmit = () => {
		if (!values.categoryId) {
			toast.error("Please select a category");
			return;
		}
		onModeChange("create");
	};

	return (
		<div className="my-4 space-y-5">
			<DialogTitle>Add New Course</DialogTitle>
			<DialogDescription hidden>Add New Course</DialogDescription>
			<div className="w-full space-y-4">
				<div className="space-y-1.5">
					<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="category">
						Select Category
					</label>
					{!exams ? (
						<div className="grid h-24 w-full place-items-center">
							<RiLoaderLine className="animate-spin text-primary-400" />
						</div>
					) : (
						<div className="flex w-full flex-col gap-y-3 rounded-lg bg-neutral-100 p-3">
							{exams.data.data?.map((exam, index) => (
								<React.Fragment key={exam.examination_id}>
									<div className="flex h-10 w-full items-center justify-between py-1">
										<div className="flex flex-col">
											<h6 className="font-medium capitalize">{exam.examination_name}</h6>
											<p className="text-xs text-neutral-400">Subcategories</p>
										</div>
										<CustomRadio
											name={exam.examination_name}
											value={exam.examination_id}
											checked={values.categoryId === exam.examination_id}
											onChange={(e) => setFieldValue("categoryId", e.target.value)}
										/>
									</div>
									{index < exams.data.data.length - 1 && <hr className="border-neutral-300" />}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
				<Button variant="dotted">
					<RiAddLine />
					Create New Category
				</Button>
				<div className="flex w-full items-center justify-between">
					<p className="text-xs text-neutral-400">STEP 1 OF 3</p>
					<div className="flex items-center gap-x-4">
						<Button onClick={() => onModeChange("initial")} className="w-fit" variant="outline">
							Back
						</Button>
						<Button onClick={handleSubmit} className="w-fit">
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

const Complete = (props: InnerProps) => {
	const { onModeChange, onSubmit, setFieldValue, values } = props;

	const { data: bundles } = useQuery({
		queryKey: ["get-bundles"],
		queryFn: () => GetBundles({ examination: values.categoryId }),
		enabled: !!values.categoryId,
	});

	const handleSubmit = () => {
		if (!values.examination_bundle) {
			toast.error("Please select a bundle");
			return;
		}
		onSubmit();
	};

	return (
		<div className="my-4 space-y-5">
			<DialogTitle>Select Category</DialogTitle>
			<DialogDescription hidden>Select Category</DialogDescription>
			<div className="w-full space-y-4">
				<div className="w-full space-y-2">
					<p className="text-xs text-neutral-400">Select subcategory (National Exams)</p>
					{!bundles ? (
						<div className="grid h-24 w-full place-items-center">
							<RiLoaderLine className="animate-spin text-primary-400" />
						</div>
					) : (
						<div className="flex w-full flex-col gap-y-3 rounded-lg border bg-neutral-100 py-3">
							{bundles?.data.data.map((bundle, index) => (
								<React.Fragment key={bundle.examinationbundle_id}>
									<div className="flex h-14 w-full items-center justify-between px-3 first:rounded-t-lg last:rounded-b-lg">
										<div className="flex items-center gap-x-2">
											<div className="size-12 p-1">
												<div className="relative size-full rounded-md bg-neutral-500"></div>
											</div>
											<div className="flex flex-col">
												<h6 className="font-medium uppercase">{bundle.examinationbundle_name}</h6>
												<div className="flex items-center gap-x-1">
													<p className="text-xs text-neutral-400"> Courses</p>
													<div className="h-3 w-[1px] bg-neutral-300" />
													<p className="text-xs text-neutral-400">
														{" "}
														Last Updated{" "}
														{differenceInDays(
															new Date(),
															bundle.examinationbundle_updatedon ?? bundle.examinationbundle_createdon
														)}{" "}
														days
													</p>
												</div>
											</div>
										</div>
										<CustomRadio
											name={bundle.examinationbundle_name}
											value={bundle.examinationbundle_id}
											checked={values.examination_bundle === bundle.examinationbundle_id}
											onChange={(e) => setFieldValue("examination_bundle", e.target.value)}
										/>
									</div>
									{index < bundles.data.data.length - 1 && <hr className="border-neutral-300" />}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
				<Button variant="dotted">
					<RiAddLine />
					Create New Subcategory
				</Button>
			</div>
			<div className="flex w-full items-center justify-between">
				<p className="text-xs text-neutral-400">STEP 2 OF 3</p>
				<div className="flex items-center gap-x-4">
					<Button onClick={() => onModeChange("select")} className="w-fit" variant="outline">
						Back
					</Button>
					<Button type="submit" onClick={handleSubmit} className="w-fit">
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
