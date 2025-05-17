import React from "react";

import { DeleteAdmin } from "./admin/delete-admin";
import { RevokeAdmin } from "./admin/revoke-admin";
import { EditAdmin } from "./admin/edit-admin";
import type { AdminProps } from "@/types";

interface Props {
	admin: AdminProps;
	onClose: () => void;
}

export const AdminActions = ({ admin, onClose }: Props) => {
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
	const [isRevokeopen, setIsRevokeOpen] = React.useState(false);
	const [isEditopen, setIsEditOpen] = React.useState(false);

	return (
		<div className="flex w-full flex-col gap-y-1">
			<EditAdmin
				admin={admin}
				isEditopen={isEditopen}
				onClose={onClose}
				setIsEditOpen={setIsEditOpen}
			/>
			<RevokeAdmin
				adminId={admin.id}
				isBlocked={admin.is_blocked}
				isRevokeopen={isRevokeopen}
				setIsRevokeOpen={setIsRevokeOpen}
			/>
			<DeleteAdmin adminId={admin.id} isDeleteOpen={isDeleteOpen} setIsDeleteOpen={setIsDeleteOpen} />
		</div>
	);
};
