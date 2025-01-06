import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo, Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CreateRoleDto } from "@/queries";
import { Input } from "@/components/ui/input";
import { CreateRoleMutation } from "@/queries";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";

const initialValues: CreateRoleDto = {
	name: "",
	admin_read: "NO",
	admin_write: "NO",
	student_read: "NO",
	student_write: "NO",
	transactions_read: "NO",
	transactions_write: "NO",
	tutor_read: "NO",
	tutor_write: "NO",
	videos_read: "NO",
	videos_write: "NO",
	waitlist_read: "NO",
	waitlist_write: "NO",
};

const permissions: { label: string; value: keyof CreateRoleDto }[] = [
	{ label: "Read from admin", value: "admin_read" },
	{ label: "Write to admin", value: "admin_write" },
	{ label: "Read from student", value: "student_read" },
	{ label: "Write to student", value: "student_write" },
	{ label: "Read from transactions", value: "transactions_read" },
	{ label: "Write to transactions", value: "transactions_write" },
	{ label: "Read from tutor", value: "tutor_read" },
	{ label: "Write to tutor", value: "tutor_write" },
	{ label: "Read from courses", value: "videos_read" },
	{ label: "Write to courses", value: "videos_write" },
	{ label: "Read from waitlist", value: "waitlist_read" },
	{ label: "Write to waitlist", value: "waitlist_write" },
];

const Page = () => {
	const router = useRouter();

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: CreateRoleDto) => CreateRoleMutation(payload),
		mutationKey: ["create-role"],
		onSuccess: () => {
			toast.success("Role added successfully!");
			router.push("/dashboard/roles-and-permissions").then(() => {
				queryClient.invalidateQueries({ queryKey: ["get-admin-roles"] });
			});
		},
		onError: ({ response }: HttpError) => {
			console.error(response);
			const { message } = response.data;
			toast.error(message);
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			if (!values.name) {
				toast.error("Please provide a role name!");
				return;
			}
			mutateAsync(values);
		},
	});

	return (
		<>
			<Seo title="Roles and Permissions" />
			<DashboardLayout>
				<div className="h-full w-full p-6">
					<form onSubmit={handleSubmit} className="flex max-w-[500px] flex-col gap-4">
						<Input
							label="Role name"
							type="text"
							name="name"
							onChange={handleChange}
							placeholder="Role name"
							error={errors.name}
						/>
						<div className="flex w-full flex-col gap-2">
							<label htmlFor="permissions" className="text-lg font-medium">
								Role Permissions
							</label>
							{permissions.map(({ label, value }, index) => (
								<div key={index} className="flex w-full items-center justify-between">
									<label htmlFor="admin_read" className="text-sm text-neutral-600">
										{label}
									</label>
									<Switch
										checked={values[value] === "YES"}
										onCheckedChange={(checked) => setFieldValue(value, checked ? "YES" : "NO")}
									/>
								</div>
							))}
						</div>
						<Button type="submit" disabled={isPending}>
							{isPending ? <Spinner /> : "Add Role"}
						</Button>
					</form>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
