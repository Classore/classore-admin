import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import { Button } from "@/components/ui/button";
import { TabPanel } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { UpdatePassword } from "@/queries";
import type { HttpError } from "@/types";

interface Props {
	selected: string;
}

const initialValues = {
	old_password: "",
	new_password: "",
	confirm_password: "",
};

export const ChangePassword = ({ selected }: Props) => {
	const { mutate } = useMutation({
		mutationFn: UpdatePassword,
		mutationKey: ["update-password"],
		onSuccess: () => {
			toast.success("Password updated successfully!");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to update password";
			toast.error(message);
		},
	});

	const { errors, handleChange, handleSubmit, resetForm, touched } = useFormik({
		initialValues,
		validationSchema: Yup.object({
			old_password: Yup.string()
				.required("Password is required!")
				.matches(
					/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,20}$/,
					"Password must be at least 8 characters and contain at least one uppercase, lowercase, number and special character!"
				),
			new_password: Yup.string()
				.required("Password is required!")
				.matches(
					/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,20}$/,
					"Password must be at least 8 characters and contain at least one uppercase, lowercase, number and special character!"
				),
			confirm_password: Yup.string().oneOf(
				[Yup.ref("new_password"), undefined],
				"Passwords must match"
			),
		}),
		onSubmit: (values) => {
			mutate(values);
		},
	});

	const handleResetForm = () => {
		const values = {
			old_password: "",
			new_password: "",
			confirm_password: "",
		};
		resetForm({ values });
	};

	return (
		<TabPanel selected={selected} value="password">
			<form onSubmit={handleSubmit} className="flex h-full w-full flex-col justify-between">
				<div className="w-full space-y-4">
					<Input
						name="old_password"
						label="Old Password"
						onChange={handleChange}
						type="password"
						error={errors.old_password && touched.old_password ? errors.old_password : ""}
					/>
					<Input
						name="new_password"
						label="New Password"
						onChange={handleChange}
						type="password"
						error={errors.new_password && touched.new_password ? errors.new_password : ""}
					/>
					<Input
						name="confirm_password"
						label="Confirm Password"
						onChange={handleChange}
						type="password"
						error={errors.confirm_password && touched.confirm_password ? errors.confirm_password : ""}
					/>
				</div>
				<div className="flex w-full items-center justify-between">
					<Button className="w-fit" size="sm" type="button" variant="destructive">
						Delete Account
					</Button>
					<div className="flex items-center gap-x-4">
						<Button
							onClick={() => handleResetForm()}
							className="w-fit"
							size="sm"
							type="button"
							variant="outline">
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
