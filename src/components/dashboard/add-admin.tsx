import { RiLoaderLine, RiUserAddLine } from "@remixicon/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";
import * as Yup from "yup";

import { type CreateAdminDto, CreateAdminMutation, GetRolesQuery } from "@/queries";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { IconLabel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Props {
	setOpen: (open: boolean) => void;
}

const initialValues = {
	email: "",
	name: "",
	phone_number: "",
	role: "",
};

export const AddAdmin = ({ setOpen }: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateAdminDto) => CreateAdminMutation(payload),
		mutationKey: ["create-admin"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-staffs"] }).then(() => {
				setOpen(false);
			});
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error.response?.data?.message)
				? error.response?.data?.message[0]
				: error.response?.data?.message;
			const message = errorMessage || "An error occurred. Please try again later.";
			toast.error(message);
		},
	});

	const [{ data: roles }] = useQueries({
		queries: [
			{
				queryKey: ["get-roles"],
				queryFn: () => GetRolesQuery(),
			},
		],
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched } = useFormik({
		initialValues,
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Name is required")
				.matches(
					/^[a-zA-Z]+ [a-zA-Z]+$/,
					"The name must be two names separated by a single space. No other characters are allowed!"
				),
			email: Yup.string().email("Invalid email").required("Email is required"),
			phone_number: Yup.string().optional(),
			role: Yup.string().required("Role is required"),
		}),
		onSubmit: (values) => {
			const payload = {
				...values,
				first_name: values.name.split(" ")[0],
				last_name: values.name.split(" ")[1],
			} as CreateAdminDto;
			mutate(payload);
		},
	});

	const named_errors = React.useMemo(() => {
		return Object.keys(errors).reduce(
			(acc, key) => {
				acc[key as keyof typeof errors] = String(
					touched[key as keyof typeof touched] && errors[key as keyof typeof errors]
				);
				return acc;
			},
			{} as Record<keyof typeof initialValues, string>
		);
	}, [errors, touched]);

	return (
		<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiUserAddLine} />
			<div className="my-4 w-full">
				<DialogTitle>Add New Admin</DialogTitle>
				<DialogDescription hidden>
					Enter the details of the new admin you want to add.
				</DialogDescription>
			</div>
			<form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-5">
				<Input label="Name" name="name" onChange={handleChange} error={named_errors.name} />
				<Input
					label="Email Address"
					name="email"
					onChange={handleChange}
					type="email"
					error={named_errors.email}
				/>
				<div className="space-y-1.5">
					<label className="text-xs text-neutral-400 dark:text-neutral-50" htmlFor="role">
						Set Permission
					</label>
					<Select name="role" onValueChange={(value) => setFieldValue("role", value)}>
						<SelectTrigger className="h-[42px] capitalize">
							<SelectValue placeholder="Access Type" />
						</SelectTrigger>
						<SelectContent className="capitalize">
							{roles?.data.data.map((role) => (
								<SelectItem key={role.role_id} value={role.role_id}>
									{role.role_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{named_errors.role && <p className="text-xs text-error">{named_errors.role}</p>}
				</div>
				<hr />
				<div className="flex w-full items-center justify-end gap-x-4">
					<Button
						className="w-fit"
						disabled={isPending}
						onClick={() => setOpen(false)}
						type="button"
						variant="outline">
						Cancel
					</Button>
					<Button className="w-fit" disabled={isPending} type="submit">
						{isPending ? <RiLoaderLine className="animate-spin" /> : "Add Admin"}
					</Button>
				</div>
			</form>
		</div>
	);
};
