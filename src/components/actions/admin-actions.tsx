import React from "react";

import { DeleteAdmin } from "./admin/delete-admin";
import { RevokeAdmin } from "./admin/revoke-admin";
import { EditAdmin } from "./admin/edit-admin";
import type { AdminProps } from "@/types";

interface Props {
	admin: AdminProps;
	id: string;
}

export const AdminActions = ({ admin }: Props) => {
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
	const [isRevokeopen, setIsRevokeOpen] = React.useState(false);
	const [isEditopen, setIsEditOpen] = React.useState(false);

	return (
		<div className="flex w-full flex-col gap-y-1">
			<EditAdmin isEditopen={isEditopen} setIsEditOpen={setIsEditOpen} />
			<RevokeAdmin adminId={admin.id} isRevokeopen={isRevokeopen} setIsRevokeOpen={setIsRevokeOpen} />
			<DeleteAdmin adminId={admin.id} isDeleteOpen={isDeleteOpen} setIsDeleteOpen={setIsDeleteOpen} />
		</div>
	);
};
