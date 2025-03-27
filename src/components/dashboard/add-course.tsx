import {
	RiAddLine,
	RiBookLine,
	RiCameraLine,
	RiDeleteBinLine,
	RiLoaderLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useFormik } from "formik";
import React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useFileHandler } from "@/hooks";
import { IsHttpError, httpErrorhandler } from "@/lib";
import { queryClient } from "@/providers";
import type { CreateSubjectDto } from "@/queries";
import { CreateSubject, GetBundles, GetExaminations } from "@/queries";
import Image from "next/image";
import { IconLabel } from "../shared";
import CustomRadio from "../shared/radio";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { TiptapEditor } from "../ui/tiptap-editor";

type Mode = "initial" | "select" | "create";

interface Props {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

interface InnerProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleChange: (e: React.ChangeEvent<any>) => void;
	isPending: boolean;
	onModeChange: (mode: Mode) => void;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setFieldValue: (field: string, value: any) => void;
	values: CreateSubjectDto;
}

const initialValues: CreateSubjectDto = {
	examination_bundle: "",
	categoryId: "",
	description: "",
	name: "",
	banner: null,
	chapter_dripping: "NO",
};

export const AddCourse = ({ onOpenChange, open }: Props) => {
	const [mode, setMode] = React.useState<Mode>("initial");

	const { isPending, mutate } = useMutation({
		mutationKey: ["create-course"],
		mutationFn: (payload: CreateSubjectDto) => CreateSubject(payload),
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries().then(() => {
				onOpenChange(false);
			});
		},
		onError: (error) => {
			const isHttpError = IsHttpError(error);
			if (isHttpError) {
				const { message } = httpErrorhandler(error);
				toast.error(message);
				return;
			} else {
				toast.error("Something went wrong");
			}
		},
		onSettled: () => {
			setMode("initial");
			queryClient.invalidateQueries();
		},
	});

	const onModeChange = (mode: Mode) => {
		setMode(mode);
	};

	const { handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		enableReinitialize: true,
		onSubmit: (values) => {
			mutate(values);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Button size="sm" className="w-fit" onClick={() => onOpenChange(!open)}>
				<RiAddLine /> Add New Course
			</Button>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiBookLine} />
					{mode === "initial" && (
						<Initial
							handleChange={handleChange}
							isPending={isPending}
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
							isPending={isPending}
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
							isPending={isPending}
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
	const { handleChange, onModeChange, onOpenChange, setFieldValue, values } = props;

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

	const { handleClick, handleFileChange, handleRemoveFile, inputRef } = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			setFieldValue("banner", file);
		},
		fileType: "image",
		validationRules: {
			allowedTypes: ["image/png", "image/jpeg", "image/jpg"],
			maxSize: 2 * 1024 * 1024, // 2MB
			maxFiles: 1,
			minFiles: 1,
		},
		onError: (error) => {
			toast.error(error);
		},
	});

	return (
		<div className="my-4 space-y-5">
			<DialogTitle>Add New Course</DialogTitle>
			<DialogDescription hidden>Add New Course</DialogDescription>
			<div className="w-full space-y-4">
				<div className="h-40 w-full rounded-lg border">
					{values.banner ? (
						<div className="relative size-full rounded-lg">
							<Image
								src={URL.createObjectURL(values.banner as File)}
								alt="banner"
								fill
								className="size-full rounded-lg object-cover"
							/>
							<button
								onClick={() => values.banner && handleRemoveFile(values.banner as File)}
								className="absolute right-3 top-3 rounded-md bg-white p-1 text-red-500">
								<RiDeleteBinLine size={14} />
							</button>
						</div>
					) : (
						<div className="relative size-full rounded-lg bg-gradient-to-br from-secondary-100 to-primary-300">
							<input
								type="file"
								id="image-upload"
								className="hidden"
								onChange={handleFileChange}
								ref={inputRef}
							/>
							<button
								onClick={handleClick}
								className="absolute bottom-3 right-3 flex items-center gap-x-2 rounded-md border bg-white px-3 py-0.5 text-xs font-medium">
								<RiCameraLine size={14} /> <span>Add Banner</span>
							</button>
						</div>
					)}
				</div>

				<Input label="Enter course title" name="name" value={values.name} onChange={handleChange} />
				{/* <Textarea
					label="Describe what the students will learn"
					name="description"
					value={values.description}
					onChange={handleChange}
					wrapperClassName="h-40"
				/> */}
				<label className="font-body flex flex-col gap-1.5">
					<p className="text-xs text-neutral-400">
						Describe what the students will learn
					</p>
				<TiptapEditor
					value={values.description ?? ""}
					initialValue={values.description ?? ""}
					onChange={(value) => setFieldValue("description", value)}
					editorClassName="max-h-52"
				/>
				</label>

				<label className="flex items-center justify-between pt-2 text-xs">
					<p>Add Chapter Dripping</p>
					<Switch
						checked={values.chapter_dripping === "YES"}
						onCheckedChange={() => {
							setFieldValue("chapter_dripping", values.chapter_dripping === "YES" ? "NO" : "YES");
						}}
					/>
				</label>
			</div>
			<div className="flex w-full items-center justify-between">
				<p className="text-xs text-neutral-400">STEP 1 OF 3</p>
				<div className="flex items-center gap-x-2">
					<Button onClick={() => onOpenChange(false)} className="w-32" variant="outline">
						Cancel
					</Button>
					<Button onClick={handleSubmit} className="w-32">
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
		queryFn: () => GetExaminations(),
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
									<label className="flex h-10 w-full cursor-pointer items-center justify-between py-1">
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
									</label>
									{index < exams.data.data.length - 1 && <hr className="border-neutral-300" />}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
				{/* <Button variant="dotted">
					<RiAddLine />
					Create New Category
				</Button> */}
				<div className="flex w-full items-center justify-between">
					<p className="text-xs text-neutral-400">STEP 2 OF 3</p>
					<div className="flex items-center gap-x-2">
						<Button onClick={() => onModeChange("initial")} className="w-32" variant="outline">
							Back
						</Button>
						<Button onClick={handleSubmit} className="w-32">
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

const Complete = (props: InnerProps) => {
	const { isPending, onModeChange, onSubmit, setFieldValue, values } = props;

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
									<label className="flex h-14 w-full cursor-pointer items-center justify-between px-3 first:rounded-t-lg last:rounded-b-lg">
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
									</label>
									{index < bundles.data.data.length - 1 && <hr className="border-neutral-300" />}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
				{/* <Button variant="dotted">
					<RiAddLine />
					Create New Subcategory
				</Button> */}
			</div>
			<div className="flex w-full items-center justify-between">
				<p className="text-xs text-neutral-400">STEP 3 OF 3</p>
				<div className="flex items-center gap-x-2">
					<Button onClick={() => onModeChange("select")} className="w-32" variant="outline">
						Back
					</Button>
					<Button type="submit" disabled={isPending} onClick={handleSubmit} className="w-32">
						{isPending ? <RiLoaderLine className="size-5 animate-spin" /> : "Next"}
					</Button>
				</div>
			</div>
		</div>
	);
};
