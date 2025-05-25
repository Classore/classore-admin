import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import type { AdminOneProps, HttpError, Maybe } from "@/types";
import { Button } from "@/components/ui/button";
import { TabPanel } from "@/components/shared";
import { Input } from "@/components/ui/input";

interface Props {
	selected: string;
	user: Maybe<AdminOneProps>;
}

export const Profile = ({ selected, user }: Props) => {
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

	const { errors, handleChange, handleSubmit, touched, values } = useFormik({
		initialValues: {
			first_name: user?.first_name || "",
			last_name: user?.last_name || "",
			email: user?.email || "",
			phone_number: user?.phone_number || "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
		enableReinitialize: true,
		validationSchema: Yup.object({}),
	});

	return (
		<TabPanel selected={selected} value="profile">
			<form onSubmit={handleSubmit} className="flex h-full w-full flex-col justify-between">
				<div className="w-full space-y-4">
					<Input
						name="first_name"
						label="First Name"
						onChange={handleChange}
						defaultValue={values.first_name}
						error={errors.first_name && touched.first_name ? errors.first_name : ""}
					/>
					<Input
						name="last_name"
						label="Last Name"
						onChange={handleChange}
						defaultValue={values.last_name}
						error={errors.last_name && touched.last_name ? errors.last_name : ""}
					/>
					<Input
						name="email"
						label="Email"
						type="email"
						onChange={handleChange}
						defaultValue={values.email}
						error={errors.email && touched.email ? errors.email : ""}
					/>
					<Input
						name="phone_number"
						label="Phone"
						onChange={handleChange}
						defaultValue={values.phone_number}
						error={errors.phone_number && touched.phone_number ? errors.phone_number : ""}
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
