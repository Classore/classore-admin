import { RiHashtag, RiLoaderLine, RiUserAddLine } from "@remixicon/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { CreateSubjectDto, GetStaffsResponse, RoleResponse } from "@/queries";
import { GetRolesQuery, GetStaffs, UpdateSubject } from "@/queries";
import { Textarea } from "../ui/textarea";
import { queryClient } from "@/providers";
import type { HttpError } from "@/types";
import { Button } from "../ui/button";
import { TabPanel } from "../shared";

type UseMutationProps = {
	id: string;
	payload: Partial<CreateSubjectDto>;
};

interface Props {
	courseId: string;
	tab: string;
	tutor?: string;
}

export const AssignTeachers = ({ courseId, tab, tutor }: Props) => {
	const [admin_role, setAdminRole] = React.useState("");

	const { isPending, mutate } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => UpdateSubject(id, payload),
		onSuccess: () => {
			toast.success("Course updated successfully");
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to update course";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-subject", courseId] });
		},
	});

	const { errors, handleChange, handleSubmit, setFieldValue, touched, values } = useFormik({
		initialValues: { tags: "", tutor: "" },
		validationSchema: Yup.object({
			tags: Yup.string(),
			tutor: Yup.string().required("Tutor is required"),
		}),
		onSubmit: (values) => {
			if (!admin_role) {
				return;
			}
			const payload: Partial<CreateSubjectDto> = {
				tags: values.tags.split(",").map((tag) => tag.trim()),
				tutor: values.tutor,
			};
			mutate({ id: courseId, payload });
		},
	});

	const [{ data: roles }, { data: users }] = useQueries({
		queries: [
			{
				queryKey: ["get-roles"],
				queryFn: () => GetRolesQuery({ limit: 20 }),
				select: (data) => (data as RoleResponse).data.data,
			},
			{
				queryKey: ["get-staffs", admin_role],
				queryFn: () => GetStaffs({ admin_role, limit: 50 }),
				enabled: !!admin_role,
				select: (data) => (data as GetStaffsResponse).data.admins,
			},
		],
	});

	React.useEffect(() => {
		if (roles) {
			const wantedRole = roles.find((role) => role.role_name.toLowerCase() === "tutor");
			if (wantedRole) {
				setAdminRole(wantedRole.role_id);
			}
		}
	}, [roles]);

	return (
		<TabPanel selected={tab} value="teacher">
			<form onSubmit={handleSubmit} className="grid w-full grid-cols-2 gap-x-4">
				<div className="w-full space-y-10">
					<div className="h-fit w-full space-y-2 rounded-lg bg-neutral-100 p-3">
						<p className="text-xs font-medium text-neutral-500">ASSIGN TEACHER</p>
						<div className="w-full space-y-2 rounded-lg bg-white p-4">
							<div className="flex items-start gap-x-2">
								<RiUserAddLine size={18} />
								<div className="flex-1 space-y-2">
									<div className="flex w-full items-center justify-between">
										<label className="text-sm font-medium" htmlFor="">
											Select Teacher
										</label>
										{isPending && <RiLoaderLine className="animate-spin" size={18} />}
									</div>
									<Select
										value={tutor}
										onValueChange={(value) => setFieldValue("tutor", value)}
										disabled={isPending}>
										<SelectTrigger className="w-full text-sm capitalize">
											<SelectValue placeholder="Select Teacher" />
										</SelectTrigger>
										<SelectContent className="text-sm capitalize">
											{users?.data.map((user) => (
												<SelectItem key={user.id} value={user.id}>
													{user.first_name} {user.last_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{touched.tutor && errors.tutor && <p className="text-xs text-red-500">{errors.tutor}</p>}
								</div>
							</div>
						</div>
						<Button type="submit" size="sm" className="w-fit">
							Update Course
						</Button>
					</div>
				</div>

				<div className="h-fit w-full space-y-2 rounded-lg bg-neutral-100 p-3">
					<p className="text-xs font-medium text-neutral-500">ADD COURSE TAGS</p>
					<div className="w-full rounded-lg bg-white p-4">
						<div className="flex items-start gap-x-2">
							<RiHashtag size={18} />
							<div className="flex-1 space-y-2">
								<label className="text-sm font-medium" htmlFor="">
									Tags
								</label>
								<p className="text-xs">
									Use relevant keywords for the created course and separate the values with comma
								</p>
								<Textarea
									className="h-[90px]"
									name="tags"
									onChange={handleChange}
									value={values.tags}
									placeholder="e.g., government, constitution"
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</TabPanel>
	);
};
