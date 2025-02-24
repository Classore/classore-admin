import { RiAddLine, RiSpeedUpLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";

import { Textarea } from "@/components/ui/textarea";
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

export const AddTest = () => {
	const [open, setOpen] = React.useState(false);

	const {} = useMutation({
		mutationKey: ["add-test"],
		onSuccess: (data) => {
			console.log(data);
			queryClient.invalidateQueries({ queryKey: ["get-tests"] });
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const { handleSubmit } = useFormik({
		initialValues: { title: "", description: "" },
		onSubmit: (values) => {
			console.log(values);
			setOpen(false);
		},
	});

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
						<Input label="Enter Test Title" />
						<Textarea label="Enter Test Description" name="description" className="h-28" />
						<hr />
						<div className="flex w-full items-center justify-end gap-x-4">
							<Button className="w-fit" type="button" size="sm" variant="outline">
								Cancel
							</Button>
							<Button className="w-fit" type="submit" size="sm">
								Create Test
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
