import { useMutation, useQueries } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import {
	RiAddLine,
	RiLoaderLine,
	RiTeamLine,
	RiUser2Line,
	RiUser5Line,
	RiUserAddLine,
	RiUserUnfollowLine,
} from "@remixicon/react";

import { type CreateAdminDto, CreateAdminMutation } from "@/queries";
import { IconLabel, SearchInput, Seo } from "@/components/shared";
import { DashboardLayout } from "@/components/layout";
import { GetStaffs, GetRolesQuery } from "@/queries";
import { UserCard } from "@/components/dashboard";
import { AdminTable } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/providers";
import { useDebounce } from "@/hooks";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const user_types = ["all", "super admin", "view only", "edit access"] as const;
const sort_options = ["NAME", "DATE_CREATED"];
type User_Type = (typeof user_types)[number];

const initialValues = {
	email: "",
	name: "",
	password: "",
	phone_number: "",
	role: "",
};

const Page = () => {
	const [user_type, setUserType] = React.useState<User_Type>("all");
	const [sort_by, setSortBy] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [page, setPage] = React.useState(1);

	const search = useDebounce(name, 500);

	const { isPending, mutate } = useMutation({
		mutationFn: (payload: CreateAdminDto) => CreateAdminMutation(payload),
		mutationKey: ["create-admin"],
		onSuccess: (data) => {
			console.log(data);
			queryClient.invalidateQueries({ queryKey: ["get-staffs"] }).then(() => {
				setOpen(false);
			});
		},
	});

	const [{ data }, { data: roles }] = useQueries({
		queries: [
			{
				queryKey: ["get-staffs", page, search],
				queryFn: () => GetStaffs({ limit: 10, page, search }),
			},
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
			password: Yup.string().required("Password is required"),
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
		<>
			<Seo title="Roles and Permissions" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6">
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<p className="">Manage Roles</p>
							<Dialog open={open} onOpenChange={setOpen}>
								<DialogTrigger asChild>
									<Button size="sm" className="w-fit">
										<RiAddLine /> Add Admin
									</Button>
								</DialogTrigger>
								<DialogContent className="w-[450px] max-w-[90%] p-1">
									<div className="h-full w-full rounded-lg border px-4 pb-4 pt-[59px]">
										<IconLabel icon={RiUserAddLine} />
										<div className="my-4 w-full">
											<DialogTitle>Add New Admin</DialogTitle>
											<DialogDescription hidden>
												Enter the details of the new admin you want to add.
											</DialogDescription>
										</div>
										<form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-5">
											<Input
												label="Name"
												name="name"
												onChange={handleChange}
												error={named_errors.name}
											/>
											<Input
												label="Email Address"
												name="email"
												onChange={handleChange}
												type="email"
												error={named_errors.email}
											/>
											<Input
												label="Password"
												name="password"
												onChange={handleChange}
												type="password"
												error={named_errors.password}
											/>
											<div className="space-y-1.5">
												<label
													className="text-xs text-neutral-400 dark:text-neutral-50"
													htmlFor="role">
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
												{named_errors.role && (
													<p className="text-xs text-error">{named_errors.role}</p>
												)}
											</div>
											<hr />
											<div className="flex w-full items-center justify-end gap-x-4">
												<Button className="w-fit" type="button" variant="outline">
													Cancel
												</Button>
												<Button className="w-fit" type="submit">
													{isPending ? <RiLoaderLine className="animate-spin" /> : "Add Admin"}
												</Button>
											</div>
										</form>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<div className="grid w-full grid-cols-4 gap-x-4">
							<UserCard
								icon={RiTeamLine}
								value={data?.data.total_no_of_admins ?? 0}
								label="Total No of Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser5Line}
								value={data?.data.super_admins ?? 0}
								label="Super Admin"
								percentage={10}
								variant="success"
							/>
							<UserCard
								icon={RiUser2Line}
								value={data?.data.edit_access ?? 0}
								label="Edit Access"
								percentage={10}
								variant="danger"
							/>
							<UserCard
								icon={RiUserUnfollowLine}
								value={data?.data.view_only ?? 0}
								label="View Only"
								percentage={10}
								variant="danger"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-y-4 rounded-lg bg-white p-5">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-x-2">
								<p className="">Roles</p>
								<div className="flex items-center">
									{user_types.map((type) => (
										<button
											key={type}
											onClick={() => setUserType(type)}
											className={`h-6 min-w-[90px] rounded-md text-xs capitalize ${type === user_type ? "bg-primary-100 text-primary-400" : "text-neutral-400"}`}>
											{type}
										</button>
									))}
								</div>
							</div>
							<div className="flex items-center gap-x-2">
								<SearchInput value={name} onChange={(e) => setName(e.target.value)} />
								<Select value={sort_by} onValueChange={(value) => setSortBy(value)}>
									<SelectTrigger className="h-8 w-[90px] text-xs">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										{sort_options.map((option) => (
											<SelectItem key={option} value={option} className="text-xs">
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<AdminTable
							admins={data?.data.admins.data ?? []}
							onPageChange={setPage}
							page={page}
							total={data?.data.admins.meta.itemCount ?? 0}
						/>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
