import { RiLoaderLine, RiUserAddLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";

import { type CreateRoleDto, CreateRoleMutation } from "@/queries";
import { DialogTitle, DialogDescription } from "../ui/dialog";
import { queryClient } from "@/providers";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";

interface Props {
	setOpen: (open: boolean) => void;
}

const initialValues: CreateRoleDto = {
	name: "",
	waitlist_read: "NO",
	waitlist_write: "NO",
	student_read: "NO",
	student_write: "NO",
	admin_read: "NO",
	admin_write: "NO",
	tutor_read: "NO",
	tutor_write: "NO",
	videos_read: "NO",
	videos_write: "NO",
	transactions_read: "NO",
	transactions_write: "NO",
};

export const AddRoles = ({ setOpen }: Props) => {
	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateRoleDto) => CreateRoleMutation(payload),
		mutationKey: ["create-role"],
		onSuccess: () => {
			toast.error("Role created successfully");
			queryClient.invalidateQueries({ queryKey: ["get-roles"] }).then(() => {
				setOpen(false);
			});
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		onSubmit: (values) => {
			const name = values.name?.toLowerCase();
			if (!name) {
				toast.error("Role name is required");
				return;
			}
			const permissions = Object.keys(values);
			for (const key in permissions) {
				if (permissions.includes("_")) {
					delete values[key as keyof CreateRoleDto];
				}
			}
			const isEmpty = permissions.some((key) => values[key as keyof CreateRoleDto] === "YES");
			if (!isEmpty) {
				toast.error("Please select at least one permission");
				return;
			}
			const payload = {
				...values,
				name,
			};
			mutate(payload);
		},
	});

	return (
		<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
			<IconLabel icon={RiUserAddLine} />
			<div className="my-4 w-full">
				<DialogTitle>Add New Role</DialogTitle>
				<DialogDescription hidden>Enter the details of the new role you want to add.</DialogDescription>
			</div>
			<form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-5">
				<Input label="Role Name" name="name" onChange={handleChange} error={errors.name} />
				<div className="grid grid-cols-2 gap-4">
					<div className="flex items-center gap-x-3">
						<Switch
							id="student_read"
							name="student_read"
							checked={values.student_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("student_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="student_read" className="text-sm font-medium leading-none">
							Student Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="student_write"
							name="student_write"
							checked={values.student_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("student_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="student_write" className="text-sm font-medium leading-none">
							Student Write
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="admin_read"
							name="admin_read"
							checked={values.admin_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("admin_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="admin_read" className="text-sm font-medium leading-none">
							Admin Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="admin_write"
							name="admin_write"
							checked={values.admin_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("admin_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="admin_write" className="text-sm font-medium leading-none">
							Admin Write
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="tutor_read"
							name="tutor_read"
							checked={values.tutor_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("tutor_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="tutor_read" className="text-sm font-medium leading-none">
							Tutor Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="tutor_write"
							name="tutor_write"
							checked={values.tutor_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("tutor_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="tutor_write" className="text-sm font-medium leading-none">
							Tutor Write
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="transactions_read"
							name="transactions_read"
							checked={values.transactions_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("transactions_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="transactions_read" className="text-sm font-medium leading-none">
							Transaction Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="transactions_write"
							name="transactions_write"
							checked={values.transactions_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("transactions_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="transactions_write" className="text-sm font-medium leading-none">
							Transaction Write
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="videos_read"
							name="videos_read"
							checked={values.videos_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("videos_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="videos_read" className="text-sm font-medium leading-none">
							Courses Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="videos_write"
							name="videos_write"
							checked={values.videos_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("videos_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="videos_write" className="text-sm font-medium leading-none">
							Courses Write
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="waitlist_read"
							name="waitlist_read"
							checked={values.waitlist_read === "YES"}
							onCheckedChange={(checked) => setFieldValue("waitlist_read", checked ? "YES" : "NO")}
						/>
						<label htmlFor="waitlist_read" className="text-sm font-medium leading-none">
							Waitlist Read
						</label>
					</div>
					<div className="flex items-center gap-x-3">
						<Switch
							id="waitlist_write"
							name="waitlist_write"
							checked={values.waitlist_write === "YES"}
							onCheckedChange={(checked) => setFieldValue("waitlist_write", checked ? "YES" : "NO")}
						/>
						<label htmlFor="waitlist_write" className="text-sm font-medium leading-none">
							Waitlist Write
						</label>
					</div>
				</div>
				<Button className="mx-auto max-w-[250px]" type="submit" disabled={isPending}>
					{isPending ? <RiLoaderLine className="size-4 animate-spin" /> : "Add Role"}
				</Button>
			</form>
		</div>
	);
};
