import { RiCameraLine, RiDeleteBinLine, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import Image from "next/image";
import * as Yup from "yup";
import React from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { UpdateSubject, type CreateSubjectDto } from "@/queries";
import { queryClient } from "@/providers";
import { Textarea } from "../ui/textarea";
import { useFileHandler } from "@/hooks";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {
	courseId: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	subject: string;
}

export const EditCourse = ({ courseId, open, setOpen, subject }: Props) => {
	const { isPending } = useMutation({
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
		name: subject,
		description: "",
		banner: null,
	};

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema: Yup.object().shape({
			name: Yup.string().required("Name is required"),
			description: Yup.string().required("Description is required"),
			banner: Yup.mixed(),
		}),
		onSubmit: (values) => {
			console.log(values);
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
						<div className="aspect-video w-full rounded-lg border">
							{values.banner ? (
								<div className="relative size-full rounded-lg">
									<Image
										src={URL.createObjectURL(values.banner)}
										alt="banner"
										fill
										className="size-full rounded-lg object-cover"
									/>
									<button
										onClick={() => values.banner && handleRemoveFile(values.banner)}
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
						<Textarea
							label="Description"
							name="description"
							value={values.description}
							onChange={handleChange}
							className="h-[150px]"
							error={touched.description && errors.description ? errors.description : ""}
						/>
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								type="button"
								className="w-fit"
								onClick={() => setOpen(false)}
								size="sm"
								variant="outline">
								Cancel
							</Button>
							<Button type="submit" className="w-fit" size="sm">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Update"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
