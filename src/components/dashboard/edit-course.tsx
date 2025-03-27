import { RiCameraLine, RiDeleteBinLine, RiLoaderLine, RiLoopLeftLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Image from "next/image";
import { toast } from "sonner";
import * as Yup from "yup";

import { useFileHandler } from "@/hooks";
import { queryClient } from "@/providers";
import { UpdateSubject, type CreateSubjectDto, type SubjectResponse } from "@/queries";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { TiptapEditor } from "../ui/tiptap-editor";

interface Props {
	course: SubjectResponse;
	open: boolean;
	setOpen: (open: boolean) => void;
	courseId: string;
}

export const EditCourse = ({ course, open, setOpen, courseId }: Props) => {
	const { isPending, mutateAsync } = useMutation({
		mutationKey: ["update-subject"],
		mutationFn: (data: Partial<CreateSubjectDto>) => UpdateSubject(courseId, data),
		onSuccess: (data) => {
			console.log(data);
			queryClient.invalidateQueries({ queryKey: ["get-subject", courseId] });
			setOpen(false);
		},
		onError: (error) => {
			console.log(error);
		},
	});

	const initialValues: Partial<CreateSubjectDto> = {
		name: course.name,
		description: course.description,
		banner: course.banner ?? null,
	};

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema: Yup.object().shape({
			name: Yup.string().required("Name is required"),
			description: Yup.string().required("Description is required"),
			banner: Yup.mixed(),
			chapter_dripping: Yup.string().required("Chapter Dripping is required"),
		}),
		onSubmit: (values) => {
			mutateAsync(values);
		},
	});

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
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" onClick={() => setOpen(!open)}>
					Edit Course
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[450px] p-1">
				<div className="w-full space-y-4 rounded-lg border p-4">
					<div>
						<DialogTitle>Edit Course</DialogTitle>
						<DialogDescription></DialogDescription>
					</div>
					<form onSubmit={handleSubmit} className="w-full space-y-4">
						<div className="h-40 w-full rounded-lg border">
							{values.banner ? (
								<div className="relative size-full rounded-lg">
									<Image
										src={
											typeof values.banner === "string" ? values.banner : URL.createObjectURL(values.banner)
										}
										alt="banner"
										fill
										className="size-full rounded-lg object-cover"
									/>
									{values.banner && typeof values.banner === "string" ? (
										<label htmlFor="image-upload">
											<input
												type="file"
												id="image-upload"
												className="hidden"
												onChange={handleFileChange}
												ref={inputRef}
											/>
											<button
												type="button"
												onClick={handleClick}
												className="absolute right-3 top-3 rounded-md bg-white p-1 text-primary-500">
												<RiLoopLeftLine size={14} />
											</button>
										</label>
									) : (
										<button
											type="button"
											onClick={() =>
												values.banner && typeof values.banner !== "string" && handleRemoveFile(values.banner)
											}
											className="absolute right-3 top-3 rounded-md bg-white p-1 text-red-500">
											<RiDeleteBinLine size={14} />
										</button>
									)}
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
										type="button"
										onClick={handleClick}
										className="absolute bottom-3 right-3 flex items-center gap-x-2 rounded-md border bg-white px-3 py-0.5 text-xs font-medium">
										<RiCameraLine size={14} /> Update Banner
									</button>
								</div>
							)}
						</div>
						<Input
							label="Name"
							name="name"
							value={values.name}
							onChange={handleChange}
							error={touched.name && errors.name ? errors.name : ""}
						/>

						<label className="flex flex-col gap-1.5 font-body">
							<p className="text-xs text-neutral-400">Description</p>
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
								value={values.chapter_dripping === "YES" ? "NO" : "YES"}
								checked={values.chapter_dripping === "YES"}
								onCheckedChange={() => {
									setFieldValue("chapter_dripping", values.chapter_dripping === "YES" ? "NO" : "YES");
								}}
							/>
						</label>

						<div className="flex w-full items-center justify-end gap-x-4">
							<Button type="button" className="w-fit" onClick={() => setOpen(false)} variant="outline">
								Cancel
							</Button>
							<Button disabled={isPending} type="submit" className="w-fit">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Update"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
