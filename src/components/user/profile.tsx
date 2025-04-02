import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import { Button } from "@/components/ui/button";
import { TabPanel } from "@/components/shared";
import { Input } from "@/components/ui/input";
import type { HttpError } from "@/types";

interface Props {
	selected: string;
}

const initialValues = {
	first_name: "",
	last_name: "",
	email: "",
	phone: "",
};

export const Profile = ({ selected }: Props) => {
	const {} = useMutation({
		mutationKey: ["update-user"],
		onSuccess: () => {
			console.log("success");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to create module";
			toast.error(message);
		},
	});

	const { errors, handleChange, handleSubmit, touched } = useFormik({
		initialValues,
		validationSchema: Yup.object({}),
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<TabPanel selected={selected} value="profile">
			<form onSubmit={handleSubmit} className="flex h-full w-full flex-col justify-between">
				<div className="w-full space-y-4">
					<Input
						name="first_name"
						label="First Name"
						onChange={handleChange}
						error={errors.first_name && touched.first_name ? errors.first_name : ""}
					/>
					<Input
						name="last_name"
						label="Last Name"
						onChange={handleChange}
						error={errors.last_name && touched.last_name ? errors.last_name : ""}
					/>
					<Input
						name="email"
						label="Email"
						type="email"
						onChange={handleChange}
						error={errors.email && touched.email ? errors.email : ""}
					/>
					<Input
						name="phone"
						label="Phone"
						onChange={handleChange}
						error={errors.phone && touched.phone ? errors.phone : ""}
					/>
				</div>
				<div className="flex w-full items-center justify-between">
					<Button className="w-fit" size="sm" type="button" variant="destructive">
						Delete Account
					</Button>
					<div className="flex items-center gap-x-4">
						<Button className="w-fit" size="sm" type="button" variant="outline">
							Reset Changes
						</Button>
						<Button className="w-fit" size="sm" type="submit">
							Save Changes
						</Button>
					</div>
				</div>
			</form>
		</TabPanel>
	);
};
