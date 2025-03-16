import { RiAddLine, RiLoaderLine, RiSpeedUpLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import { CreateTest, type CreateTestDto } from "@/queries/test-center";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/providers";
import { IconLabel } from "../shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

const initialValues: CreateTestDto = { title: "", description: "", banner: null };

export const AddTest = () => {
	const [open, setOpen] = React.useState(false);

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: CreateTestDto) => CreateTest(payload),
		mutationKey: ["add-test"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-tests"] });
		},
		onError: (error) => {
			console.error(error);
		},
		onSettled: () => {
			setOpen(false);
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema: Yup.object({
			title: Yup.string().required("Title is required").min(5, "Title is too short"),
			description: Yup.string().required("Description is required"),
			banner: Yup.mixed().required("Banner is required"),
		}),
		onSubmit: (values) => {
			mutateAsync(values);
		},
	});

	React.useEffect(() => {
		if (open) {
			setFieldValue("banner", null);
			setFieldValue("title", "");
			setFieldValue("description", "");
		}
	}, [open, setFieldValue]);

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)} className="w-fit" size="sm">
					<RiAddLine /> Add Test
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<div className="w-full rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiSpeedUpLine} />
					<div className="mb-5 mt-4">
						<DialogTitle>Add New Test</DialogTitle>
						<DialogDescription hidden>add New Test</DialogDescription>
					</div>
					<form onSubmit={handleSubmit} className="w-full space-y-4">
						<div>
							<ImageUploader
								fileType="image"
								onValueChange={(file) => setFieldValue("banner", file)}
								value={values.banner}
							/>
						</div>
						{errors.title && <span className="text-xs text-red-500">{errors.banner}</span>}
						<Input
							label="Enter Test Title"
							name="title"
							onChange={handleChange}
							error={touched.title && errors.title ? errors.title : ""}
						/>
						<Textarea
							label="Enter Test Description"
							name="description"
							onChange={handleChange}
							className="h-28"
							error={touched.description && errors.description ? errors.description : ""}
						/>
						<hr />
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button
								onClick={() => setOpen(false)}
								className="w-fit"
								type="button"
								size="sm"
								variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" type="submit" size="sm">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Create Test"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
