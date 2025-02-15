import { RiHashtag, RiLoaderLine, RiUserAddLine } from "@remixicon/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

import { useCourseStore } from "@/store/z-store";
import { Textarea } from "../ui/textarea";
import { GetChapterModules, GetRolesQuery, GetStaffs, UpdateChapterModule } from "@/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type {
	GetChapterModuleResponse,
	GetStaffsResponse,
	RoleResponse,
	UpdateChapterModuleDto,
} from "@/queries";

type UseMutationProps = {
	id: string;
	payload: UpdateChapterModuleDto;
};

export const AssignTeachers = () => {
	const [admin_role, setAdminRole] = React.useState("");
	const { chapterModule } = useCourseStore();

	const { isPending, mutate } = useMutation({
		mutationFn: ({ id, payload }: UseMutationProps) => UpdateChapterModule(id, payload),
		onSuccess: () => {
			toast.success("Module updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update module");
			console.error(error);
		},
	});

	const handleSelectTutor = async (tutor: string) => {
		if (!chapterModule?.id || !chapterModule.sequence) {
			toast.error("Please select a module");
			return;
		}
		if (!admin_role || !tutor) {
			toast.error("Please select a tutor");
			return;
		}
		const payload: UpdateChapterModuleDto = {
			sequence: chapterModule.sequence,
			tutor,
		};
		mutate({ id: chapterModule.id, payload });
	};

	const [{ data: roles }, { data: users }, { data: modules }] = useQueries({
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
			{
				queryKey: ["get-module"],
				queryFn: () => GetChapterModules({ limit: 100 }),
				enabled: !!chapterModule?.id,
				select: (data) => (data as GetChapterModuleResponse).data.data,
			},
		],
	});

	const tutor = React.useMemo(() => {
		if (modules) {
			const mod = modules.find((module) => module.chapter_module_id === String(chapterModule?.id));
			if (mod) {
				return mod.chapter_module_tutor?.id ?? "";
			}
		}
		return "";
	}, [chapterModule?.id, modules]);

	React.useEffect(() => {
		if (roles) {
			const wantedRole = roles.find((role) => role.role_name.toLowerCase() === "tutor");
			if (wantedRole) {
				setAdminRole(wantedRole.role_id);
			}
		}
	}, [roles]);

	return (
		<div className="grid w-full grid-cols-2 gap-x-4">
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
								onValueChange={(value) => handleSelectTutor(value)}
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
						</div>
					</div>
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
							<p className="text-[10px]">Use relevant keywords for the created course</p>
							<Textarea className="h-[90px]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
